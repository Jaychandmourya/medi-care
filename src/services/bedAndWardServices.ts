import { db } from '@/features/db/dexie'
import type{ Bed, Ward } from '@/types/bed/bedType'

// Initialize database with sample data
export const initializeDatabase = async () => {
  const existingWards = await db.wards.count()
  if (existingWards === 0) {
    const sampleWards: Ward[] = [
      { wardId: 'general', name: 'General Ward', totalBeds: 20, floor: '1' },
      { wardId: 'icu', name: 'ICU', totalBeds: 10, floor: '2' },
      { wardId: 'pediatric', name: 'Pediatric', totalBeds: 15, floor: '1' },
      { wardId: 'maternity', name: 'Maternity', totalBeds: 12, floor: '3' },
      { wardId: 'emergency', name: 'Emergency', totalBeds: 8, floor: 'Ground' }
    ]
    await db.wards.bulkAdd(sampleWards)
  }

  const existingBeds = await db.beds.count()
  if (existingBeds === 0) {
    const sampleBeds: Bed[] = []
    const wards = await db.wards.toArray()

    wards.forEach(ward => {
      for (let i = 1; i <= ward.totalBeds; i++) {
        const random = Math.random()
        let status: 'available' | 'occupied' | 'reserved' | 'maintenance'
        let patientId: string | undefined
        let admittedAt: string | undefined

        if (random > 0.7) {
          status = 'occupied'
          patientId = `PAT-${Math.floor(Math.random() * 1000)}`
          admittedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        } else if (random > 0.5) {
          status = 'reserved'
        } else if (random > 0.3) {
          status = 'maintenance'
        } else {
          status = 'available'
        }

        sampleBeds.push({
          bedId: `${ward.wardId}-${i.toString().padStart(3, '0')}`,
          ward: ward.wardId,
          status,
          patientId,
          admittedAt,
          notes: random > 0.8 ? 'Additional notes about this bed' : undefined
        })
      }
    })

    await db.beds.bulkAdd(sampleBeds)
  }
}

// ==================== SHOW/GET FUNCTIONS ====================

export const getAllBeds = async (): Promise<Bed[]> => {
  return await db.beds.toArray()
}

export const getAllWards = async (): Promise<Ward[]> => {
  return await db.wards.toArray()
}

export const getBedById = async (bedId: string): Promise<Bed | undefined> => {
  return await db.beds.get(bedId)
}

export const getWardById = async (wardId: string): Promise<Ward | undefined> => {
  return await db.wards.get(wardId)
}

export const getBedsByWard = async (wardId: string): Promise<Bed[]> => {
  return await db.beds.where('ward').equals(wardId).toArray()
}

// ==================== ADD FUNCTIONS ====================

export const addBed = async (bed: Bed): Promise<string> => {
  return await db.beds.add(bed)
}

export const addWard = async (ward: Ward): Promise<string> => {
  return await db.wards.add(ward)
}

export const addBedsBulk = async (beds: Bed[]): Promise<void> => {
  await db.beds.bulkAdd(beds)
}

// ==================== UPDATE FUNCTIONS ====================

export const updateBed = async (bedId: string, updates: Partial<Bed>): Promise<number> => {
  return await db.beds.update(bedId, updates)
}

export const updateWard = async (wardId: string, updates: Partial<Ward>): Promise<number> => {
  return await db.wards.update(wardId, updates)
}

// ==================== DELETE FUNCTIONS ====================

export const deleteBed = async (bedId: string): Promise<void> => {
  await db.beds.delete(bedId)
}

export const deleteWard = async (wardId: string): Promise<void> => {
  await db.wards.delete(wardId)
}

export const deleteBedsByWard = async (wardId: string): Promise<number> => {
  return await db.beds.where('ward').equals(wardId).delete()
}

export default db