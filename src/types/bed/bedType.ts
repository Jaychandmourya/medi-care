export interface Ward {
  wardId: string
  name: string
  totalBeds: number
  floor: string
}
export type BedStatus = 'available' | 'occupied' | 'reserved' | 'maintenance'
export interface Bed {
  bedId: string
  ward: string
  status: BedStatus
  patientId?: string
  patientName?: string
  admittedAt?: string
  notes?: string
}

export interface BedFormData {
  ward: string
  status: BedStatus
  notes?: string
}

export interface WardFormData {
  name: string
  floor: string
  totalBeds: number
}