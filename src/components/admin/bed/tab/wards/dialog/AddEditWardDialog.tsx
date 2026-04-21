import { useCallback, useMemo } from 'react'

// Import toast
import toast from 'react-hot-toast'

// Import components
import { Button } from '@/components/common/Button'
import Input from '@/components/common/Input'

// Import types
import type { AppDispatch } from '@/app/store'
import type { Ward } from '@/types/bed/bedType'

// Import redux
import { useDispatch } from 'react-redux'

// Import thunks
import { createWard, updateWard } from '@/features/bed/bedThunk'

// Import form validation
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'

// Zod schema for ward validation
const wardSchema = z.object({
  name: z.string()
    .min(1, 'Ward name is required')
    .max(15, 'Ward name must not exceed 15 characters'),
  floor: z.string()
    .min(1, 'Floor is required'),
  totalBeds: z.number()
    .min(1, 'Total beds must be at least 1')
    .max(100, 'Total beds cannot exceed 100')
})

type WardFormDataWithZod = z.infer<typeof wardSchema>

interface AddEditWardDialogProps {
  isOpen: boolean
  onClose: () => void
  editingWard: Ward | null
}

const AddEditWardDialog = ({ isOpen, onClose, editingWard }: AddEditWardDialogProps) => {

  const dispatch = useDispatch<AppDispatch>()

  // Initialize react-hook-form with zod resolver
  const {
    register,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<WardFormDataWithZod>({
    resolver: zodResolver(wardSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      floor: '',
      totalBeds: 0
    }
  })

  // Reset form when dialog opens/closes or editingWard changes
  useMemo(() => {
    if (isOpen) {
      if (editingWard) {
        reset({
          name: editingWard.name,
          floor: editingWard.floor,
          totalBeds: editingWard.totalBeds
        })
      } else {
        reset({
          name: '',
          floor: '',
          totalBeds: 0
        })
      }
    }
  }, [isOpen, editingWard, reset])

  // Also reset form when dialog closes to clear data
  useMemo(() => {
    if (!isOpen) {
      reset({
        name: '',
        floor: '',
        totalBeds: 0
      })
    }
  }, [isOpen, reset])

  // Handle form submission
  const onSubmit = useCallback(async (data: WardFormDataWithZod) => {
    try {
      if (editingWard) {
        await dispatch(updateWard({ wardId: editingWard.wardId, data })).unwrap()
        toast.success('Updated ward successfully!')
      } else {
        await dispatch(createWard(data)).unwrap()
        toast.success('Created ward successfully!')
      }
      onClose()
    } catch (error) {
      console.error('Error saving ward:', error)
      toast.error(editingWard ? 'Failed to update ward. Please try again.' : 'Failed to create ward. Please try again.')
    }
  }, [editingWard, dispatch, onClose])

  const handleCloseModal = useCallback(() => {
    onClose()
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100">
        <div className="p-6 border-b border-gray-300 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            {editingWard ? 'Edit Ward' : 'Add New Ward'}
          </h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <form onSubmit={handleFormSubmit(onSubmit)} className="p-6 space-y-4">
          <Input
            id="ward-name"
            label="Ward Name"
            type="text"
            placeholder="e.g., Cardiology Ward"
            required
            registration={register('name')}
            error={errors.name ? { message: errors.name.message } : undefined}
          />
          <Input
            id="ward-floor"
            label="Floor"
            type="text"
            placeholder="e.g., 1, 2, Ground"
            required
            registration={register('floor')}
            error={errors.floor ? { message: errors.floor.message } : undefined}
          />
          <div>
            <Input
              id="ward-beds"
              label="Total Beds Capacity"
              type="number"
              required
              registration={register('totalBeds', { valueAsNumber: true })}
              error={errors.totalBeds ? { message: errors.totalBeds.message } : undefined}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleCloseModal}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingWard ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEditWardDialog