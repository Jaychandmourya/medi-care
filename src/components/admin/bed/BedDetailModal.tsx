import React, { useState, useEffect, useMemo, useCallback } from 'react'

// Import icons file
import { X, User, Calendar, Clock, FileText, Save, UserPlus, LogOut, Plus, ChevronDown } from 'lucide-react'

// Import UI components
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import Input from '@/components/ui/Input'

// Import Types files
import type { RootState } from '@/app/store'
import type { Patient } from '@/types/patients/patientType'
import type { Bed, BedStatus } from '@/types/bed/bedType'

// Import form control, validation and zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Import dispatch and selector for redux
import { useAppDispatch, useAppSelector } from '@/app/hooks'

// Import Thunk file for redux
import { getAllPatients } from '@/features/patient/patientThunk'

// Lazy load AddPatientDialog
const AddPatientDialog = React.lazy(() => import('@/components/admin/patient/dialog/AddEditPatientDialog'))

// Interface
interface BedDetailModalProps {
  bed: Bed | null
  onClose: () => void
  onUpdateStatus: (bedId: string, status: BedStatus, notes?: string) => void
  onAdmitPatient: (bedId: string, patientId: string) => void
  onDischargePatient: (bedId: string) => void
}

// Static data
const bedStatusOptions: { value: BedStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800' },
  { value: 'occupied', label: 'Occupied', color: 'bg-red-100 text-red-800' },
  { value: 'reserved', label: 'Reserved', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-gray-100 text-gray-800' }
]

// Form validation schema
const bedFormSchema = z.object({
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']),
  notes: z.string().optional(),
  patientSearch: z.string().optional()
}).refine((data) => {
  // If status is being set to 'occupied', a patient must be selected
  if (data.status === 'occupied') {
    return data.patientSearch && data.patientSearch.trim().length > 0
  }
  return true
}, {
  message: "Please select a patient when admitting to occupied status",
  path: ["patientSearch"]
})

type BedFormData = z.infer<typeof bedFormSchema>

const BedDetailModal: React.FC<BedDetailModalProps> = ({
  bed,
  onClose,
  onUpdateStatus,
  onAdmitPatient,
  onDischargePatient
}) => {

  // Dispatch and selector
  const dispatch = useAppDispatch()
  const patients = useAppSelector((state: RootState) => state.patients.list)
  const beds = useAppSelector((state: RootState) => state.beds.beds)

  // State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false)

  // Form control
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting }
  } = useForm<BedFormData>({
    resolver: zodResolver(bedFormSchema),
    defaultValues: {
      status: bed?.status || 'available',
      notes: bed?.notes || '',
      patientSearch: ''
    },
    mode: 'onSubmit'
  })
  const watchedPatientSearch = watch('patientSearch')
  const watchedStatus = watch('status')

  // Effect
  useEffect(() => {
    dispatch(getAllPatients())
  }, [dispatch])

  // Callbacks
  // Check if patient is already admitted to another bed
  const isPatientAlreadyAdmitted = useCallback((patientIdToCheck: string): Bed | null => {
    return beds.find(existingBed =>
      existingBed.patientId === patientIdToCheck &&
      existingBed.status === 'occupied' &&
      existingBed.bedId !== bed?.bedId
    ) || null
  }, [bed?.bedId, beds])

  // Filter patients based on search and availability
  const filteredPatients = useMemo(() => patients.filter(patient => {
    const isAlreadyAdmitted = beds.some(existingBed =>
      existingBed.patientId === (patient.patientId || patient.id) &&
      existingBed.status === 'occupied' &&
      existingBed.bedId !== bed?.bedId
    )

    return patient.isActive && !isAlreadyAdmitted && (
      patient.name?.toLowerCase().includes(watchedPatientSearch?.toLowerCase() || '') ||
      patient.patientId?.toLowerCase().includes(watchedPatientSearch?.toLowerCase() || '') ||
      patient.phone?.includes(watchedPatientSearch || '')
    )
  }), [patients, beds, bed?.bedId, watchedPatientSearch])

  // Check if patient is not admitted to another bed
  const unavailablePatients = useMemo(() => patients.filter(patient => {
    const isAlreadyAdmitted = beds.some(existingBed =>
      existingBed.patientId === (patient.patientId || patient.id) &&
      existingBed.status === 'occupied' &&
      existingBed.bedId !== bed?.bedId
    )

    const admittedBed = beds.find(existingBed =>
      existingBed.patientId === (patient.patientId || patient.id) &&
      existingBed.status === 'occupied'
    )

    return patient.isActive && isAlreadyAdmitted && (
      patient.name?.toLowerCase().includes(watchedPatientSearch?.toLowerCase() || '') ||
      patient.patientId?.toLowerCase().includes(watchedPatientSearch?.toLowerCase() || '') ||
      patient.phone?.includes(watchedPatientSearch || '')
    ) && admittedBed
  }), [patients, beds, bed?.bedId, watchedPatientSearch])

  const currentBedStatus = useMemo(() =>
    bedStatusOptions.find(s => s.value === bed?.status),
    [bed?.status]
  )

  // Handle patient selection
  const handlePatientSelect = useCallback((patient: Patient) => {
    setSelectedPatient(patient)
    setValue('patientSearch', patient.name || '')
    setShowPatientDropdown(false)
  }, [setValue])

  // Handle bed status update
  const handleUpdateStatus = useCallback((data: BedFormData) => {
    if (!bed) return
    onUpdateStatus(bed.bedId, data.status, data.notes)
    if (selectedPatient && data.status === 'occupied') {
      onAdmitPatient(bed.bedId, selectedPatient.patientId || selectedPatient.id || '')
    }
    onClose()
  }, [bed, selectedPatient, onUpdateStatus, onAdmitPatient, onClose])

  // Handle patient admission
  const handleAdmitPatient = useCallback(() => {
    if (!selectedPatient || !bed) {
      return
    }

    const patientIdToUse = selectedPatient.patientId || selectedPatient.id || ''

    // Check if patient is already admitted to another bed
    const existingBed = isPatientAlreadyAdmitted(patientIdToUse)
    if (existingBed) {
      alert(`Patient is already admitted to bed ${existingBed.bedId} in ${existingBed.ward} ward. Please discharge them first before admitting to another bed.`)
      return
    }

    onAdmitPatient(bed.bedId, patientIdToUse)
    setSelectedPatient(null)
    setValue('patientSearch', '')
    setValue('status', 'occupied')
    onClose()
  }, [selectedPatient, isPatientAlreadyAdmitted, bed, onAdmitPatient, setValue, onClose])

  const handleDischargePatient = useCallback(() => {
    if (!bed) return
    onDischargePatient(bed.bedId)
    onClose()
  }, [bed, onDischargePatient, onClose])

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }, [])

  const handlePatientSearchChange = useCallback((value: string) => {
    setValue('patientSearch', value)
    setShowPatientDropdown(true)
    setSelectedPatient(null)
  }, [setValue])

  const handleClearPatient = useCallback(() => {
    setSelectedPatient(null)
    setValue('patientSearch', '')
  }, [setValue])

  const getPatientNameById = useCallback((patientId?: string): string => {
    if (!patientId) return 'None'

    const patient = patients.find(p =>
      (p.patientId === patientId) || (p.id === patientId)
    )

    return patient?.name || patientId
  }, [patients])

  // Determine if Save Changes button should be disabled
  const shouldDisableSaveChanges = useMemo(() => {
    // If form is invalid or submitting, disable
    if (!isValid || isSubmitting) return true

    // If status is being changed to 'occupied' and we have a selected patient but haven't admitted yet, disable
    if (watchedStatus === 'occupied' && selectedPatient && bed?.status !== 'occupied') {
      return true
    }

    // If status is being changed to 'occupied' but no patient is selected, disable (handled by validation)
    if (watchedStatus === 'occupied' && !selectedPatient && bed?.status !== 'occupied') {
      return true
    }

    return false
  }, [isValid, isSubmitting, watchedStatus, selectedPatient, bed?.status])

  if (!bed) return null

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white rounded-t-xl shrink-0">
          <Label className="text-2xl font-bold text-gray-800">Bed Details</Label>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(handleUpdateStatus)}>
            <div className="p-6 space-y-6">

          {/* Bed Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">{bed.bedId}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                currentBedStatus?.color
              }`}>
                {currentBedStatus?.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-700" />
                <span className="text-gray-700">Patient:</span>
                <span className="font-bold text-black">{getPatientNameById(bed.patientId)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-700" />
                <span className="text-gray-700">Ward:</span>
                <span className="font-bold capitalize text-black">{bed.ward}</span>
              </div>

              {bed.admittedAt && (
                <div className="flex items-center space-x-2 col-span-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Admitted:</span>
                  <span className="font-medium">{formatDate(bed.admittedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Update */}
          <div className="space-y-3">
            <Input
              id="status"
              label="Update Status"
              as="select"
              registration={register('status')}
              error={errors.status}
            >
              {bedStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Input>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Input
              id="notes"
              label="Notes"
              as="textarea"
              rows={3}
              placeholder="Add notes about this bed..."
              registration={register('notes')}
              error={errors.notes}
              icon={FileText}
            />
          </div>
            {/* Patient Actions */}
          {((bed?.status === 'available') || (watchedStatus === 'available' || watchedStatus === 'occupied')) && (
              <div className="space-y-3">
              <div className='flex justify-between items-center'>
                <Label className="block text-sm font-medium text-gray-700">
                  <UserPlus className="w-4 h-4 inline mr-2" />
                  Admit Patient
                  </Label>
                  <button
                  onClick={() => setShowAddPatientDialog(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Patient
                  </button>
              </div>
              <div className="relative">
                <div className="relative">
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        id="patientSearch"
                        type="text"
                        placeholder="Search patient by name, ID, or phone..."
                        value={selectedPatient ? `${selectedPatient.name}` : watchedPatientSearch}
                        onChange={(e) => handlePatientSearchChange(e.target.value)}
                        onFocus={() => setShowPatientDropdown(true)}
                        onClick={() => setShowPatientDropdown(true)}
                        error={errors.patientSearch}
                        className="pr-10"
                      />
                      {!selectedPatient && (
                        <button
                          type="button"
                          onClick={() => setShowPatientDropdown(!showPatientDropdown)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-center p-1 hover:bg-gray-100 rounded-md transition-all duration-200"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showPatientDropdown ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                      {selectedPatient && (
                        <button
                          type="button"
                          onClick={handleClearPatient}
                          className="absolute right-2 cursor-pointer top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 flex items-center justify-center p-1 hover:bg-red-50 rounded-md transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Patient Dropdown */}
                  {showPatientDropdown && !selectedPatient && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowPatientDropdown(false)}
                      />
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 max-h-80 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                        {/* Dropdown Header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">
                              {watchedPatientSearch ? 'Search Results' : 'Available Patients'}
                            </span>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                              {filteredPatients.length} available
                            </span>
                          </div>
                        </div>

                        {/* Dropdown Content */}
                        <div className="max-h-60 overflow-y-auto">
                          {filteredPatients.length === 0 && unavailablePatients.length === 0 ? (
                            <div className="p-6 text-center">
                              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                              </div>
                              <p className="text-gray-500 text-sm font-medium">
                                {watchedPatientSearch ? 'No patients found' : 'Start typing to search patients'}
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                Try searching by name, ID, or phone number
                              </p>
                            </div>
                          ) : (
                            <>
                              {/* Available patients section */}
                              {filteredPatients.length > 0 && (
                                <div>
                                  <div className="px-4 py-2 bg-green-50 border-b border-green-100">
                                    <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                                      Available for Admission
                                    </span>
                                  </div>
                                  {filteredPatients.slice(0, 10).map((patient, index) => (
                                    <div
                                      key={patient.id}
                                      onClick={() => handlePatientSelect(patient)}
                                      className={`p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer border-b border-gray-100 transition-all duration-200 ${index === 0 ? 'border-t-0' : ''}`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                              <User className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                              <div className="font-semibold text-gray-900">{patient.name}</div>
                                              <div className="text-sm text-gray-600 mt-0.5">
                                                <span className="font-medium">ID:</span> {patient.patientId} • <span className="font-medium">Phone:</span> {patient.phone}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                          <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="bg-gray-100 px-2 py-1 rounded-full">{patient.gender}</span>
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">{patient.bloodGroup}</span>
                                          </div>
                                          <div className="text-xs text-green-600 font-medium">
                                            Available
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Unavailable patients section */}
                              {unavailablePatients.length > 0 && (
                                <div>
                                  <div className="px-4 py-2 bg-red-50 border-b border-red-100">
                                    <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                                      Currently Admitted Elsewhere
                                    </span>
                                  </div>
                                  {unavailablePatients.slice(0, 5).map((patient) => {
                                    const admittedBed = beds.find(existingBed =>
                                      existingBed.patientId === (patient.patientId || patient.id) &&
                                      existingBed.status === 'occupied'
                                    )
                                    return (
                                      <div
                                        key={`unavailable-${patient.id}`}
                                        className="p-4 bg-gray-50 border-b border-gray-100 opacity-75"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-gray-500" />
                                              </div>
                                              <div>
                                                <div className="font-medium text-gray-600">{patient.name}</div>
                                                <div className="text-sm text-red-600 mt-0.5">
                                                  <span className="font-medium">ID:</span> {patient.patientId} • <span className="font-medium">Phone:</span> {patient.phone}
                                                </div>
                                                <div className="text-xs text-red-700 mt-1 font-medium bg-red-50 px-2 py-1 rounded inline-block">
                                                  Already in {admittedBed?.bedId} ({admittedBed?.ward})
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                              <span className="bg-gray-200 px-2 py-1 rounded-full">{patient.gender}</span>
                                              <span className="bg-gray-200 px-2 py-1 rounded-full">{patient.bloodGroup}</span>
                                            </div>
                                            <div className="text-xs text-red-600 font-medium">
                                              Occupied
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Dropdown Footer */}
                        {(filteredPatients.length > 0 || unavailablePatients.length > 0) && (
                          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                              Click on a patient to select them for admission
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {bed.status === 'occupied' && (
            <Button
              type="button"
              onClick={handleDischargePatient}
              variant="destructive"
              size="default"
              className="w-full px-4 py-2 flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Discharge Patient</span>
            </Button>
          )}

          {/* Admit Patient Button - shown when patient is selected but not yet admitted */}
          {watchedStatus === 'occupied' && selectedPatient && bed?.status !== 'occupied' && (
            <Button
              type="button"
              onClick={handleAdmitPatient}
              variant="default"
              size="default"
              className="w-full px-4 py-2 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="w-4 h-4" />
              <span>Admit Patient</span>
            </Button>
          )}
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-xl shrink-0">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            size="default"
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(handleUpdateStatus)}
            variant="default"
            size="default"
            className="px-4 py-2 flex items-center space-x-2"
            disabled={shouldDisableSaveChanges}
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Add Patient Dialog */}
      <React.Suspense fallback={null}>
        <AddPatientDialog
          isOpen={showAddPatientDialog}
          onClose={() => setShowAddPatientDialog(false)}
        />
      </React.Suspense>
    </div>
  )
}

export default BedDetailModal
