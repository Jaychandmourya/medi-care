import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, User, MapPin, Plus, X, Eye, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import { type AppDispatch, type RootState } from '@/app/store'
import { addLocalDoctor } from '@/features/doctor/doctorThunk'
import { searchDoctors } from '@/features/doctor/doctorThunk'
import { doctorDBOperations } from '@/services/doctorServices'
import { type NPIResult } from '@/features/doctor/doctorThunk'
import { Button } from '../ui/Button'
import DoctorDetailsModal from './DoctorDetailsModal'

interface DoctorAutocompleteProps {
  onFieldPopulate?: (fields: { firstName: string; lastName: string; city?: string; state?: string; country?: string; contact?: string }) => void
  onFormPopulate?: (fields: { firstName: string; lastName: string; city?: string; state?: string; country?: string; contact?: string }) => void
  onClearForm?: () => void
  clearTrigger?: number
}

interface AutocompleteDoctor {
  npi: string
  firstName: string
  lastName: string
  middleName?: string
  credential?: string
  city?: string
  state?: string
  country?: string
  contact?: string
  specialty?: string
  fullName: string,
  gender: string
  address?: string
  address2?: string
  postalCode?: string
  enumerationDate?: string
  lastUpdated?: string
  status?: string
  taxonomyCode?: string
}

// Custom debounce hook
const useDebounce = <T extends (...args: never[]) => unknown>(callback: T, delay: number): T => {
  const timeoutRef = useRef<number | null>(null)

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = window.setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay]) as T
}

