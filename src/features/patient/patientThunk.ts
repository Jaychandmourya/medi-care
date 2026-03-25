import { createAsyncThunk } from "@reduxjs/toolkit"
import { patientService } from "../../services/patientServices"

export const getAllPatients = createAsyncThunk(
  'patient/getAllPatients',
  async () => {
    const patients = await patientService.getAllPatients()
    return patients
  }
)

export const addPatient = createAsyncThunk(
  'patient/addPatient',
  async (patient: any, { rejectWithValue }) => {
    try {
      const newPatient = await patientService.addPatient(patient)
      return newPatient
    } catch (error) {
      console.error('Error adding patient:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add patient')
    }
  }
)

export const updatePatient = createAsyncThunk(
  'patient/updatePatient',
  async (patient: any, { rejectWithValue }) => {
    try {
      await patientService.updatePatient(patient.id, patient)
      return patient
    } catch (error) {
      console.error('Error updating patient:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update patient')
    }
  }
)

export const deletePatient = createAsyncThunk(
  'patient/deletePatient',
  async (id: string, { rejectWithValue }) => {
    try {
      await patientService.softDeletePatient(id)
      return id
    } catch (error) {
      console.error('Error deleting patient:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete patient')
    }
  }
)

export const hardDeletePatient = createAsyncThunk(
  'patient/hardDeletePatient',
  async (id: string) => {
    await patientService.deletePatient(id)
    return id
  }
)