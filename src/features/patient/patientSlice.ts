import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../patient/db/dexie";
import type { Patient } from "../patient/db/dexie";

export const fetchPatients = createAsyncThunk("patients/fetch", async () => {
  return await db.patients.toArray();
});

export const addPatient = createAsyncThunk(
  "patients/add",
  async (patient: Patient) => {
    await db.patients.add(patient);
    return patient;
  }
);

export const updatePatient = createAsyncThunk(
  "patients/update",
  async (patient: Patient) => {
    await db.patients.update(patient.id, patient);
    return patient;
  }
);

export const deletePatient = createAsyncThunk(
  "patients/delete",
  async (id: string) => {
    await db.patients.update(id, { isActive: false });
    return id;
  }
);

const patientSlice = createSlice({
  name: "patients",
  initialState: {
    list: [] as Patient[],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPatients.fulfilled, (state, action) => {
      state.list = action.payload;
    });
  },
});

export default patientSlice.reducer;