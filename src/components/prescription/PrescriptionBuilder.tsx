import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import toast from 'react-hot-toast'

// Import icons file
import { Plus, Trash2, Save } from 'lucide-react'

// Import Types files
import type { AppDispatch, RootState } from '@/app/store'
import type { Appointment } from '@/features/db/dexie'
import type { Medicine } from '@/types/prescription/prescriptionType'

// Import UI components
import Input from '@/components/common/Input'
import DatePicker from '@/components/common/DatePicker'
import { Button } from '@/components/common/Button'
import { Label } from '@/components/common/Label'

// Import form control, validation and zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Import dispatch and selector for redux
import { useDispatch, useSelector } from 'react-redux'

// Import Thunk file for redux
import { getAllPatients } from '@/features/patient/patientThunk'
import { fetchAppointments } from '@/features/appointment/appointmentThunk'

//  Import Slice file for redux
import {
  setCurrentPrescription,
  removeMedicine,
  savePrescriptionToHistory,
} from '@/features/prescription/prescriptionSlice'

//  Lazy loading components
const AddMedicineDialog = lazy(() => import('./dialog/AddMedicineDialog'))
const ConfirmationDialog = lazy(() => import('@/components/common/dialog/ConfirmationDialog'))

// Schema
import { prescriptionSchema } from '@/schema/prescriptionSchema'

type PrescriptionFormData = z.infer<typeof prescriptionSchema>

