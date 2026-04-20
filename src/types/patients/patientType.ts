import type { Appointment } from '@/types/appointment/appointmentType';
import type { Vitals } from '@/types/vitals/vitalsType';
import type { Prescription } from '@/types/prescription/prescriptionType';

export interface Patient {
  id: string;
  patientId: string;
  name?: string;
  dob?: string;
  gender: "Male" | "Female" | "Other";
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  phone?: string;
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

export interface AddPatientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: Partial<Patient>;
  titleClass?: string;
}

// BillingRecord type definition (not imported from elsewhere)
export interface BillingRecord {
  id: string;
  patientId: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface PatientDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatient: Patient | null;
  calculateAge: (dob: string) => number;
  titleClass?: string;
  headerClass?: string;
  appointments?: Appointment[];
  vitals?: Vitals[];
  prescriptions?: Prescription[];
  billing?: BillingRecord[];
}