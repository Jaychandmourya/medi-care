import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type{ AuthState, User } from "@/types/auth/auth"
import { generateToken } from "@/utils/token"

const getStoredUser = (): User | null => {
  const data = localStorage.getItem("user")
  return data ? JSON.parse(data) : null
}

const initialState: AuthState = {
  user: getStoredUser(),
}

interface LoginPayload {
  role: User["role"]
  name: string
  id: number
  avatar: string
  doctorId?: string // Optional doctor ID for doctor role
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<LoginPayload>) => {
      const { role, name, id, avatar, doctorId } = action.payload
      console.log("role111", role)

      const userData: User = {
        role,
        name,
        id,
        avatar,
        token: generateToken(),
      }

      state.user = userData
      localStorage.setItem("user", JSON.stringify(userData))

      // Store doctor-specific information in localStorage
      if (role === 'doctor' && doctorId) {
        localStorage.setItem("doctorInfo", JSON.stringify({
          doctorId,
          doctorName: name,
          loginTime: new Date().toISOString()
        }))
      }
    },

    logout: (state) => {
      state.user = null
      localStorage.removeItem("user")
      localStorage.removeItem("doctorInfo") // Clear doctor info on logout
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer