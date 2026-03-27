import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  fetchAppointments,
  fetchDoctors,
  fetchPatients,
  fetchDoctorSchedules,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  generateTimeSlots,
} from './appointmentThunk';
import { type Appointment, type DoctorSchedule, type Doctor, type Patient } from '@/features/db/dexie';
import { startOfWeek } from 'date-fns';

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
  availableSlots: [],
  timeSlotConflict: false,
};


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
          // Also update selectedAppointment if it's the same appointment
          if (state.selectedAppointment && state.selectedAppointment.id === id) {
            state.selectedAppointment = { ...state.selectedAppointment, ...updates };
          }
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
  clearError,
} = appointmentSlice.actions;

// Re-export thunks for backward compatibility
export {
  fetchAppointments,
  fetchDoctors,
  fetchPatients,
  fetchDoctorSchedules,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  generateTimeSlots,
} from './appointmentThunk';

export default appointmentSlice.reducer;
