import Dexie, { type Table } from "dexie";
import type{ Bed, Ward } from '@/types/bed/bedType'
import type { Appointment } from '@/types/appointment/appointmentType';
import type { Patient } from '@/types/patients/patientType'
import type { Vitals } from '@/types/vitals/vitalsType'
import type { Doctor, DoctorSchedule } from '@/types/doctors/doctorType'

class AppDB extends Dexie {
  patients!: Table<Patient>;
  doctors!: Table<Doctor>;
  appointments!: Table<Appointment>;
  doctorSchedules!: Table<DoctorSchedule>;
  beds!: Table<Bed>;
  wards!: Table<Ward>;
  vitals!: Table<Vitals>;

  constructor() {
    super("MediCareDB");
    this.version(2).stores({
      patients: "id, patientId, name, phone, bloodGroup, email, city, state, pin, contactName, emergencyPhone, isActive, createdAt",
      doctors: "id, name, department, specialization, contact, city, state, country, createdAt",
      appointments: "id, patientId, doctorId, department, date, slot, status, createdAt",
      doctorSchedules: "++id, doctorId, workingDays, startTime, endTime, slotDuration, isActive, createdAt, updatedAt",
      beds: 'bedId, ward, status, patientId, admittedAt',
      wards: 'wardId, name, totalBeds, floor',
      vitals: 'id, patientId, recordedAt, bp, pulse, temp, spo2'
    });
  }
}

export const db = new AppDB();

// Re-export types for convenience
export type { Bed, Ward } from '@/types/bed/bedType'
export type { Appointment } from '@/types/appointment/appointmentType';
export type { Patient } from '@/types/patients/patientType'
export type { Vitals } from '@/types/vitals/vitalsType'
export type { Doctor, DoctorSchedule } from '@/types/doctors/doctorType'