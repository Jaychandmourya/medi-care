import { useState, useEffect, useCallback, useMemo, lazy, Suspense, memo } from 'react'

// Import icons file
import { Search, Database } from 'lucide-react'

// Import Types files
import { type AppDispatch, type RootState } from '@/app/store'
import type { NPIResult } from '@/types/doctors/NpiType'
import type { AutocompleteDoctor } from '@/types/doctors/doctorType'


// Import dispatch and selector for redux
import { useDispatch, useSelector } from 'react-redux'

// Import Thunk file for redux
import { fetchLocalDoctors } from '@/features/doctor/doctorThunk'
import { searchDoctors } from '@/features/doctor/doctorThunk'

// Import Slice file for redux
import {
  setCurrentPage,
  setActiveTab,
  clearError
} from '@/features/doctor/doctorSlice'


import DoctorSearch from '@/components/doctor/DoctorSearch'

const InternalDoctorList = lazy(() => import('@/components/doctor/InternalDoctorList'))
const NpiRegistryDialog = lazy(() => import('@/components/doctor/dialog/NpiRegistryDialog'))




// Helper function to convert NPIResult to AutocompleteDoctor - memoized
const convertNPIResultToAutocompleteDoctor = (npiResult: NPIResult): AutocompleteDoctor => {
  const primaryAddress = npiResult.addresses?.find(addr => addr.address_1)
  const primaryTaxonomy = npiResult.taxonomies?.find(tax => tax.primary)

  return {
    npi: npiResult.basic.npi,
    firstName: npiResult.basic.first_name,
    lastName: npiResult.basic.last_name,
    middleName: npiResult.basic.middle_name,
    credential: npiResult.basic.credential,
    city: primaryAddress?.city,
    state: primaryAddress?.state,
    country: primaryAddress?.country_code || npiResult.country,
    contact: primaryAddress?.telephone_number,
    specialty: primaryTaxonomy?.desc,
    fullName: `${npiResult.basic.first_name} ${npiResult.basic.middle_name ? npiResult.basic.middle_name + ' ' : ''}${npiResult.basic.last_name}${npiResult.basic.credential ? ', ' + npiResult.basic.credential : ''}`,
    gender: npiResult.basic.gender || '',
    address: primaryAddress?.address_1,
    address2: primaryAddress?.address_2,
    postalCode: primaryAddress?.postal_code,
    enumerationDate: npiResult.basic.enumeration_date,
    lastUpdated: npiResult.basic.last_updated,
    status: npiResult.basic.status === 'A' ? 'Active' : 'Inactive',
    taxonomyCode: primaryTaxonomy?.code
  }
}

