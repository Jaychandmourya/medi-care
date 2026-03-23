import { configureStore } from "@reduxjs/toolkit"
import authReducer from "@/features/auth/authSlice"
import patientReducer from "@/features/patient/patientSlice"
import appointmentReducer from "@/features/appointment/appointmentSlice"
import opdReducer from "@/features/opd/opdSlice"
import bedReducer from "@/features/bed/bedSlice"
import prescriptionReducer from "@/features/prescription/prescriptionSlice"
import doctorReducer from "@/features/doctor/doctorSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientReducer,
    appointments: appointmentReducer,
    opd: opdReducer,
    beds: bedReducer,
    prescriptions: prescriptionReducer,
    doctors: doctorReducer,
  },
})

// Types for hooks
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch