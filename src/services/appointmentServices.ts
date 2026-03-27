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

  // Fetch doctors
  async fetchDoctors() {
    try {
      // Ensure database is open
      if (!db.isOpen()) {
        await db.open();
      }

      const doctors = await db.doctors.filter(doctor => doctor.isActive === true).toArray();
      return doctors;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Fetch patients
  async fetchPatients() {
    try {
      // Ensure database is open
      if (!db.isOpen()) {
        await db.open();
      }

      const patients = await db.patients.filter(patient => patient.isActive === true).toArray();
      return patients;
    } catch (error) {
      console.error('Error fetching patients:', error);
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
    const schedule = await db.doctorSchedules.where('doctorId').equals(doctorId).first();
    if (!schedule) throw new Error('No schedule found for doctor');

    const dayOfWeek = date.getDay();
    if (!schedule.workingDays.includes(dayOfWeek)) {
      return [];
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    const appointments = await db.appointments
      .where('date')
      .equals(dateStr)
      .toArray();

    const doctorAppointments = appointments.filter((apt: Appointment) => apt.doctorId === doctorId);
    const bookedSlots = doctorAppointments.map((apt: Appointment) => apt.slot);

    const startTime = parse(schedule.startTime, 'HH:mm', date);
    const endTime = parse(schedule.endTime, 'HH:mm', date);
    const slots: string[] = [];

    let currentTime = startTime;
    while (isBefore(currentTime, endTime)) {
      const slotTime = format(currentTime, 'HH:mm');

      if (schedule.lunchBreakStart && schedule.lunchBreakEnd) {
        const lunchStart = parse(schedule.lunchBreakStart, 'HH:mm', date);
        const lunchEnd = parse(schedule.lunchBreakEnd, 'HH:mm', date);

        if (!isAfter(currentTime, lunchStart) || !isBefore(currentTime, lunchEnd)) {
          if (!bookedSlots.includes(slotTime)) {
            slots.push(slotTime);
          }
        }
      } else {
        if (!bookedSlots.includes(slotTime)) {
          slots.push(slotTime);
        }
      }

      currentTime = addMinutes(currentTime, schedule.slotDuration);
    }

    return slots;
  }
};