import { createAsyncThunk } from '@reduxjs/toolkit'
import { doctorDBOperations } from '../../services/doctorServices'

// Import types files
import type { LocalDoctor } from '@/types/doctors/doctorType'
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
    limit = 10
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
    if (city && city.trim()) {
      params.append('city', city.trim())
    }
    if (state && state.trim()) {
      params.append('state', state.trim())
    }
    if (taxonomy && taxonomy.trim()) {
      params.append('taxonomy', taxonomy.trim())
    }
    // Always search for US country doctors
    const url = `http://localhost:3001/api/npi?${params.toString()}`
    console.log('NPI API URL:11111111', url) // Debug log

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to fetch doctors from NPI registry')
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
  async (doctor: Omit<LocalDoctor, 'id' | 'addedAt'>) => {
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