export interface Drug {
  id: string
  genericName: string
  brandName: string
  drugClass: string
  purpose?: string
  warnings?: string[]
  dosage?: string
  adverseReactions?: string[]
  manufacturer?: string
  isRecalled?: boolean
  recallInfo?: Record<string, unknown> | null
}

export interface Medicine {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  drug?: Drug
}

export interface Prescription {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  diagnosis: string
  medicines: Medicine[]
  generalNotes: string
  followUpDate: string
  createdAt: string
  updatedAt?: string
  status: 'active' | 'completed' | 'cancelled'
}

export interface PrescriptionState {
  prescriptions: Prescription[]
  currentPrescription: Prescription | null
  prescriptionHistory: Prescription[]
  drugSearchResults: Drug[]
  selectedDrug: Drug | null
  loading: boolean
  error: string | null
  searchLoading: boolean
  historyLoading: boolean
}