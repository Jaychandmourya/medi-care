import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Pill, Loader2 } from 'lucide-react'
import { setSelectedDrug, searchDrugs } from '@/features/prescription/prescriptionSlice'
import type { AppDispatch, RootState } from '@/app/store'
import type { Drug } from '@/features/prescription/prescriptionSlice'

const DrugSearch = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { drugSearchResults, searchLoading, error } = useSelector((state: RootState) => state.prescriptions)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        setDebouncedQuery(searchQuery)
      } else {
        setDebouncedQuery('')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Trigger API search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      dispatch(searchDrugs(debouncedQuery))
    }
  }, [debouncedQuery, dispatch])

  // Memoize showResults to prevent unnecessary recalculations
  const showResults = useMemo(() => {
    return searchQuery.trim() && drugSearchResults.length > 0 && showDropdown
  }, [searchQuery, drugSearchResults.length, showDropdown])

  // Memoize drug selection handler to prevent function recreation
  const handleDrugSelect = useCallback((drug: Drug) => {
    console.log('Selected drug:', drug)
    dispatch(setSelectedDrug(drug))
    setSearchQuery(`${drug.brandName} (${drug.genericName})`)
    setShowDropdown(false)
  }, [dispatch])

  // Memoize clear search handler
  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    dispatch(setSelectedDrug(null))
    setShowDropdown(false)
  }, [dispatch])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setShowDropdown(true)
  }, [])

  // Memoize search results list to prevent unnecessary re-renders
  const searchResultsList = useMemo(() => {
    return drugSearchResults.map((drug) => (
      <button
        key={drug.id}
        onClick={() => handleDrugSelect(drug)}
        className="w-full text-left p-3 hover:bg-blue-50 rounded-lg transition-colors duration-150 border border-transparent hover:border-blue-200"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {drug.brandName}
            </div>
            <div className="text-sm text-gray-600 truncate">
              {drug.genericName}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {drug.drugClass}
            </div>
            {drug.manufacturer && drug.manufacturer !== 'Unknown' && (
              <div className="text-xs text-gray-400 mt-1">
                {drug.manufacturer}
              </div>
            )}
          </div>
          <div className="ml-2">
            <Pill className="h-4 w-4 text-blue-500" />
          </div>
        </div>
      </button>
    ))
  }, [drugSearchResults, handleDrugSelect])

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search for medicines by brand or generic name..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {searchLoading ? (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <span className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</span>
            )}
          </button>
        )}
      </div>


      {/* Loading indicator */}
      {searchLoading && searchQuery.trim() && showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            <span className="text-sm text-gray-600">Searching FDA database...</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && searchQuery.trim() && showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-red-200 rounded-lg shadow-lg p-4">
          <div className="text-sm text-red-600">
            Error: {error}. Please try again.
          </div>
        </div>
      )}

      {/* Search results */}
      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            {searchResultsList}
          </div>
        </div>
      )}

      {/* No results message */}
      {searchQuery.trim() && !searchLoading && !error && drugSearchResults.length === 0 && showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="text-sm text-gray-600 text-center">
            No medicines found matching "{searchQuery}"
          </div>
        </div>
      )}
    </div>
  )
}

export default DrugSearch
