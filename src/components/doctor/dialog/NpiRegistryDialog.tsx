import { useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/common/Button'
import Input from '@/components/common/Input'
import { Label } from '@/components/common/Label'

import type { NPIResult } from '@/types/doctors/NpiType'
import type{ AutocompleteDoctor } from '@/types/doctors/doctorType'

import TaxonomyFilter from '@/components/doctor/TaxonomyFilter'
import DoctorSearchResults from '@/components/doctor/DoctorSearchResults'
import SearchPagination from '@/components/doctor/SearchPagination'
import DoctorDetailsModal from '@/components/doctor/dialog/DoctorDetailsModal'
import CountryStateCitySelector from '@/components/doctor/CountryStateCitySelector'

// Interface
interface NpiRegistryDialogProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: () => void
  selectedTaxonomy: { code: string; desc: string } | null
  onTaxonomyChange: (taxonomy: { code: string; desc: string } | null) => void
  filterValues: {
    firstName: string
    lastName: string
    city: string
    state: string
    country: string
  }
  onFilterChange: (field: string, value: string) => void
  selectedCountryCode: string
  onCountryChange: (countryCode: string, countryName: string) => void
  selectedStateCode: string
  onStateChange: (stateCode: string, stateName: string) => void
  onCityChange: (cityName: string) => void
  hasActiveFilters: () => boolean
  onClearFilters: () => void
  showResults: boolean
  onAddToSystem: (doctor: NPIResult) => void
  currentPage: number
  totalPages: number
  resultCount: number
  onPageChange: (page: number) => void
  loading: boolean
}

const NpiRegistryDialog = ({
  isOpen,
  onClose,
  onApplyFilters,
  selectedTaxonomy,
  onTaxonomyChange,
  filterValues,
  onFilterChange,
  hasActiveFilters,
  onClearFilters,
  showResults,
  onAddToSystem,
  currentPage,
  totalPages,
  resultCount,
  onPageChange,
  loading,
  selectedCountryCode,
  onCountryChange,
  selectedStateCode,
  onStateChange,
  onCityChange
}: NpiRegistryDialogProps) => {


  // State
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<AutocompleteDoctor | null>(null)

  // Method
  const handleViewDetails = (doctor: NPIResult) => {
    const convertedDoctor = convertNPIResultToAutocompleteDoctor(doctor)
    setSelectedDoctor(convertedDoctor)
    setShowProfileModal(true)
  }

  const handleCloseProfile = () => {
    setSelectedDoctor(null)
    setShowProfileModal(false)
  }

  const handleCloseDialog = () => {
    onClearFilters()
    onClose()
  }

  const convertNPIResultToAutocompleteDoctor = (npiResult: NPIResult): AutocompleteDoctor => {
    const primaryAddress = npiResult.addresses?.find(addr => addr.address_1)
    const primaryTaxonomy = npiResult.taxonomies?.find(tax => tax.primary)

    const firstName = npiResult.basic.first_name?.trim() || '';
    const lastName = npiResult.basic.last_name?.trim() || '';
    const middleName = npiResult.basic.middle_name?.trim() || '';

    return {
      npi: npiResult.basic.npi,
      firstName,
      lastName,
      middleName,
      fullName: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
      credential: npiResult.basic.credential?.trim() || '',
      specialty: primaryTaxonomy?.desc?.trim() || '',
      city: primaryAddress?.city?.trim() || '',
      state: primaryAddress?.state?.trim() || '',
      country: (primaryAddress as unknown as { country?: string })?.country?.trim() || npiResult.country || 'US',
      contact: primaryAddress?.telephone_number?.trim() || '',
      address: primaryAddress?.address_1?.trim() || '',
      postalCode: primaryAddress?.postal_code?.trim() || '',
      gender: npiResult.basic.gender || 'M'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header - Fixed */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200 z-10">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Search NPI Registry</h3>
            {hasActiveFilters() && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Active
              </span>
            )}
          </div>
          <button
            onClick={handleCloseDialog}
            className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filters Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name Filter */}
            <Input
              id="filterFirstName"
              label="First Name"
              placeholder="Enter first name"
              value={filterValues.firstName}
              onChange={(e) => onFilterChange('firstName', e.target.value)}
            />

            {/* Last Name Filter */}
            <Input
              id="filterLastName"
              label="Last Name"
              placeholder="Enter last name"
              value={filterValues.lastName}
              onChange={(e) => onFilterChange('lastName', e.target.value)}
            />
          </div>

          {/* Country/State/City Selector */}
          <div className="mt-4">
            <CountryStateCitySelector
              selectedCountry={selectedCountryCode}
              selectedState={selectedStateCode}
              selectedCity={filterValues.city}
              onCountryChange={onCountryChange}
              onStateChange={onStateChange}
              onCityChange={onCityChange}
            />
          </div>

          {/* Specialty Filter */}
          <div className="mt-4">
            <Label className="mb-1.5">
              Specialty (Taxonomy)
            </Label>
            <div className="max-w-md">
              <TaxonomyFilter
                selectedTaxonomy={selectedTaxonomy?.code || ''}
                onTaxonomyChange={onTaxonomyChange}
                placeholder="Select a specialty to filter results..."
              />
            </div>
          </div>

          <div className='flex gap-4 mt-4'>
            <Button onClick={onApplyFilters}>
              Search
            </Button>
            <Button variant="secondary" onClick={onClearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Search Results - Only show when filters are applied */}
        {showResults && (
          <div className="px-6 pb-6">
            <DoctorSearchResults
              onViewDetails={handleViewDetails}
              onAddToSystem={onAddToSystem}
              searchPerformed={showResults}
            />

            {/* Pagination */}
            <SearchPagination
              currentPage={currentPage}
              totalPages={totalPages}
              resultCount={resultCount}
              onPageChange={onPageChange}
              loading={loading}
            />
          </div>
        )}

        {/* Footer - Fixed */}
        <div className="sticky bottom-0 bg-white flex justify-end gap-3 p-4 border-t border-gray-200 z-10">
          <Button variant="outline" onClick={handleCloseDialog}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Doctor Details Modal */}
      <DoctorDetailsModal
        selectedDoctor={selectedDoctor}
        showDetailsModal={showProfileModal}
        onCloseModal={handleCloseProfile}
        onAddToSystem={(doctor) => doctor && onAddToSystem(doctor as unknown as NPIResult)}
        adding={loading}
      />
    </div>
  )
}

export default NpiRegistryDialog