// Test component to verify autocomplete functionality
// This is a temporary test file - you can delete it after testing

import { useState } from 'react'
import DoctorAutocomplete from './DoctorAutocomplete'
import { type NPIResult } from '@/features/doctor/doctorSlice'

export default function DoctorAutocompleteTest() {
  const [selectedDoctor, setSelectedDoctor] = useState<NPIResult | null>(null)

  const handleDoctorSelect = (doctor: NPIResult) => {
    setSelectedDoctor(doctor)
    console.log('Selected doctor:', doctor)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Doctor Autocomplete Test</h2>
      
      <div className="mb-6">
        <DoctorAutocomplete onDoctorSelect={handleDoctorSelect} />
      </div>

      {selectedDoctor && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Selected Doctor:</h3>
          <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(selectedDoctor, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