export default function DoctorAutocomplete({ onFieldPopulate, onFormPopulate, onClearForm, clearTrigger }: DoctorAutocompleteProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { searchResults, loading } = useSelector((state: RootState) => state.doctors)
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [adding, setAdding] = useState(false)
  const [isUserTyping, setIsUserTyping] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState<AutocompleteDoctor | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Clear autocomplete when clearTrigger changes
  useEffect(() => {
    if (clearTrigger !== undefined) {
      setQuery('')
      setShowSuggestions(false)
      setIsUserTyping(true)
    }
  }, [clearTrigger])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search function - using useCallback to prevent recreation
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2 || !isUserTyping) {
      setShowSuggestions(false)
      return
    }

    try {
      // Split query to determine if it's first name, last name, or both
      const nameParts = searchQuery.trim().split(' ')
      const searchParams: {
        firstName?: string
        lastName?: string
        limit: number
        skip: number
      } = {
        limit: 10,
        skip: 0
      }

      if (nameParts.length === 1) {
        // Single name, search as first name
        searchParams.firstName = nameParts[0]
      } else if (nameParts.length >= 2) {
        // Multiple names, use first as first name, last as last name
        searchParams.firstName = nameParts[0]
        searchParams.lastName = nameParts.slice(1).join(' ')
      }

      await dispatch(searchDoctors(searchParams)).unwrap()
      setShowSuggestions(true)
    } catch (err) {
      console.error('Search failed:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to search doctors. Please try again.')
      setShowSuggestions(false)
    }
  }, [dispatch, isUserTyping])

  const debouncedSearch = useDebounce(performSearch, 500)

  // Memoize the input change handler to prevent unnecessary re-renders
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUserTyping(true)
    setQuery(e.target.value)
  }, [])

  // Memoize the input focus handler
  const handleInputFocus = useCallback(() => {
    if (query.trim().length >= 2) {
      setShowSuggestions(true)
    }
  }, [query])

  // Trigger debounced search when query changes
  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  // Transform NPI results to AutocompleteDoctor format - memoized for performance
  const suggestions: AutocompleteDoctor[] = useMemo(() => {
    return searchResults.map((doctor: NPIResult) => {
      console.log('doctor',doctor)
      const basic = doctor.basic
      const primaryAddress = doctor.addresses?.find(addr => addr.address_1)
      const primaryTaxonomy = doctor.taxonomies?.find(tax => tax.primary)

      return {
        npi: basic?.npi || '',
        firstName: basic?.first_name || '',
        lastName: basic?.last_name || '',
        middleName: basic?.middle_name || '',
        credential: basic?.credential || '',
        contact: primaryAddress?.telephone_number || '',
        city: primaryAddress?.city || '',
        state: primaryAddress?.state || '',
        country: doctor?.country || '',
        postalCode: primaryAddress?.postal_code || '',
        address: primaryAddress?.address_1 || '',
        address2: primaryAddress?.address_2 || '',
        specialty: primaryTaxonomy?.desc || '',
        taxonomyCode: primaryTaxonomy?.code || '',
        fullName: `${basic?.first_name || ''} ${basic?.middle_name ? basic.middle_name + ' ' : ''}${basic?.last_name || ''}`.trim(),
        gender: basic?.gender || '',
        enumerationDate: basic?.enumeration_date || '',
        lastUpdated: basic?.last_updated || '',
        status: basic?.status || ''
      }
    })
  }, [searchResults])

  const handleDoctorClick = useCallback((doctor: AutocompleteDoctor) => {
    setIsUserTyping(false) // Prevent search when setting query from selection

    // Populate form fields if callback is provided
    if (onFormPopulate) {
      onFormPopulate({
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        city: doctor.city,
        state: doctor.state,
        country: doctor.country,
        contact: doctor.contact,
        specialty: doctor.specialty,
        postalCode: doctor.postalCode,
        address: doctor.address,
        gender: doctor.gender
      })
    } else if (onFieldPopulate) {
      onFieldPopulate({
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        city: doctor.city,
        state: doctor.state,
        country: doctor.country,
        contact: doctor.contact,
        specialty: doctor.specialty,
        postalCode: doctor.postalCode,
        address: doctor.address,
        gender: doctor.gender
      })
    }

    setShowSuggestions(false)
    setQuery(doctor.fullName)
  }, [onFormPopulate, onFieldPopulate])

  const handleClear = useCallback(() => {
    setIsUserTyping(true)
    setQuery('')
    setShowSuggestions(false)
    onClearForm?.()
  }, [onClearForm])

  const handleViewDetails = useCallback((doctor: AutocompleteDoctor, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDoctor(doctor)
    setShowDetailsModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowDetailsModal(false)
    setSelectedDoctor(null)
  }, [])

  const handleAddToSystem = useCallback(async (doctor: AutocompleteDoctor) => {
    setAdding(true)
    try {
      // Check if already exists
      const existing = await doctorDBOperations.findByNPI(doctor.npi)
      if (existing) {
        toast.error('This doctor is already in your system')
        return
      }

      // Add to database
      const doctorData = {
        npi: doctor.npi,
        firstName: doctor.firstName?.trim() || '',
        lastName: doctor.lastName?.trim() || '',
        specialty: doctor.specialty?.trim(),
        department: doctor.department || 'General Medicine',
        email: doctor.email?.trim(),
        city: doctor.city?.trim(),
        state: doctor.state?.trim(),
        country: doctor.country?.trim(),
        contact: doctor.contact?.trim(),
        address: doctor.address,
        gender: doctor.gender,
        postalCode: doctor.postalCode,
        addedAt: new Date().toISOString()
      }
      // Add to Redux store
      dispatch(addLocalDoctor({
        ...doctorData,
        id: Date.now(),
        addedAt: new Date().toISOString()
      }))

      toast.success('Doctor added to your system successfully!')
      setShowSuggestions(false)
      setQuery('')
      setIsUserTyping(true)
    } catch (error) {
      console.error('Failed to add doctor:', error)
      toast.error('Failed to add doctor to system')
    } finally {
      setAdding(false)
    }
  }, [dispatch])

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Search doctors by name (type at least 2 characters)..."
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-linear-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Search Results</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Found {suggestions.length} doctor{suggestions.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {query}
                </span>
              </div>
            </div>
          </div>

          {/* Suggestions List */}
          <div className="divide-y divide-gray-100">
            {suggestions.map((doctor, index) => (
              <div
                key={`${doctor.npi}-${index}`}
                className="group p-4 hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-200"
                onClick={() => handleDoctorClick(doctor)}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Doctor Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                          {doctor.fullName}
                        </h4>
                        <p className="text-xs text-gray-500">NPI: {doctor.npi}</p>
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="flex flex-wrap items-center gap-3 ml-13">
                      {doctor.specialty && (
                        <span className="inline-flex items-center gap-1 bg-linear-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                          <Briefcase className="w-3 h-3" />
                          {doctor.specialty}
                        </span>
                      )}

                      {doctor.city && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          <MapPin className="w-3 h-3" />
                          <span>{doctor.city}, {doctor.state}</span>
                        </div>
                      )}

                      {doctor.gender && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          <User className="w-3 h-3" />
                          <span className="capitalize">{doctor.gender}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      onClick={(e) => handleViewDetails(doctor, e)}
                      size="sm"
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 p-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              💡 Click on a doctor to populate fields or use the action buttons
            </p>
          </div>
        </div>
      )}

      <DoctorDetailsModal
        selectedDoctor={selectedDoctor}
        showDetailsModal={showDetailsModal}
        onCloseModal={handleCloseModal}
        onAddToSystem={handleAddToSystem}
        adding={adding}
      />
    </div>
  )
}
