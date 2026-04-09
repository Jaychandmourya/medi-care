import type { BedStatus } from '@/types/bed/bedType'
export interface Vitals {
  id: string;
  patientId: string;
  recordedAt: string;
  bp: string;
  pulse: number;
  temp: number;
  spo2: number;
}

export interface VitalsFormData {
  patientId: string;
  bp: string;
  pulse: string;
  temp: string;
  spo2: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bedNumber?: string;
}

export interface BedStatusChange {
  id: string
  bedId: string
  oldStatus: BedStatus
  newStatus: BedStatus
  timestamp: Date
  patientId?: string
}

