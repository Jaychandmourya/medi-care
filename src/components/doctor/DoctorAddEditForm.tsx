import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, useRef, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import { Country, State } from 'country-state-city'
import { doctorFormSchema, type DoctorFormData } from '@/features/doctor/validation/doctorValidation'
import type { LocalDoctor } from '@/types/doctors/doctorType'
import { COMMON_TAXONOMIES } from '@/features/doctor/doctorSlice'
import { useDispatch } from 'react-redux'
import { type AppDispatch } from '@/app/store'
import { fetchDoctorSchedules } from '@/features/doctorSchedule/doctorScheduleSlice'
import { type DoctorSchedule as DoctorScheduleType } from '@/features/db/dexie'
import FormField from '@/components/common/FormField'
import CountryStateCitySelector from './CountryStateCitySelector'
import { FormButton } from '@/components/common/FormButton'
import { DoctorSchedule as DoctorScheduleComponent } from './DoctorSchedule'
import GenericDialog from '@/components/common/dialog/GenericDialog'
import toast from 'react-hot-toast'

interface DoctorEditFormProps {
  isOpen: boolean
  doctor?: LocalDoctor
  mode?: 'add' | 'edit'
  onSave: (data: DoctorFormData, shouldCloseDialog?: boolean) => Promise<void | LocalDoctor>
  onCancel: () => void
  onComplete?: () => void // Called after successful save to refresh parent data
}

type Step = 'doctor-info' | 'schedule'

const defaultDoctor: Partial<LocalDoctor> = {
  npi: '',
  firstName: '',
  lastName: '',
  middleName: '',
  credential: '',
  specialty: '',
  department: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  gender: undefined,
  contact: '',
  addedAt: new Date().toISOString(),
}

