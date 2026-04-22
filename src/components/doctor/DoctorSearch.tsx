import { useState, useCallback, useMemo, Suspense, lazy, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'

// Import UI components
import { Button } from '@/components/common/Button'
import Input from '@/components/common/Input'
import { Label } from '@/components/common/Label'
// Lazy load heavy components
const CountryStateCitySelector = lazy(() => import('@/components/doctor/CountryStateCitySelector'))

// Import Types files
import { type AppDispatch, type RootState } from '@/app/store'
import type { NPIResult } from '@/types/doctors/NpiType'

// Import dispatch and selector for redux
import { useDispatch, useSelector } from 'react-redux'

// Import Thunk file for redux
import { searchDoctors, addLocalDoctor } from '@/features/doctor/doctorThunk'

// Import Slice file for redux
import { setCurrentPage, clearSearchResults } from '@/features/doctor/doctorSlice'

// Lazy load components
const SearchPagination = lazy(() => import('@/components/doctor/SearchPagination'))
const TaxonomyFilter = lazy(() => import('@/components/doctor/TaxonomyFilter'))
const DoctorSearchResults = lazy(() => import('@/components/doctor/DoctorSearchResults'))
const DoctorSearchDetails = lazy(() => import('@/components/doctor/DoctorSearchDetails'))

// NPI Search Section Component
function NPISearchSection() {
  const dispatch = useDispatch<AppDispatch>()
  const { searchResults, localDoctors, searchLoading: loading, resultCount, currentPage, totalPages, error } = useSelector((state: RootState) => state.doctors)

  const [searchFilters, setSearchFilters] = useState({
    firstName: '',
    lastName: '',
    city: '',
    state: '',
    country: 'US',
    taxonomy: ''
  })
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<{ code: string; desc: string } | null>(null)
  const [viewingDoctor, setViewingDoctor] = useState<NPIResult | null>(null)
  const [addedDoctorNpis, setAddedDoctorNpis] = useState<Set<string>>(new Set())
  const [searchPerformed, setSearchPerformed] = useState(false)

  // Show toast when search fails
  useEffect(() => {
    if (error && searchPerformed) {
      toast.error(`Search failed: ${error}`)
    }
  }, [error, searchPerformed])

  const hasActiveFilters = useMemo(() =>
    searchFilters.firstName ||
    searchFilters.lastName ||
    searchFilters.city ||
    searchFilters.state ||
    searchFilters.country ||
    selectedTaxonomy,
    [searchFilters, selectedTaxonomy]
  )

  const handleFilterChange = useCallback((field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleTaxonomyChange = useCallback((taxonomy: { code: string; desc: string } | null) => {
    setSelectedTaxonomy(taxonomy)
    setSearchFilters(prev => ({ ...prev, taxonomy: taxonomy?.code || '' }))
  }, [])

  const handleSearch = useCallback(async () => {
    if (!hasActiveFilters) {
      toast.error('Please enter at least one search criteria')
      return
    }
    setSearchPerformed(true)
    dispatch(setCurrentPage(1))
    dispatch(searchDoctors({
      firstName: searchFilters.firstName,
      lastName: searchFilters.lastName,
      city: searchFilters.city,
      state: searchFilters.state,
      taxonomy: selectedTaxonomy?.code,
      skip: 0
    }))
  }, [dispatch, searchFilters, selectedTaxonomy, hasActiveFilters])

  const handlePageChange = useCallback((page: number) => {
    dispatch(setCurrentPage(page))
    const skip = (page - 1) * 10
    dispatch(searchDoctors({
      firstName: searchFilters.firstName,
      lastName: searchFilters.lastName,
      city: searchFilters.city,
      state: searchFilters.state,
      taxonomy: selectedTaxonomy?.code,
      skip
    }))
  }, [dispatch, searchFilters, selectedTaxonomy])

  const handleClearFilters = useCallback(() => {
    setSearchFilters({ firstName: '', lastName: '', city: '', state: '', country: 'US', taxonomy: '' })
    setSelectedTaxonomy(null)
    setSearchPerformed(false)
    dispatch(clearSearchResults())
  }, [dispatch])

  const handleCountryChange = useCallback((countryCode: string) => {
    setSearchFilters(prev => ({ ...prev, country: countryCode, state: '', city: '' }))
  }, [])

  const handleStateChange = useCallback((stateCode: string) => {
    setSearchFilters(prev => ({ ...prev, state: stateCode, city: '' }))
  }, [])

  const handleCityChange = useCallback((cityName: string) => {
    setSearchFilters(prev => ({ ...prev, city: cityName }))
  }, [])


  const handleViewDetails = useCallback((doctor: NPIResult) => {
    setViewingDoctor(doctor)
  }, [])

  const handleAddToInternal = useCallback(async (doctor: NPIResult) => {
    const npi = doctor?.basic?.npi
    if (!npi) {
      toast.error('Cannot add doctor without NPI number')
      return
    }

    // Check if doctor already exists in local database by NPI
    const existingDoctor = localDoctors.find(d => d.npi === npi)

    if (existingDoctor) {
      toast.error('Doctor already added to internal system')
      return
    }

    try {
      const primaryAddress = doctor.addresses?.find((addr: { address_1?: string }) => addr.address_1)
      const primaryTaxonomy = doctor.taxonomies?.find((tax: { primary?: boolean }) => tax.primary)
      const doctorData = {
        npi: npi,
        firstName: doctor.basic.first_name || '',
        lastName: doctor.basic.last_name || '',
        credential: doctor.basic.credential,
        gender: doctor.basic.gender,
        specialty: primaryTaxonomy?.desc || 'General Practice',
        department: primaryTaxonomy?.desc || 'General Medicine',
        address: primaryAddress
          ? `${primaryAddress.address_1}${primaryAddress.address_2 ? ', ' + primaryAddress.address_2 : ''}`
          : undefined,
        city: primaryAddress?.city,
        state: primaryAddress?.state,
        country: doctor?.country || 'US',
        postalCode: primaryAddress?.postal_code,
        phone: primaryAddress?.telephone_number,
        contact: primaryAddress?.telephone_number,
        doctorSchedules: {
          id: crypto.randomUUID(),
          doctorId: npi,
          workingDays: [1, 2, 3, 4, 5],
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30 as const,
          lunchBreakStart: '12:00',
          lunchBreakEnd: '13:00',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      await dispatch(addLocalDoctor(doctorData)).unwrap()
      setAddedDoctorNpis(prev => new Set(prev).add(npi))
      toast.success(`Dr. ${doctorData.firstName} ${doctorData.lastName} added to internal system`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add doctor to internal system')
    }
  }, [dispatch, localDoctors])

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-100 rounded-2xl">
      <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                <Search className="w-4 h-4 text-blue-500" />
                Search Filters
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Input
                id="npiFirstName"
                label="First Name"
                placeholder="Enter first name"
                value={searchFilters.firstName}
                onChange={(e) => handleFilterChange('firstName', e.target.value)}
              />
              <Input
                id="npiLastName"
                label="Last Name"
                placeholder="Enter last name"
                value={searchFilters.lastName}
                onChange={(e) => handleFilterChange('lastName', e.target.value)}
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <Suspense fallback={<div className="h-24 bg-gray-100 rounded animate-pulse" />}>
                <CountryStateCitySelector
                  selectedCountry={searchFilters.country}
                  selectedState={searchFilters.state}
                  selectedCity={searchFilters.city}
                  onCountryChange={handleCountryChange}
                  onStateChange={handleStateChange}
                  onCityChange={handleCityChange}
                />
                </Suspense>
              </div>
              <div className="sm:col-span-2 lg:col-span-2">
                <Label className="mb-1.5">Specialty</Label>
                <Suspense fallback={<div className="h-10 bg-gray-100 rounded animate-pulse" />}>
                  <TaxonomyFilter
                    selectedTaxonomy={selectedTaxonomy?.code || ''}
                    onTaxonomyChange={handleTaxonomyChange}
                    placeholder="Select a specialty..."
                  />
                </Suspense>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4">
              <Button
                onClick={handleSearch}
                loading={loading}
                disabled={loading || !hasActiveFilters}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Searching...' : 'Search NPI Registry'}
              </Button>
              <Button variant="secondary" onClick={handleClearFilters} disabled={!hasActiveFilters} className="w-full sm:w-auto">
                Clear Filters
              </Button>
            </div>
          </div>
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <Suspense fallback={<div className="h-32 bg-gray-100 rounded animate-pulse" />}>
                <DoctorSearchResults
                  onViewDetails={handleViewDetails}
                  onAddToSystem={handleAddToInternal}
                  searchPerformed={searchPerformed}
                />
              </Suspense>
              {totalPages > 1 && (
                <Suspense fallback={<div className="h-10 bg-gray-100 rounded animate-pulse" />}>
                  <SearchPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    resultCount={resultCount}
                    onPageChange={handlePageChange}
                    loading={loading}
                  />
                </Suspense>
              )}
            </div>
          )}
      </div>
      {viewingDoctor && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-lg">Loading...</div></div>}>
          <DoctorSearchDetails
            selectedDoctor={viewingDoctor}
            showDetailsModal={!!viewingDoctor}
            onCloseModal={() => setViewingDoctor(null)}
            onAddToSystem={handleAddToInternal}
            adding={viewingDoctor?.basic?.npi ? addedDoctorNpis.has(viewingDoctor.basic.npi) : false}
          />
        </Suspense>
      )}
    </div>
  )
}


export default function DoctorSearch() {
  return (
    <div>
      {/* NPI Registry Search Section */}
      <NPISearchSection />
    </div>
  )
}
