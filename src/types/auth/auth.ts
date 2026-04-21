
export type Role = "doctor" | "admin" | "nurse" | "receptionist"

export interface User {
  role: Role
  name: string
  id: number
  avatar: string
  token: string
  doctorId?: string
}

export interface AuthState {
  user: User | null
}