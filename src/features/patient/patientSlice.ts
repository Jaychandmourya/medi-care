import { createSlice } from "@reduxjs/toolkit";
import type { PatientFormData } from "../../validation-schema/patientValidation";
import { getAllPatients, addPatient as addPatientThunk, updatePatient as updatePatientThunk, deletePatient as deletePatientThunk } from "./patientThunk"


const patientSlice = createSlice({
  name: "patients",
  initialState: {
    list: [] as PatientFormData[],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addPatientThunk.fulfilled, (state, action) => {
      state.list.push(action.payload);
    });
    builder.addCase(addPatientThunk.rejected, (state, action) => {
      console.error('Add patient rejected:', action.payload);
    });
    builder.addCase(getAllPatients.fulfilled, (state, action) => {
      state.list = action.payload.filter((p) => p.isActive);
    });
    builder.addCase(updatePatientThunk.fulfilled, (state, action) => {
      const index = state.list.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    });
    builder.addCase(updatePatientThunk.rejected, (state, action) => {
      console.error('Update patient rejected:', action.payload);
    });
    builder.addCase(deletePatientThunk.fulfilled, (state, action) => {
      const index = state.list.findIndex(p => p.id === action.payload);
      if (index !== -1) {
        state.list[index].isActive = false;
      }
    });
    builder.addCase(deletePatientThunk.rejected, (state, action) => {
      console.error('Delete patient rejected:', action.payload);
    });
  },
});

export default patientSlice.reducer;