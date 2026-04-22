import { useState, useCallback, memo } from 'react'
import toast from 'react-hot-toast'

import { User, Briefcase, Eye, Plus, Loader2 } from 'lucide-react'

import { Button } from '@/components/common/Button'

import { type RootState } from '@/app/store'
import type { NPIResult } from '@/types/doctors/NpiType'

import { useSelector } from 'react-redux'

import { doctorDBOperations } from '@/services/doctorServices'

interface DoctorSearchResultsProps {
  onViewDetails: (doctor: NPIResult) => void
  onAddToSystem: (doctor: NPIResult) => void
  searchPerformed: boolean
}

function DoctorSearchResults({ onViewDetails, onAddToSystem, searchPerformed }: DoctorSearchResultsProps) {
  const { searchResults, searchLoading: loading, resultCount, currentPage, totalPages } = useSelector((state: RootState) => state.doctors)
  const [addingDoctor, setAddingDoctor] = useState<string | null>(null)

  const handleViewDetails = useCallback((doctor: NPIResult) => {
    onViewDetails(doctor)
  }, [onViewDetails])

  const handleAddToSystem = useCallback(async (doctor: NPIResult) => {
    setAddingDoctor(doctor.basic?.npi || '')
    try {
      // Check if already exists
      const existing = await doctorDBOperations.findByNPI(doctor.basic?.npi || '')
      if (existing) {
        toast.success('Doctor already exists in your system. Form populated with their data.')
        onAddToSystem(doctor)
        return
      }

      // Extract primary address and taxonomy
      const primaryAddress = doctor.addresses?.find((addr) => addr.address_1)
      const primaryTaxonomy = doctor.taxonomies?.find((tax) => tax.primary)

      // Add to database
      const doctorData = {
        npi: doctor.basic?.npi || '',
        firstName: doctor.basic?.first_name?.trim() || '',
        lastName: doctor.basic?.last_name?.trim() || '',
        middleName: doctor.basic?.middle_name?.trim() || '',
        credential: doctor.basic?.credential?.trim() || '',
        specialty: primaryTaxonomy?.desc?.trim() || '',
        department: primaryTaxonomy?.desc?.trim() || 'General Medicine',
        email: '',
        city: primaryAddress?.city?.trim() || '',
        state: primaryAddress?.state?.trim() || '',
        country: 'US',
        contact: primaryAddress?.telephone_number?.trim() || '',
        address: primaryAddress?.address_1?.trim() || '',
        gender: doctor.basic?.gender || '',
        postalCode: primaryAddress?.postal_code?.trim() || '',
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active' as const
      }

      // Add the doctor to the database
      await doctorDBOperations.add(doctorData)

      onAddToSystem(doctor)
      toast.success('Doctor added to your system successfully!')
    } catch (error) {
      console.error('Failed to add doctor:', error)
      toast.error('Failed to add doctor to system')
    } finally {
      setAddingDoctor(null)
    }
  }, [onAddToSystem])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Searching doctors...</span>
      </div>
    )
  }

  if (searchResults.length === 0) {
    if (!searchPerformed) {
      return null
    }
    return (
      <div className="text-center py-8 sm:py-12 bg-white rounded-xl border border-gray-100 px-4">
        <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
        <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No doctors found</h4>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Try adjusting your search criteria. You can search by name, location, or specialty.
        </p>
      </div>
    )
  }

  return (
      <div className="space-y-4">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results
            </h3>
            <p className="text-sm text-gray-600">
              Found {resultCount} doctor{resultCount !== 1 ? 's' : ''}
              {totalPages > 1 && ` - Page ${currentPage} of ${totalPages}`}
            </p>
          </div>
        </div>

        {/* Doctor Cards */}
        <div className="grid gap-4">
          {searchResults.map((doctor) => {
            const basic = doctor.basic
            const primaryTaxonomy = doctor.taxonomies?.find((tax: { primary?: boolean }) => tax.primary)
            const isAdding = addingDoctor === basic?.npi

            return (
              <div
                key={basic?.npi || Math.random().toString()}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Doctor Information */}
                  <div className="flex-1">
                    {/* Name and Credentials */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {basic?.first_name} {basic?.middle_name ? basic.middle_name + ' ' : ''}{basic?.last_name}
                          {basic?.credential && (
                            <span className="ml-2 text-sm text-gray-500">
                              {basic.credential}
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-500">NPI: {basic?.npi}</p>
                      </div>
                    </div>

                    {/* Specialty */}
                    {primaryTaxonomy?.desc && (
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {primaryTaxonomy.desc}
                        </span>
                        {primaryTaxonomy.code && (
                          <span className="text-xs text-gray-500">
                            ({primaryTaxonomy.code})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Additional Taxonomies */}
                    {doctor.taxonomies && doctor.taxonomies.length > 1 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Additional Specialties:</p>
                        <div className="flex flex-wrap gap-2">
                          {doctor.taxonomies
                            .filter((tax: { primary?: boolean }) => !tax.primary)
                            .map((tax: { desc?: string }, taxIndex: number) => (
                              <span
                                key={taxIndex}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                              >
                                {tax.desc}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      onClick={() => handleViewDetails(doctor)}
                      size="sm"
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleAddToSystem(doctor)}
                      size="sm"
                      loading={isAdding}
                      disabled={isAdding}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {isAdding ? 'Adding...' : 'Add to doctor'}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
  )
}

// Memoize component to prevent re-renders when props haven't changed
export default memo(DoctorSearchResults, (prevProps, nextProps) => {
  return prevProps.onViewDetails === nextProps.onViewDetails &&
        prevProps.onAddToSystem === nextProps.onAddToSystem
})
