import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { type AppDispatch, type RootState } from '@/app/store'
import { clearError, addLocalDoctor } from '@/features/doctor/doctorSlice'
import { doctorDBOperations } from '@/features/db/doctorDB'
import { doctorFormSchema, type DoctorFormData } from '@/features/doctor/validation/doctorValidation'
import { COMMON_TAXONOMIES } from '@/features/doctor/doctorSlice'

interface DoctorSearchProps {
  onSearch: (params: {
    firstName?: string
    lastName?: string
    taxonomy?: string
    city?: string
    state?: string
    country?: string
    contact?: string
  }) => void
  initialValues?: {
    firstName?: string
    lastName?: string
    city?: string
    state?: string
    country?: string
    contact?: string
    specialty?: string
    postalCode?: string
    address?: string
  }
}

export default function DoctorSearch({ onSearch, initialValues }: DoctorSearchProps) {
  console.log('DoctorSearch rendered with initialValues:', initialValues)
  const dispatch = useDispatch<AppDispatch>()
  const { error } = useSelector((state: RootState) => state.doctors)
  const [adding, setAdding] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false)

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
      specialty: initialValues?.specialty || '',
      phone: '',
      contact: initialValues?.contact || '',
      email: initialValues?.email || '',
      city: initialValues?.city || '',
      state: initialValues?.state || '',
      postalCode: initialValues?.postalCode || '',
      address: initialValues?.address || '',
      country: initialValues?.country || '',
      credential: '',
      gender: undefined
    }
  })

  const watchedValues = watch()
  const searchRef = useRef<HTMLDivElement>(null)
  const specialtyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialValues) {
      setValue('firstName', initialValues.firstName || '')
      setValue('lastName', initialValues.lastName || '')
      setValue('city', initialValues.city || '')
      setValue('state', initialValues.state || '')
      setValue('country', initialValues.country || '')
      setValue('contact', initialValues.contact || '')
      setValue('postalCode', initialValues.postalCode || '')
      setValue('address', initialValues.address || '')
    }
  }, [initialValues, setValue])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setShowSpecialtyDropdown(false)
      }
      if (specialtyRef.current && !specialtyRef.current.contains(event.target as Node)) {
        setShowSpecialtyDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setValue(field as keyof DoctorFormData, value)
  }

  const handleSearch = () => {
    // Get current form values
    const currentValues = watchedValues

    // Create search params object, filtering out empty values
    const searchParams: Record<string, string> = {}

    if (currentValues.firstName?.trim()) {
      searchParams.firstName = currentValues.firstName.trim()
    }
    if (currentValues.lastName?.trim()) {
      searchParams.lastName = currentValues.lastName.trim()
    }
    if (currentValues.specialty?.trim()) {
      searchParams.taxonomy = currentValues.specialty.trim()
    }
    if (currentValues.city?.trim()) {
      searchParams.city = currentValues.city.trim()
    }
    if (currentValues.state?.trim()) {
      searchParams.state = currentValues.state.trim()
    }
    if (currentValues.country?.trim()) {
      searchParams.country = currentValues.country.trim()
    }
    if (currentValues.contact?.trim()) {
      searchParams.contact = currentValues.contact.trim()
    }

    // Check if at least one search parameter is provided
    if (Object.keys(searchParams).length === 0) {
      alert('Please enter at least one search criteria (name, specialty, city, or state)')
      return
    }

    console.log('Search params being sent:', searchParams) // Debug log
    onSearch(searchParams)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleAddToSystem = async (data: DoctorFormData) => {
    if (!data.firstName?.trim()) {
      alert('First name is required')
      return
    }
    if (!data.lastName?.trim()) {
      alert('Last name is required')
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
        firstName: data.firstName?.trim() || '',
        lastName: data.lastName?.trim() || '',
        specialty: data.specialty?.trim(),
        email: data.email?.trim(),
        city: data.city?.trim(),
        state: data.state?.trim(),
        country: data.country?.trim(),
        contact: data.contact?.trim(),
        address: data.address,
        credential: data.credential?.trim(),
        gender: data.gender,
        postalCode: data.postalCode
      }
      console.log('Adding doctor to system:', doctorData)
      await doctorDBOperations.add(doctorData)
      dispatch(addLocalDoctor(doctorData))

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

  const selectSpecialty = (taxonomy: typeof COMMON_TAXONOMIES[0]) => {
    setValue('specialty', taxonomy.desc)
    setShowSpecialtyDropdown(false)
  }

  const filteredSpecialties = useMemo(() => {
    const currentSpecialty = watchedValues.specialty || ''
    if (currentSpecialty) {
      return COMMON_TAXONOMIES.filter(tax =>
        tax.desc.toLowerCase().includes(currentSpecialty.toLowerCase())
      )
    }
    return COMMON_TAXONOMIES
  }, [watchedValues.specialty])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit(handleAddToSystem)}>
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

        {/* Specialty */}
        <div className="relative" ref={specialtyRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialty
          </label>
          <input
            {...register('specialty')}
            type="text"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.specialty ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter or select specialty"
            onFocus={() => setShowSpecialtyDropdown(true)}
          />
          {errors.specialty && (
            <p className="mt-1 text-sm text-red-600">{errors.specialty.message}</p>
          )}

          {/* Specialty Dropdown */}
          {showSpecialtyDropdown && filteredSpecialties.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              <div className="p-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">
                  {filteredSpecialties.length} specialties found. Click to select.
                </p>
              </div>
              {filteredSpecialties.map((taxonomy, index) => (
                <div
                  key={`${taxonomy.code}-${index}`}
                  className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                  onClick={() => selectSpecialty(taxonomy)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{taxonomy.desc}</span>
                    <span className="text-sm text-gray-500">{taxonomy.code}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact
          </label>
          <input
            {...register('contact')}
            type="tel"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.contact ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter phone number"
          />
          {errors.contact && (
            <p className="mt-1 text-sm text-red-600">{errors.contact.message}</p>
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
            Country
          </label>
          <input
            {...register('country')}
            type="text"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.country ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter country"
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
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
            maxLength={10}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.postalCode ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter postal code (e.g., 12345, 12345-6789, or 077537594)"
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
            placeholder="Enter street address (e.g., 123 Main St, Apt 4B)"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        {/* Add Button */}
        <div className="flex items-end gap-2">
          <Button
            type="button"
            disabled={adding}
            loading={adding}
            onClick={() => {
              const formData = watchedValues
              handleAddToSystem(formData)
            }}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Add to System
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-red-500 hover:bg-red-600 h-[55px]"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
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
