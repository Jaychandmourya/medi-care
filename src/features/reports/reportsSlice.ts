import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

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
      // Simulate fetching from IndexedDB or API
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return {
          date: date.toISOString().split('T')[0],
          patients: Math.floor(Math.random() * 50) + 20, // 20-70 patients per day
        }
      })
      return last30Days
    } catch {
      return rejectWithValue('Failed to fetch OPD trend data')
    }
  }
)

export const fetchBedOccupancy = createAsyncThunk(
  'reports/fetchBedOccupancy',
  async (_, { rejectWithValue }) => {
    try {
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return {
          date: date.toISOString().split('T')[0],
          occupancyRate: Math.floor(Math.random() * 40) + 50, // 50-90% occupancy
        }
      })
      return last30Days
    } catch {
      return rejectWithValue('Failed to fetch bed occupancy data')
    }
  }
)

export const fetchDepartmentDistribution = createAsyncThunk(
  'reports/fetchDepartmentDistribution',
  async (_, { rejectWithValue }) => {
    try {
      const departments = [
        { name: 'Cardiology', count: 150 },
        { name: 'Neurology', count: 120 },
        { name: 'Orthopedics', count: 180 },
        { name: 'Pediatrics', count: 200 },
        { name: 'General Medicine', count: 250 },
        { name: 'Emergency', count: 100 },
      ]

      const total = departments.reduce((sum, dept) => sum + dept.count, 0)

      return departments.map(dept => ({
        department: dept.name,
        count: dept.count,
        percentage: Math.round((dept.count / total) * 100),
      }))
    } catch {
      return rejectWithValue('Failed to fetch department distribution data')
    }
  }
)

export const fetchAppointmentStatus = createAsyncThunk(
  'reports/fetchAppointmentStatus',
  async (_, { rejectWithValue }) => {
    try {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return {
          date: date.toISOString().split('T')[0],
          'Completed': Math.floor(Math.random() * 30) + 20,
          'Cancelled': Math.floor(Math.random() * 10) + 5,
          'No-Show': Math.floor(Math.random() * 8) + 2,
        }
      })

      return last7Days.flatMap(day => [
        { status: 'Completed' as const, count: day['Completed'], date: day.date },
        { status: 'Cancelled' as const, count: day['Cancelled'], date: day.date },
        { status: 'No-Show' as const, count: day['No-Show'], date: day.date },
      ])
    } catch {
      return rejectWithValue('Failed to fetch appointment status data')
    }
  }
)

export const fetchDoctorWorkload = createAsyncThunk(
  'reports/fetchDoctorWorkload',
  async (_, { rejectWithValue }) => {
    try {
      const doctors = [
        { name: 'Dr. Smith', department: 'Cardiology', appointments: 45 },
        { name: 'Dr. Johnson', department: 'Neurology', appointments: 38 },
        { name: 'Dr. Williams', department: 'Orthopedics', appointments: 52 },
        { name: 'Dr. Brown', department: 'Pediatrics', appointments: 61 },
        { name: 'Dr. Davis', department: 'General Medicine', appointments: 73 },
        { name: 'Dr. Miller', department: 'Emergency', appointments: 29 },
      ]

      return doctors.map(doctor => ({
        doctorName: doctor.name,
        appointments: doctor.appointments,
        department: doctor.department,
      }))
    } catch {
      return rejectWithValue('Failed to fetch doctor workload data')
    }
  }
)

export const fetchRevenue = createAsyncThunk(
  'reports/fetchRevenue',
  async (_, { rejectWithValue }) => {
    try {
      const departments = [
        { name: 'Cardiology', revenue: 250000 },
        { name: 'Neurology', revenue: 180000 },
        { name: 'Orthopedics', revenue: 320000 },
        { name: 'Pediatrics', revenue: 150000 },
        { name: 'General Medicine', revenue: 280000 },
        { name: 'Emergency', revenue: 200000 },
      ]

      return departments.map(dept => ({
        department: dept.name,
        revenue: dept.revenue,
      }))
    } catch {
      return rejectWithValue('Failed to fetch revenue data')
    }
  }
)

export const fetchDrugRecalls = createAsyncThunk(
  'reports/fetchDrugRecalls',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate OpenFDA API call
      const mockData = [
        { drugClass: 'Antibiotics', recallCount: 12 },
        { drugClass: 'Pain Relievers', recallCount: 8 },
        { drugClass: 'Cardiovascular', recallCount: 15 },
        { drugClass: 'Diabetes', recallCount: 6 },
        { drugClass: 'Mental Health', recallCount: 9 },
      ]

      return mockData.map(item => ({
        drugClass: item.drugClass,
        recallCount: item.recallCount,
        lastUpdated: new Date().toISOString(),
      }))
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
