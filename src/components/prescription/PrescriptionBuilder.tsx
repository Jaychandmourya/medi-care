import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Trash2, Calendar, FileText, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  setCurrentPrescription,
  addMedicine,
  removeMedicine,
  updateMedicine,
  setSelectedDrug,
  savePrescriptionToHistory,
  type Medicine
} from '@/features/prescription/prescriptionSlice'
import type { AppDispatch, RootState } from '@/app/store'
import DrugSearch from './DrugSearch'
import DrugInfoPanel from './DrugInfoPanel'

const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  diagnosis: z.string().min(10, 'Diagnosis must be at least 10 characters').max(500, 'Diagnosis must be less than 500 characters'),
  generalNotes: z.string().max(1000, 'General notes must be less than 1000 characters').optional(),
  followUpDate: z.string().optional(),
}).refine((data) => {
  if (data.followUpDate) {
    const followUp = new Date(data.followUpDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return followUp >= today
  }
  return true
}, {
  message: 'Follow-up date cannot be in the past',
  path: ['followUpDate']
})

const medicineSchema = z.object({
  name: z.string().min(2, 'Medicine name must be at least 2 characters').max(100, 'Medicine name must be less than 100 characters'),
  dosage: z.string().min(1, 'Dosage is required').max(50, 'Dosage must be less than 50 characters'),
  frequency: z.string().min(2, 'Frequency must be at least 2 characters').max(50, 'Frequency must be less than 50 characters'),
  duration: z.string().min(1, 'Duration is required').max(50, 'Duration must be less than 50 characters'),
  instructions: z.string().max(200, 'Instructions must be less than 200 characters').optional(),
})

type PrescriptionFormData = z.infer<typeof prescriptionSchema>
type MedicineFormData = z.infer<typeof medicineSchema>

const PrescriptionBuilder = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentPrescription, selectedDrug } = useSelector((state: RootState) => state.prescriptions)

  const [showMedicineForm, setShowMedicineForm] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const generateId = () => crypto.randomUUID()

  const {
    register: registerPrescription,
    handleSubmit: handlePrescriptionSubmit,
    formState: { errors: prescriptionErrors },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
  })

  const {
    register: registerMedicine,
    handleSubmit: handleMedicineSubmit,
    formState: { errors: medicineErrors },
    reset: resetMedicine,
    setValue: setMedicineValue,
  } = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
  })

  const onPrescriptionSubmit = (data: PrescriptionFormData) => {
    // Keep existing medicines if they exist
    const existingMedicines = currentPrescription?.medicines || [];

    // Get patient name from the selected option
    const patientSelect = document.querySelector('select[name="patientId"]') as HTMLSelectElement;
    const selectedPatient = patientSelect?.options[patientSelect?.selectedIndex]?.text || 'Unknown Patient';

    const prescription = {
      id: currentPrescription?.id || generateId(), // Keep existing ID if updating
      ...data,
      patientName: selectedPatient, // Dynamic patient name from selection
      doctorId: 'doc1',
      doctorName: 'Dr. Smith',
      medicines: existingMedicines, // Preserve existing medicines
      createdAt: currentPrescription?.createdAt || new Date().toISOString(), // Keep original creation date
      updatedAt: new Date().toISOString(), // Add update timestamp
      status: 'active' as const,
      followUpDate: data.followUpDate || '',
      generalNotes: data.generalNotes || '',
    }

    dispatch(setCurrentPrescription(prescription))

    // Save to history
    dispatch(savePrescriptionToHistory(prescription))

    // Show success feedback
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const onMedicineSubmit = (data: MedicineFormData) => {
    const medicine: Medicine = {
      id: editingMedicine?.id || generateId(),
      ...data,
      drug: selectedDrug || undefined,
      instructions: data.instructions || '',
    }

    // Ensure we have a current prescription before adding medicine
    if (!currentPrescription) {
      const newPrescription = {
        id: generateId(),
        patientId: '',
        patientName: 'Unknown Patient',
        doctorId: 'doc1',
        doctorName: 'Dr. Smith',
        diagnosis: '',
        medicines: [medicine],
        generalNotes: '',
        followUpDate: '',
        createdAt: new Date().toISOString(),
        status: 'active' as const,
      }
      dispatch(setCurrentPrescription(newPrescription))
    } else {
      if (editingMedicine) {
        dispatch(updateMedicine(medicine))
        setEditingMedicine(null)
      } else {
        dispatch(addMedicine(medicine))
      }
    }

    resetMedicine()
    setShowMedicineForm(false)
    dispatch(setSelectedDrug(null))
  }

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine)
    setMedicineValue('name', medicine.name)
    setMedicineValue('dosage', medicine.dosage)
    setMedicineValue('frequency', medicine.frequency)
    setMedicineValue('duration', medicine.duration)
    setMedicineValue('instructions', medicine.instructions || '')
    setShowMedicineForm(true)
  }

  const handleRemoveMedicine = (medicineId: string) => {
    dispatch(removeMedicine(medicineId))
  }

  const handleAddMedicine = () => {
    setEditingMedicine(null)
    resetMedicine()
    setShowMedicineForm(true)
  }

  const medicines = currentPrescription?.medicines || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prescription Builder</h1>
        <p className="text-gray-600">Create and manage medical prescriptions</p>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="bg-green-100 rounded-full p-2">
            <Save className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h4 className="text-green-800 font-medium">Prescription Saved Successfully!</h4>
            <p className="text-green-600 text-sm">
              {currentPrescription?.medicines?.length || 0} medicine(s) included
            </p>
          </div>
        </div>
      )}

      {/* Prescription Form */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-500" />
          Prescription Details
        </h2>

        <form onSubmit={handlePrescriptionSubmit(onPrescriptionSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient *
              </label>
              <select
                {...registerPrescription('patientId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select Patient</option>
                <option value="patient1">John Doe</option>
                <option value="patient2">Jane Smith</option>
                <option value="patient3">Robert Johnson</option>
              </select>
              {prescriptionErrors.patientId && (
                <p className="text-red-500 text-sm mt-1">{prescriptionErrors.patientId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Follow-up Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...registerPrescription('followUpDate')}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis *
            </label>
            <textarea
              {...registerPrescription('diagnosis')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Enter diagnosis..."
            />
            {prescriptionErrors.diagnosis && (
              <p className="text-red-500 text-sm mt-1">{prescriptionErrors.diagnosis.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              General Notes
            </label>
            <textarea
              {...registerPrescription('generalNotes')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Prescription
            </button>
          </div>
        </form>
      </div>

      {/* Medicine Management */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Medicines</h3>
          <button
            onClick={handleAddMedicine}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Medicine
          </button>
        </div>

        {medicines.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No medicines added yet</p>
            <button
              onClick={handleAddMedicine}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Medicine
            </button>
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
                    <button
                      onClick={() => handleEditMedicine(medicine)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveMedicine(medicine.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medicine Form Modal */}
      {showMedicineForm && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingMedicine ? 'Edit Medicine' : 'Add Medicine'}
            </h3>

            <div className="mb-4">
              <DrugSearch />
            </div>

            <DrugInfoPanel />

            <form onSubmit={handleMedicineSubmit(onMedicineSubmit)} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name *
                </label>
                <input
                  {...registerMedicine('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter medicine name"
                />
                {medicineErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{medicineErrors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage *
                  </label>
                  <input
                    {...registerMedicine('dosage')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., 500mg"
                  />
                  {medicineErrors.dosage && (
                    <p className="text-red-500 text-sm mt-1">{medicineErrors.dosage.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency *
                  </label>
                  <input
                    {...registerMedicine('frequency')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., Twice daily"
                  />
                  {medicineErrors.frequency && (
                    <p className="text-red-500 text-sm mt-1">{medicineErrors.frequency.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration *
                  </label>
                  <input
                    {...registerMedicine('duration')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., 7 days"
                  />
                  {medicineErrors.duration && (
                    <p className="text-red-500 text-sm mt-1">{medicineErrors.duration.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <input
                    {...registerMedicine('instructions')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., Take after meals"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowMedicineForm(false)
                    setEditingMedicine(null)
                    dispatch(setSelectedDrug(null))
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingMedicine ? 'Update' : 'Add'} Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrescriptionBuilder
