import { useState, useEffect, useRef, useMemo, useCallback, Suspense, lazy } from 'react'
import toast from 'react-hot-toast'

// Import UI components
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// Import Types files
import { type AppDispatch, type RootState } from '@/app/store'
import { doctorFormSchema, type DoctorFormData } from '@/features/doctor/validation/doctorValidation'

// Import form, validation and zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Import dispatch and selector for redux
import { useDispatch, useSelector } from 'react-redux'

// Import Services
import { doctorDBOperations } from '@/services/doctorServices'

// Import Thunk file for redux
import { fetchLocalDoctors, addLocalDoctor } from '@/features/doctor/doctorThunk'

// Import Slice file for redux
import { clearError } from '@/features/doctor/doctorSlice'
import { fetchDoctorSchedules } from '@/features/doctorSchedule/doctorScheduleSlice'
import { COMMON_TAXONOMIES } from '@/features/doctor/doctorSlice'

// Lazy load components
const DoctorSchedule = lazy(() => import('@/components/doctor/DoctorSchedule'))

// Constants
const STORAGE_KEYS = {
  FORM_DATA: 'doctorFormData',
  DOCTOR_DATA: 'currentDoctorData',
  DOCTOR_ADDED: 'doctorAdded'
} as const

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology'
] as const

// Sub-components
interface SpecialtyDropdownProps {
  filteredSpecialties: typeof COMMON_TAXONOMIES
  onSelect: (taxonomy: typeof COMMON_TAXONOMIES[0]) => void
  specialtyRef: React.RefObject<HTMLDivElement>
  showDropdown: boolean
  toggleDropdown: () => void
  register: ReturnType<typeof useForm<DoctorFormData>>['register']
  error?: { message?: string }
}

