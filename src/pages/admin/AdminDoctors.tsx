import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Users, Database } from 'lucide-react'
import { type AppDispatch, type RootState } from '@/app/store'
import {
  searchDoctors,
  setCurrentPage,
  setActiveTab,
  clearError,
  setLocalDoctors
} from '@/features/doctor/doctorSlice'
import DoctorSearch from '@/components/doctor/DoctorSearch'
import DoctorCard from '@/components/doctor/DoctorCard'
import DoctorProfile from '@/components/doctor/DoctorProfile'
import DoctorAutocomplete from '@/components/doctor/DoctorAutocomplete'
import Pagination from '@/components/doctor/Pagination'
import InternalDoctorList from '@/components/doctor/InternalDoctorList'
import { type NPIResult } from '@/features/doctor/doctorSlice'
import { doctorDBOperations } from '@/features/doctor/db/doctorDB'

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
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    city: '',
    state: '',
    country: '',
    contact: '',
    specialty: '',
    postalCode: '',
    address: ''
  })

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    const loadLocalDoctors = async () => {
      try {
        const doctors = await doctorDBOperations.getAll()
        dispatch(setLocalDoctors(doctors))
      } catch (error) {
        console.error('Failed to load local doctors:', error)
      }
    }
    loadLocalDoctors()
  }, [dispatch])

  const handleSearch = async (params: Record<string, string>) => {
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

  const handleFormPopulate = (fields: { firstName: string; lastName: string; city?: string; state?: string; country?: string; contact?: string, specialty?: string, postalCode?: string, address?: string }) => {
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
      address: fields.address || ''
    })
  }

  const handleFieldPopulate = (fields: { firstName: string; lastName: string; city?: string; state?: string }) => {
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

    setLastSearchParams(params)
    dispatch(setCurrentPage(1))
    dispatch(searchDoctors({ ...params, skip: 0 }))
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
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
            <DoctorAutocomplete onFieldPopulate={handleFieldPopulate} onFormPopulate={handleFormPopulate} />
          </div>
        </div>

        {/* Content */}
        {activeTab === 'search' ? (
          <div>
            {/* Search Component */}
            <DoctorSearch onSearch={handleSearch} initialValues={formValues} />

            {/* Results Summary */}
            {searchResults.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {searchResults.length} of {resultCount} results
                </div>
              </div>
            )}

            {/* Search Results */}
            {loading && (
              <div className="mt-6 flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {!loading && !error && searchResults.length === 0 && Object.keys(lastSearchParams).length > 0 && (
              <div className="mt-6 text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or browse different terms
                </p>
              </div>
            )}

            {!loading && !error && searchResults.length > 0 && (
              <div className="mt-6 space-y-4">
                {searchResults.map((doctor, index) => (
                  <DoctorCard
                    key={`${doctor.basic?.npi}-${index}`}
                    doctor={doctor}
                    onViewDetails={handleViewDetails}
                    isAdded={localDoctors.some(local => local.npi === doctor.basic?.npi)}
                  />
                ))}

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              </div>
            )}
          </div>
        ) : (
          <InternalDoctorList />
        )}

        {/* Doctor Profile Modal */}
        {selectedDoctor && (
          <DoctorProfile
            doctor={selectedDoctor}
            onClose={handleCloseProfile}
          />
        )}
      </div>
    </div>
  )
}

export default AdminDoctors