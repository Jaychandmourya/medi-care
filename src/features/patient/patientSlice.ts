import { createSlice } from "@reduxjs/toolkit";
import type { PatientFormData } from "../../lib/patientValidation";
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
    builder.addCase(getAllPatients.fulfilled, (state, action) => {
      state.list = action.payload;
    });
    builder.addCase(updatePatientThunk.fulfilled, (state, action) => {
      const index = state.list.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    });
    builder.addCase(deletePatientThunk.fulfilled, (state, action) => {
      const index = state.list.findIndex(p => p.id === action.payload);
      if (index !== -1) {
        state.list[index].isActive = false;
      }
    });
  },
});

export default patientSlice.reducer;