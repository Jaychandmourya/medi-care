import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Users, Database } from 'lucide-react'
import { type AppDispatch, type RootState } from '@/app/store'
import { searchDoctors } from '@/features/doctor/doctorThunk'
import {
  setCurrentPage,
  setActiveTab,
  clearError
} from '@/features/doctor/doctorSlice'
import { fetchLocalDoctors } from '@/features/doctor/doctorThunk'
import DoctorSearch from '@/components/doctor/DoctorSearch'
import DoctorAutocomplete from '@/components/doctor/DoctorAutocomplete'
import InternalDoctorList from '@/components/doctor/InternalDoctorList'
import { type NPIResult } from '@/features/doctor/doctorThunk'

const AdminDoctors = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    searchResults,
    localDoctors,
    loading,
    error,
    currentPage,
    totalPages,
    resultCount,
    activeTab
  } = useSelector((state: RootState) => state.doctors)

  const [selectedDoctor, setSelectedDoctor] = useState<NPIResult | null>(null)
  const [lastSearchParams, setLastSearchParams] = useState<Record<string, string>>({})
  const [clearTrigger, setClearTrigger] = useState(0)
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    city: '',
    state: '',
    country: '',
    contact: '',
    specialty: '',
    postalCode: '',
    address: '',
    gender: ''
  })

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    const loadLocalDoctors = async () => {
      try {
        dispatch(fetchLocalDoctors())
      } catch (error) {
        console.error('Failed to load local doctors:', error)
      }
    }
    loadLocalDoctors()
  }, [dispatch])

  const handleSearch = async (params: Record<string, string>) => {
    console.log('Searching with params:', params)
    setLastSearchParams(params)
    dispatch(setCurrentPage(1))
    dispatch(searchDoctors({ ...params, skip: 0 }))
  }

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page))
    const skip = (page - 1) * 10
    dispatch(searchDoctors({ ...lastSearchParams, skip }))
  }

  const handleViewDetails = (doctor: NPIResult) => {
    setSelectedDoctor(doctor)
  }

  const handleCloseProfile = () => {
    setSelectedDoctor(null)
  }

  const handleFormPopulate = (fields: { firstName: string; lastName: string; city?: string; state?: string; country?: string; contact?: string, specialty?: string, postalCode?: string, address?: string, gender?: string }) => {
    console.log('fields',fields)
    // Populate the DoctorSearch form fields
    setFormValues({
      firstName: fields.firstName || '',
      lastName: fields.lastName || '',
      city: fields.city || '',
      state: fields.state || '',
      country: fields.country || '',
      contact: fields.contact || '',
      specialty: fields.specialty || '',
      postalCode: fields.postalCode || '',
      address: fields.address || '',
      gender: fields.gender || ''
    })
  }

  const handleClearForm = () => {
    // Clear form values
    setFormValues({
      firstName: '',
      lastName: '',
      city: '',
      state: '',
      country: '',
      contact: '',
      specialty: '',
      postalCode: '',
      address: '',
      gender: ''
    })
    // Clear last search params
    setLastSearchParams({})
    // Trigger clear for DoctorAutocomplete
    setClearTrigger(prev => prev + 1)
  }

  const handleFieldPopulate = (fields: { firstName: string; lastName: string; city?: string; state?: string }) => {
    console.log('handleFieldPopulate1111', fields)
    // Auto-fill the search form with selected doctor's data
    const params: Record<string, string> = {}
    if (fields.firstName) {
      params.firstName = fields.firstName
    }
    if (fields.lastName) {
      params.lastName = fields.lastName
    }
    if (fields.city) {
      params.city = fields.city
    }
    if (fields.state) {
      params.state = fields.state
    }

    // setLastSearchParams(params)
    // dispatch(setCurrentPage(1))
    console.log('params1111', params)
    // dispatch(searchDoctors({ ...params, skip: 0 }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Doctor Directory
          </h1>
          <p className="text-gray-600">
            Search real US doctors from the NPI Registry and manage your internal doctor database
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => dispatch(setActiveTab('search'))}
              className={`py-2 px-1 border-b-2 font-medium cursor-pointer text-sm transition-colors ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search NPI Registry
              </div>
            </button>
            <button
              onClick={() => dispatch(setActiveTab('internal'))}
              className={`py-2 px-1 border-b-2 font-medium cursor-pointer text-sm transition-colors ${
                activeTab === 'internal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Internal Doctors ({localDoctors.length})
              </div>
            </button>
          </nav>
        </div>

        {/* Quick Autocomplete Search */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Doctor Search</h3>
            <p className="text-blue-700 text-sm mb-4">
              Type a doctor's name to instantly search and add them to your system
            </p>
            <DoctorAutocomplete onFieldPopulate={handleFieldPopulate} onFormPopulate={handleFormPopulate} clearTrigger={clearTrigger} />
          </div>
        </div>

        {/* Content */}
        {activeTab === 'search' ? (
          <div>
            {/* Search Component */}
            <DoctorSearch onSearch={handleSearch} initialValues={formValues} onClear={handleClearForm} />
          </div>
        ) : (
          <InternalDoctorList />
        )}
      </div>
    </div>
  )
}

export default AdminDoctors