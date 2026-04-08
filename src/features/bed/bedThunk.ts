import { createAsyncThunk } from '@reduxjs/toolkit'
import type{ Bed, Ward, BedStatus } from '@/types/bed/bedType'
import {
  getAllBeds,
  getAllWards,
  getBedById,
  getWardById,
  addBed,
  addWard,
  updateBed as updateBedService,
  updateWard as updateWardService,
  deleteBed as deleteBedService,
  deleteWard as deleteWardService,
  deleteBedsByWard
} from '@/services/bedAndWardServices'

// Bed CRUD Operations
export const fetchBeds = createAsyncThunk(
  'beds/fetchBeds',
  async () => {
    return await getAllBeds()
  }
)

export const createBed = createAsyncThunk(
  'beds/createBed',
  async (bed: Omit<Bed, 'bedId'>) => {
    const ward = await getWardById(bed.ward)
    const existingBeds = await getAllBeds()
    const bedsInWard = existingBeds.filter(b => b.ward === bed.ward)
    const bedNumber = bedsInWard.length + 1
    const bedId = `${bed.ward}-${bedNumber.toString().padStart(3, '0')}`

    const newBed = { ...bed, bedId }
    await addBed(newBed)

    if (ward) {
      await updateWardService(bed.ward, { totalBeds: ward.totalBeds + 1 })
    }

    return newBed
  }
)

export const updateBed = createAsyncThunk(
  'beds/updateBed',
  async ({ bedId, data }: { bedId: string; data: Partial<Bed> }) => {
    await updateBedService(bedId, data)
    const updatedBed = await getBedById(bedId)
    return updatedBed as Bed
  }
)

export const deleteBed = createAsyncThunk(
  'beds/deleteBed',
  async (bedId: string) => {
    const bed = await getBedById(bedId)
    await deleteBedService(bedId)

    if (bed) {
      const ward = await getWardById(bed.ward)
      if (ward) {
        await updateWardService(bed.ward, { totalBeds: Math.max(0, ward.totalBeds - 1) })
      }
    }

    return bedId
  }
)

// Ward CRUD Operations
export const fetchWards = createAsyncThunk(
  'beds/fetchWards',
  async () => {
    return await getAllWards()
  }
)

export const createWard = createAsyncThunk(
  'beds/createWard',
  async (ward: Omit<Ward, 'wardId'>) => {
    const wardId = ward.name.toLowerCase().replace(/\s+/g, '-')
    const newWard = { ...ward, wardId }
    await addWard(newWard)
    return newWard
  }
)

export const updateWard = createAsyncThunk(
  'beds/updateWard',
  async ({ wardId, data }: { wardId: string; data: Partial<Ward> }) => {
    await updateWardService(wardId, data)
    const updatedWard = await getWardById(wardId)
    return updatedWard as Ward
  }
)

export const deleteWard = createAsyncThunk(
  'beds/deleteWard',
  async (wardId: string) => {
    await deleteBedsByWard(wardId)
    await deleteWardService(wardId)
    return wardId
  }
)

// Legacy operations
export const updateBedStatus = createAsyncThunk(
  'beds/updateBedStatus',
  async ({ bedId, status, notes }: { bedId: string; status: BedStatus; notes?: string }) => {
    const updateData: Partial<Bed> = { status, notes }

    if (status === 'occupied') {
      updateData.admittedAt = new Date().toISOString()
    } else if (status === 'available') {
      updateData.patientId = undefined
      updateData.admittedAt = undefined
    }

    await updateBedService(bedId, updateData)
    const updatedBed = await getBedById(bedId)
    return updatedBed as Bed
  }
)

export const admitPatient = createAsyncThunk(
  'beds/admitPatient',
  async ({ bedId, patientId }: { bedId: string; patientId: string }) => {
    const updateData = {
      status: 'occupied' as BedStatus,
      patientId,
      admittedAt: new Date().toISOString()
    }
    await updateBedService(bedId, updateData)
    const updatedBed = await getBedById(bedId)
    return updatedBed as Bed
  }
)

export const dischargePatient = createAsyncThunk(
  'beds/dischargePatient',
  async (bedId: string) => {
    const updateData = {
      status: 'available' as BedStatus,
      patientId: undefined,
      admittedAt: undefined,
      notes: `Discharged at ${new Date().toISOString()}`
    }
    await updateBedService(bedId, updateData)
    const updatedBed = await getBedById(bedId)
    return updatedBed as Bed
  }
)