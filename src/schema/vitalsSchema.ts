import { z } from 'zod';
export const vitalsSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient'),
  bp: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Format: 120/80'),
  pulse: z.string().regex(/^\d+$/, 'Must be a number').min(1).max(200),
  temp: z.string().regex(/^\d+\.?\d*$/, 'Must be a valid temperature'),
  spo2: z.string().regex(/^\d+$/, 'Must be a number').min(1).max(100)
});