import Dexie, { type Table } from "dexie";

export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  email?: string;
  address?: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  specialization: string;
  phone: string;
  email: string;
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

  constructor() {
    super("MediCareDB");
    this.version(2).stores({
      patients: "id, name, phone, bloodGroup, createdAt",
      doctors: "id, name, department, specialization, createdAt",
      appointments: "id, patientId, doctorId, department, date, slot, status, createdAt",
      doctorSchedules: "id, doctorId, workingDays, startTime, endTime, slotDuration, isActive",
    });
  }
}

export const db = new AppDB();