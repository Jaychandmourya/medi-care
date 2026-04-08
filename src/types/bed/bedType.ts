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