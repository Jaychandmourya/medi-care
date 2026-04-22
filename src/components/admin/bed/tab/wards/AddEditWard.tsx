import { useCallback, useMemo, useRef } from 'react'

// Import toast
import toast from 'react-hot-toast'

// Import components
import Input from '@/components/common/Input'
import FormDialog from '@/components/common/dialog/FormDialog'

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

// Zod schema for ward validation
const wardSchema = z.object({
  name: z.string()
    .min(1, 'Ward name is required')
    .max(15, 'Ward name must not exceed 15 characters').transform((val) => val.trim()),
  floor: z.string().max(30, 'Floor must not exceed 30 characters').min(1, 'Floor is required'),
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

const AddEditWard = ({ isOpen, onClose, editingWard }: AddEditWardDialogProps) => {

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

  // Use hidden form submission to connect FormDialog's save button with react-hook-form
  const formRef = useRef<HTMLFormElement>(null)

  const handleSave = useCallback(() => {
    formRef.current?.requestSubmit()
  }, [])

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={handleCloseModal}
      title={editingWard ? 'Edit Ward' : 'Add New Ward'}
      maxWidth="max-w-md"
      cancelButtonText="Cancel"
      saveButtonText={isSubmitting ? 'Saving...' : (editingWard ? 'Update' : 'Create')}
      saveButtonLoading={isSubmitting}
      saveButtonDisabled={isSubmitting}
      onCancel={handleCloseModal}
      onSave={handleSave}
    >
      <form
        ref={formRef}
        onSubmit={handleFormSubmit(onSubmit)}
        className="space-y-4"
      >
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
        <Input
          id="ward-beds"
          label="Total Beds Capacity"
          type="number"
          min={0}
          required
          registration={register('totalBeds', { valueAsNumber: true })}
          error={errors.totalBeds ? { message: errors.totalBeds.message } : undefined}
        />
      </form>
    </FormDialog>
  )
}

export default AddEditWard