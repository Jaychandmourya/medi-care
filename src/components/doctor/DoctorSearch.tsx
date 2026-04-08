import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { type AppDispatch, type RootState } from '@/app/store'
import { clearError } from '@/features/doctor/doctorSlice'
import { fetchLocalDoctors, addLocalDoctor } from '@/features/doctor/doctorThunk'
import { fetchDoctorSchedules } from '@/features/doctorSchedule/doctorScheduleSlice'
import { doctorDBOperations } from '@/services/doctorServices'
import { doctorFormSchema, type DoctorFormData } from '@/features/doctor/validation/doctorValidation'
import { COMMON_TAXONOMIES } from '@/features/doctor/doctorSlice'
import { appointmentServices } from '@/services/appointmentServices'
import DoctorSchedule from './DoctorSchedule'

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
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [addingSchedule, setAddingSchedule] = useState(false)
  const [lastAddedDoctor, setLastAddedDoctor] = useState<any>(null)
  const [doctorAdded, setDoctorAdded] = useState(false)

  // Get doctors for schedule form
  const { localDoctors: doctors } = useSelector((state: RootState) => state.doctors)

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

  // Load doctor schedules when component mounts or schedule step is active
  useEffect(() => {
    if (currentStep === 2) {
      dispatch(fetchLocalDoctors())
      dispatch(fetchDoctorSchedules())
    }
  }, [currentStep, dispatch])

  // Restore current doctor data on component mount (only for current session)
  useEffect(() => {
    // Clear all session storage on page refresh to ensure temporary data only
    sessionStorage.removeItem('doctorFormData')
    sessionStorage.removeItem('currentDoctorData')
    sessionStorage.removeItem('doctorAdded')

    // Don't restore any data on component mount - start fresh
    setLastAddedDoctor(null)
    setDoctorAdded(false)
  }, [])

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
    // Enhanced validation
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
      const npi = `LOCAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Enhanced duplicate check with more criteria
      const doctorExists = await doctorDBOperations.doctorExists(
        data.firstName?.trim() || '',
        data.lastName?.trim() || ''
      )

      if (doctorExists) {
        toast.error('A doctor with this name already exists in the system')
        return
      }

      // Enhanced doctor data object with validation
      const doctorData = {
        npi: npi,
        firstName: data.firstName?.trim() || '',
        lastName: data.lastName?.trim() || '',
        middleName: data.middleName?.trim() || '',
        specialty: data.specialty?.trim() || 'General Practice',
        department: data.department || 'General Medicine',
        email: data.email?.trim() || '',
        city: data.city?.trim() || '',
        state: data.state?.trim() || '',
        country: data.country?.trim() || '',
        contact: data.contact?.trim() || '',
        address: data.address?.trim() || '',
        gender: data.gender || '',
        postalCode: data.postalCode?.trim() || '',
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active' as const
      }

      // Add to database with enhanced error handling
      const result = await dispatch(addLocalDoctor(doctorData)).unwrap()

      // Set the last added doctor with complete data
      setLastAddedDoctor(result)
      setDoctorAdded(true) // Mark that doctor has been added

      // Store current doctor data and flag for potential use (temporary)
      sessionStorage.setItem('currentDoctorData', JSON.stringify(result))
      sessionStorage.setItem('doctorAdded', 'true')

      toast.success(`Dr. ${result.firstName} ${result.lastName} added successfully! Moving to schedule setup.`)
      reset()
      setCurrentStep(2) // Move to schedule step after successful doctor addition
    } catch (error) {
      console.error('Failed to add doctor:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to add doctor: ${errorMessage}`)
    } finally {
      setAdding(false)
    }
  }, [dispatch, reset])

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
    // Clear stored data
    sessionStorage.removeItem('doctorFormData')
    sessionStorage.removeItem('currentDoctorData')
    sessionStorage.removeItem('doctorAdded')
    setLastAddedDoctor(null)
    setDoctorAdded(false)
  }, [reset, dispatch])

  const clearCurrentDoctorData = useCallback(() => {
    setLastAddedDoctor(null)
    setDoctorAdded(false)
    sessionStorage.removeItem('currentDoctorData')
    sessionStorage.removeItem('doctorAdded')
  }, [])

  const handleStepChange = useCallback((step: 1 | 2) => {
    if (step === 1) {
      // Check sessionStorage for existing data when going to step 1
      const doctorFormData = sessionStorage.getItem('doctorFormData')
      const currentDoctorData = sessionStorage.getItem('currentDoctorData')

      if (doctorFormData || currentDoctorData) {
        // Try to parse and use currentDoctorData first, then fallback to doctorFormData
        let dataToFill = null

        try {
          if (currentDoctorData) {
            dataToFill = JSON.parse(currentDoctorData)
          } else if (doctorFormData) {
            dataToFill = JSON.parse(doctorFormData)
          }
        } catch (error) {
          console.error('Error parsing sessionStorage data:', error)
        }

        // If we have valid data, fill the form and move to step 2
        if (dataToFill) {
          // Map the data to form fields
          const formData = {
            firstName: dataToFill.firstName || '',
            lastName: dataToFill.lastName || '',
            middleName: dataToFill.middleName || '',
            specialty: dataToFill.specialty || '',
            department: dataToFill.department || 'General Medicine',
            contact: dataToFill.contact || '',
            email: dataToFill.email || '',
            city: dataToFill.city || '',
            state: dataToFill.state || '',
            postalCode: dataToFill.postalCode || '',
            address: dataToFill.address || '',
            country: dataToFill.country || '',
            gender: (dataToFill.gender as 'M' | 'F' | 'O' | '') || ''
          }

          // Fill the form with the data
          reset(formData)

          // Set state variables if we have currentDoctorData
          if (currentDoctorData) {
            setLastAddedDoctor(dataToFill)
            setDoctorAdded(true)
          }

          // Move directly to Doctor Schedule step
          setCurrentStep(2)
          return
        }
      }

      // If no data or invalid data, proceed with normal step 1 logic
      setLastAddedDoctor(null)
      setDoctorAdded(false)

      // Clear all session storage first
      sessionStorage.removeItem('doctorFormData')
      sessionStorage.removeItem('currentDoctorData')
      sessionStorage.removeItem('doctorAdded')

      // Reset form to default values with a slight delay to ensure it takes effect
      setTimeout(() => {
        reset({
          firstName: '',
          lastName: '',
          middleName: '',
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
      }, 0)
    }

    // Save current form data before switching steps (temporary)
    if (currentStep === 1 && step === 2) {
      const currentFormData = watchedValues
      sessionStorage.setItem('doctorFormData', JSON.stringify(currentFormData))
    }

    setCurrentStep(step)
  }, [currentStep, watchedValues, reset])

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
      {/* Stepper Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Step 1 */}
            {currentStep === 1 ? (
              <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-blue-600 text-white shadow-lg">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-white text-blue-600">
                  1
                </div>
                <div className="text-left">
                  <div className="font-medium">Add Doctor</div>
                  <div className="text-xs opacity-75">Enter doctor information</div>
                </div>
              </div>
            ) : doctorAdded ? (
              <button
                type="button"
                onClick={() => {
                  handleStepChange(1)
                }}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-green-600 text-white">
                  ✓
                </div>
                <div className="text-left">
                  <div className="font-medium">Add Doctor</div>
                  <div className="text-xs opacity-75">Doctor added - Click to edit</div>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleStepChange(1)
                }}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 cursor-not-allowed transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-200 text-gray-400">
                  1
                </div>
                <div className="text-left">
                  <div className="font-medium">Add Doctor</div>
                  <div className="text-xs opacity-75">Click to start adding doctor</div>
                </div>
              </button>
            )}

            {/* Connector */}
            <div className="w-12 h-0.5 bg-gray-300 mx-4">
              <div className={`h-full transition-all duration-300 ${
                currentStep === 2 ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            </div>

            {/* Step 2 */}
            {currentStep === 2 ? (
              <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-blue-600 text-white shadow-lg">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-white text-blue-600">
                  2
                </div>
                <div className="text-left">
                  <div className="font-medium">Doctor Schedule</div>
                  <div className="text-xs opacity-75">Set working hours</div>
                </div>
              </div>
            ) : doctorAdded ? (
              <button
                type="button"
                onClick={() => handleStepChange(2)}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-green-600 text-white">
                  ✓
                </div>
                <div className="text-left">
                  <div className="font-medium">Doctor Schedule</div>
                  <div className="text-xs opacity-75">Doctor added - Click to continue</div>
                </div>
              </button>
            ) : (
              <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-200 text-gray-400">
                  2
                </div>
                <div className="text-left">
                  <div className="font-medium">Doctor Schedule</div>
                  <div className="text-xs opacity-75">Complete doctor setup first</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step 1: Add Doctor Form */}
      {currentStep === 1 && (
        <form onSubmit={handleSubmit(handleAddToSystem, (errors) => {
          console.error('Form validation errors:', errors)
          const errorMessages = Object.values(errors).map(err => err?.message).filter(Boolean).join(', ')
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
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            {adding ? 'Adding Doctor...' : 'Add Doctor'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            className="px-8 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Button>
        </div>
      </form>
      )}

      {/* Step 2: Doctor Schedule Form */}
      {currentStep === 2 && (
        <DoctorSchedule
          lastAddedDoctor={lastAddedDoctor}
          doctors={doctors}
          addingSchedule={addingSchedule}
          setAddingSchedule={setAddingSchedule}
          clearCurrentDoctorData={clearCurrentDoctorData}
          onNavigateToAddDoctor={() => handleStepChange(1)}
        />
      )}
    </div>
  )
}
