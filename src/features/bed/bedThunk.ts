import { createAsyncThunk } from '@reduxjs/toolkit'
import type { BedStatus, Bed } from './bedSlice'

// Async thunks for IndexedDB operations
export const fetchBeds = createAsyncThunk(
  'beds/fetchBeds',
  async () => {
    const db = (await import('@/services/bedAndWardServices')).default
    return await db.beds.toArray()
  }
)

export const fetchWards = createAsyncThunk(
  'beds/fetchWards',
  async () => {
    const db = (await import('@/services/bedAndWardServices')).default
    return await db.wards.toArray()
  }
)

export const updateBedStatus = createAsyncThunk(
  'beds/updateBedStatus',
  async ({ bedId, status, notes }: { bedId: string; status: BedStatus; notes?: string }) => {
    const db = (await import('@/services/bedAndWardServices')).default
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
    const db = (await import('@/services/bedAndWardServices')).default
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
    const db = (await import('@/services/bedAndWardServices')).default
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