const AdminDoctorsComponent = () => {
  const dispatch = useDispatch<AppDispatch>()
  // Memoized selector to prevent unnecessary re-renders
  const {
    localDoctors,
    loading,
    currentPage,
    totalPages,
    resultCount,
    activeTab
  } = useSelector((state: RootState) => state.doctors)

  const [lastSearchParams, setLastSearchParams] = useState<Record<string, string>>({})
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<{ code: string; desc: string } | null>(null)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
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
    gender: '',
    email: ''
  })

  // Separate state for Advanced Filters
  const [filterValues, setFilterValues] = useState({
    firstName: '',
    lastName: '',
    city: '',
    state: ''
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

  // Memoized handlers to prevent child re-renders
  const handleSearch = useCallback(async (params: Record<string, string>) => {
    setLastSearchParams(params)
    dispatch(setCurrentPage(1))
    dispatch(searchDoctors({ ...params, skip: 0 }))
  }, [dispatch])

  const handlePageChange = useCallback((page: number) => {
    dispatch(setCurrentPage(page))
    const skip = (page - 1) * 10
    dispatch(searchDoctors({ ...lastSearchParams, skip }))
  }, [dispatch, lastSearchParams])


  const handleAddToSystem = useCallback((doctor: NPIResult) => {
    // Convert NPIResult to AutocompleteDoctor first
    const convertedDoctor = convertNPIResultToAutocompleteDoctor(doctor)

    // Auto-fill the form with doctor data
    setFormValues(prev => ({
      ...prev,
      firstName: convertedDoctor.firstName || '',
      lastName: convertedDoctor.lastName || '',
      city: convertedDoctor.city || '',
      state: convertedDoctor.state || '',
      country: convertedDoctor.country || '',
      contact: convertedDoctor.contact || '',
      specialty: convertedDoctor.specialty || '',
      postalCode: convertedDoctor.postalCode || '',
      address: convertedDoctor.address || '',
      gender: convertedDoctor.gender || ''
    }))
  }, [])

  const handleTaxonomyChange = useCallback((taxonomy: { code: string; desc: string } | null) => {
    setSelectedTaxonomy(taxonomy)
  }, [])

  const handleFilterChange = useCallback((field: string, value: string) => {
    setFilterValues(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filterValues.firstName.trim() ||
      filterValues.lastName.trim() ||
      filterValues.city.trim() ||
      filterValues.state.trim() ||
      selectedTaxonomy
    )
  }, [filterValues.firstName, filterValues.lastName, filterValues.city, filterValues.state, selectedTaxonomy])


  // Add non-empty filter values to search params
  const handleApplyFilters = useCallback(() => {
    const params: Record<string, string> = {}
    if (filterValues.firstName.trim()) {
      params.firstName = filterValues.firstName.trim()
    }
    if (filterValues.lastName.trim()) {
      params.lastName = filterValues.lastName.trim()
    }
    if (filterValues.city.trim()) {
      params.city = filterValues.city.trim()
    }
    if (filterValues.state.trim()) {
      params.state = filterValues.state.trim()
    }
    if (selectedTaxonomy) {
      params.taxonomy = selectedTaxonomy.code
    }
    setLastSearchParams(params)
    dispatch(setCurrentPage(1))
    dispatch(searchDoctors({ ...params, skip: 0 }))
  }, [filterValues.firstName, filterValues.lastName, filterValues.city, filterValues.state, selectedTaxonomy, dispatch])

  const handleClearFilters = useCallback(() => {
    setFilterValues({
      firstName: '',
      lastName: '',
      city: '',
      state: ''
    })
    setSelectedTaxonomy(null)
    setLastSearchParams({})
    dispatch(setCurrentPage(1))
    dispatch(searchDoctors({ skip: 0 }))
  }, [dispatch])

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
        {/* <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Doctor Search</h3>
            <p className="text-blue-700 text-sm mb-4">
              Type a doctor's name to instantly search and add them to your system
            </p>
            <DoctorAutocomplete onFieldPopulate={handleFieldPopulate} onFormPopulate={handleFormPopulate} onClearForm={handleClearForm} clearTrigger={clearTrigger} />
          </div>
        </div> */}

        {/* Advanced Filters Button */}
        {activeTab === 'search' && (
          <div className="mb-6">
            <button
              onClick={() => {
                // Populate filter values from form values when opening dialog
                setFilterValues({
                  firstName: formValues.firstName,
                  lastName: formValues.lastName,
                  city: formValues.city,
                  state: formValues.state
                })
                setIsFilterDialogOpen(true)
              }}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="font-medium">Search NPI Registry</span>
            </button>
          </div>
        )}


         {/* Content */}
        {activeTab === 'search' ? (
          <div className="space-y-6">
            {/* Search Component */}
            <DoctorSearch onSearch={handleSearch} initialValues={formValues} />
          </div>
        ) : (
          <Suspense fallback={<div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}>
            <InternalDoctorList />
          </Suspense>
        )}


        {/* Advanced Filters Dialog */}
        <Suspense fallback={<div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}>
          <NpiRegistryDialog
          isOpen={isFilterDialogOpen}
          onClose={() => {
            setIsFilterDialogOpen(false)
            setFilterValues({
              firstName: '',
              lastName: '',
              city: '',
              state: ''
            })
            setLastSearchParams({})
            setSelectedTaxonomy(null)
          }}
          onApplyFilters={handleApplyFilters}
          selectedTaxonomy={selectedTaxonomy}
          onTaxonomyChange={handleTaxonomyChange}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          hasActiveFilters={() => hasActiveFilters}
          onClearFilters={handleClearFilters}
          showResults={Object.keys(lastSearchParams).length > 0}
          onAddToSystem={handleAddToSystem}
          currentPage={currentPage}
          totalPages={totalPages}
          resultCount={resultCount}
          onPageChange={handlePageChange}
          loading={loading}
          />
        </Suspense>
      </div>
    </div>
  )
}

// Memoize the entire component to prevent unnecessary re-renders
const AdminDoctors = memo(AdminDoctorsComponent)

export default AdminDoctors