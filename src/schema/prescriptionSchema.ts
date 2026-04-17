import { z } from 'zod'
export const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  diagnosis: z.string().min(10, 'Diagnosis must be at least 10 characters').max(500, 'Diagnosis must be less than 500 characters'),
  generalNotes: z.string().max(1000, 'General notes must be less than 1000 characters').optional(),
  followUpDate: z.string().min(1, 'Follow-up date is required'),
}).refine((data) => {
  if (data.followUpDate) {
    const followUp = new Date(data.followUpDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return followUp >= today
  }
  return true
}, {
  message: 'Follow-up date cannot be in the past',
  path: ['followUpDate']
})

export const medicineSchema = z.object({
  name: z.string().min(2, 'Medicine name must be at least 2 characters').max(100, 'Medicine name must be less than 100 characters'),
  dosage: z.string().min(1, 'Dosage is required').max(50, 'Dosage must be less than 50 characters'),
  frequency: z.string().min(2, 'Frequency must be at least 2 characters').max(50, 'Frequency must be less than 50 characters'),
  duration: z.string().min(1, 'Duration is required').max(50, 'Duration must be less than 50 characters'),
  instructions: z.string().max(200, 'Instructions must be less than 200 characters').optional(),
})