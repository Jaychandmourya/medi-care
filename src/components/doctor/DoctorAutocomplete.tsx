import { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Search, User, MapPin, Plus, X } from 'lucide-react'
import { type AppDispatch } from '@/app/store'
import { addLocalDoctor } from '@/features/doctor/doctorSlice'
import { doctorDBOperations } from '@/features/db/doctorDB'
import { type NPIResult } from '@/features/doctor/doctorSlice'
import { Button } from '../ui/Button'

interface DoctorAutocompleteProps {
  onFieldPopulate?: (fields: { firstName: string; lastName: string; city?: string; state?: string; country?: string; contact?: string }) => void
  onFormPopulate?: (fields: { firstName: string; lastName: string; city?: string; state?: string; country?: string; contact?: string }) => void
}

interface AutocompleteDoctor {
  npi: string
  firstName: string
  lastName: string
  city?: string
  state?: string
  country?: string
  contact?: string
  specialty?: string
  fullName: string
}

export default function DoctorAutocomplete({ onFieldPopulate, onFormPopulate }: DoctorAutocompleteProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AutocompleteDoctor[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [adding, setAdding] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchDoctors(query.trim())
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const searchDoctors = async (searchQuery: string) => {
    try {
      setLoading(true)

      // Search by first name or last name
      const params = new URLSearchParams({
        version: '2.1',
        limit: '10',
        skip: '0'
      })
      // Try first name search first
      params.append('first_name', searchQuery)

      const response = await fetch(
        `http://localhost:3001/api/npi?${params.toString()}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch doctors')
      }

      const data = await response.json()

      if (data.Errors && data.Errors.length > 0) {
        throw new Error(data.Errors[0].description || 'API error occurred')
      }

      const doctors: AutocompleteDoctor[] = (data.results || []).map((doctor: NPIResult) => {
        const basic = doctor.basic
        const primaryAddress = doctor.addresses?.find(addr => addr.address_1)
        const primaryTaxonomy = doctor.taxonomies?.find(tax => tax.primary)

        return {
          npi: basic?.npi || '',
          firstName: basic?.first_name || '',
          lastName: basic?.last_name || '',
          contact: primaryAddress?.telephone_number || '',
          city: primaryAddress?.city || '',
          state: primaryAddress?.state || '',
          country: primaryAddress?.country_name || '',
          postalCode: primaryAddress?.postal_code || '',
          specialty: primaryTaxonomy?.desc || '',
          address: primaryAddress?.address_1 || '',
          fullName: `${basic?.first_name || ''} ${basic?.last_name || ''}`.trim()
        }
      })

      setSuggestions(doctors)
      setShowSuggestions(doctors.length > 0)
    } catch (error) {
      console.error('Autocomplete search error:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleDoctorClick = (doctor: AutocompleteDoctor) => {
    console.log('Doctor clicked111:', doctor)
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
        address: doctor.address
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
        address: doctor.address
      })
    }

    setShowSuggestions(false)
    setQuery(doctor.fullName)
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleAddToSystem = async (doctor: AutocompleteDoctor) => {
    setAdding(true)
    try {
      // Check if already exists
      const existing = await doctorDBOperations.findByNPI(doctor.npi)
      if (existing) {
        alert('This doctor is already in your system')
        return
      }

      // Add to database
      const doctorData = {
        npi: doctor.npi,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialty: doctor.specialty,
        city: doctor.city,
        state: doctor.state,
        country: doctor.country,
        contact: doctor.contact,
        address: doctor.city ? `${doctor.city}, ${doctor.state || ''}`.trim() : undefined,
        phone: undefined,
        credential: undefined,
        gender: undefined,
        postalCode: undefined
      }

      await doctorDBOperations.add(doctorData)

      // Add to Redux store
      dispatch(addLocalDoctor({
        ...doctorData,
        id: Date.now(),
        addedAt: new Date().toISOString()
      }))

      alert('Doctor added to your system successfully!')
      setShowSuggestions(false)
      setQuery('')
    } catch (error) {
      console.error('Failed to add doctor:', error)
      alert('Failed to add doctor to system')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
          placeholder="Search doctors by name (type at least 2 characters)..."
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2 border-b border-gray-100">
            <p className="text-xs text-gray-500">
              Found {suggestions.length} doctors. Click to populate fields or add to system.
            </p>
          </div>
          {suggestions.map((doctor, index) => (
            <div
              key={`${doctor.npi}-${index}`}
              className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
              onClick={() => handleDoctorClick(doctor)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900 truncate">
                      {doctor.fullName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {doctor.specialty && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                        {doctor.specialty}
                      </span>
                    )}
                    {doctor.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{doctor.city}, {doctor.state}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">NPI: {doctor.npi}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToSystem(doctor)
                    }}
                    loading={adding}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add to System
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