const PrescriptionBuilder = () => {

  // Redux dispatch
  const dispatch = useDispatch<AppDispatch>()

  // Redux selector
  const { currentPrescription } = useSelector((state: RootState) => state.prescriptions)
  const patients = useSelector((state: RootState) => state.patients.list)
  const appointments = useSelector((state: RootState) => state.appointments.appointments)
  const { user } = useSelector((state: RootState) => state.auth)

  // State management
  const [showMedicineForm, setShowMedicineForm] = useState<boolean>(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null)

  // Effect
  useEffect(() => {
    dispatch(getAllPatients())
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    dispatch(fetchAppointments({ startDate: startOfMonth, endDate: endOfMonth }))
  }, [dispatch])

   // Generate a unique ID with prefix for better identification
  const generateId = useCallback(() => {
    const timestamp = Date.now().toString(36); // Base36 timestamp
    const randomStr = crypto.randomUUID().replace(/-/g, '').substring(0, 8); // First 8 chars of UUID
    return `RX_${timestamp}_${randomStr}`; // Format: RX_timestamp_randomString
  }, [])

  // Form control
  const {
    register: registerPrescription,
    handleSubmit: handlePrescriptionSubmit,
    formState: { errors: prescriptionErrors },
    trigger: triggerValidation,
    watch,
    setValue,
    reset: resetPrescriptionForm
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: '',
      followUpDate: '',
      diagnosis: '',
      generalNotes: ''
    }
  })

  // Get current doctor's ID from localStorage
  const getCurrentDoctorId = useCallback(() => {
    if (user?.role === 'doctor') {
      const doctorInfo = localStorage.getItem('doctorInfo')
      if (doctorInfo) {
        const info = JSON.parse(doctorInfo)
        return info.doctorId
      }
    }
    return null
  }, [user])

  const activePatients = useMemo(() => {
    // Admin role: show all active patients
    if (user?.role === 'admin') {
      return patients.filter(p => p.isActive)
    }

    // Doctor role: show only patients who have appointments with the current doctor
    if (user?.role === 'doctor') {
      const currentDoctorId = getCurrentDoctorId()

      // If no doctor ID found, show all active patients as fallback
      if (!currentDoctorId) {
        return patients.filter(p => p.isActive)
      }

      // Filter patients who have appointments with the current doctor
      const doctorPatientIds = appointments
        .filter((apt: Appointment) => apt.doctorId === currentDoctorId)
        .map((apt: Appointment) => apt.patientId)
      console.log('doctorPatientIds',patients.filter(p => p.isActive && doctorPatientIds.includes(p.id!)))

      return patients.filter(p => p.isActive && doctorPatientIds.includes(p.id!))
    }

    // Default/other roles: show all active patients
    return patients.filter(p => p.isActive)
  }, [patients, appointments, getCurrentDoctorId, user])

  const watchedFollowUpDate = watch('followUpDate')
  const watchedPatientId = watch('patientId')
  const watchedDiagnosis = watch('diagnosis')

  // Create temporary prescription when form has data to enable medicine management
  const tempPrescription = useMemo(() => {
    if (!currentPrescription && (watchedPatientId || watchedDiagnosis)) {
      return {
        id: 'temp',
        patientId: watchedPatientId || '',
        patientName: patients.find(p => p.patientId === watchedPatientId)?.name || 'Temp Patient',
        doctorId: 'doc1',
        doctorName: 'Dr. Smith',
        diagnosis: watchedDiagnosis || '',
        medicines: [],
        generalNotes: '',
        followUpDate: watchedFollowUpDate || '',
        createdAt: new Date().toISOString(),
        status: 'active' as const,
      }
    }
    return null
  }, [watchedPatientId, watchedDiagnosis, watchedFollowUpDate, currentPrescription, patients])

  // Effect
  useEffect(() => {
    if (tempPrescription) {
      dispatch(setCurrentPrescription(tempPrescription))
    }
  }, [tempPrescription, dispatch])


  const onPrescriptionSubmit = useCallback((data: PrescriptionFormData) => {
    const existingMedicines = currentPrescription?.medicines || [];
    const selectedPatient = patients.find(p => p.patientId === data.patientId);
    const patientName = selectedPatient?.name || 'Unknown Patient';

    const newPrescriptionId = generateId();

    // Get current doctor's information
    const currentDoctorId = getCurrentDoctorId();
    const doctorName = user?.name || 'Dr. Smith';

    const prescription = {
      id: newPrescriptionId,
      ...data,
      patientName: patientName,
      doctorId: currentDoctorId || 'doc1',
      doctorName: doctorName,
      medicines: existingMedicines,
      createdAt: currentPrescription?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active' as const,
      generalNotes: data.generalNotes || '',
    }

    // Set the current prescription with the new ID
    dispatch(setCurrentPrescription(prescription))

    // Save to history with the unique ID
    dispatch(savePrescriptionToHistory(prescription))

    // Show success toast with the new prescription ID
    toast.success(`Prescription saved successfully! ID: ${newPrescriptionId} (${existingMedicines.length} medicine(s) included)`)

    // Clear current prescription to start fresh for next prescription
    dispatch(setCurrentPrescription(prescription))

    // Reset the form
    resetPrescriptionForm()
  }, [currentPrescription, patients, generateId, dispatch, resetPrescriptionForm, getCurrentDoctorId, user?.name])



  const handleEditMedicine = useCallback((medicine: Medicine) => {
    setEditingMedicine(medicine)
    setShowMedicineForm(true)
  }, [])

  const medicines = useMemo(() => {
    return currentPrescription?.medicines || []
  }, [currentPrescription?.medicines])

  const handleRemoveMedicine = useCallback((medicineId: string) => {
    const medicine = medicines.find(m => m.id === medicineId)
    if (medicine) {
      setMedicineToDelete(medicine)
      setShowDeleteDialog(true)
    }
  }, [medicines])

  const handleConfirmDelete = useCallback(() => {
    if (medicineToDelete) {
      dispatch(removeMedicine(medicineToDelete.id))
      setShowDeleteDialog(false)
      setMedicineToDelete(null)
    }
  }, [medicineToDelete, dispatch])

  const handleCloseDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false)
    setMedicineToDelete(null)
  }, [])

  const handleAddMedicine = useCallback(() => {
    setEditingMedicine(null)
    setShowMedicineForm(true)

    // Create temporary prescription if it doesn't exist
    if (!currentPrescription && (watchedPatientId || watchedDiagnosis)) {
      const tempPrescription = {
        id: 'temp',
        patientId: watchedPatientId || '',
        patientName: patients.find(p => p.patientId === watchedPatientId)?.name || 'Temp Patient',
        doctorId: 'doc1',
        doctorName: 'Dr. Smith',
        diagnosis: watchedDiagnosis || '',
        medicines: [],
        generalNotes: '',
        followUpDate: watchedFollowUpDate || '',
        createdAt: new Date().toISOString(),
        status: 'active' as const,
      };
      dispatch(setCurrentPrescription(tempPrescription))
    }
  }, [currentPrescription, watchedPatientId, watchedDiagnosis, watchedFollowUpDate, patients, dispatch])

  const handleCloseMedicineForm = useCallback(() => {
    setShowMedicineForm(false)
    setEditingMedicine(null)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prescription Builder</h1>
        <p className="text-gray-600">Create and manage medical prescriptions</p>
      </div>

      {/* Prescription Form */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Prescription Details
        </h2>

            <form onSubmit={handlePrescriptionSubmit(onPrescriptionSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="patientId"
                  required
                  as="select"
                  label="Patient"
                  registration={registerPrescription('patientId')}
                  error={prescriptionErrors.patientId}
                >
                  <option value="">Select Patient</option>
                  {activePatients.map((patient) => (
                    <option key={patient.patientId} value={patient.patientId}>
                      {patient.name} - {patient.patientId}
                    </option>
                  ))}
                </Input>

                <div>
                  <Label required className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Date
                  </Label>
                  <input
                    type="hidden"
                    {...registerPrescription('followUpDate')}
                  />
                  <DatePicker
                    value={watchedFollowUpDate}
                    onChange={(value: string) => {
                      setValue('followUpDate', value)
                      triggerValidation('followUpDate') // Revalidate this field
                    }}
                    onBlur={() => {
                      triggerValidation('followUpDate') // Revalidate this field
                    }}
                    placeholder="Select follow-up date"
                    disablePastDates={true}
                  />
                  {prescriptionErrors.followUpDate && (
                    <p className="text-red-500 text-sm mt-1">{prescriptionErrors.followUpDate.message}</p>
                  )}
                </div>
              </div>

              <Input
                id="diagnosis"
                as="textarea"
                label="Diagnosis"
                required
                placeholder="Enter diagnosis..."
                rows={3}
                registration={registerPrescription('diagnosis')}
                error={prescriptionErrors.diagnosis}
              />

              <Input
                id="generalNotes"
                as="textarea"
                label="General Notes"
                placeholder="Additional notes..."
                rows={2}
                registration={registerPrescription('generalNotes')}
                error={prescriptionErrors.generalNotes}
              />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Prescription
                </Button>
              </div>
            </form>
      </div>

      {/* Medicine Management */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Medicines</h3>
              <Button
                onClick={handleAddMedicine}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Medicine
              </Button>
            </div>

            {medicines.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No medicines added yet</p>
                <Button
                  onClick={handleAddMedicine}
                  variant="outline"
                  className="inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Medicine
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{medicines.length} medicine(s) added</span>
                  {!currentPrescription?.patientId && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Complete prescription details above
                    </span>
                  )}
                </div>
                {medicines.map((medicine) => (
                  <div key={medicine.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{medicine.name}</h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p><strong>Dosage:</strong> {medicine.dosage}</p>
                          <p><strong>Frequency:</strong> {medicine.frequency}</p>
                          <p><strong>Duration:</strong> {medicine.duration}</p>
                          {medicine.instructions && (
                            <p><strong>Instructions:</strong> {medicine.instructions}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditMedicine(medicine)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleRemoveMedicine(medicine.id)}
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
            ))}
          </div>
        )}
      </div>

      {/* Medicine Form Modal */}
      <Suspense fallback={<div className="flex items-center justify-center p-8">Loading medicine form...</div>}>
        <AddMedicineDialog
          showMedicineForm={showMedicineForm}
          editingMedicine={editingMedicine}
          onClose={handleCloseMedicineForm}
          currentPrescription={currentPrescription}
        />
      </Suspense>

      {/* Delete Confirmation Dialog */}
      <Suspense fallback={<div>Loading...</div>}>
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          title="Delete Medicine"
          message={`Are you sure you want to delete "${medicineToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={handleConfirmDelete}
          onCancel={handleCloseDeleteDialog}
        />
      </Suspense>
    </div>
  )
}

export default PrescriptionBuilder
