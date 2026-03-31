import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, useRef, useMemo } from 'react'
import { X } from 'lucide-react'
import { doctorFormSchema, type DoctorFormData } from '@/features/doctor/validation/doctorValidation'
import { type LocalDoctor } from '@/features/doctor/doctorSlice'
import { COMMON_TAXONOMIES } from '@/features/doctor/doctorSlice'
import Input from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface DoctorEditFormProps {
  doctor: LocalDoctor
  onSave: (data: DoctorFormData) => Promise<void>
  onCancel: () => void
}

export default function DoctorEditForm({ doctor, onSave, onCancel }: DoctorEditFormProps) {
  const [saving, setSaving] = useState(false)
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false)
  const specialtyRef = useRef<HTMLDivElement>(null)

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
      county: doctor.country || '',
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

  const handleSave = async (data: DoctorFormData) => {
    console.log('Save data:', data)
    setSaving(true)
    try {
      await onSave(data)
    } catch (error) {
      console.error('Failed to update doctor:', error)
      alert('Failed to update doctor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Doctor</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(handleSave)} className="p-6">
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

            {/* County */}
            <Input
              id="county"
              label="County"
              registration={register('county')}
              error={errors.county}
              placeholder="Enter county"
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              disabled={saving}
              onClick={() => {
                const formData = watchedValues
                console.log('Click me', formData)
                handleSave(formData)
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
