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
  gender?: string;
  postalCode?: string;
  isActive: boolean;
  createdAt: string;
  address?: string;
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

export interface LocalDoctor {
  id?: string
  npi: string
  firstName: string
  lastName: string
  middleName?: string
  credential?: string
  gender?: string
  specialty?: string
  department: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  phone?: string
  contact?: string
  email?: string
  addedAt: string
}

export interface DoctorState {
  searchResults: NPIResult[]
  localDoctors: LocalDoctor[]
  loading: boolean
  error: string | null
  searchQuery: string
  selectedTaxonomy: string
  currentPage: number
  totalPages: number
  resultCount: number
  activeTab: 'search' | 'internal'
}