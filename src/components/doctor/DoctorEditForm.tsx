import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, useRef, useMemo } from 'react'
import { X, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import { doctorFormSchema, type DoctorFormData } from '@/features/doctor/validation/doctorValidation'
import { type LocalDoctor } from '@/features/doctor/doctorSlice'
import { COMMON_TAXONOMIES } from '@/features/doctor/doctorSlice'
import { useDispatch, useSelector } from 'react-redux'
import { type AppDispatch, type RootState } from '@/app/store'
import { fetchDoctorSchedules } from '@/features/doctorSchedule/doctorScheduleSlice'
import { type DoctorSchedule } from '@/features/db/dexie'
import Input from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import DoctorSchedule from './DoctorSchedule'
import toast from 'react-hot-toast'

interface DoctorEditFormProps {
  doctor: LocalDoctor
  onSave: (data: DoctorFormData) => Promise<void>
  onCancel: () => void
}

type Step = 'doctor-info' | 'schedule'

interface ScheduleStepData {
  workingDays: number[]
  startTime: string
  endTime: string
  slotDuration: '15' | '20' | '30'
  lunchBreakStart?: string
  lunchBreakEnd?: string
}

export default function DoctorEditForm({ doctor, onSave, onCancel }: DoctorEditFormProps) {

  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState<DoctorEditFormProps>(null)
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>('doctor-info')
  const [existingSchedule, setExistingSchedule] = useState<DoctorSchedule | null>(null)
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [addingSchedule, setAddingSchedule] = useState(false)
  const specialtyRef = useRef<HTMLDivElement>(null)
  const dispatch = useDispatch<AppDispatch>()

  const { schedules } = useSelector((state: RootState) => state.doctorSchedule)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      gender: (doctor.gender as 'M' | 'F' | 'O' | undefined) || undefined,
      specialty: doctor.specialty || '',
      department: doctor.department || '',
      address: doctor.address || '',
      city: doctor.city || '',
      state: doctor.state || '',
      country: doctor.country || '',
      postalCode: doctor.postalCode || '',
      contact: doctor.contact || '',
      email: doctor.email || '',
      addedAt: doctor.addedAt || '',
    }
  })

  const watchedValues = watch()



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (specialtyRef.current && !specialtyRef.current.contains(event.target as Node)) {
        setShowSpecialtyDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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


  const loadExistingSchedule = async () => {
      if (!doctor.id) return
      try {
        await dispatch(fetchDoctorSchedules())
        const schedule = schedules.find(s => s.doctorId === doctor.id)
        if (schedule) {
          setExistingSchedule(schedule)
        } else {
          setExistingSchedule(null)
        }
      } catch (error) {
        toast.error('Failed to load doctor schedule')
      }
    }

  const handleNextStep = async () => {
    if (currentStep === 'doctor-info') {
      try {
        const isValid = await handleSubmit(async (data) => {
          // Then move to schedule step
          setEditData(data)
          setCurrentStep('schedule')
          loadExistingSchedule()
        })()
      } catch (error) {
        console.error('Validation or save failed:', error)
        toast.error('Failed to save doctor information')
      }
    }
  }

  const handlePreviousStep = () => {
    if (currentStep === 'schedule') {
      setCurrentStep('doctor-info')
    }
  }

  const handleSave = async (data: DoctorFormData) => {
    console.log('Save data:', data)
    setSaving(true)
    try {
    } catch (error) {
      toast.error('Failed to update doctor')
    } finally {
      setSaving(false)
    }
  }

  // Helper functions for DoctorSchedule component
  const clearCurrentDoctorData = () => {
    // This function is called by DoctorSchedule when clearing doctor data
    // In this context, we don't need to do anything since the doctor is fixed
  }

  const handleNavigateToAddDoctor = async() => {
    // Navigate back to doctor info step
    await onSave(editData)
    // setCurrentStep('doctor-info')
  }

  const renderStepIndicator = () => {
    const steps = [
      { key: 'doctor-info', label: 'Doctor Information', icon: User },
      { key: 'schedule', label: 'Schedule', icon: Clock }
    ]

    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.key
            const isCompleted = currentStep === 'schedule' || (currentStep === 'doctor-info' && index === 0)

            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : isCompleted
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
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

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Doctor Information</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-6">
          {renderStepIndicator()}

          {currentStep === 'doctor-info' && (
            <form onSubmit={handleSubmit(handleSave)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* First Name */}
            <Input
              id="firstName"
              label="First Name"
              required
              registration={register('firstName')}
              error={errors.firstName}
              placeholder="Enter first name"
            />

            {/* Last Name */}
            <Input
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
                <Input
                  id="specialty"
                  label="Specialty"
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
            <Input
              id="contact"
              label="Contact"
              registration={register('contact')}
              error={errors.contact}
              placeholder="Enter contact information"
            />

            {/* Email */}
            <Input
              id="email"
              label="Email"
              type="email"
              registration={register('email')}
              error={errors.email}
              placeholder="Enter email address"
            />



            {/* Gender */}
            <Input
              id="gender"
              label="Gender"
              as="select"
              registration={register('gender')}
              error={errors.gender}
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </Input>

            {/* Department */}
            <Input
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
            </Input>

            {/* City */}
            <Input
              id="city"
              label="City"
              registration={register('city')}
              error={errors.city}
              placeholder="Enter city"
            />

            {/* State */}
            <Input
              id="state"
              label="State"
              registration={register('state')}
              error={errors.state}
              placeholder="e.g., CA, NY"
            />

            {/* country */}
            <Input
              id="country"
              label="Country"
              registration={register('country')}
              error={errors.country}
              placeholder="Enter country"
            />

            {/* Postal Code */}
            <Input
              id="postalCode"
              label="Postal Code"
              registration={register('postalCode')}
              error={errors.postalCode}
              placeholder="Enter postal code"
            />

            {/* Address */}
            <div className="md:col-span-2">
              <Input
                id="address"
                label="Address"
                registration={register('address')}
                error={errors.address}
                placeholder="Enter address"
              />
            </div>
          </div>

          {/* Action Buttons for Doctor Info Step */}
          <div className="flex items-center justify-between gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={saving}
              className="flex items-center gap-2"
            >
              Next: Schedule
              <ChevronRight className="w-4 h-4" />
            </Button>
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
                  <DoctorSchedule
                    lastAddedDoctor={doctor}
                    doctors={[doctor]}
                    addingSchedule={addingSchedule}
                    setAddingSchedule={setAddingSchedule}
                    clearCurrentDoctorData={clearCurrentDoctorData}
                    onNavigateToAddDoctor={handleNavigateToAddDoctor}
                    existingSchedule={existingSchedule}
                  />

                  {/* Navigation buttons for schedule step */}
                  <div className="flex items-center justify-between gap-3 mt-6 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handlePreviousStep}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Doctor Info
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