export default function DoctorEditForm({ isOpen, doctor, mode = 'edit', onSave, onCancel, onComplete }: DoctorEditFormProps) {
  const dispatch = useDispatch<AppDispatch>()

  const currentDoctor = doctor || defaultDoctor as LocalDoctor
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState<DoctorFormData | null>(null)
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>('doctor-info')
  const [existingSchedule, setExistingSchedule] = useState<DoctorScheduleType | null>(null)
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [addingSchedule, setAddingSchedule] = useState(false)
  const [newlySavedDoctor, setNewlySavedDoctor] = useState<LocalDoctor | null>(null)
  const [pendingDoctorData, setPendingDoctorData] = useState<DoctorFormData | null>(null)
  const pendingDoctorDataRef = useRef<DoctorFormData | null>(null)
  const specialtyRef = useRef<HTMLDivElement>(null)
  const dialogContentRef = useRef<HTMLDivElement>(null)


  // State for country/state codes (selector uses codes, form stores names)
  const [countryCode, setCountryCode] = useState('')
  const [stateCode, setStateCode] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    reset
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    mode: 'onChange',
    defaultValues: {
      id: currentDoctor.id || '',
      firstName: currentDoctor.firstName || '',
      lastName: currentDoctor.lastName || '',
      gender: (currentDoctor.gender as 'M' | 'F' | 'O' | undefined) || undefined,
      specialty: currentDoctor.specialty || '',
      department: currentDoctor.department || '',
      address: currentDoctor.address || '',
      city: currentDoctor.city || '',
      state: currentDoctor.state || '',
      country: currentDoctor.country || '',
      postalCode: currentDoctor.postalCode || '',
      contact: currentDoctor.contact || '',
      addedAt: currentDoctor.addedAt || '',
    }
  })

  const watchedValues = watch()

  // Reset form values when doctor prop changes (for edit mode)
  useEffect(() => {
    if (doctor) {
      reset({
        id: doctor.id || '',
        firstName: doctor.firstName || '',
        lastName: doctor.lastName || '',
        gender: (doctor.gender as 'M' | 'F' | 'O' | undefined) || undefined,
        specialty: doctor.specialty || '',
        department: doctor.department || '',
        address: doctor.address || '',
        city: doctor.city || '',
        state: doctor.state || '',
        country: doctor.country || '',
        postalCode: doctor.postalCode || '',
        contact: doctor.contact || '',
        addedAt: doctor.addedAt || '',
      })
    }
  }, [doctor, reset])

  // Map country/state names to codes when editing existing doctor
  useEffect(() => {
    const countryName = currentDoctor.country?.trim()
    const stateName = currentDoctor.state?.trim()

    if (countryName) {
      const countries = Country.getAllCountries()
      // Try exact match first, then case-insensitive
      let foundCountry = countries.find(c => c.name === countryName)
      if (!foundCountry) {
        foundCountry = countries.find(c => c.name.toLowerCase() === countryName.toLowerCase())
      }
      // Also try matching by ISO code
      if (!foundCountry) {
        foundCountry = countries.find(c => c.isoCode.toLowerCase() === countryName.toLowerCase())
      }

      if (foundCountry) {
        setCountryCode(foundCountry.isoCode)
        if (stateName) {
          const states = State.getStatesOfCountry(foundCountry.isoCode)
          // Try exact match first, then case-insensitive
          let foundState = states.find(s => s.name === stateName)
          if (!foundState) {
            foundState = states.find(s => s.name.toLowerCase() === stateName.toLowerCase())
          }
          // Also try matching by ISO code (e.g., "CA" instead of "California")
          if (!foundState) {
            foundState = states.find(s => s.isoCode.toLowerCase() === stateName.toLowerCase())
          }

          if (foundState) {
            setStateCode(foundState.isoCode)
          } else {
            setStateCode('')
          }
        } else {
          setStateCode('')
        }
      } else {
        setCountryCode('')
        setStateCode('')
      }
    } else {
      setCountryCode('')
      setStateCode('')
    }
  }, [currentDoctor.id, currentDoctor.country, currentDoctor.state])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (specialtyRef.current && !specialtyRef.current.contains(event.target as Node)) {
        setShowSpecialtyDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll to top when switching to schedule step
  useEffect(() => {
    if (currentStep === 'schedule' && dialogContentRef.current) {
      dialogContentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep])

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


  const loadExistingSchedule = async (doctorIdToUse?: string) => {
      const doctorId = doctorIdToUse || currentDoctor.id
      if (!doctorId) {
        setLoadingSchedule(false)
        return
      }
      try {
        const result = await dispatch(fetchDoctorSchedules())
        // Access fresh schedules from the action result payload or thunk return
        const freshSchedules = (result.payload as DoctorScheduleType[]) || []
        const schedule = freshSchedules.find((s: DoctorScheduleType) => s.doctorId === doctorId)
        if (schedule) {
          setExistingSchedule(schedule)
        } else {
          setExistingSchedule(null)
        }
      } catch (error) {
        console.error('Failed to load doctor schedule:', error)
        toast.error('Failed to load doctor schedule')
      } finally {
        setLoadingSchedule(false)
      }
    }

  const handleNextStep = async () => {
    if (currentStep === 'doctor-info') {
      const isValid = await trigger()
      if (!isValid) {
        const errorFields = Object.entries(errors)
          .map(([field, error]) => `${field}: ${error?.message}`)
          .join(', ')
        toast.error(`Validation errors: ${errorFields}`)
        return
      }

      // Get form data and store it temporarily
      const data = watch()
      setEditData(data as DoctorFormData)
      setPendingDoctorData(data as DoctorFormData)
      pendingDoctorDataRef.current = data as DoctorFormData

      // For edit mode, save immediately. For add mode, defer until Complete Setup
      if (mode === 'edit') {
        setSaving(true)
        try {
          const result = await onSave(data as DoctorFormData, false)
          setNewlySavedDoctor(data as LocalDoctor)
          if (result && typeof result === 'object' && 'id' in result) {
            setNewlySavedDoctor(result as LocalDoctor)
          }
        } catch (err) {
          console.error('Failed to save doctor:', err)
          toast.error('Failed to save doctor. Please try again.')
          return
        } finally {
          setSaving(false)
        }
      }

      setLoadingSchedule(true)
      setCurrentStep('schedule')
      // In edit mode, use the saved doctor's ID to load schedule
      // In add mode, we don't have an ID yet - will be created on Complete Setup
      const doctorIdForSchedule = mode === 'edit' && newlySavedDoctor?.id ? newlySavedDoctor.id : currentDoctor.id
      if (doctorIdForSchedule) {
        await loadExistingSchedule(doctorIdForSchedule)
      } else {
        setLoadingSchedule(false)
      }
    }
  }

  const handlePreviousStep = () => {
    if (currentStep === 'schedule') {
      setCurrentStep('doctor-info')
    }
  }

  const handleStepClick = (stepKey: Step) => {
    // In edit mode, allow direct navigation to any step
    // In add mode, only allow navigation back to doctor-info from schedule
    if (mode === 'edit') {
      if (stepKey === 'schedule' && currentStep !== 'schedule') {
        // When clicking schedule in edit mode, load existing schedule data
        setLoadingSchedule(true)
        setCurrentStep('schedule')
        if (currentDoctor.id) {
          loadExistingSchedule(currentDoctor.id)
        } else {
          setLoadingSchedule(false)
        }
      } else if (stepKey === 'doctor-info' && currentStep !== 'doctor-info') {
        setCurrentStep('doctor-info')
      }
    } else {
      // Add mode: only allow going back to doctor-info
      if (stepKey === 'doctor-info' && currentStep === 'schedule') {
        setCurrentStep('doctor-info')
      }
    }
  }

  const handleSave = async (data: DoctorFormData) => {
    setSaving(true)
    try {
      await onSave(data, true)
    } catch (err) {
      console.error('Failed to save doctor:', err)
      toast.error('Failed to save doctor')
    } finally {
      setSaving(false)
    }
  }

  const handleBeforeScheduleSave = async (): Promise<string | null> => {
    const doctorData = pendingDoctorDataRef.current
    if (!doctorData) {
      toast.error('No doctor data available')
      return null
    }

    // In edit mode, return existing doctor ID
    if (mode === 'edit') {
      return currentDoctor.id || null
    }
    setSaving(true)
    try {
      const result = await onSave(doctorData, false)
      if (result && typeof result === 'object' && 'id' in result) {
        const savedDoctor = result as LocalDoctor
        setNewlySavedDoctor(savedDoctor)
        pendingDoctorDataRef.current = null
        toast.success('Doctor saved successfully!')
        return savedDoctor.id || null
      }
      return null
    } catch (err) {
      console.error('Failed to save doctor:', err)
      toast.error('Failed to save doctor. Please try again.')
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleNavigateToAddDoctor = async () => {
    onComplete?.()
    if (mode === 'edit' && editData) {
      await onSave(editData, true)
    } else if (mode === 'add' && pendingDoctorData) {
      onCancel()
    }
  }

  const renderStepIndicator = () => {
    const steps = [
      { key: 'doctor-info', label: 'Doctor Information', icon: User },
      { key: 'schedule', label: 'Schedule', icon: Clock }
    ]

    // Determine if a step is clickable
    const isStepClickable = (stepKey: Step) => {
      if (mode === 'edit') {
        // In edit mode, both steps are clickable
        return stepKey !== currentStep
      } else {
        // In add mode, only allow going back to doctor-info
        return stepKey === 'doctor-info' && currentStep === 'schedule'
      }
    }

    return (
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.key
            const isCompleted = currentStep === 'schedule' || (currentStep === 'doctor-info' && index === 0)
            const clickable = isStepClickable(step.key as Step)

            return (
              <div key={step.key} className="flex items-center">
                <div
                  onClick={() => clickable && handleStepClick(step.key as Step)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  } ${clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  onClick={() => clickable && handleStepClick(step.key as Step)}
                  className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  } ${clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`mx-4 w-8 h-0.5 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Custom footer based on current step
  const renderFooter = () => {
    if (currentStep === 'doctor-info') {
      return (
        <div className="flex items-center justify-between gap-3">
          <FormButton
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </FormButton>
          <FormButton
            type="button"
            onClick={handleNextStep}
            disabled={saving}
            className="flex items-center gap-2"
          >
            Next: Schedule
            <ChevronRight className="w-4 h-4" />
          </FormButton>
        </div>
      )
    }

    // Schedule step - navigation is inside DoctorScheduleComponent, but we need a back button
    return (
      <div className="flex items-center justify-between gap-3">
        <FormButton
          type="button"
          variant="secondary"
          onClick={handlePreviousStep}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Doctor Info
        </FormButton>
        <div /> {/* Spacer for alignment */}
      </div>
    )
  }

  return (
    <GenericDialog
      isOpen={isOpen}
      onClose={onCancel}
      title={mode === 'add' ? 'Add New Doctor' : 'Edit Doctor Information'}
      maxWidth="max-w-4xl"
      showDefaultButtons={false}
      footer={renderFooter()}
      contentRef={dialogContentRef}
    >
      {renderStepIndicator()}

      {currentStep === 'doctor-info' && (
        <form onSubmit={handleSubmit(handleSave)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <FormField
              id="firstName"
              label="First Name"
              required
              registration={register('firstName')}
              error={errors.firstName}
              placeholder="Enter first name"
            />

            {/* Last Name */}
            <FormField
              id="lastName"
              label="Last Name"
              required
              registration={register('lastName')}
              error={errors.lastName}
              placeholder="Enter last name"
            />

            {/* Specialty */}
            <div className="relative" ref={specialtyRef}>
              <div onClick={() => setShowSpecialtyDropdown(true)}>
                <FormField
                  id="specialty"
                  label="Specialty"
                  required
                  registration={register('specialty')}
                  error={errors.specialty}
                  placeholder="Enter or select specialty"
                />
              </div>

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
            <FormField
              id="contact"
              label="Phone"
              type="tel"
              required
              registration={register('contact')}
              error={errors.contact}
              placeholder="Enter phone number"
            />

            {/* Gender */}
            <FormField
              id="gender"
              label="Gender"
              required
              as="select"
              registration={register('gender')}
              error={errors.gender}
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </FormField>

            {/* Department */}
            <FormField
              id="department"
              label="Department"
              as="select"
              registration={register('department')}
              error={errors.department}
              required
            >
              <option value="">Select Department</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Dermatology">Dermatology</option>
            </FormField>

            {/* Country, State, City Selector */}
            <div className="md:col-span-2">
              <CountryStateCitySelector
                selectedCountry={countryCode}
                selectedState={stateCode}
                selectedCity={watch('city') || ''}
                onCountryChange={(code, name) => {
                  setCountryCode(code)
                  setStateCode('')
                  setValue('country', name)
                  setValue('state', '')
                  setValue('city', '')
                }}
                onStateChange={(code, name) => {
                  setStateCode(code)
                  setValue('state', name)
                  setValue('city', '')
                }}
                onCityChange={(cityName) => setValue('city', cityName)}
              />
            </div>

            {/* Postal Code */}
            <FormField
              id="postalCode"
              label="Postal Code"
              registration={register('postalCode')}
              error={errors.postalCode}
              placeholder="Enter postal code"
            />

            {/* Address */}
            <FormField
              id="address"
              as="textarea"
              label="Address"
              registration={register('address')}
              error={errors.address}
              placeholder="Enter address"
              rows={3}
            />
          </div>
        </form>
      )}

      {currentStep === 'schedule' && (
        <div>
          {loadingSchedule ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading schedule data...</span>
            </div>
          ) : (
            <div>
              {/* Create a temp doctor from pending data for display before save */}
              {(() => {
                const displayDoctor = newlySavedDoctor
                  ? newlySavedDoctor
                  : mode === 'add' && pendingDoctorData
                    ? { ...currentDoctor, ...pendingDoctorData, id: 'temp-id' } as LocalDoctor
                    : currentDoctor as LocalDoctor
                return (
                  <DoctorScheduleComponent
                    lastAddedDoctor={displayDoctor}
                    doctors={[displayDoctor]}
                    addingSchedule={addingSchedule}
                    setAddingSchedule={setAddingSchedule}
                    onNavigateToAddDoctor={handleNavigateToAddDoctor}
                    onBeforeScheduleSave={handleBeforeScheduleSave}
                    existingSchedule={existingSchedule}
                    isNewDoctor={mode === 'add' && !newlySavedDoctor}
                  />
                )
              })()}
            </div>
          )}
        </div>
      )}
    </GenericDialog>
  )
}
