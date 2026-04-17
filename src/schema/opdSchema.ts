import * as z from 'zod'

export const tokenSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  department: z.string().min(1, 'Department is required'),
  doctorId: z.string().min(1, 'Doctor is required')
})