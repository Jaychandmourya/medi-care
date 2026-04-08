import * as z from 'zod'

export const tokenSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  department: z.string().min(1, 'Department is required'),
  doctorId: z.string().min(1, 'Doctor is required')
})