import { configureStore } from "@reduxjs/toolkit"
import authReducer from "@/features/auth/authSlice"
import patientReducer from "@/features/patient/patientSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientReducer,
  },
})

// Types for hooks
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch