import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { reportsServices } from '@/services/reportsServices'

// Types
export interface OPDTrendData {
  date: string
  patients: number
}

export interface BedOccupancyData {
  date: string
  occupancyRate: number
}

export interface DepartmentDistribution {
  department: string
  count: number
  percentage: number
}

export interface AppointmentStatusData {
  status: 'Completed' | 'Cancelled' | 'No-Show'
  count: number
  date: string
}

export interface DoctorWorkloadData {
  doctorName: string
  appointments: number
  department: string
}

export interface RevenueData {
  department: string
  revenue: number
}

export interface DrugRecallData {
  drugClass: string
  recallCount: number
  lastUpdated: string
}

export interface ReportsState {
  opdTrend: OPDTrendData[]
  bedOccupancy: BedOccupancyData[]
  departmentDistribution: DepartmentDistribution[]
  appointmentStatus: AppointmentStatusData[]
  doctorWorkload: DoctorWorkloadData[]
  revenue: RevenueData[]
  drugRecalls: DrugRecallData[]
  loading: boolean
  error: string | null
}

const initialState: ReportsState = {
  opdTrend: [],
  bedOccupancy: [],
  departmentDistribution: [],
  appointmentStatus: [],
  doctorWorkload: [],
  revenue: [],
  drugRecalls: [],
  loading: false,
  error: null,
}

// Async thunks for fetching data
export const fetchOPDTrend = createAsyncThunk(
  'reports/fetchOPDTrend',
  async (_, { rejectWithValue }) => {
    try {
      const data = await reportsServices.fetchOPDTrend()
      return data
    } catch {
      return rejectWithValue('Failed to fetch OPD trend data')
    }
  }
)

export const fetchBedOccupancy = createAsyncThunk(
  'reports/fetchBedOccupancy',
  async (_, { rejectWithValue }) => {
    try {
      const data = await reportsServices.fetchBedOccupancy()
      return data
    } catch {
      return rejectWithValue('Failed to fetch bed occupancy data')
    }
  }
)

export const fetchDepartmentDistribution = createAsyncThunk(
  'reports/fetchDepartmentDistribution',
  async (_, { rejectWithValue }) => {
    try {
      const data = await reportsServices.fetchDepartmentDistribution()
      return data
    } catch {
      return rejectWithValue('Failed to fetch department distribution data')
    }
  }
)

export const fetchAppointmentStatus = createAsyncThunk(
  'reports/fetchAppointmentStatus',
  async (_, { rejectWithValue }) => {
    try {
      const data = await reportsServices.fetchAppointmentStatus()
      return data
    } catch {
      return rejectWithValue('Failed to fetch appointment status data')
    }
  }
)

export const fetchDoctorWorkload = createAsyncThunk(
  'reports/fetchDoctorWorkload',
  async (_, { rejectWithValue }) => {
    try {
      const data = await reportsServices.fetchDoctorWorkload()
      return data
    } catch {
      return rejectWithValue('Failed to fetch doctor workload data')
    }
  }
)

export const fetchRevenue = createAsyncThunk(
  'reports/fetchRevenue',
  async (_, { rejectWithValue }) => {
    try {
      const data = await reportsServices.fetchRevenue()
      return data
    } catch {
      return rejectWithValue('Failed to fetch revenue data')
    }
  }
)

export const fetchDrugRecalls = createAsyncThunk(
  'reports/fetchDrugRecalls',
  async (_, { rejectWithValue }) => {
    try {
      const data = await reportsServices.fetchDrugRecalls()
      return data
    } catch {
      return rejectWithValue('Failed to fetch drug recall data')
    }
  }
)

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // OPD Trend
      .addCase(fetchOPDTrend.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOPDTrend.fulfilled, (state, action: PayloadAction<OPDTrendData[]>) => {
        state.loading = false
        state.opdTrend = action.payload
      })
      .addCase(fetchOPDTrend.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Bed Occupancy
      .addCase(fetchBedOccupancy.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBedOccupancy.fulfilled, (state, action: PayloadAction<BedOccupancyData[]>) => {
        state.loading = false
        state.bedOccupancy = action.payload
      })
      .addCase(fetchBedOccupancy.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Department Distribution
      .addCase(fetchDepartmentDistribution.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDepartmentDistribution.fulfilled, (state, action: PayloadAction<DepartmentDistribution[]>) => {
        state.loading = false
        state.departmentDistribution = action.payload
      })
      .addCase(fetchDepartmentDistribution.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Appointment Status
      .addCase(fetchAppointmentStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAppointmentStatus.fulfilled, (state, action: PayloadAction<AppointmentStatusData[]>) => {
        state.loading = false
        state.appointmentStatus = action.payload
      })
      .addCase(fetchAppointmentStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Doctor Workload
      .addCase(fetchDoctorWorkload.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDoctorWorkload.fulfilled, (state, action: PayloadAction<DoctorWorkloadData[]>) => {
        state.loading = false
        state.doctorWorkload = action.payload
      })
      .addCase(fetchDoctorWorkload.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Revenue
      .addCase(fetchRevenue.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRevenue.fulfilled, (state, action: PayloadAction<RevenueData[]>) => {
        state.loading = false
        state.revenue = action.payload
      })
      .addCase(fetchRevenue.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Drug Recalls
      .addCase(fetchDrugRecalls.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDrugRecalls.fulfilled, (state, action: PayloadAction<DrugRecallData[]>) => {
        state.loading = false
        state.drugRecalls = action.payload
      })
      .addCase(fetchDrugRecalls.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = reportsSlice.actions
export default reportsSlice.reducer
