import type { Patient } from '@/types/patients/patientType'
export interface RoleColors {
  primary: string;
  secondary: string;
  calendar: string;
  header: string;
}

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
  roleColors?: RoleColors;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  department: string;
  date: string;
  slot: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}