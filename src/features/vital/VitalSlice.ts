import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Vitals, Patient as VitalsPatient } from '../../types/vitals/vitalsType';
import {
  fetchPatients,
  fetchVitals,
  fetchVitalsByPatientId,
  addVitals,
  updateVitals,
  deleteVitals
} from './VitalThunk';

interface VitalsState {
  patients: VitalsPatient[];
  vitals: Vitals[];
  currentPatientVitals: Vitals[];
  loading: boolean;
  error: string | null;
}

const initialState: VitalsState = {
  patients: [],
  vitals: [],
  currentPatientVitals: [],
  loading: false,
  error: null,
};

const vitalsSlice = createSlice({
  name: 'vitals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPatientVitals: (state) => {
      state.currentPatientVitals = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch patients
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action: PayloadAction<VitalsPatient[]>) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch patients';
      });

    // Fetch all vitals
    builder
      .addCase(fetchVitals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVitals.fulfilled, (state, action: PayloadAction<Vitals[]>) => {
        state.loading = false;
        state.vitals = action.payload;
      })
      .addCase(fetchVitals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch vitals';
      });

    // Fetch vitals by patient ID
    builder
      .addCase(fetchVitalsByPatientId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVitalsByPatientId.fulfilled, (state, action: PayloadAction<Vitals[]>) => {
        state.loading = false;
        state.currentPatientVitals = action.payload;
      })
      .addCase(fetchVitalsByPatientId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch patient vitals';
      });

    // Add vitals
    builder
      .addCase(addVitals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVitals.fulfilled, (state, action: PayloadAction<Vitals>) => {
        state.loading = false;
        state.vitals.push(action.payload);
        state.currentPatientVitals.push(action.payload);
      })
      .addCase(addVitals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add vitals';
      });

    // Update vitals
    builder
      .addCase(updateVitals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVitals.fulfilled, (state, action: PayloadAction<Vitals>) => {
        state.loading = false;
        const index = state.vitals.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.vitals[index] = action.payload;
        }
        const currentIndex = state.currentPatientVitals.findIndex(v => v.id === action.payload.id);
        if (currentIndex !== -1) {
          state.currentPatientVitals[currentIndex] = action.payload;
        }
      })
      .addCase(updateVitals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update vitals';
      });

    // Delete vitals
    builder
      .addCase(deleteVitals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVitals.fulfilled, (state, action) => {
        state.loading = false;
        state.vitals = state.vitals.filter(v => v.id !== action.meta.arg);
        state.currentPatientVitals = state.currentPatientVitals.filter(v => v.id !== action.meta.arg);
      })
      .addCase(deleteVitals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete vitals';
      });
  },
});

export const { clearError, clearCurrentPatientVitals } = vitalsSlice.actions;
export default vitalsSlice.reducer;