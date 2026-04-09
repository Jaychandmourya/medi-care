import { createAsyncThunk } from '@reduxjs/toolkit';
import { VitalsService } from '@/services/vitalsService';
import type { Vitals, VitalsFormData, Patient as VitalsPatient } from '@/types/vitals/vitalsType';

// Async thunks for vitals operations
export const fetchPatients = createAsyncThunk<VitalsPatient[]>(
  'vitals/fetchPatients',
  async () => {
    return await VitalsService.getPatients();
  }
);

export const fetchVitals = createAsyncThunk<Vitals[]>(
  'vitals/fetchVitals',
  async () => {
    return await VitalsService.getVitals();
  }
);

export const fetchVitalsByPatientId = createAsyncThunk<Vitals[], string>(
  'vitals/fetchVitalsByPatientId',
  async (patientId) => {
    return await VitalsService.getVitalsByPatientId(patientId);
  }
);

export const addVitals = createAsyncThunk<Vitals, VitalsFormData>(
  'vitals/addVitals',
  async (vitalsData) => {
    return await VitalsService.addVitals(vitalsData);
  }
);

export const updateVitals = createAsyncThunk<Vitals, { id: string; vitalsData: Partial<VitalsFormData> }>(
  'vitals/updateVitals',
  async ({ id, vitalsData }) => {
    return await VitalsService.updateVitals(id, vitalsData);
  }
);

export const deleteVitals = createAsyncThunk<void, string>(
  'vitals/deleteVitals',
  async (id) => {
    await VitalsService.deleteVitals(id);
  }
);