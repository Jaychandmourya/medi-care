import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Prescription } from '@/types/prescription/prescriptionType'

// Mock data functions
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


// Async thunks for OpenFDA API
export const searchDrugs = createAsyncThunk(
  'prescription/searchDrugs',
  async (query: string) => {
    try {
      // Updated API call using brand_name and generic_name parameters as requested
      const response = await fetch(
        `${import.meta.env.VITE_OPENFDA_DRUG_LABEL_URL}?search=openfda.brand_name:${encodeURIComponent(query)}*+openfda.generic_name:${encodeURIComponent(query)}*&limit=10`
      );

      if (response.ok) {
        const data = await response.json();

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
      return {
        isRecalled: mockRecallData.isRecalled,
        recallInfo: mockRecallData.recallInfo,
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
      }
    } catch (error) {
      console.error('Error getting adverse events:', error);
    }
  }
);