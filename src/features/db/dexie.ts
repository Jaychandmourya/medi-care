import Dexie, { type Table } from "dexie";
import type { Bed, Ward } from '@/features/bed/bedSlice'

export interface Patient {
  id: string;
  patientId: string;
  name: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  allergies: string;
  conditions: string;
  surgeries?: string;
  medications?: string;
  contactName: string;
  emergencyPhone: string;
  relationship?: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  specialization: string;
  phone: string;
  email: string;
  contact?: string;
  city?: string;
  state?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
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

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  workingDays: number[];
  startTime: string;
  endTime: string;
  slotDuration: 15 | 20 | 30;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class AppDB extends Dexie {
  patients!: Table<Patient>;
  doctors!: Table<Doctor>;
  appointments!: Table<Appointment>;
  doctorSchedules!: Table<DoctorSchedule>;
  beds!: Table<Bed>;
  wards!: Table<Ward>;

  constructor() {
    super("MediCareDB");
    this.version(2).stores({
      patients: "id, patientId, name, phone, bloodGroup, email, city, state, pin, contactName, emergencyPhone, isActive, createdAt",
      doctors: "id, name, department, specialization, contact, city, state, country, createdAt",
      appointments: "id, patientId, doctorId, department, date, slot, status, createdAt",
      doctorSchedules: "id, doctorId, workingDays, startTime, endTime, slotDuration, isActive",
      beds: 'bedId, ward, status, patientId, admittedAt',
      wards: 'wardId, name, totalBeds, floor'
    });
  }
}

export const db = new AppDB();