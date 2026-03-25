import { type LocalDoctor } from '../doctorSlice'
import { db, type Doctor } from '../../patient/db/dexie'

// Database operations using MediCareDB
export const doctorDBOperations = {
  // Get all local doctors
  getAll: async (): Promise<LocalDoctor[]> => {
    const doctors = await db.doctors.orderBy('createdAt').reverse().toArray()
    return doctors.map(doctor => ({
      id: doctor.id,
      npi: doctor.id, // Using doctor ID as NPI for compatibility
      firstName: doctor.name.split(' ')[0] || '',
      lastName: doctor.name.split(' ').slice(1).join(' ') || '',
      email: doctor.email,
      specialty: doctor.specialization,
      city: doctor.city,
      state: doctor.state,
      country: doctor.country, // Map country to county for compatibility
      address: `${doctor.city || ''}, ${doctor.state || ''}`.trim(),
      contact: doctor.contact,
      postalCode: doctor.postalCode || '',
      credential: undefined,
      gender: undefined,
      addedAt: doctor.createdAt
    }))
  },

  // Add a new doctor
  add: async (doctor: Omit<LocalDoctor, 'id' | 'addedAt'>): Promise<number> => {
    const doctorData: Doctor = {
      id: doctor.npi || `DOC-${Date.now()}`,
      name: `${doctor.firstName} ${doctor.lastName}`.trim(),
      department: doctor.specialty || 'General',
      specialization: doctor.specialty || 'General Practice',
      email: doctor.email || '',
      contact: doctor.contact,
      city: doctor.city,
      state: doctor.state,
      country: doctor.country,
      postalCode: doctor.postalCode || '',
      isActive: true,
      createdAt: new Date().toISOString()
    }
    return await db.doctors.add(doctorData)
  },

  // Update an existing doctor
  update: async (id: number, updates: Partial<LocalDoctor>): Promise<number> => {
    console.log('updates',updates)
    const doctorId = id.toString()
    const existingDoctor = await db.doctors.get(doctorId)
    if (!existingDoctor) return 0

    const updateData: Partial<Doctor> = {}
    if (updates.firstName || updates.lastName) {
      updateData.name = `${updates.firstName || existingDoctor.name.split(' ')[0]} ${updates.lastName || existingDoctor.name.split(' ').slice(1).join(' ')}`.trim()
    }
    if (updates.specialty !== undefined) {
      updateData.specialization = updates.specialty
      updateData.department = updates.specialty
    }
    if (updates.city !== undefined) updateData.city = updates.city
    if (updates.state !== undefined) updateData.state = updates.state
    if (updates.county !== undefined) updateData.country = updates.county
    if (updates.contact !== undefined) updateData.contact = updates.contact
    if(updates.email !== undefined) updateData.email = updates.email
    return await db.doctors.update(doctorId, updateData)
  },

  // Remove a doctor
  remove: async (id: number): Promise<void> => {
    return await db.doctors.delete(id.toString())
  },

  // Find by NPI (using doctor ID)
  findByNPI: async (npi: string): Promise<LocalDoctor | undefined> => {
    const doctor = await db.doctors.get(npi)
    if (!doctor) return undefined

    return {
      id: doctor.id,
      npi: doctor.id,
      firstName: doctor.name.split(' ')[0] || '',
      lastName: doctor.name.split(' ').slice(1).join(' ') || '',
      specialty: doctor.specialization,
      city: doctor.city,
      state: doctor.state,
      country: doctor.country,
      email: doctor.email,
      address: `${doctor.city || ''}, ${doctor.state || ''}`.trim(),
      contact: doctor.contact,
      postalCode: doctor.postalCode || '',
      credential: undefined,
      gender: undefined,
      addedAt: doctor.createdAt
    }
  },

  // Find by ID
  findById: async (id: number): Promise<LocalDoctor | undefined> => {
    const doctor = await db.doctors.get(id.toString())
    if (!doctor) return undefined

    return {
      id: parseInt(doctor.id),
      npi: doctor.id,
      firstName: doctor.name.split(' ')[0] || '',
      lastName: doctor.name.split(' ').slice(1).join(' ') || '',
      specialty: doctor.specialization,
      city: doctor.city,
      email: doctor.email,
      state: doctor.state,
      county: doctor.country,
      address: `${doctor.city || ''}, ${doctor.state || ''}`.trim(),
      phone: doctor.phone,
      contact: doctor.contact,
      postalCode: undefined,
      credential: undefined,
      gender: undefined,
      addedAt: doctor.createdAt
    }
  },

  // Search local doctors
  search: async (query: string): Promise<LocalDoctor[]> => {
    const lowerQuery = query.toLowerCase()
    const allDoctors = await db.doctors.toArray()
    return allDoctors.filter(doctor =>
      doctor.name.toLowerCase().includes(lowerQuery) ||
      (doctor.specialization && doctor.specialization.toLowerCase().includes(lowerQuery)) ||
      doctor.id.includes(query) ||
      (doctor.city && doctor.city.toLowerCase().includes(lowerQuery)) ||
      (doctor.state && doctor.state.toLowerCase().includes(lowerQuery)) ||
      (doctor.country && doctor.country.toLowerCase().includes(lowerQuery)) ||
      (doctor.contact && doctor.contact.toLowerCase().includes(lowerQuery))
    ).map(doctor => ({
      id: doctor.id,
      npi: doctor.id,
      firstName: doctor.name.split(' ')[0] || '',
      lastName: doctor.name.split(' ').slice(1).join(' ') || '',
      specialty: doctor.specialization,
      city: doctor.city,
      state: doctor.state,
      email: doctor.email,
      county: doctor.country,
      address: `${doctor.city || ''}, ${doctor.state || ''}`.trim(),
      phone: doctor.phone,
      contact: doctor.contact,
      postalCode: undefined,
      credential: undefined,
      gender: undefined,
      addedAt: doctor.createdAt
    }))
  }
}
