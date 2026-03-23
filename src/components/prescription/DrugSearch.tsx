import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Search, Pill } from 'lucide-react'
import { setSelectedDrug } from '@/features/prescription/prescriptionSlice'
import type { AppDispatch } from '@/app/store'
import type { Drug } from '@/features/prescription/prescriptionSlice'

// Mock medicine database for instant search
const mockMedicineDatabase = [
  { id: '1', brandName: 'Paracetamol', genericName: 'Acetaminophen', drugClass: 'Analgesic', manufacturer: 'Various' },
  { id: '2', brandName: 'Ibuprofen', genericName: 'Ibuprofen', drugClass: 'NSAID', manufacturer: 'Various' },
  { id: '3', brandName: 'Aspirin', genericName: 'Acetylsalicylic acid', drugClass: 'NSAID', manufacturer: 'Bayer' },
  { id: '4', brandName: 'Amoxicillin', genericName: 'Amoxicillin', drugClass: 'Penicillin antibiotic', manufacturer: 'Various' },
  { id: '5', brandName: 'Azithromycin', genericName: 'Azithromycin', drugClass: 'Macrolide antibiotic', manufacturer: 'Pfizer' },
  { id: '6', brandName: 'Metformin', genericName: 'Metformin', drugClass: 'Biguanide', manufacturer: 'Various' },
  { id: '7', brandName: 'Amlodipine', genericName: 'Amlodipine', drugClass: 'Calcium channel blocker', manufacturer: 'Various' },
  { id: '8', brandName: 'Lisinopril', genericName: 'Lisinopril', drugClass: 'ACE inhibitor', manufacturer: 'Various' },
  { id: '9', brandName: 'Atorvastatin', genericName: 'Atorvastatin', drugClass: 'Statin', manufacturer: 'Pfizer' },
  { id: '10', brandName: 'Omeprazole', genericName: 'Omeprazole', drugClass: 'Proton pump inhibitor', manufacturer: 'Various' },
  { id: '11', brandName: 'Cetirizine', genericName: 'Cetirizine', drugClass: 'Antihistamine', manufacturer: 'Various' },
  { id: '12', brandName: 'Salbutamol', genericName: 'Albuterol', drugClass: 'Bronchodilator', manufacturer: 'Various' },
  { id: '13', brandName: 'Insulin', genericName: 'Insulin', drugClass: 'Hormone', manufacturer: 'Various' },
  { id: '14', brandName: 'Ciprofloxacin', genericName: 'Ciprofloxacin', drugClass: 'Fluoroquinolone antibiotic', manufacturer: 'Bayer' },
  { id: '15', brandName: 'Prednisone', genericName: 'Prednisone', drugClass: 'Corticosteroid', manufacturer: 'Various' },
]

const DrugSearch = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMedicines = searchQuery.trim()
    ? mockMedicineDatabase.filter(medicine =>
        medicine.brandName.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
        medicine.genericName.toLowerCase().startsWith(searchQuery.toLowerCase())
      )
    : []

  const showResults = searchQuery.trim() && filteredMedicines.length > 0

  const handleDrugSelect = (medicine: typeof mockMedicineDatabase[0]) => {
    console.log('Selected drug:', medicine)
    // Create drug object for Redux store
    const drug: Drug = {
      id: medicine.id,
      brandName: medicine.brandName,
      genericName: medicine.genericName,
      drugClass: medicine.drugClass,
      manufacturer: medicine.manufacturer,
      isRecalled: false,
    }

    dispatch(setSelectedDrug(drug))
    setSearchQuery(`${medicine.brandName} (${medicine.genericName})`)

    // No additional API call - DrugInfoPanel will fetch detailed data
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    dispatch(setSelectedDrug(null))
  }

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for medicines by brand or generic name..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <span className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</span>
          </button>
        )}
      </div>


      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            {filteredMedicines.map((medicine) => (
              <button
                key={medicine.id}
                onClick={() => handleDrugSelect(medicine)}
                className="w-full text-left p-3 hover:bg-blue-50 rounded-lg transition-colors duration-150 border border-transparent hover:border-blue-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {medicine.brandName}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {medicine.genericName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {medicine.drugClass}
                    </div>
                  </div>
                  <div className="ml-2">
                    <Pill className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DrugSearch
