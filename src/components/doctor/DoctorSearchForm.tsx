import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Loader2, Plus } from 'lucide-react'
import { type AppDispatch, type RootState } from '@/app/store'
import { clearError } from '@/features/doctor/doctorSlice'
import { doctorDBOperations } from '@/features/doctor/db/doctorDB'
import { doctorFormSchema, type DoctorFormData } from '@/features/doctor/validation/doctorValidation'
import { COMMON_TAXONOMIES } from '@/features/doctor/doctorSlice'

interface DoctorSearchFormProps {
  onSearch: (params: {
    firstName?: string
    lastName?: string
    taxonomy?: string
    city?: string
    state?: string
    county?: string
    contact?: string
  }) => void
  initialValues?: {
    firstName?: string
    lastName?: string
    city?: string
    state?: string
    county?: string
    contact?: string
  }
}

export default function DoctorSearchForm({ onSearch, initialValues }: DoctorSearchFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { error } = useSelector((state: RootState) => state.doctors)
  const [adding, setAdding] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      firstName: initialValues?.firstName || '',
      lastName: initialValues?.lastName || '',
      middleName: '',
      specialty: '',
      phone: '',
      contact: initialValues?.contact || '',
      email: '',
      city: initialValues?.city || '',
      state: initialValues?.state || '',
      county: initialValues?.county || '',
      postalCode: '',
      address: '',
      credential: '',
      gender: undefined
    }
  })

  const watchedValues = watch()

  useEffect(() => {
    if (initialValues) {
      setValue('firstName', initialValues.firstName || '')
      setValue('lastName', initialValues.lastName || '')
      setValue('city', initialValues.city || '')
      setValue('state', initialValues.state || '')
      setValue('county', initialValues.county || '')
      setValue('contact', initialValues.contact || '')
    }
  }, [initialValues, setValue])

  const handleAddToSystem = async (data: DoctorFormData) => {
    if (!isValid) {
      alert('Please fix the validation errors before submitting')
      return
    }

    setAdding(true)
    try {
      // Generate a unique NPI or use a placeholder
      const npi = `LOCAL-${Date.now()}`

      // Check if already exists (by name)
      const existingDoctors = await doctorDBOperations.getAll()
      const exists = existingDoctors.some(doc =>
        doc.firstName.toLowerCase() === data.firstName.toLowerCase() &&
        doc.lastName.toLowerCase() === data.lastName.toLowerCase()
      )

      if (exists) {
        alert('A doctor with this name already exists in your system')
        return
      }

      // Add to database
      const doctorData = {
        npi: npi,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        specialty: data.specialty?.trim(),
        city: data.city?.trim(),
        state: data.state?.trim(),
        county: data.county?.trim(),
        contact: data.contact?.trim(),
        address: (data.city && data.state) ? `${data.city.trim()}, ${data.state.trim()}` : undefined,
        phone: data.phone?.trim(),
        credential: data.credential?.trim(),
        gender: data.gender,
        postalCode: data.postalCode?.trim()
      }

      await doctorDBOperations.add(doctorData)

      alert('Doctor added to your system successfully!')
      reset()
    } catch (error) {
      console.error('Failed to add doctor:', error)
      alert('Failed to add doctor to system')
    } finally {
      setAdding(false)
    }
  }

  const handleClear = () => {
    reset()
    dispatch(clearError())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(handleAddToSystem)()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit(handleAddToSystem)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              {...register('firstName')}
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              {...register('lastName')}
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          {/* Middle Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Middle Name
            </label>
            <input
              {...register('middleName')}
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.middleName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter middle name"
            />
            {errors.middleName && (
              <p className="mt-1 text-sm text-red-600">{errors.middleName.message}</p>
            )}
          </div>

          {/* Credential */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credential
            </label>
            <input
              {...register('credential')}
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.credential ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., MD, DO"
            />
            {errors.credential && (
              <p className="mt-1 text-sm text-red-600">{errors.credential.message}</p>
            )}
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialty
            </label>
            <input
              {...register('specialty')}
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.specialty ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter specialty"
            />
            {errors.specialty && (
              <p className="mt-1 text-sm text-red-600">{errors.specialty.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              {...register('phone')}
              type="tel"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              {...register('city')}
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter city"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              {...register('state')}
              type="text"
              maxLength={2}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter state (e.g., CA, NY)"
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>

          {/* County */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              County
            </label>
            <input
              {...register('county')}
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.county ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter county"
            />
            {errors.county && (
              <p className="mt-1 text-sm text-red-600">{errors.county.message}</p>
            )}
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact
            </label>
            <textarea
              {...register('contact')}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.contact ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter additional contact information"
            />
            {errors.contact && (
              <p className="mt-1 text-sm text-red-600">{errors.contact.message}</p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code
            </label>
            <input
              {...register('postalCode')}
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.postalCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter postal code"
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              {...register('address')}
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter address"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {adding ? 'Adding...' : 'Add to System'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
