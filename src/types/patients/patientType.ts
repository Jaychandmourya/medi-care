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