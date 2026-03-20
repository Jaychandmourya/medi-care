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
  async (patient: any) => {
    const newPatient = await patientService.addPatient(patient)
    return newPatient
  }
)

export const updatePatient = createAsyncThunk(
  'patient/updatePatient',
  async (patient: any) => {
    await patientService.updatePatient(patient.id, patient)
    return patient
  }
)

export const deletePatient = createAsyncThunk(
  'patient/deletePatient',
  async (id: string) => {
    await patientService.softDeletePatient(id)
    return id
  }
)

export const hardDeletePatient = createAsyncThunk(
  'patient/hardDeletePatient',
  async (id: string) => {
    await patientService.deletePatient(id)
    return id
  }
)