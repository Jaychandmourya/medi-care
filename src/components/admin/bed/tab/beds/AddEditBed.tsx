import { useState } from 'react'
import { z } from 'zod'
import type { Bed, BedStatus, BedFormData } from '@/types/bed/bedType'
import Input from '@/components/common/Input'
import FormDialog from '@/components/common/dialog/FormDialog'

// Interface
interface AddEditBedDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: BedFormData) => void
  editingBed: Bed | null
  wards: Array<{ wardId: string; name: string }>
}

// Zod validation schema
const bedFormSchema = z.object({
  ward: z.string().min(1, 'Please select a ward'),
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).refine((val) => val !== undefined, {
    message: 'Please select a status'
  }),
  notes: z.string().max(150, 'Notes must be at most 150 characters').optional()
})

const getInitialFormData = (editingBed: Bed | null, wards: Array<{ wardId: string; name: string }>): BedFormData => {

  if (editingBed) {
    return {
      ward: editingBed.ward,
      status: editingBed.status,
      notes: editingBed.notes || ''
    }
  }
  return {
    ward: wards[0]?.wardId || '',
    status: 'available',
    notes: ''
  }
}

const AddEditBed = ({ isOpen, onClose, onSubmit, editingBed, wards }: AddEditBedDialogProps) => {

  const [formData, setFormData] = useState<BedFormData>(() => getInitialFormData(editingBed, wards))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (name: string, value: string | BedStatus) => {
    try {
      bedFormSchema.parse({ ...formData, [name]: value })
      setErrors(prev => ({ ...prev, [name]: '' }))
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.issues.find(issue => issue.path[0] === name)
        if (fieldError) {
          setErrors(prev => ({ ...prev, [name]: fieldError.message }))
        }
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form with Zod
    const result = bedFormSchema.safeParse(formData)

    if (!result.success) {
      // Extract and set error messages
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0])] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    // Clear errors and submit
    setErrors({})
    onSubmit(formData)

    // Reset form after successful submission
    const resetFormData = getInitialFormData(null, wards)
    setFormData(resetFormData)
    setErrors({})
  }

  const handleSave = () => {
    // Trigger form validation and submission
    const formEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent
    handleSubmit(formEvent)
  }

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={editingBed ? 'Edit Bed' : 'Add New Bed'}
      maxWidth="max-w-md"
      showDefaultButtons={true}
      cancelButtonText="Cancel"
      saveButtonText={editingBed ? 'Update' : 'Create'}
      onCancel={onClose}
      onSave={handleSave}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            id="ward"
            label="Ward"
            as="select"
            value={formData.ward}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
              const value = e.target.value
              setFormData({ ...formData, ward: value })
              validateField('ward', value)
            }}
            error={errors.ward ? { message: errors.ward } : undefined}
            required
            disabled={!!editingBed}
          >
            <option value="">Select Ward</option>
            {wards.map(ward => (
              <option key={ward.wardId} value={ward.wardId}>{ward.name}</option>
            ))}
          </Input>
          {editingBed && (
            <p className="text-xs text-gray-500 mt-1">Ward cannot be changed after creation</p>
          )}
        </div>
        <div>
          <Input
            id="status"
            label="Status"
            as="select"
            value={formData.status}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
              const value = e.target.value as BedStatus
              setFormData({ ...formData, status: value })
              validateField('status', value)
            }}
            error={errors.status ? { message: errors.status } : undefined}
            required
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="maintenance">Maintenance</option>
          </Input>
        </div>
        <div>
          <Input
            id="notes"
            label="Notes"
            as="textarea"
            value={formData.notes}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
              const value = e.target.value
              setFormData({ ...formData, notes: value })
              validateField('notes', value)
            }}
            placeholder="Optional notes..."
            rows={3}
            error={errors.notes ? { message: errors.notes } : undefined}
          />
        </div>
      </form>
    </FormDialog>
  )
}

export default AddEditBed