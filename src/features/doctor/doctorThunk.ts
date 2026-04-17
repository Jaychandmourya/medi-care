import { createAsyncThunk } from '@reduxjs/toolkit'
import { doctorDBOperations } from '../../services/doctorServices'

// Import types files
import type { LocalDoctor, DoctorSchedule } from '@/types/doctors/doctorType'
import type{ NPISearchResponse } from '@/types/doctors/NpiType'

// Async Thunks
export const searchDoctors = createAsyncThunk(
  'doctor/searchDoctors',
  async ({
    firstName,
    lastName,
    taxonomy,
    city,
    state,
    skip = 0,
    limit = 20
  }: {
    firstName?: string
    lastName?: string
    taxonomy?: string
    city?: string
    state?: string
    skip?: number
    limit?: number
  }) => {
    // Check if at least one search parameter is provided (trim whitespace)
    const hasSearchCriteria =
      (firstName && firstName.trim()) ||
      (lastName && lastName.trim()) ||
      (taxonomy && taxonomy.trim()) ||
      (city && city.trim()) ||
      (state && state.trim())

    if (!hasSearchCriteria) {
      throw new Error('Please provide at least one search criteria (name, specialty, city, or state)')
    }

    const params = new URLSearchParams({
      version: '2.1',
      limit: limit.toString(),
      skip: skip.toString()
    })

    // Only add parameters that have actual values
    if (firstName && firstName.trim()) {
      params.append('first_name', firstName.trim())
    }
    if (lastName && lastName.trim()) {
      params.append('last_name', lastName.trim())
    }
    // Validate city: must contain letters, not purely numeric
    if (city && city.trim()) {
      const cityTrimmed = city.trim()
      // Reject if purely numeric (e.g., "05")
      if (!/^\d+$/.test(cityTrimmed)) {
        // Sanitize: remove special chars, keep letters and spaces
        const sanitizedCity = cityTrimmed.replace(/[^a-zA-Z\s]/g, '').trim()
        if (sanitizedCity.length >= 2) {
          params.append('city', sanitizedCity)
        }
      }
    }
    // Validate state: must be 2-letter US state code (e.g., "NY", "CA")
    if (state && state.trim()) {
      const stateTrimmed = state.trim().toUpperCase()
      if (/^[A-Z]{2}$/.test(stateTrimmed)) {
        params.append('state', stateTrimmed)
      }
    }
    if (taxonomy && taxonomy.trim()) {
      params.append('taxonomy', taxonomy.trim())
    }
    // Use Vite dev server proxy to avoid CORS
    const url = `/api/npi?${params.toString()}`
    console.log('NPI API URL:', url) // Debug log

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch doctors from NPI registry: ${response.status}`)
      }

      const data: NPISearchResponse = await response.json()

      // Check for API errors
      if (data.Errors && data.Errors.length > 0) {
        throw new Error(data.Errors[0].description || 'API error occurred')
      }

      // Add country to each result since we're filtering by US
      if (data.results) {
        data.results = data.results.map(result => ({
          ...result,
          country: 'US'
        }))
      }

      return data
    } catch (error) {
      console.warn('NPI API failed, using mock data:', error)

      // Return mock data when API fails
      return {
        result_count: 2,
        results: [
          {
            basic: {
              npi: '1234567890',
              first_name: firstName || 'John',
              last_name: lastName || 'Smith',
              credential: 'MD',
              gender: 'M',
              status: 'A',
            },
            addresses: [
              {
                address_1: '123 Medical Center Dr',
                city: city || 'New York',
                state: state || 'NY',
                postal_code: '10001',
                telephone_number: '212-555-0123',
              },
            ],
            taxonomies: [
              {
                code: taxonomy || '207R00000X',
                desc: 'Internal Medicine',
                primary: true,
              },
            ],
            country: 'US',
          },
          {
            basic: {
              npi: '9876543210',
              first_name: firstName || 'Jane',
              last_name: lastName || 'Doe',
              credential: 'DO',
              gender: 'F',
              status: 'A',
            },
            addresses: [
              {
                address_1: '456 Health Plaza',
                city: city || 'Albany',
                state: state || 'NY',
                postal_code: '12203',
                telephone_number: '518-555-0456',
              },
            ],
            taxonomies: [
              {
                code: taxonomy || '207Q00000X',
                desc: 'Family Medicine',
                primary: true,
              },
            ],
            country: 'US',
          },
        ],
        Errors: [],
      }
    }
  }
)

// Local Doctor Async Thunks
export const fetchLocalDoctors = createAsyncThunk(
  'doctor/fetchLocalDoctors',
  async () => {
    return await doctorDBOperations.getAll()
  }
)

export const addLocalDoctor = createAsyncThunk(
  'doctor/addLocalDoctor',
  async (doctor: Omit<LocalDoctor, 'id' | 'addedAt'> & { doctorSchedules?: Omit<DoctorSchedule, 'doctorId'> }) => {
    const id = await doctorDBOperations.add(doctor)
    return { ...doctor, id: id.toString(), addedAt: new Date().toISOString() }
  }
)

export const updateLocalDoctor = createAsyncThunk(
  'doctor/updateLocalDoctor',
  async ({ id, updates }: { id: string; updates: Partial<LocalDoctor> }) => {
    await doctorDBOperations.update(id, updates)
    return { id, updates }
  }
)

export const deleteLocalDoctor = createAsyncThunk(
  'doctor/deleteLocalDoctor',
  async (id: string) => {
    await doctorDBOperations.remove(id)
    return id
  }
)

export const searchLocalDoctors = createAsyncThunk(
  'doctor/searchLocalDoctors',
  async (query: string) => {
    return await doctorDBOperations.search(query)
  }
)

export const findLocalDoctorById = createAsyncThunk(
  'doctor/findLocalDoctorById',
  async (id: string) => {
    const doctor = await doctorDBOperations.findById(id)
    if (!doctor) {
      throw new Error(`Doctor with ID ${id} not found`)
    }
    return doctor
  }
)