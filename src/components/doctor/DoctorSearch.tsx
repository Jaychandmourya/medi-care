import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { type AppDispatch, type RootState } from '@/app/store'
import { clearError } from '@/features/doctor/doctorSlice'
import { addLocalDoctor } from '@/features/doctor/doctorThunk'
import { doctorDBOperations } from '@/services/doctorServices'
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
    gender?: string
    email?: string
  }
  onClear?: () => void
}

export default function DoctorSearch({ initialValues, onClear }: DoctorSearchProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [adding, setAdding] = useState(false)
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false)

  const defaultValues = useMemo(() => ({
    firstName: initialValues?.firstName || '',
    lastName: initialValues?.lastName || '',
    middleName: '',
    specialty: initialValues?.specialty || '',
    department: 'General Medicine' as const,
    contact: initialValues?.contact || '',
    email: initialValues?.email || '',
    city: initialValues?.city || '',
    state: initialValues?.state || '',
    postalCode: initialValues?.postalCode || '',
    address: initialValues?.address || '',
    country: initialValues?.country || '',
    gender: (initialValues?.gender as 'M' | 'F' | 'O' | undefined) || undefined
  }), [initialValues])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues
  })

  const watchedValues = watch()
  const specialtyValue = watchedValues.specialty
  const searchRef = useRef<HTMLDivElement>(null)
  const specialtyRef = useRef<HTMLDivElement>(null)

  const selectSpecialty = useCallback((taxonomy: typeof COMMON_TAXONOMIES[0]) => {
    setValue('specialty', taxonomy.desc)
    setShowSpecialtyDropdown(false)
  }, [setValue])

  const toggleSpecialtyDropdown = useCallback(() => {
    setShowSpecialtyDropdown(prev => !prev)
  }, [])

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
      setValue('gender', initialValues.gender || '')
      setValue('specialty', initialValues.specialty || '')
    }
  }, [initialValues, setValue])

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowSpecialtyDropdown(false)
    }
    if (specialtyRef.current && !specialtyRef.current.contains(event.target as Node)) {
      setShowSpecialtyDropdown(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  const handleAddToSystem = useCallback(async (data: DoctorFormData) => {
    if (!data.firstName?.trim()) {
      toast.error('First name is required')
      return
    }
    if (!data.lastName?.trim()) {
      toast.error('Last name is required')
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
        toast.error('A doctor with this name already exists in your system')
        return
      }

      // Add to database
      const doctorData = {
        npi: npi,
        firstName: data.firstName?.trim() || '',
        lastName: data.lastName?.trim() || '',
        specialty: data.specialty?.trim(),
        department: data.department,
        email: data.email?.trim(),
        city: data.city?.trim(),
        state: data.state?.trim(),
        country: data.country?.trim(),
        contact: data.contact?.trim(),
        address: data.address,
        gender: data.gender,
        postalCode: data.postalCode,
        addedAt: new Date().toISOString()
      }
      dispatch(addLocalDoctor(doctorData))

      toast.success('Doctor added to your system successfully!')
      reset()
      onClear?.()
    } catch (error) {
      console.error('Failed to add doctor:', error)
      toast.error('Failed to add doctor to system')
    } finally {
      setAdding(false)
    }
  }, [dispatch, reset, onClear])

  const handleClear = useCallback(() => {
    reset({
      firstName: '',
      lastName: '',
      specialty: '',
      department: 'General Medicine',
      contact: '',
      email: '',
      city: '',
      state: '',
      postalCode: '',
      address: '',
      country: '',
      gender: '' as '' | 'M' | 'F' | 'O'
    })
    dispatch(clearError())
  }, [reset, dispatch])

  const filteredSpecialties = useMemo(() => {
    const currentSpecialty = specialtyValue || ''
    if (currentSpecialty) {
      return COMMON_TAXONOMIES.filter(tax =>
        tax.desc.toLowerCase().includes(currentSpecialty.toLowerCase())
      )
    }
    return COMMON_TAXONOMIES
  }, [specialtyValue])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit(handleAddToSystem, (errors) => {
        console.error('Form validation errors:', errors)
        const errorMessages = Object.values(errors).map(err => err?.message).filter(Boolean).join(', ')
        toast.error(`Please fix the following errors: ${errorMessages}`)
      })}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* First Name */}
        <Input
          id="firstName"
          label="First Name"
          placeholder="Enter first name"
          registration={register('firstName')}
          required
          error={errors.firstName}
        />

        {/* Last Name */}
        <Input
          id="lastName"
          label="Last Name"
          placeholder="Enter last name"
          registration={register('lastName')}
          required
          error={errors.lastName}
        />

        {/* Specialty */}
        <div ref={specialtyRef} className="relative">
          <Input
            id="specialty"
            label="Specialty"
            placeholder="Enter specialty or select from dropdown"
            registration={register('specialty')}
            error={errors.specialty}
            onClick={toggleSpecialtyDropdown}
          />

          {/* Specialty Dropdown */}
          {showSpecialtyDropdown && filteredSpecialties.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                <p className="text-xs text-gray-500">
                  {filteredSpecialties.length} specialties found. Click to select.
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {filteredSpecialties.map((taxonomy, index) => (
                  <div
                    key={`${taxonomy.code}-${index}`}
                    className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                    onClick={() => selectSpecialty(taxonomy)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{taxonomy.desc}</span>
                      <span className="text-sm text-gray-500">{taxonomy.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Department */}
        <Input
          id="department"
          label="Department"
          required
          as="select"
          registration={register('department')}
          error={errors.department}
        >
          <option value="">Select Department</option>
          <option value="General Medicine">General Medicine</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Dermatology">Dermatology</option>
        </Input>

        {/* Contact */}
        <Input
          id="contact"
          label="Contact"
          placeholder="Phone or email"
          registration={register('contact')}
          error={errors.contact}
        />

        {/* Email */}
        <Input
          id="email"
          label="Email"
          placeholder="Enter email address"
          registration={register('email')}
          error={errors.email}
        />

        {/* City */}
        <Input
          id="city"
          label="City"
          placeholder="Enter city"
          registration={register('city')}
          error={errors.city}
        />

        {/* State */}
        <Input
          id="state"
          label="State"
          placeholder="Enter state"
          registration={register('state')}
          error={errors.state}
        />

        {/* country */}
        <Input
          id="country"
          label="country"
          placeholder="Enter country"
          registration={register('country')}
          error={errors.country}
        />

        {/* Postal Code */}
        <Input
          id="postalCode"
          label="Postal Code"
          placeholder="Enter postal code (e.g., 12345, 12345-6789, or 077537594)"
          registration={register('postalCode')}
          error={errors.postalCode}
        />

        {/* Address */}
        <Input
          id="address"
          label="Address"
          placeholder="Enter street address (e.g., 123 Main St, Apt 4B)"
          registration={register('address')}
          error={errors.address}
          as="textarea"
          rows={3}
        />

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            id="gender"
            {...register('gender')}
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm border-gray-300"
          >
            <option value="">Select gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-4">
          <Button
            type="submit"
            variant="outline"
            loading={adding}
            disabled={adding}
            className="px-6 py-3"
          >
            {adding ? 'Adding...' : 'Add to System'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            className="px-6 py-3"
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  )
}
