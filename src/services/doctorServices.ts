
import { db } from '@/features/db/dexie'

// import types file
import type { LocalDoctor, Doctor, DoctorSchedule } from '@/types/doctors/doctorType'


// Database operations using MediCareDB
export const doctorDBOperations = {
  // Get all local doctors with their schedules
  getAll: async (): Promise<LocalDoctor[]> => {
    const doctors = await db.doctors.orderBy('createdAt').reverse().toArray()
    const schedules = await db.doctorSchedules.toArray()

    return doctors.map(doctor => {
      const schedule = schedules.find(s => s.doctorId === doctor.id)
      return {
        id: doctor.id,
        npi: doctor.npi || doctor.id,
        name: doctor.name,
        firstName: doctor.name.split(' ')[0] || '',
        lastName: doctor.name.split(' ').slice(1).join(' ') || '',
        specialty: doctor.specialization,
        department: doctor.department || 'General Medicine',
        city: doctor.city,
        state: doctor.state,
        country: doctor.country,
        address: doctor.address,
        contact: doctor.contact,
        postalCode: doctor.postalCode || '',
        credential: undefined,
        gender: doctor.gender || 'M',
        addedAt: doctor.createdAt,
        doctorSchedule: schedule
      }
    })
  },

  // Add a new doctor
  add: async (doctor: Omit<LocalDoctor, 'id' | 'addedAt'> & { doctorSchedules?: Omit<DoctorSchedule, 'doctorId'> }): Promise<number> => {
    const doctorId = doctor.npi ? `NPI-${doctor.npi}` : `LOCAL-${Date.now()}`
    const doctorData: Doctor = {
      id: doctorId,
      npi: doctor.npi || `LOCAL-${Date.now()}`,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      name: `${doctor.firstName} ${doctor.lastName}`.trim(),
      department: doctor.department,
      specialization: doctor.specialty || 'General Practice',
      contact: doctor.contact,
      city: doctor.city,
      state: doctor.state,
      country: doctor.country,
      postalCode: doctor.postalCode || '',
      gender: doctor.gender,
      address: doctor.address,
      isActive: true,
      createdAt: new Date().toISOString()
    }
    const doctorResult = await db.doctors.add(doctorData)

    // Add doctor schedule if provided
    if (doctor.doctorSchedules) {
      const scheduleData: DoctorSchedule = {
        ...doctor.doctorSchedules,
        doctorId: doctorId
      }
      await db.doctorSchedules.add(scheduleData)
    }

    return doctorResult
  },

  // Update an existing doctor
  update: async (id: string, updates: Partial<LocalDoctor>): Promise<number> => {
    const existingDoctor = await db.doctors.get(id)
    if (!existingDoctor) return 0

    const updateData: Partial<Doctor> = {}
    if (updates.firstName || updates.lastName) {
      updateData.name = `${updates.firstName || existingDoctor.name.split(' ')[0]} ${updates.lastName || existingDoctor.name.split(' ').slice(1).join(' ')}`.trim()
      updateData.firstName = updates.firstName
      updateData.lastName = updates.lastName
    }
    if (updates.specialty !== undefined) {
      updateData.specialization = updates.specialty
    }
    if (updates.department !== undefined) {
      updateData.department = updates.department
    }
    if (updates.city !== undefined) updateData.city = updates.city
    if (updates.state !== undefined) updateData.state = updates.state
    if (updates.country !== undefined) updateData.country = updates.country
    if (updates.contact !== undefined) updateData.contact = updates.contact
    if (updates.email !== undefined) updateData.email = updates.email
    if (updates.postalCode !== undefined) updateData.postalCode = updates.postalCode
    if (updates.gender !== undefined) updateData.gender = updates.gender
    if (updates.address !== undefined) updateData.address = updates.address
    return await db.doctors.update(id, updateData)
  },

  // Remove a doctor
  remove: async (id: string): Promise<void> => {
    const doctor = await db.doctors.get(id);
    if (!doctor) {
      throw new Error(`Doctor with ID ${id} not found`);
    }
    await db.doctors.delete(id);
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
      department: doctor.department || 'General Medicine',
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
  findById: async (id: string): Promise<LocalDoctor | undefined> => {
    const doctor = await db.doctors.get(id)
    if (!doctor) return undefined

    return {
      id: doctor.id,
      npi: doctor.id,
      firstName: doctor.name.split(' ')[0] || '',
      lastName: doctor.name.split(' ').slice(1).join(' ') || '',
      specialty: doctor.specialization,
      department: doctor.department || 'General Medicine',
      city: doctor.city,
      email: doctor.email,
      state: doctor.state,
      country: doctor.country,
      address: `${doctor.city || ''}, ${doctor.state || ''}`.trim(),
      phone: doctor.phone,
      contact: doctor.contact,
      postalCode: undefined,
      credential: undefined,
      gender: undefined,
      addedAt: doctor.createdAt
    }
  },

  // Check if doctor exists by first and last name
  doctorExists: async (firstName: string, lastName: string): Promise<boolean> => {
    const allDoctors = await db.doctors.toArray()
    return allDoctors.some(doctor => {
      const doctorFirstName = doctor.name.split(' ')[0] || ''
      const doctorLastName = doctor.name.split(' ').slice(1).join(' ') || ''
      return doctorFirstName.toLowerCase() === firstName.toLowerCase() &&
            doctorLastName.toLowerCase() === lastName.toLowerCase()
    })
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
      department: doctor.department || 'General Medicine',
      city: doctor.city,
      state: doctor.state,
      email: doctor.email,
      country: doctor.country,
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