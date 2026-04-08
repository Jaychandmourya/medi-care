import { z } from 'zod'

export const doctorScheduleSchema = z.object({
  doctorId: z.string().min(1, 'Doctor selection is required'),
  workingDays: z.array(z.number()).min(1, 'At least one working day is required'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  slotDuration: z.enum(['15', '20', '30']),
  lunchBreakStart: z.string().optional(),
  lunchBreakEnd: z.string().optional()
}).refine((data) => {
  if (data.startTime && data.endTime) {
    const start = new Date(`2000-01-01 ${data.startTime}`)
    const end = new Date(`2000-01-01 ${data.endTime}`)
    return end > start
  }
  return true
}, {
  message: 'End time must be after start time',
  path: ['endTime']
}).refine((data) => {
  if (data.lunchBreakStart && data.lunchBreakEnd) {
    const lunchStart = new Date(`2000-01-01 ${data.lunchBreakStart}`)
    const lunchEnd = new Date(`2000-01-01 ${data.lunchBreakEnd}`)
    return lunchEnd > lunchStart
  }
  return true
}, {
  message: 'Lunch break end time must be after start time',
  path: ['lunchBreakEnd']
})

export type DoctorScheduleFormData = z.infer<typeof doctorScheduleSchema>

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' }
]

export const SLOT_DURATIONS = [
  { value: '15', label: '15 minutes' },
  { value: '20', label: '20 minutes' },
  { value: '30', label: '30 minutes' }
]

export const TIME_SLOTS = [
  { value: '06:00', label: '6:00 AM' },
  { value: '06:30', label: '6:30 AM' },
  { value: '07:00', label: '7:00 AM' },
  { value: '07:30', label: '7:30 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '08:30', label: '8:30 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '09:30', label: '9:30 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '13:30', label: '1:30 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '14:30', label: '2:30 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '15:30', label: '3:30 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '16:30', label: '4:30 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '17:30', label: '5:30 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '18:30', label: '6:30 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '19:30', label: '7:30 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '20:30', label: '8:30 PM' },
  { value: '21:00', label: '9:00 PM' },
  { value: '21:30', label: '9:30 PM' },
  { value: '22:00', label: '10:00 PM' }
]
