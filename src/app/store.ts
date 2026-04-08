import { configureStore } from "@reduxjs/toolkit"
import authReducer from "@/features/auth/authSlice"
import patientReducer from "@/features/patient/patientSlice"
import appointmentReducer from "@/features/appointment/appointmentSlice"
import opdReducer from "@/features/opd/opdSlice"
import bedReducer from "@/features/bed/bedSlice"
import prescriptionReducer from "@/features/prescription/prescriptionSlice"
import doctorReducer from "@/features/doctor/doctorSlice"
import reportsReducer from "@/features/reports/reportsSlice"
import doctorScheduleReducer from "@/features/doctorSchedule/doctorScheduleSlice"
import vitalsReducer from "@/features/vital/VitalSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientReducer,
    appointments: appointmentReducer,
    opd: opdReducer,
    beds: bedReducer,
    prescriptions: prescriptionReducer,
    doctors: doctorReducer,
    reports: reportsReducer,
    doctorSchedule: doctorScheduleReducer,
    vitals: vitalsReducer,
  },
})

// Types for hooks
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch