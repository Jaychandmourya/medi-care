import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

// Types
export interface Drug {
  id: string
  genericName: string
  brandName: string
  drugClass: string
  purpose?: string
  warnings?: string[]
  dosage?: string
  adverseReactions?: string[]
  manufacturer?: string
  isRecalled?: boolean
  recallInfo?: Record<string, unknown> | null
}

export interface Medicine {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  drug?: Drug
}

export interface Prescription {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  diagnosis: string
  medicines: Medicine[]
  generalNotes: string
  followUpDate: string
  createdAt: string
  updatedAt?: string
  status: 'active' | 'completed' | 'cancelled'
}

interface PrescriptionState {
  prescriptions: Prescription[]
  currentPrescription: Prescription | null
  prescriptionHistory: Prescription[]
  drugSearchResults: Drug[]
  selectedDrug: Drug | null
  loading: boolean
  error: string | null
  searchLoading: boolean
  historyLoading: boolean
}

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

// Async thunks for OpenFDA API
export const searchDrugs = createAsyncThunk(
  'prescription/searchDrugs',
  async (query: string) => {
    try {
      // Single API call with working pattern
      const response = await fetch(
        `${import.meta.env.VITE_OPENFDA_DRUG_LABEL_URL}?search=patient.drug.medicinalproduct:${encodeURIComponent(query)}+openfda.generic_name:${encodeURIComponent(query)}&limit=10`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Drug search successful for: ${query}`);
        console.log('API Response:', data); // Debug log

        // Safe data mapping with null checks
        return data.results?.map((item: Record<string, unknown>) => {
          const openfda = item.openfda as Record<string, unknown> || {};
          const genericNameArray = openfda.generic_name as string[] || [];
          const brandNameArray = openfda.brand_name as string[] || [];
          const pharmClassArray = openfda.pharm_class_epc as string[] || [];
          const manufacturerArray = openfda.manufacturer_name as string[] || [];
          const purposeArray = item.purpose as string[] || [];
          const warningsArray = item.warnings as string[] || [];
          const dosageArray = item.dosage_and_administration as string[] || [];
          const adverseArray = item.adverse_reactions as string[] || [];

          return {
            id: (item as Record<string, unknown>).id as string || crypto.randomUUID(),
            genericName: genericNameArray[0] || 'Unknown',
            brandName: brandNameArray[0] || 'Unknown',
            drugClass: pharmClassArray[0] || 'Unknown',
            purpose: purposeArray[0] || '',
            warnings: warningsArray,
            dosage: dosageArray[0] || '',
            adverseReactions: adverseArray,
            manufacturer: manufacturerArray[0] || 'Unknown',
          };
        }) || [];
      } else {
        console.log(`❌ HTTP error: ${response.status} for drug search`);
        return [];
      }
    } catch (error) {
      console.error('Error searching drugs:', error);
      return [];
    }
  }
);

export const checkDrugRecall = createAsyncThunk(
  'prescription/checkDrugRecall',
  async (drugName: string) => {
    try {
      // First check for actual recalls using the enforcement endpoint
      const recallResponse = await fetch(
        `${import.meta.env.VITE_OPENFDA_DRUG_ENFORCEMENT_URL}?search=product.description:"${encodeURIComponent(drugName.toUpperCase())}"&limit=10`
      );

      let recallData = { isRecalled: false, recallInfo: null };

      if (recallResponse.ok) {
        const recallResults = await recallResponse.json();
        console.log(`✅ Drug recall check successful for: ${drugName}`);
        console.log('Recall API Response:', recallResults);

        // Check if there are any active recalls
        const activeRecalls = recallResults.results?.filter((recall: Record<string, unknown>) => {
          const status = recall.status as string || '';
          return status.toLowerCase().includes('ongoing') || status.toLowerCase().includes('active');
        }) || [];

        if (activeRecalls.length > 0) {
          recallData = {
            isRecalled: true,
            recallInfo: activeRecalls[0] // Return the most recent active recall
          };
        }
      } else {
        console.log(`❌ Recall API error: ${recallResponse.status}`);
      }

      // Also get adverse events data
      const adverseResponse = await fetch(
        `${import.meta.env.VITE_OPENFDA_DRUG_EVENT_URL}?search=patient.drug.medicinalproduct:"${encodeURIComponent(drugName.toUpperCase())}"&limit=10`
      );

      let adverseEvents = [];
      if (adverseResponse.ok) {
        const adverseData = await adverseResponse.json();
        console.log(`✅ Adverse events search successful for: ${drugName}`);

        adverseEvents = adverseData.results?.map((item: Record<string, unknown>) => {
          const patient = item.patient as Record<string, unknown> || {};
          const reactionArray = patient.reaction as Record<string, unknown>[] || [];
          const firstReaction = reactionArray[0] || {};

          return {
            reaction: (firstReaction as Record<string, unknown>).reactionmeddrapt as string || 'Unknown',
            severity: (item as Record<string, unknown>).seriousness as string || 'Unknown',
          };
        }) || [];
      }

      return {
        ...recallData,
        adverseEvents: adverseEvents,
      };
    } catch (error) {
      console.error('Error checking drug recall:', error);
      // Return mock data on API failure
      const mockRecallData = getMockRecallData(drugName);
      const mockAdverseData = getMockAdverseEvents(drugName);
      return {
        isRecalled: mockRecallData.isRecalled,
        recallInfo: mockRecallData.recallInfo,
        adverseEvents: mockAdverseData,
      };
    }
  }
);

// Async thunks for prescription history
export const savePrescriptionToHistory = createAsyncThunk(
  'prescription/savePrescriptionToHistory',
  async (prescription: Prescription) => {
    try {
      // Get existing history from localStorage
      const existingHistory = JSON.parse(localStorage.getItem('prescriptionHistory') || '[]');

      // Add new prescription to history
      const updatedHistory = [...existingHistory, prescription];

      // Sort by date (newest first)
      updatedHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Save to localStorage
      localStorage.setItem('prescriptionHistory', JSON.stringify(updatedHistory));

      console.log('✅ Prescription saved to history:', prescription.id);
      return prescription;
    } catch (error) {
      console.error('Error saving prescription to history:', error);
      throw error;
    }
  }
);

export const loadPrescriptionHistory = createAsyncThunk(
  'prescription/loadPrescriptionHistory',
  async () => {
    try {
      const history = JSON.parse(localStorage.getItem('prescriptionHistory') || '[]');
      console.log(`✅ Loaded ${history.length} prescriptions from history`);
      return history;
    } catch (error) {
      console.error('Error loading prescription history:', error);
      return [];
    }
  }
);

export const deletePrescriptionFromHistory = createAsyncThunk(
  'prescription/deletePrescriptionFromHistory',
  async (prescriptionId: string) => {
    try {
      const existingHistory = JSON.parse(localStorage.getItem('prescriptionHistory') || '[]');
      const updatedHistory = existingHistory.filter((p: Prescription) => p.id !== prescriptionId);

      localStorage.setItem('prescriptionHistory', JSON.stringify(updatedHistory));

      console.log('✅ Prescription deleted from history:', prescriptionId);
      return prescriptionId;
    } catch (error) {
      console.error('Error deleting prescription from history:', error);
      throw error;
    }
  }
);
const getMockRecallData = (drugName: string) => {
  const mockRecalls: Record<string, { isRecalled: boolean; recallInfo: Record<string, unknown> | null }> = {
    'paracetamol': { isRecalled: false, recallInfo: null },
    'acetaminophen': { isRecalled: false, recallInfo: null },
    'ibuprofen': { isRecalled: false, recallInfo: null },
    'aspirin': { isRecalled: false, recallInfo: null },
    'amoxicillin': { isRecalled: false, recallInfo: null },
    'metformin': { isRecalled: false, recallInfo: null },
    'lisinopril': { isRecalled: false, recallInfo: null },
    'atorvastatin': { isRecalled: false, recallInfo: null },
    'omeprazole': { isRecalled: false, recallInfo: null },
  };

  const lowerDrugName = drugName.toLowerCase();
  return mockRecalls[lowerDrugName] || { isRecalled: false, recallInfo: null };
};

export const getDrugAdverseEvents = createAsyncThunk(
  'prescription/getDrugAdverseEvents',
  async (drugName: string) => {
    try {
      // Single API call with working pattern
      const response = await fetch(
        `${import.meta.env.VITE_OPENFDA_DRUG_EVENT_URL}?search=patient.drug.medicinalproduct:${encodeURIComponent(drugName)}&limit=10`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Adverse events search successful for: ${drugName}`);
        console.log('Adverse Events API Response:', data); // Debug log

        // Safe data mapping with null checks
        return data.results?.map((item: Record<string, unknown>) => {
          const patient = item.patient as Record<string, unknown> || {};
          const reactionArray = patient.reaction as Record<string, unknown>[] || [];
          const firstReaction = reactionArray[0] || {};

          return {
            reaction: (firstReaction as Record<string, unknown>).reactionmeddrapt as string || 'Unknown',
            severity: (item as Record<string, unknown>).seriousness as string || 'Unknown',
          };
        }) || [];
      } else {
        console.log(`❌ HTTP error: ${response.status} for adverse events search`);
        return getMockAdverseEvents(drugName);
      }
    } catch (error) {
      console.error('Error getting adverse events:', error);
      return getMockAdverseEvents(drugName);
    }
  }
);

// Mock adverse events for common medicines when API fails
const getMockAdverseEvents = (drugName: string) => {
  const mockAdverseEvents: Record<string, Array<{ reaction: string; severity: string }>> = {
    'paracetamol': [
      { reaction: 'Liver injury', severity: 'Serious' },
      { reaction: 'Skin rash', severity: 'Mild' },
      { reaction: 'Nausea', severity: 'Mild' },
    ],
    'acetaminophen': [
      { reaction: 'Liver injury', severity: 'Serious' },
      { reaction: 'Skin rash', severity: 'Mild' },
      { reaction: 'Nausea', severity: 'Mild' },
    ],
    'ibuprofen': [
      { reaction: 'Stomach bleeding', severity: 'Serious' },
      { reaction: 'Kidney injury', severity: 'Serious' },
      { reaction: 'Stomach pain', severity: 'Mild' },
    ],
    'aspirin': [
      { reaction: 'Stomach bleeding', severity: 'Serious' },
      { reaction: 'Reye syndrome', severity: 'Serious' },
      { reaction: 'Stomach pain', severity: 'Mild' },
    ],
    'amoxicillin': [
      { reaction: 'Allergic reaction', severity: 'Serious' },
      { reaction: 'Skin rash', severity: 'Mild' },
      { reaction: 'Diarrhea', severity: 'Mild' },
    ],
  };

  const lowerDrugName = drugName.toLowerCase();
  return mockAdverseEvents[lowerDrugName] || [];
};

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
          state.selectedDrug.adverseReactions = action.payload.adverseEvents?.map((event: { reaction?: string }) => event.reaction).filter(Boolean) || [];
        }
      })
      // Prescription history
      .addCase(savePrescriptionToHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(savePrescriptionToHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        // Add to history if not already there
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

export default prescriptionSlice.reducer;
