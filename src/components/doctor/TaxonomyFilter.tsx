import { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react'
import { ChevronDown, Briefcase } from 'lucide-react'

// Common taxonomy codes for dropdown (extracted from API data)
const COMMON_TAXONOMIES = [
  { code: '101YA0400X', desc: 'Counselor, Addiction (Substance Use Disorder)' },
  { code: '101Y00000X', desc: 'Counselor' },
  { code: '104100000X', desc: 'Social Worker' },
  { code: '1041C0700X', desc: 'Social Worker, Clinical' },
  { code: '106S00000X', desc: 'Behavior Technician' },
  { code: '111N00000X', desc: 'Chiropractor' },
  { code: '122300000X', desc: 'Dentist' },
  { code: '207Q00000X', desc: 'Family Medicine' },
  { code: '225100000X', desc: 'Physical Therapist' },
  { code: '251S00000X', desc: 'Community/Behavioral Health' },
  { code: '252Y00000X', desc: 'Early Intervention Provider Agency' },
  { code: '261QR0405X', desc: 'Clinic/Center, Rehabilitation, Substance Use Disorder' },
  { code: '3336C0003X', desc: 'Pharmacy, Community/Retail Pharmacy' },
  { code: '3336C0004X', desc: 'Pharmacy, Compounding Pharmacy' },
  { code: '343800000X', desc: 'Secured Medical Transport (VAN)' },
  { code: '363LP0808X', desc: 'Nurse Practitioner, Psych/Mental Health' }
]

interface TaxonomyFilterProps {
  selectedTaxonomy?: string
  onTaxonomyChange: (taxonomy: { code: string; desc: string } | null) => void
  placeholder?: string
  disabled?: boolean
}

function TaxonomyFilter({
  selectedTaxonomy,
  onTaxonomyChange,
  placeholder = 'Filter by specialty...',
  disabled = false
}: TaxonomyFilterProps) {

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedTaxonomyObj = useMemo(() =>
    COMMON_TAXONOMIES.find(t =>
      t.code === selectedTaxonomy || t.desc === selectedTaxonomy
    ), [selectedTaxonomy]
  )

  const filteredTaxonomies = useMemo(() =>
    COMMON_TAXONOMIES.filter(taxonomy =>
      taxonomy.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taxonomy.code.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = useCallback((taxonomy: { code: string; desc: string }) => {
    onTaxonomyChange(taxonomy)
    setIsOpen(false)
    setSearchTerm('')
  }, [onTaxonomyChange])

  const handleClear = useCallback(() => {
    onTaxonomyChange(null)
    setSearchTerm('')
  }, [onTaxonomyChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setIsOpen(true)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }, [])

  const handleClearClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    handleClear()
  }, [handleClear])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full px-4 py-2 text-left bg-white border rounded-lg
          flex items-center justify-between gap-2
          transition-colors duration-200
          ${disabled
            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          }
        `}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">
            {selectedTaxonomyObj ? selectedTaxonomyObj.desc : placeholder}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selectedTaxonomyObj && !disabled && (
            <span
              onClick={handleClearClick}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              title="Clear selection"
            >
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search specialties..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="max-h-60 overflow-y-auto">
            {filteredTaxonomies.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">No specialties found</p>
              </div>
            ) : (
              <div className="py-1">
                {filteredTaxonomies.map((taxonomy) => (
                  <button
                    key={taxonomy.code}
                    type="button"
                    onClick={() => handleSelect(taxonomy)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                      flex items-start gap-3 border-b border-gray-100 last:border-b-0
                      ${selectedTaxonomyObj?.code === taxonomy.code
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                      }
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{taxonomy.desc}</div>
                      <div className="text-sm text-gray-500">{taxonomy.code}</div>
                    </div>
                    {selectedTaxonomyObj?.code === taxonomy.code && (
                      <svg className="w-5 h-5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              {filteredTaxonomies.length} of {COMMON_TAXONOMIES.length} specialties
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(TaxonomyFilter, (prevProps, nextProps) => {
  return prevProps.selectedTaxonomy === nextProps.selectedTaxonomy &&
         prevProps.onTaxonomyChange === nextProps.onTaxonomyChange &&
         prevProps.placeholder === nextProps.placeholder &&
         prevProps.disabled === nextProps.disabled
})
