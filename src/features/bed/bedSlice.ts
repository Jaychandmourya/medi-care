import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

export type BedStatus = 'available' | 'occupied' | 'reserved' | 'maintenance'

export interface Bed {
  bedId: string
  ward: string
  status: BedStatus
  patientId?: string
  admittedAt?: string
  notes?: string
}

export interface Ward {
  wardId: string
  name: string
  totalBeds: number
  floor: string
}

interface BedState {
  beds: Bed[]
  wards: Ward[]
  selectedWard: string
  loading: boolean
  error: string | null
  simulationEnabled: boolean
}

const initialState: BedState = {
  beds: [],
  wards: [
    { wardId: 'general', name: 'General Ward', totalBeds: 20, floor: '1' },
    { wardId: 'icu', name: 'ICU', totalBeds: 10, floor: '2' },
    { wardId: 'pediatric', name: 'Pediatric', totalBeds: 15, floor: '1' },
    { wardId: 'maternity', name: 'Maternity', totalBeds: 12, floor: '3' },
    { wardId: 'emergency', name: 'Emergency', totalBeds: 8, floor: 'Ground' }
  ],
  selectedWard: 'general',
  loading: false,
  error: null,
  simulationEnabled: false
}

// Async thunks for IndexedDB operations
export const fetchBeds = createAsyncThunk(
  'beds/fetchBeds',
  async () => {
    const db = (await import('@/utils/bedDatabase')).default
    return await db.beds.toArray()
  }
)

export const fetchWards = createAsyncThunk(
  'beds/fetchWards',
  async () => {
    const db = (await import('@/utils/bedDatabase')).default
    return await db.wards.toArray()
  }
)

export const updateBedStatus = createAsyncThunk(
  'beds/updateBedStatus',
  async ({ bedId, status, notes }: { bedId: string; status: BedStatus; notes?: string }) => {
    const db = (await import('@/utils/bedDatabase')).default
    const updateData: Partial<Bed> = { status, notes }

    if (status === 'occupied') {
      updateData.admittedAt = new Date().toISOString()
    } else if (status === 'available') {
      updateData.patientId = undefined
      updateData.admittedAt = undefined
    }

    await db.beds.update(bedId, updateData)
    return { bedId, ...updateData }
  }
)

export const admitPatient = createAsyncThunk(
  'beds/admitPatient',
  async ({ bedId, patientId }: { bedId: string; patientId: string }) => {
    const db = (await import('@/utils/bedDatabase')).default
    const updateData = {
      status: 'occupied' as BedStatus,
      patientId,
      admittedAt: new Date().toISOString()
    }
    await db.beds.update(bedId, updateData)
    return { bedId, ...updateData }
  }
)

export const dischargePatient = createAsyncThunk(
  'beds/dischargePatient',
  async (bedId: string) => {
    const db = (await import('@/utils/bedDatabase')).default
    const updateData = {
      status: 'available' as BedStatus,
      patientId: undefined,
      admittedAt: undefined,
      notes: `Discharged at ${new Date().toISOString()}`
    }
    await db.beds.update(bedId, updateData)
    return { bedId, ...updateData }
  }
)

const bedSlice = createSlice({
  name: 'beds',
  initialState,
  reducers: {
    setSelectedWard: (state, action: PayloadAction<string>) => {
      state.selectedWard = action.payload
    },
    toggleSimulation: (state) => {
      state.simulationEnabled = !state.simulationEnabled
    },
    simulateBedStatusChange: (state) => {
      const availableBeds = state.beds.filter(bed => bed.ward === state.selectedWard)
      if (availableBeds.length > 0) {
        const randomBeds = availableBeds
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(Math.floor(Math.random() * 2) + 1, availableBeds.length))

        randomBeds.forEach(bed => {
          const statuses: BedStatus[] = ['available', 'occupied', 'reserved', 'maintenance']
          const currentStatusIndex = statuses.indexOf(bed.status)
          const newStatusIndex = (currentStatusIndex + Math.floor(Math.random() * 3) + 1) % statuses.length
          bed.status = statuses[newStatusIndex]

          if (bed.status === 'occupied') {
            bed.admittedAt = new Date().toISOString()
            bed.patientId = `PAT-${Math.floor(Math.random() * 1000)}`
          } else if (bed.status === 'available') {
            bed.patientId = undefined
            bed.admittedAt = undefined
          }
        })
      }
    },
    initializeBeds: (state) => {
      const newBeds: Bed[] = []
      state.wards.forEach(ward => {
        for (let i = 1; i <= ward.totalBeds; i++) {
          newBeds.push({
            bedId: `${ward.wardId}-${i.toString().padStart(3, '0')}`,
            ward: ward.wardId,
            status: Math.random() > 0.7 ? 'occupied' : Math.random() > 0.5 ? 'reserved' : Math.random() > 0.3 ? 'maintenance' : 'available',
            patientId: Math.random() > 0.7 ? `PAT-${Math.floor(Math.random() * 1000)}` : undefined,
            admittedAt: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            notes: Math.random() > 0.8 ? 'Additional notes about this bed' : undefined
          })
        }
      })
      state.beds = newBeds
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch beds
      .addCase(fetchBeds.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBeds.fulfilled, (state, action) => {
        state.loading = false
        state.beds = action.payload
      })
      .addCase(fetchBeds.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch beds'
      })
      // Fetch wards
      .addCase(fetchWards.fulfilled, (state, action) => {
        state.wards = action.payload
      })
      // Update bed status
      .addCase(updateBedStatus.fulfilled, (state, action) => {
        const bed = state.beds.find(b => b.bedId === action.payload.bedId)
        if (bed) {
          Object.assign(bed, action.payload)
        }
      })
      // Admit patient
      .addCase(admitPatient.fulfilled, (state, action) => {
        const bed = state.beds.find(b => b.bedId === action.payload.bedId)
        if (bed) {
          Object.assign(bed, action.payload)
        }
      })
      // Discharge patient
      .addCase(dischargePatient.fulfilled, (state, action) => {
        const bed = state.beds.find(b => b.bedId === action.payload.bedId)
        if (bed) {
          Object.assign(bed, action.payload)
        }
      })
  }
})

export const { setSelectedWard, toggleSimulation, simulateBedStatusChange, initializeBeds } = bedSlice.actions
export default bedSlice.reducer
