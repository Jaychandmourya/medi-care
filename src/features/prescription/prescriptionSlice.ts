import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  searchDrugs,
  checkDrugRecall,
  savePrescriptionToHistory,
  loadPrescriptionHistory,
  deletePrescriptionFromHistory,
  getDrugAdverseEvents,
} from './prescriptionThunk'

import type { Drug, Medicine, Prescription, PrescriptionState } from '@/types/prescription/prescriptionType'

const initialState: PrescriptionState = {
  prescriptions: [],
  currentPrescription: null,
  prescriptionHistory: [],
  drugSearchResults: [],
  selectedDrug: null,
  loading: false,
  error: null,
  searchLoading: false,
  historyLoading: false,
}

const prescriptionSlice = createSlice({
  name: 'prescription',
  initialState,
  reducers: {
    setCurrentPrescription: (state, action: PayloadAction<Prescription | null>) => {
      state.currentPrescription = action.payload;
    },
    addMedicine: (state, action: PayloadAction<Medicine>) => {
      if (state.currentPrescription) {
        state.currentPrescription.medicines.push(action.payload);
      }
    },
    removeMedicine: (state, action: PayloadAction<string>) => {
      if (state.currentPrescription) {
        state.currentPrescription.medicines =
          state.currentPrescription.medicines.filter(med => med.id !== action.payload);
      }
    },
    updateMedicine: (state, action: PayloadAction<Medicine>) => {
      if (state.currentPrescription) {
        const index = state.currentPrescription.medicines.findIndex(
          med => med.id === action.payload.id
        );
        if (index !== -1) {
          state.currentPrescription.medicines[index] = action.payload;
        }
      }
    },
    setSelectedDrug: (state, action: PayloadAction<Drug | null>) => {
      state.selectedDrug = action.payload;
    },
    clearDrugSearch: (state) => {
      state.drugSearchResults = [];
      state.selectedDrug = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Search drugs
      .addCase(searchDrugs.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchDrugs.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.drugSearchResults = action.payload;
      })
      .addCase(searchDrugs.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.error.message || 'Failed to search drugs';
      })
      // Check drug recall (now includes adverse events too)
      .addCase(checkDrugRecall.fulfilled, (state, action) => {
        if (state.selectedDrug) {
          state.selectedDrug.isRecalled = action.payload.isRecalled;
          state.selectedDrug.recallInfo = action.payload.recallInfo;
          const adverseEvents = (action.payload as { adverseEvents?: Array<{ reaction?: string }> }).adverseEvents;
          state.selectedDrug.adverseReactions = adverseEvents?.map((event) => event.reaction).filter((r): r is string => Boolean(r)) || [];
        }
      })
      // Prescription history
      .addCase(savePrescriptionToHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(savePrescriptionToHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        if (!state.prescriptionHistory.find(p => p.id === action.payload.id)) {
          state.prescriptionHistory.unshift(action.payload);
        }
      })
      .addCase(savePrescriptionToHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.error.message || 'Failed to save prescription to history';
      })
      .addCase(loadPrescriptionHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(loadPrescriptionHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.prescriptionHistory = action.payload;
      })
      .addCase(loadPrescriptionHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.error.message || 'Failed to load prescription history';
      })
      .addCase(deletePrescriptionFromHistory.fulfilled, (state, action) => {
        state.prescriptionHistory = state.prescriptionHistory.filter(p => p.id !== action.payload);
      });
  },
});

export const {
  setCurrentPrescription,
  addMedicine,
  removeMedicine,
  updateMedicine,
  setSelectedDrug,
  clearDrugSearch,
  clearError,
} = prescriptionSlice.actions;


export {
  searchDrugs,
  checkDrugRecall,
  savePrescriptionToHistory,
  loadPrescriptionHistory,
  deletePrescriptionFromHistory,
  getDrugAdverseEvents,
};

export default prescriptionSlice.reducer;
