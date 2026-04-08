import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { DoctorState } from '@/types/doctors/doctorType'

import {
  searchDoctors,
  fetchLocalDoctors,
  addLocalDoctor,
  updateLocalDoctor,
  deleteLocalDoctor,
  searchLocalDoctors,
} from './doctorThunk'



// Search State

const initialState: DoctorState = {
  searchResults: [],
  localDoctors: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedTaxonomy: '',
  currentPage: 1,
  totalPages: 0,
  resultCount: 0,
  activeTab: 'search'
}


// Common taxonomy codes for dropdown
export const COMMON_TAXONOMIES = [
  { code: '207R00000X', desc: 'Internal Medicine' },
  { code: '207Q00000X', desc: 'Family Medicine' },
  { code: '208000000X', desc: 'Pediatrics' },
  { code: '207RC0000X', desc: 'Cardiovascular Disease' },
  { code: '207X00000X', desc: 'Orthopaedic Surgery' },
  { code: '207Y00000X', desc: 'Neurology' },
  { code: '207U00000X', desc: 'General Surgery' },
  { code: '207T00000X', desc: 'Psychiatry' },
  { code: '207PE0004X', desc: 'Emergency Medicine' },
  { code: '207V00000X', desc: 'Obstetrics & Gynecology' },
  { code: '207ZB0001X', desc: 'Anesthesiology' },
  { code: '207ZD0900X', desc: 'Dermatology' }
]

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setSelectedTaxonomy: (state, action: PayloadAction<string>) => {
      state.selectedTaxonomy = action.payload
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    setActiveTab: (state, action: PayloadAction<'search' | 'internal'>) => {
      state.activeTab = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // NPI Search
      .addCase(searchDoctors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchDoctors.fulfilled, (state, action) => {
        state.loading = false
        state.searchResults = action.payload.results || []
        state.resultCount = action.payload.result_count || 0
        state.totalPages = Math.ceil((action.payload.result_count || 0) / 10)
      })
      .addCase(searchDoctors.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to search doctors'
        state.searchResults = []
      })
      // Fetch Local Doctors
      .addCase(fetchLocalDoctors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLocalDoctors.fulfilled, (state, action) => {
        state.loading = false
        state.localDoctors = action.payload
      })
      .addCase(fetchLocalDoctors.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch local doctors'
      })
      // Add Local Doctor
      .addCase(addLocalDoctor.fulfilled, (state, action) => {
        state.localDoctors.unshift(action.payload)
      })
      .addCase(addLocalDoctor.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add doctor'
      })
      // Update Local Doctor
      .addCase(updateLocalDoctor.fulfilled, (state, action) => {
        const { id, updates } = action.payload
        const index = state.localDoctors.findIndex(doc => doc.id === id)
        if (index !== -1) {
          state.localDoctors[index] = { ...state.localDoctors[index], ...updates }
        }
      })
      .addCase(updateLocalDoctor.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update doctor'
      })
      // Delete Local Doctor
      .addCase(deleteLocalDoctor.fulfilled, (state, action) => {
        state.localDoctors = state.localDoctors.filter(doc => doc.id !== action.payload)
      })
      .addCase(deleteLocalDoctor.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete doctor'
      })
      // Search Local Doctors
      .addCase(searchLocalDoctors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchLocalDoctors.fulfilled, (state, action) => {
        state.loading = false
        state.localDoctors = action.payload
      })
      .addCase(searchLocalDoctors.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to search local doctors'
      })
  }
})

export const {
  setSearchQuery,
  setSelectedTaxonomy,
  setCurrentPage,
  setActiveTab,
  clearError
} = doctorSlice.actions

export default doctorSlice.reducer
