import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  setSelectedDrug,
  addMedicine,
  updateMedicine,
  setCurrentPrescription,
  type Medicine
} from '@/features/prescription/prescriptionSlice'
import type { AppDispatch, RootState } from '@/app/store'
import Input from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import DrugSearch from '../DrugSearch'
import DrugInfoPanel from '../DrugInfoPanel'

const medicineSchema = z.object({
  name: z.string().min(2, 'Medicine name must be at least 2 characters').max(100, 'Medicine name must be less than 100 characters'),
  dosage: z.string().min(1, 'Dosage is required').max(50, 'Dosage must be less than 50 characters'),
  frequency: z.string().min(2, 'Frequency must be at least 2 characters').max(50, 'Frequency must be less than 50 characters'),
  duration: z.string().min(1, 'Duration is required').max(50, 'Duration must be less than 50 characters'),
  instructions: z.string().max(200, 'Instructions must be less than 200 characters').optional(),
})

type MedicineFormData = z.infer<typeof medicineSchema>

interface AddMedicineDialogProps {
  showMedicineForm: boolean
  editingMedicine: Medicine | null
  onClose: () => void
  currentPrescription: {
    id?: string
    patientId?: string
    patientName?: string
    doctorId?: string
    doctorName?: string
    diagnosis?: string
    medicines?: Medicine[]
    generalNotes?: string
    followUpDate?: string
    createdAt?: string
    status?: string
  } | null
}

const AddMedicineDialog = ({ showMedicineForm, editingMedicine, onClose, currentPrescription }: AddMedicineDialogProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedDrug } = useSelector((state: RootState) => state.prescriptions)

  const generateId = () => crypto.randomUUID()

  const {
    register: registerMedicine,
    handleSubmit: handleMedicineSubmit,
    formState: { errors: medicineErrors },
    reset: resetMedicine,
    setValue: setMedicineValue,
  } = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
  })

  // Auto-fill medicine name when a drug is selected
  useEffect(() => {
    if (selectedDrug && selectedDrug.genericName) {
      setMedicineValue('name', selectedDrug.genericName)
    }
  }, [selectedDrug, setMedicineValue])

  // Auto-fill all form fields when editing a medicine
  useEffect(() => {
    if (editingMedicine) {
      // Set all form values from the editing medicine
      setMedicineValue('name', editingMedicine.name)
      setMedicineValue('dosage', editingMedicine.dosage)
      setMedicineValue('frequency', editingMedicine.frequency)
      setMedicineValue('duration', editingMedicine.duration)
      setMedicineValue('instructions', editingMedicine.instructions || '')

      // Also set the selected drug if it exists
      if (editingMedicine.drug) {
        dispatch(setSelectedDrug(editingMedicine.drug))
      }
    }
  }, [editingMedicine, setMedicineValue, dispatch])

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
      toast.success('Medicine added successfully')
    } else {
      if (editingMedicine) {
        dispatch(updateMedicine(medicine))
        toast.success('Medicine updated successfully')
      } else {
        dispatch(addMedicine(medicine))
        toast.success('Medicine added successfully')
      }
    }

    resetMedicine()
    onClose()
    dispatch(setSelectedDrug(null))
  }

  // Reset form and clear selected drug when dialog closes
  const handleCloseDialog = () => {
    resetMedicine()
    dispatch(setSelectedDrug(null))
    onClose()
  }

  if (!showMedicineForm) return null

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingMedicine ? 'Edit Medicine' : 'Add Medicine'}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCloseDialog}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4">
          <DrugSearch />
        </div>

        <DrugInfoPanel />

        <form onSubmit={handleMedicineSubmit(onMedicineSubmit)} className="space-y-4 mt-4">
          <Input
            id="name"
            label="Medicine Name"
            placeholder="Enter medicine name"
            registration={registerMedicine('name')}
            error={medicineErrors.name}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="dosage"
              label="Dosage"
              placeholder="e.g., 500mg"
              registration={registerMedicine('dosage')}
              error={medicineErrors.dosage}
              required
            />

            <Input
              id="frequency"
              label="Frequency"
              placeholder="e.g., Twice daily"
              registration={registerMedicine('frequency')}
              error={medicineErrors.frequency}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="duration"
              label="Duration"
              placeholder="e.g., 7 days"
              registration={registerMedicine('duration')}
              error={medicineErrors.duration}
              required
            />

            <Input
              id="instructions"
              label="Instructions"
              placeholder="e.g., Take after meals"
              registration={registerMedicine('instructions')}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDialog}
            >
              Cancel
            </Button>
            <Button
              type="submit"
            >
              {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMedicineDialog