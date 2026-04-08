import { db, type Appointment } from '@/features/db/dexie';
import { format, addMinutes, parse, isAfter, isBefore } from 'date-fns';

export const appointmentServices = {
  // Fetch appointments with filtering
  async fetchAppointments({ doctorId, startDate, endDate }: { doctorId?: string; startDate: Date; endDate: Date }) {
    try {
      // Ensure database is open
      if (!db.isOpen()) {
        await db.open();
      }

      // Simplify - get all appointments first, then filter in memory
      let appointments: Appointment[] = [];

      try {
        appointments = await db.appointments.toArray();
      } catch (dbError) {
        console.error('DB error fetching appointments:', dbError);
        // Return empty array if DB fails
        return [];
      }

      if (appointments.length === 0) {
        return [];
      }

      // Filter by date range
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');

      let filtered = appointments.filter(apt =>
        apt.date >= startDateStr && apt.date <= endDateStr
      );

      // Filter by doctor if specified
      if (doctorId) {
        filtered = filtered.filter(apt => apt.doctorId === doctorId);
      }
      return filtered;
    } catch (error) {
      console.error('Error in fetchAppointments:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Fetch doctor schedules
  async fetchDoctorSchedules() {
    try {
      // Ensure database is open
      if (!db.isOpen()) {
        await db.open();
      }

      const schedules = await db.doctorSchedules.filter(schedule => schedule.isActive === true).toArray();
      return schedules;
    } catch (error) {
      console.error('Error fetching doctor schedules:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Create appointment
  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) {
    const newAppointment: Appointment = {
      ...appointment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.appointments.add(newAppointment);
    return newAppointment;
  },

  // Update appointment
  async updateAppointment({ id, updates }: { id: string; updates: Partial<Appointment> }) {
    const updatedAppointment = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await db.appointments.update(id, updatedAppointment);
    return { id, updates: updatedAppointment };
  },

  // Delete appointment
  async deleteAppointment(id: string) {
    await db.appointments.delete(id);
    return id;
  },

  // Generate time slots
  async generateTimeSlots({ doctorId, date }: { doctorId: string; date: Date }) {
    const dateStr = format(date, 'yyyy-MM-dd');
    console.log('Generating time slots for date:', dateStr);

    try {
      // Ensure database is open
      if (!db.isOpen()) {
        await db.open();
      }

      // First, check if doctor has a schedule in the database
      const doctorSchedule = await db.doctorSchedules.where('doctorId').equals(doctorId).first();

      if (!doctorSchedule) {
        console.log('No schedule found for doctor:', doctorId);
        return [];
      }

      console.log('Found doctor schedule:', doctorSchedule);

      // Check if the selected date is a working day
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const workingDays = doctorSchedule.workingDays; // Array of day numbers (1-5 for Mon-Fri)

      if (!workingDays.includes(dayOfWeek)) {
        console.log('Date is not a working day for doctor');
        return [];
      }

      // Get all appointments for this date to check booked slots
      const appointments = await db.appointments
        .where('date')
        .equals(dateStr)
        .toArray();

      console.log('All appointments on this date:', appointments);

      // Get booked slots for the specific doctor
      const bookedSlots = appointments
        .filter((apt: Appointment) => apt.doctorId === doctorId)
        .map((apt: Appointment) => apt.slot);

      console.log('Booked slots for doctor:', doctorId, bookedSlots);

      // Generate time slots based on doctor's schedule
      const allSlots: string[] = [];
      const startTime = parse(doctorSchedule.startTime, 'HH:mm', date);
      const endTime = parse(doctorSchedule.endTime, 'HH:mm', date);
      const slotDuration = doctorSchedule.slotDuration || 30;

      let currentTime = startTime;
      while (isBefore(currentTime, endTime)) {
        const slotTime = format(currentTime, 'HH:mm');

        // Skip lunch break if specified
        if (doctorSchedule.lunchBreakStart && doctorSchedule.lunchBreakEnd) {
          const lunchStart = parse(doctorSchedule.lunchBreakStart, 'HH:mm', date);
          const lunchEnd = parse(doctorSchedule.lunchBreakEnd, 'HH:mm', date);

          if (isAfter(currentTime, lunchStart) && isBefore(currentTime, lunchEnd)) {
            currentTime = addMinutes(currentTime, slotDuration);
            continue;
          }
        }

        if (!bookedSlots.includes(slotTime)) {
          allSlots.push(slotTime);
        }

        currentTime = addMinutes(currentTime, slotDuration);
      }

      // Sort the slots
      const slots = allSlots.sort();
      console.log('Generated time slots based on doctor schedule:', slots);
      return slots;
    } catch (error) {
      console.error('Error in generateTimeSlots:', error);
      return [];
    }
  },

  // Fetch appointments by patient ID
  async fetchAppointmentsByPatientId(patientId: string) {
    try {
      // Ensure database is open
      if (!db.isOpen()) {
        await db.open();
      }

      const appointments = await db.appointments.where('patientId').equals(patientId).toArray();

      // Sort by date descending (most recent first)
      return appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error fetching appointments for patient:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Add doctor schedule
  async addDoctorSchedule(doctorId: string, scheduleData: {
    workingDays: number[];
    startTime: string;
    endTime: string;
    slotDuration: 15 | 20 | 30;
    lunchBreakStart?: string;
    lunchBreakEnd?: string;
  }) {
    try {
      // Ensure database is open
      if (!db.isOpen()) {
        await db.open();
      }

      // Check if doctor exists
      const doctor = await db.doctors.where('id').equals(doctorId).first();
      if (!doctor) {
        throw new Error(`Doctor with ID ${doctorId} not found`);
      }

      // Check if schedule already exists for this doctor
      const existingSchedule = await db.doctorSchedules.where('doctorId').equals(doctorId).first();
      if (existingSchedule) {
        // Update existing schedule
        const updatedSchedule = {
          ...scheduleData,
          updatedAt: new Date().toISOString(),
        };
        await db.doctorSchedules.update(existingSchedule.id, updatedSchedule);
        return { id: existingSchedule.id, ...updatedSchedule };
      } else {
        // Create new schedule
        const newSchedule = {
          id: crypto.randomUUID(),
          doctorId,
          ...scheduleData,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await db.doctorSchedules.add(newSchedule);
        return newSchedule;
      }
    } catch (error) {
      console.error('Error adding doctor schedule:', error);
      throw error;
    }
  }
};