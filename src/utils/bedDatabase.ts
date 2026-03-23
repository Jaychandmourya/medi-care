import Dexie, { type Table } from 'dexie'
import type { Bed, Ward } from '@/features/bed/bedSlice'

export class BedDatabase extends Dexie {
  beds!: Table<Bed>
  wards!: Table<Ward>

  constructor() {
    super('MediCareBedDB')
    
    this.version(1).stores({
      beds: 'bedId, ward, status, patientId, admittedAt',
      wards: 'wardId, name, totalBeds, floor'
    })
  }
}

export const db = new BedDatabase()

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

export default db
