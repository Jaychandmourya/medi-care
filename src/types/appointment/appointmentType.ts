import type { Appointment, Patient } from '@/features/db/dexie';
export interface WeeklyCalendarProps {
  doctorId?: string;
  appointments: Appointment[];
  patients: Patient[];
  loading: boolean;
  doctorSchedules: Array<{ doctorId: string; startTime: string; endTime: string; lunchBreakStart?: string; lunchBreakEnd?: string; slotDuration: number }>;
  onUpdateAppointment: (params: { id: string; updates: Partial<Appointment> }) => void;
  onSetSelectedWeek: (week: string) => void;
  onSetSelectedDate: (date: string) => void;
  onSetSelectedAppointment: (appointment: Appointment) => void;
  onShowDetailModal: () => void;
}