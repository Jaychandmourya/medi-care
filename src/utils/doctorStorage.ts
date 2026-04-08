/**
 * Doctor information utilities for localStorage management
 */

export interface DoctorInfo {
  doctorId: string
  doctorName: string
  loginTime: string
}

/**
 * Get doctor information from localStorage
 * @returns DoctorInfo object if available, null otherwise
 */
export const getDoctorInfo = (): DoctorInfo | null => {
  const doctorInfo = localStorage.getItem("doctorInfo")
  return doctorInfo ? JSON.parse(doctorInfo) : null
}

/**
 * Check if current user is a doctor
 * @returns boolean indicating if current user is doctor
 */
export const isCurrentUserDoctor = (): boolean => {
  const user = localStorage.getItem("user")
  if (!user) return false
  
  const userData = JSON.parse(user)
  return userData.role === 'doctor'
}

/**
 * Get current doctor's ID from localStorage
 * @returns doctor ID string if available, null otherwise
 */
export const getCurrentDoctorId = (): string | null => {
  const doctorInfo = getDoctorInfo()
  return doctorInfo ? doctorInfo.doctorId : null
}

/**
 * Get current doctor's name from localStorage
 * @returns doctor name string if available, null otherwise
 */
export const getCurrentDoctorName = (): string | null => {
  const doctorInfo = getDoctorInfo()
  return doctorInfo ? doctorInfo.doctorName : null
}

/**
 * Clear doctor information from localStorage
 */
export const clearDoctorInfo = (): void => {
  localStorage.removeItem("doctorInfo")
}
