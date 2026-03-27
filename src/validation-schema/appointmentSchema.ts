import { z } from 'zod';
export const bookingSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  department: z.string().min(1, 'Department is required'),
  date: z.string().min(1, 'Date is required'),
  slot: z.string().min(1, 'Time slot is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

export const rescheduleSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  slot: z.string().min(1, 'Time slot is required'),
  reason: z.string().optional(),
});