function SpecialtyDropdown({
  filteredSpecialties,
  onSelect,
  specialtyRef,
  showDropdown,
  toggleDropdown,
  register,
  error
}: SpecialtyDropdownProps) {
  return (
    <div ref={specialtyRef} className="relative">
      <Input
        id="specialty"
        label="Specialty"
        placeholder="Enter specialty or select from dropdown"
        registration={register('specialty')}
        error={error}
        onClick={toggleDropdown}
      />
      {showDropdown && filteredSpecialties.length > 0 && (
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
                onClick={() => onSelect(taxonomy)}
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
  )
}

interface Step {
  id: number
  title: string
  subtitle: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  completedSteps: number[]
  onStepClick: (step: number) => void
}

function Stepper({ steps, currentStep, completedSteps, onStepClick }: StepperProps) {
  return (
    <div className="flex items-center">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          {index > 0 && (
            <div className="w-12 h-0.5 bg-gray-300 mx-4">
              <div className={`h-full transition-all duration-300 ${
                currentStep >= step.id ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            </div>
          )}
          <StepButton
            step={step}
            isActive={currentStep === step.id}
            isCompleted={completedSteps.includes(step.id)}
            onClick={() => onStepClick(step.id)}
          />
        </div>
      ))}
    </div>
  )
}

interface StepButtonProps {
  step: Step
  isActive: boolean
  isCompleted: boolean
  onClick: () => void
}

function StepButton({ step, isActive, isCompleted, onClick }: StepButtonProps) {
  if (isActive) {
    return (
      <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-blue-600 text-white shadow-lg">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-white text-blue-600">
          {step.id}
        </div>
        <div className="text-left">
          <div className="font-medium">{step.title}</div>
          <div className="text-xs opacity-75">{step.subtitle}</div>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-all duration-200"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-green-600 text-white">
          ✓
        </div>
        <div className="text-left">
          <div className="font-medium">{step.title}</div>
          <div className="text-xs opacity-75">{step.subtitle}</div>
        </div>
      </button>
    )
  }

  return (
    <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-200 text-gray-400">
        {step.id}
      </div>
      <div className="text-left">
        <div className="font-medium">{step.title}</div>
        <div className="text-xs opacity-75">{step.subtitle}</div>
      </div>
    </div>
  )
}

const EMPTY_FORM_VALUES: DoctorFormData = {
  firstName: '',
  lastName: '',
  department: 'General Medicine',
  middleName: undefined,
  credential: undefined,
  specialty: undefined,
  phone: undefined,
  contact: undefined,
  email: undefined,
  city: undefined,
  state: undefined,
  postalCode: undefined,
  address: undefined,
  country: undefined,
  gender: undefined,
  addedAt: undefined
}

// Types
interface DoctorData {
  id: string
  npi: string
  firstName: string
  lastName: string
  middleName?: string
  specialty?: string
  department?: string
  email?: string
  city?: string
  state?: string
  country?: string
  contact?: string
  address?: string
  gender?: string
  postalCode?: string
}

interface DoctorSearchProps {
  initialValues?: Partial<DoctorData>
}

export default function DoctorSearch({ initialValues }: DoctorSearchProps) {

  // Redux dispatch
  const dispatch = useDispatch<AppDispatch>()

  // Redux Selector
  const { localDoctors: doctors } = useSelector((state: RootState) => state.doctors)

  // Refs
  const searchRef = useRef<HTMLDivElement>(null)
  const specialtyRef = useRef<HTMLDivElement>(null)

  // State
  const [adding, setAdding] = useState<boolean>(false)
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState<boolean>(false)
  const [addingSchedule, setAddingSchedule] = useState<boolean>(false)
  const [doctorAdded, setDoctorAdded] = useState<boolean>(false)

  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [lastAddedDoctor, setLastAddedDoctor] = useState<DoctorData | null>(null)


  // Computed
  const defaultValues = useMemo(() => ({
    ...EMPTY_FORM_VALUES,
    ...Object.fromEntries(
      Object.entries(initialValues || {}).filter(([, v]) => v !== undefined)
    )
  }), [initialValues])

  // Form control
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


  const selectSpecialty = useCallback((taxonomy: typeof COMMON_TAXONOMIES[0]) => {
    setValue('specialty', taxonomy.desc)
    setShowSpecialtyDropdown(false)
  }, [setValue])

  const toggleSpecialtyDropdown = useCallback(() => {
    setShowSpecialtyDropdown(prev => !prev)
  }, [])

  // Effect
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

  useEffect(() => {
    if (currentStep === 2) {
      dispatch(fetchLocalDoctors())
      dispatch(fetchDoctorSchedules())
    }
  }, [currentStep, dispatch])

  // Restore current doctor data on component mount (only for current session)
  useEffect(() => {
    Object.values(STORAGE_KEYS).forEach(key => sessionStorage.removeItem(key))
    setLastAddedDoctor(null)
    setDoctorAdded(false)
  }, [])

  // Methods
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
      const npi = `LOCAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const doctorExists = await doctorDBOperations.doctorExists(
        data.firstName?.trim() || '',
        data.lastName?.trim() || ''
      )
      if (doctorExists) {
        toast.error('A doctor with this name already exists in the system')
        return
      }

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

      const result = await dispatch(addLocalDoctor(doctorData)).unwrap()

      setLastAddedDoctor(result)
      setDoctorAdded(true)

      sessionStorage.setItem(STORAGE_KEYS.DOCTOR_DATA, JSON.stringify(result))
      sessionStorage.setItem(STORAGE_KEYS.DOCTOR_ADDED, 'true')

      toast.success(`Dr. ${result.firstName} ${result.lastName} added successfully! Moving to schedule setup.`)
      reset()
      setCurrentStep(2)
    } catch (error) {
      console.error('Failed to add doctor:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to add doctor: ${errorMessage}`)
    } finally {
      setAdding(false)
    }
  }, [dispatch, reset])

  const handleClear = useCallback(() => {
    reset(EMPTY_FORM_VALUES)
    dispatch(clearError())
    Object.values(STORAGE_KEYS).forEach(key => sessionStorage.removeItem(key))
    setLastAddedDoctor(null)
    setDoctorAdded(false)
  }, [reset, dispatch])

  const clearCurrentDoctorData = useCallback(() => {
    setLastAddedDoctor(null)
    setDoctorAdded(false)
    sessionStorage.removeItem(STORAGE_KEYS.DOCTOR_DATA)
    sessionStorage.removeItem(STORAGE_KEYS.DOCTOR_ADDED)
  }, [])

  const handleStepChange = useCallback((step: 1 | 2) => {
    if (step === 1) {
      const doctorFormData = sessionStorage.getItem(STORAGE_KEYS.FORM_DATA)
      const currentDoctorData = sessionStorage.getItem(STORAGE_KEYS.DOCTOR_DATA)

      if (doctorFormData || currentDoctorData) {
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
          const formData: DoctorFormData = {
            ...EMPTY_FORM_VALUES,
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
            gender: ['M', 'F', 'O'].includes(dataToFill.gender) ? dataToFill.gender : undefined
          }

          // Fill the form with the data
          reset(formData)

          // Set state variables if we have currentDoctorData
          if (currentDoctorData) {
            setLastAddedDoctor(dataToFill)
            setDoctorAdded(true)
          }
          setCurrentStep(2)
          return
        }
      }

      setLastAddedDoctor(null)
      setDoctorAdded(false)

      Object.values(STORAGE_KEYS).forEach(key => sessionStorage.removeItem(key))

      setTimeout(() => reset(EMPTY_FORM_VALUES), 0)
    }

    if (currentStep === 1 && step === 2) {
      sessionStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(watchedValues))
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
        <Stepper
          steps={[
            { id: 1, title: 'Add Doctor', subtitle: currentStep === 1 ? 'Enter doctor information' : doctorAdded ? 'Doctor added - Click to edit' : 'Click to start adding doctor' },
            { id: 2, title: 'Doctor Schedule', subtitle: currentStep === 2 ? 'Set working hours' : doctorAdded ? 'Doctor added - Click to continue' : 'Complete doctor setup first' }
          ]}
          currentStep={currentStep}
          completedSteps={doctorAdded ? [1] : []}
          onStepClick={(step) => handleStepChange(step as 1 | 2)}
        />
      </div>

      {/* Step 1: Add Doctor Form */}
      {currentStep === 1 && (
        <form onSubmit={handleSubmit(handleAddToSystem, (errors) => console.error('Form validation errors:', errors))}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Required Fields */}
            <Input id="firstName" label="First Name" placeholder="Enter first name" registration={register('firstName')} required error={errors.firstName} />
            <Input id="lastName" label="Last Name" placeholder="Enter last name" registration={register('lastName')} required error={errors.lastName} />

            {/* Specialty Dropdown */}
            <SpecialtyDropdown
              filteredSpecialties={filteredSpecialties}
              onSelect={selectSpecialty}
              specialtyRef={specialtyRef}
              showDropdown={showSpecialtyDropdown}
              toggleDropdown={toggleSpecialtyDropdown}
              register={register}
              error={errors.specialty}
            />

            {/* Department Select */}
            <Input id="department" label="Department" required as="select" registration={register('department')} error={errors.department}>
              <option value="">Select Department</option>
              {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </Input>

            {/* Contact Info */}
            <Input id="contact" label="Contact" placeholder="Phone or email" registration={register('contact')} error={errors.contact} />
            <Input id="email" label="Email" placeholder="Enter email address" registration={register('email')} error={errors.email} />

            {/* Location Fields */}
            <Input id="city" label="City" placeholder="Enter city" registration={register('city')} error={errors.city} />
            <Input id="state" label="State" placeholder="Enter state" registration={register('state')} error={errors.state} />
            <Input id="country" label="Country" placeholder="Enter country" registration={register('country')} error={errors.country} />
            <Input id="postalCode" label="Postal Code" placeholder="Enter postal code" registration={register('postalCode')} error={errors.postalCode} />

            {/* Address & Gender */}
            <Input id="address" label="Address" placeholder="Enter street address" registration={register('address')} error={errors.address} as="textarea" rows={3} />
            <Input id="gender" label="Gender" as="select" registration={register('gender')} error={errors.gender}>
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </Input>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Button type="submit" variant="outline" loading={adding} disabled={adding} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
              {adding ? 'Adding Doctor...' : 'Add Doctor'}
            </Button>
            <Button type="button" variant="ghost" onClick={handleClear} className="px-8 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50">
              Clear
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: Doctor Schedule Form */}
      {currentStep === 2 && (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading schedule component...</div>}>
          <DoctorSchedule
            lastAddedDoctor={lastAddedDoctor}
            doctors={doctors}
            addingSchedule={addingSchedule}
            setAddingSchedule={setAddingSchedule}
            clearCurrentDoctorData={clearCurrentDoctorData}
            onNavigateToAddDoctor={() => handleStepChange(1)}
          />
        </Suspense>
      )}
    </div>
  )
}
