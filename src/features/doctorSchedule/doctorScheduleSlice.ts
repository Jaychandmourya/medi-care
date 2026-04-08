import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { db, type DoctorSchedule } from '@/features/db/dexie'
import { appointmentServices } from '@/services/appointmentServices'

interface DoctorScheduleState {
  schedules: DoctorSchedule[]
  loading: boolean
  error: string | null
}

const initialState: DoctorScheduleState = {
  schedules: [],
  loading: false,
  error: null
}

// Async thunks
export const fetchDoctorSchedules = createAsyncThunk(
  'doctorSchedule/fetchSchedules',
  async () => {
    return await appointmentServices.fetchDoctorSchedules()
  }
)

export const addDoctorSchedule = createAsyncThunk(
  'doctorSchedule/addSchedule',
  async (scheduleData: {
    doctorId: string
    workingDays: number[]
    startTime: string
    endTime: string
    slotDuration: 15 | 20 | 30
    lunchBreakStart?: string
    lunchBreakEnd?: string
  }) => {
    return await appointmentServices.addDoctorSchedule(
      scheduleData.doctorId,
      scheduleData
    )
  }
)

export const updateDoctorSchedule = createAsyncThunk(
  'doctorSchedule/updateSchedule',
  async ({ id, updates }: { id: string; updates: Partial<DoctorSchedule> }) => {
    await db.doctorSchedules.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
    return { id, updates }
  }
)

export const deleteDoctorSchedule = createAsyncThunk(
  'doctorSchedule/deleteSchedule',
  async (id: string) => {
    await db.doctorSchedules.delete(id)
    return id
  }
)

const doctorScheduleSlice = createSlice({
  name: 'doctorSchedule',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch schedules
      .addCase(fetchDoctorSchedules.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDoctorSchedules.fulfilled, (state, action) => {
        state.loading = false
        state.schedules = action.payload
      })
      .addCase(fetchDoctorSchedules.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch doctor schedules'
      })
      // Add schedule
      .addCase(addDoctorSchedule.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addDoctorSchedule.fulfilled, (state, action) => {
        state.loading = false
        const existingIndex = state.schedules.findIndex(s => s.doctorId === action.payload.doctorId)
        if (existingIndex >= 0) {
          state.schedules[existingIndex] = action.payload
        } else {
          state.schedules.push(action.payload)
        }
      })
      .addCase(addDoctorSchedule.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to add doctor schedule'
      })
      // Update schedule
      .addCase(updateDoctorSchedule.fulfilled, (state, action) => {
        const { id, updates } = action.payload
        const index = state.schedules.findIndex(s => s.id === id)
        if (index >= 0) {
          state.schedules[index] = { ...state.schedules[index], ...updates }
        }
      })
      // Delete schedule
      .addCase(deleteDoctorSchedule.fulfilled, (state, action) => {
        state.schedules = state.schedules.filter(s => s.id !== action.payload)
      })
  }
})

export const { clearError } = doctorScheduleSlice.actions
export default doctorScheduleSlice.reducer
