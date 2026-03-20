import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { db, type Appointment, type DoctorSchedule, type Doctor, type Patient } from '@/features/patient/db/dexie';
import { format, startOfWeek, addMinutes, parse, isAfter, isBefore } from 'date-fns';

interface AppointmentState {
  appointments: Appointment[];
  doctors: Doctor[];
  patients: Patient[];
  doctorSchedules: DoctorSchedule[];
  selectedDoctor: string | null;
  selectedWeek: string;
  selectedDate: string;
  loading: boolean;
  error: string | null;
  selectedAppointment: Appointment | null;
  showBookingModal: boolean;
  showDetailModal: boolean;
  showRescheduleModal: boolean;
  availableSlots: string[];
  timeSlotConflict: boolean;
}

const initialState: AppointmentState = {
  appointments: [],
  doctors: [],
  patients: [],
  doctorSchedules: [],
  selectedDoctor: null,
  selectedWeek: startOfWeek(new Date()).toISOString(),
  selectedDate: new Date().toISOString(),
  loading: false,
  error: null,
  selectedAppointment: null,
  showBookingModal: false,
  showDetailModal: false,
  showRescheduleModal: false,
  availableSlots: [],
  timeSlotConflict: false,
};

export const fetchAppointments = createAsyncThunk(
  'appointment/fetchAppointments',
  async ({ doctorId, startDate, endDate }: { doctorId?: string; startDate: Date; endDate: Date }) => {
    const appointments = await db.appointments
      .where('date')
      .between(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))
      .toArray();

    if (doctorId) {
      return appointments.filter(apt => apt.doctorId === doctorId);
    }
    return appointments;
  }
);

export const fetchDoctors = createAsyncThunk('appointment/fetchDoctors', async () => {
  return await db.doctors.filter(doctor => doctor.isActive === true).toArray();
});

export const fetchPatients = createAsyncThunk('appointment/fetchPatients', async () => {
  return await db.patients.filter(patient => patient.isActive === true).toArray();
});

export const fetchDoctorSchedules = createAsyncThunk('appointment/fetchDoctorSchedules', async () => {
  return await db.doctorSchedules.filter(schedule => schedule.isActive === true).toArray();
});

export const createAppointment = createAsyncThunk(
  'appointment/createAppointment',
  async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.appointments.add(newAppointment);
    return newAppointment;
  }
);

export const updateAppointment = createAsyncThunk(
  'appointment/updateAppointment',
  async ({ id, updates }: { id: string; updates: Partial<Appointment> }) => {
    const updatedAppointment = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await db.appointments.update(id, updatedAppointment);
    return { id, updates: updatedAppointment };
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointment/deleteAppointment',
  async (id: string) => {
    await db.appointments.delete(id);
    return id;
  }
);

export const generateTimeSlots = createAsyncThunk(
  'appointment/generateTimeSlots',
  async ({ doctorId, date }: { doctorId: string; date: Date }) => {
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
);

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setSelectedDoctor: (state, action: PayloadAction<string | null>) => {
      state.selectedDoctor = action.payload;
    },
    setSelectedWeek: (state, action: PayloadAction<string>) => {
      state.selectedWeek = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setSelectedAppointment: (state, action: PayloadAction<Appointment | null>) => {
      state.selectedAppointment = action.payload;
    },
    setShowBookingModal: (state, action: PayloadAction<boolean>) => {
      state.showBookingModal = action.payload;
      if (!action.payload) {
        state.timeSlotConflict = false;
        state.availableSlots = [];
      }
    },
    setShowDetailModal: (state, action: PayloadAction<boolean>) => {
      state.showDetailModal = action.payload;
    },
    setShowRescheduleModal: (state, action: PayloadAction<boolean>) => {
      state.showRescheduleModal = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch appointments';
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.doctors = action.payload;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.patients = action.payload;
      })
      .addCase(fetchDoctorSchedules.fulfilled, (state, action) => {
        state.doctorSchedules = action.payload;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.appointments.push(action.payload);
        state.showBookingModal = false;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const index = state.appointments.findIndex(apt => apt.id === id);
        if (index !== -1) {
          state.appointments[index] = { ...state.appointments[index], ...updates };
        }
        state.showRescheduleModal = false;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter(apt => apt.id !== action.payload);
      })
      .addCase(generateTimeSlots.fulfilled, (state, action) => {
        state.availableSlots = action.payload;
      });
  },
});

export const {
  setSelectedDoctor,
  setSelectedWeek,
  setSelectedDate,
  setSelectedAppointment,
  setShowBookingModal,
  setShowDetailModal,
  setShowRescheduleModal,
  clearError,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
