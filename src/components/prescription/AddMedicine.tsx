import { useEffect } from 'react'
import toast from 'react-hot-toast'

// Import Types files
import type { AppDispatch, RootState } from '@/app/store'
import type { Medicine } from '@/types/prescription/prescriptionType'

// Import UI components
import Input from '@/components/common/Input'
import FormDialog from '@/components/common/dialog/FormDialog'

// Import form, validation and zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Import dispatch and selector for redux
import { useDispatch, useSelector } from 'react-redux'

// Import Slice for redux
import {
  setSelectedDrug,
  addMedicine,
  updateMedicine,
  setCurrentPrescription,
} from '@/features/prescription/prescriptionSlice'

// Import components
import DrugSearch from './DrugSearch'
import DrugInfoPanel from './DrugInfoPanel'

// Schema file
import { medicineSchema } from '@/schema/prescriptionSchema'

type MedicineFormData = z.infer<typeof medicineSchema>

// Interface
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

  // Dispatch and selector
  const dispatch = useDispatch<AppDispatch>()
  const { selectedDrug } = useSelector((state: RootState) => state.prescriptions)

  // Generate ID
  const generateId = () => crypto.randomUUID()

  // Form hooks
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

  const handleSave = () => {
    handleMedicineSubmit(onMedicineSubmit)()
  }

  return (
    <FormDialog
      isOpen={showMedicineForm}
      onClose={handleCloseDialog}
      title={editingMedicine ? 'Edit Medicine' : 'Add Medicine'}
      maxWidth="max-w-2xl"
      showDefaultButtons={true}
      cancelButtonText="Cancel"
      saveButtonText={editingMedicine ? 'Update Medicine' : 'Add Medicine'}
      onCancel={handleCloseDialog}
      onSave={handleSave}
    >
      <div className="mb-4">
        <DrugSearch />
      </div>

      <DrugInfoPanel />

      <form className="space-y-4 mt-4">
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
            type='tel'
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
      </form>
    </FormDialog>
  )
}

export default AddMedicineDialog