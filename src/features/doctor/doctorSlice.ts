import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

// NPI API Types
export interface NPIAddress {
  address_1?: string
  address_2?: string
  city?: string
  state?: string
  postal_code?: string
  country_code?: string
  telephone_number?: string
}

export interface NPITaxonomy {
  code?: string
  desc?: string
  primary?: boolean
}

export interface NPIBasic {
  npi?: string
  first_name?: string
  last_name?: string
  middle_name?: string
  credential?: string
  gender?: string
  enumeration_date?: string
  last_updated?: string
  status?: string
}

export interface NPIResult {
  basic?: NPIBasic
  addresses?: NPIAddress[]
  taxonomies?: NPITaxonomy[]
}

export interface NPISearchResponse {
  result_count?: number
  results?: NPIResult[]
  skip?: number
  limit?: number
  Errors?: Array<{
    description?: string
    field?: string
    number?: number
  }>
}

// Local Doctor Type (stored in Dexie)
export interface LocalDoctor {
  id?: number
  npi: string
  firstName: string
  lastName: string
  middleName?: string
  credential?: string
  gender?: string
  specialty?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  phone?: string
  addedAt: string
}

// Search State
interface DoctorState {
  searchResults: NPIResult[]
  localDoctors: LocalDoctor[]
  loading: boolean
  error: string | null
  searchQuery: string
  selectedTaxonomy: string
  currentPage: number
  totalPages: number
  resultCount: number
  activeTab: 'search' | 'internal'
}

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

// Async Thunks
export const searchDoctors = createAsyncThunk(
  'doctor/searchDoctors',
  async ({
    firstName,
    lastName,
    taxonomy,
    city,
    state,
    skip = 0,
    limit = 10
  }: {
    firstName?: string
    lastName?: string
    taxonomy?: string
    city?: string
    state?: string
    skip?: number
    limit?: number
  }) => {
    // Check if at least one search parameter is provided (trim whitespace)
    const hasSearchCriteria =
      (firstName && firstName.trim()) ||
      (lastName && lastName.trim()) ||
      (taxonomy && taxonomy.trim()) ||
      (city && city.trim()) ||
      (state && state.trim())

    if (!hasSearchCriteria) {
      throw new Error('Please provide at least one search criteria (name, specialty, city, or state)')
    }

    const params = new URLSearchParams({
      version: '2.1',
      limit: limit.toString(),
      skip: skip.toString()
    })

    // Only add parameters that have actual values
    if (firstName && firstName.trim()) {
      params.append('first_name', firstName.trim())
    }
    if (lastName && lastName.trim()) {
      params.append('last_name', lastName.trim())
    }
    if (taxonomy && taxonomy.trim()) {
      params.append('taxonomy_description', taxonomy.trim())
    }
    if (city && city.trim()) {
      params.append('city', city.trim())
    }
    if (state && state.trim()) {
      params.append('state', state.trim())
    }

    const url = `https://npiregistry.cms.hhs.gov/api?${params.toString()}`
    console.log('NPI API URL:', url) // Debug log

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to fetch doctors from NPI registry')
    }

    const data: NPISearchResponse = await response.json()

    // Check for API errors
    if (data.Errors && data.Errors.length > 0) {
      throw new Error(data.Errors[0].description || 'API error occurred')
    }

    return data
  }
)

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
    },
    addLocalDoctor: (state, action: PayloadAction<LocalDoctor>) => {
      state.localDoctors.unshift(action.payload)
    },
    removeLocalDoctor: (state, action: PayloadAction<number>) => {
      state.localDoctors = state.localDoctors.filter(doc => doc.id !== action.payload)
    },
    setLocalDoctors: (state, action: PayloadAction<LocalDoctor[]>) => {
      state.localDoctors = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
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
  }
})

export const {
  setSearchQuery,
  setSelectedTaxonomy,
  setCurrentPage,
  setActiveTab,
  clearError,
  addLocalDoctor,
  removeLocalDoctor,
  setLocalDoctors
} = doctorSlice.actions

export default doctorSlice.reducer
