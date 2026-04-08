import { createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentServices } from '@/services/appointmentServices';
import { type Appointment } from '@/features/db/dexie';

export const fetchAppointments = createAsyncThunk(
  'appointment/fetchAppointments',
  async ({ doctorId, startDate, endDate }: { doctorId?: string; startDate: Date; endDate: Date }) => {
    return await appointmentServices.fetchAppointments({ doctorId, startDate, endDate });
  }
);

export const fetchDoctorSchedules = createAsyncThunk('appointment/fetchDoctorSchedules', async () => {
  return await appointmentServices.fetchDoctorSchedules();
});

export const createAppointment = createAsyncThunk(
  'appointment/createAppointment',
  async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await appointmentServices.createAppointment(appointment);
  }
);

export const updateAppointment = createAsyncThunk(
  'appointment/updateAppointment',
  async ({ id, updates }: { id: string; updates: Partial<Appointment> }) => {
    return await appointmentServices.updateAppointment({ id, updates });
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointment/deleteAppointment',
  async (id: string) => {
    return await appointmentServices.deleteAppointment(id);
  }
);

export const fetchAppointmentsByPatientId = createAsyncThunk(
  'appointment/fetchAppointmentsByPatientId',
  async (patientId: string) => {
    return await appointmentServices.fetchAppointmentsByPatientId(patientId);
  }
);

export const generateTimeSlots = createAsyncThunk(
  'appointment/generateTimeSlots',
  async ({ doctorId, date }: { doctorId: string; date: Date }) => {
    return await appointmentServices.generateTimeSlots({ doctorId, date });
  }
);