import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { getAllPatients } from '@/features/patient/patientThunk'
import type { Patient } from '@/types/patients/patientType'
import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/common/Button'
import AddEditPatientDialog from '@/components/admin/patient/dialog/AddEditPatientDialog'

interface PatientSearchDropdownProps {
  selectedPatientId: string
  onPatientSelect: (patientId: string) => void
  disabled?: boolean
}

const PatientSearchDropdown: React.FC<PatientSearchDropdownProps> = ({
  selectedPatientId,
  onPatientSelect,
  disabled = false
}) => {
  const dispatch = useAppDispatch()
  const patients = useAppSelector((state) => state.patients.list)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dispatch(getAllPatients())
  }, [dispatch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredPatients = useMemo(() =>
    patients.filter(patient =>
      patient.isActive && (
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
      )
    ), [patients, searchTerm])

  const selectedPatient = useMemo(() =>
    patients.find(p => p.patientId === selectedPatientId), [patients, selectedPatientId])

  const handlePatientClick = useCallback((patient: Patient) => {
    onPatientSelect(patient.patientId || '')
    setIsOpen(false)
    setSearchTerm('')
  }, [onPatientSelect])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleSearchClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation()
  }, [])

  const handleToggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }, [disabled, isOpen])

  const handleCloseDialog = useCallback(() => {
    setShowAddDialog(false)
  }, [])

  const handleAddPatient = useCallback(() => {
    setShowAddDialog(true)
    setIsOpen(false)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <div
            className={`w-full px-3 py-2 border rounded-lg bg-white flex items-center cursor-pointer ${
              disabled ? 'bg-gray-100 border-gray-300' : 'border-gray-300 hover:border-blue-500'
            }`}
            onClick={handleToggleDropdown}
          >
            {selectedPatient ? (
              <div className="flex items-center flex-1">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
                  {selectedPatient.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{selectedPatient.name}</div>
                  <div className="text-xs text-gray-500">{selectedPatient.patientId}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center flex-1 text-gray-500">
                <Search className="w-4 h-4 mr-2" />
                <span>Select a patient...</span>
              </div>
            )}
          </div>

          {isOpen && !disabled && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onClick={handleSearchClick}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => handlePatientClick(patient)}
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                        {patient.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{patient.name}</div>
                        <div className="text-xs text-gray-500">{patient.patientId} • {patient.phone}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-gray-500 text-sm">
                    {searchTerm ? 'No patients found' : 'No patients available'}
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-gray-200">
                <Button
                  onClick={handleAddPatient}
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Patient
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddDialog && (
        <AddEditPatientDialog
          isOpen={showAddDialog}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  )
}

export default PatientSearchDropdown
