import { useState, useEffect, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, X, Loader2 } from 'lucide-react'
import { type AppDispatch, type RootState } from '@/app/store'
import { clearError } from '@/features/doctor/doctorSlice'
import { COMMON_TAXONOMIES } from '@/features/doctor/doctorSlice'

interface DoctorSearchProps {
  onSearch: (params: {
    firstName?: string
    lastName?: string
    taxonomy?: string
    city?: string
    state?: string
  }) => void
}

export default function DoctorSearch({ onSearch }: DoctorSearchProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.doctors)

  const [searchForm, setSearchForm] = useState({
    firstName: '',
    lastName: '',
    taxonomy: '',
    city: '',
    state: ''
  })

  const [showSuggestions, setShowSuggestions] = useState(false)
  const filteredTaxonomies = useMemo(() => {
    if (searchForm.taxonomy) {
      return COMMON_TAXONOMIES.filter(tax =>
        tax.desc.toLowerCase().includes(searchForm.taxonomy.toLowerCase())
      )
    }
    return COMMON_TAXONOMIES
  }, [searchForm.taxonomy])
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


  const handleInputChange = (field: string, value: string) => {
    setSearchForm(prev => ({ ...prev, [field]: value }))

    if (field === 'taxonomy') {
      setShowSuggestions(true)
    }
  }

  const handleSearch = () => {
    // Create search params object, filtering out empty values
    const searchParams: Record<string, string> = {}

    if (searchForm.firstName.trim()) {
      searchParams.firstName = searchForm.firstName.trim()
    }
    if (searchForm.lastName.trim()) {
      searchParams.lastName = searchForm.lastName.trim()
    }
    if (searchForm.taxonomy.trim()) {
      searchParams.taxonomy = searchForm.taxonomy.trim()
    }
    if (searchForm.city.trim()) {
      searchParams.city = searchForm.city.trim()
    }
    if (searchForm.state.trim()) {
      searchParams.state = searchForm.state.trim()
    }

    // Check if at least one search parameter is provided
    if (Object.keys(searchParams).length === 0) {
      alert('Please enter at least one search criteria (name, specialty, city, or state)')
      return
    }

    console.log('Search params being sent:', searchParams) // Debug log
    onSearch(searchParams)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClear = () => {
    setSearchForm({
      firstName: '',
      lastName: '',
      taxonomy: '',
      city: '',
      state: ''
    })
    dispatch(clearError())
  }

  const selectTaxonomy = (taxonomy: typeof COMMON_TAXONOMIES[0]) => {
    setSearchForm(prev => ({ ...prev, taxonomy: taxonomy.desc }))
    setShowSuggestions(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={searchForm.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter first name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={searchForm.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter last name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Specialty (Taxonomy) */}
        <div ref={searchRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialty
          </label>
          <input
            type="text"
            value={searchForm.taxonomy}
            onChange={(e) => handleInputChange('taxonomy', e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Enter or select specialty"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Autocomplete Suggestions */}
          {showSuggestions && filteredTaxonomies.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredTaxonomies.map((taxonomy) => (
                <div
                  key={taxonomy.code}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                  onClick={() => selectTaxonomy(taxonomy)}
                >
                  <div className="font-medium">{taxonomy.desc}</div>
                  <div className="text-gray-500 text-xs">{taxonomy.code}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            value={searchForm.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter city"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          <input
            type="text"
            value={searchForm.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter state (e.g., CA, NY)"
            maxLength={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
          />
        </div>

        {/* Search Buttons */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
