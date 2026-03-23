import Dexie, { type Table } from 'dexie'
import { type LocalDoctor } from '../doctorSlice'

export class DoctorDatabase extends Dexie {
  doctors!: Table<LocalDoctor>

  constructor() {
    super('mediCareDoctorDB')
    this.version(1).stores({
      doctors: '++id, npi, firstName, lastName, addedAt'
    })
  }
}

export const doctorDB = new DoctorDatabase()

// Database operations
export const doctorDBOperations = {
  // Get all local doctors
  getAll: async (): Promise<LocalDoctor[]> => {
    return await doctorDB.doctors.orderBy('addedAt').reverse().toArray()
  },

  // Add a new doctor
  add: async (doctor: Omit<LocalDoctor, 'id' | 'addedAt'>): Promise<number> => {
    const doctorWithTimestamp: LocalDoctor = {
      ...doctor,
      addedAt: new Date().toISOString()
    }
    return await doctorDB.doctors.add(doctorWithTimestamp)
  },

  // Remove a doctor
  remove: async (id: number): Promise<void> => {
    return await doctorDB.doctors.delete(id)
  },

  // Find by NPI
  findByNPI: async (npi: string): Promise<LocalDoctor | undefined> => {
    return await doctorDB.doctors.where('npi').equals(npi).first()
  },

  // Search local doctors
  search: async (query: string): Promise<LocalDoctor[]> => {
    const lowerQuery = query.toLowerCase()
    return await doctorDB.doctors
      .filter(doctor => 
        doctor.firstName.toLowerCase().includes(lowerQuery) ||
        doctor.lastName.toLowerCase().includes(lowerQuery) ||
        doctor.specialty?.toLowerCase().includes(lowerQuery) ||
        doctor.npi.includes(query)
      )
      .toArray()
  }
}
