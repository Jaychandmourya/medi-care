import { useState } from 'react'
import { z } from 'zod'
import type { Bed, BedStatus, BedFormData } from '@/types/bed/bedType'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'

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
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance'], {
    required_error: 'Please select a status'
  }),
  notes: z.string().optional()
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

const AddEditBedDialog = ({ isOpen, onClose, onSubmit, editingBed, wards }: AddEditBedDialogProps) => {

  const [formData, setFormData] = useState<BedFormData>(() => getInitialFormData(editingBed, wards))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState(false)

  // Early return if dialog is not open
  if (!isOpen) return null

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
    setTouched(true)

    // Validate form with Zod
    const result = bedFormSchema.safeParse(formData)

    if (!result.success) {
      // Extract and set error messages
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message
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
    setTouched(false)
    setErrors({})
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">
            {editingBed ? 'Edit Bed' : 'Add New Bed'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Input
              id="ward"
              label="Ward"
              as="select"
              value={formData.ward}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                const value = e.target.value
                setFormData({ ...formData, ward: value })
                // Validate field on change if touched
                if (touched) {
                  validateField('ward', value)
                }
              }}
              error={touched && errors.ward ? { message: errors.ward } : undefined}
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
                // Validate field on change if touched
                if (touched) {
                  validateField('status', value)
                }
              }}
              error={touched && errors.status ? { message: errors.status } : undefined}
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
                // Validate field on change if touched
                if (touched) {
                  validateField('notes', value)
                }
              }}
              placeholder="Optional notes..."
              rows={3}
              error={touched && errors.notes ? { message: errors.notes } : undefined}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingBed ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEditBedDialog