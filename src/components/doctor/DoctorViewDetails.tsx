import { useMemo, useCallback } from 'react'
import { User, MapPin, Phone, Briefcase, Calendar } from 'lucide-react'
import { FormButton } from '@/components/common/FormButton'
import GenericDialog from '@/components/common/dialog/GenericDialog'
import type { LocalDoctor } from '@/types/doctors/doctorType'

interface DoctorViewModalProps {
  doctor: LocalDoctor | null
  isOpen: boolean
  onClose: () => void
}

export default function DoctorViewDetails({
  doctor,
  isOpen,
  onClose
}: DoctorViewModalProps) {
  const formattedAddedDate = useMemo(() => {
    if (!doctor?.addedAt) return null
    return new Date(doctor.addedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [doctor])

  const genderDisplay = useMemo(() => {
    if (!doctor?.gender) return null
    return doctor.gender === 'M' ? 'Male' : doctor.gender === 'F' ? 'Female' : 'Other'
  }, [doctor])

  const addressDisplay = useMemo(() => {
    if (!doctor) return null
    const hasAddress = doctor.address || doctor.city || doctor.state
    return hasAddress
  }, [doctor])

  const formatFullName = useCallback((doctor: LocalDoctor) => {
    const parts = []
    if (doctor.firstName) parts.push(doctor.firstName)
    if (doctor.middleName) parts.push(doctor.middleName)
    if (doctor.lastName) parts.push(doctor.lastName)
    if (doctor.credential) parts.push(`, ${doctor.credential}`)
    return parts.join(' ')
  }, [])

  if (!isOpen || !doctor) {
    return null
  }

  const footerContent = (
    <div className="flex justify-end">
      <FormButton
        onClick={onClose}
        variant="outline"
        className="border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        Close
      </FormButton>
    </div>
  )

  return (
    <GenericDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Doctor Details"
      titleClass="text-gray-900"
      showDefaultButtons={false}
      footer={footerContent}
    >
      <div className="flex items-start gap-6">
        <div className="shrink-0">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{formatFullName(doctor)}</h3>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-gray-600">NPI: {doctor.npi}</p>
              <p className="text-gray-600">ID: {doctor.id}</p>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-3">
            {doctor.specialty && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">Specialty:</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {doctor.specialty}
                </span>
              </div>
            )}

            {doctor.credential && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Credentials:</span>
                <span className="text-gray-600">{doctor.credential}</span>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="space-y-3">
            {doctor.gender && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">Gender:</span>
                <span className="text-gray-600">
                  {genderDisplay}
                </span>
              </div>
            )}

            {doctor.middleName && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Middle Name:</span>
                <span className="text-gray-600">{doctor.middleName}</span>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            {doctor.contact && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">Contact:</span>
                <a
                  href={`tel:${doctor.contact}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {doctor.contact}
                </a>
              </div>
            )}
          </div>

          {/* Address Information */}
          {addressDisplay && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <span className="font-medium text-gray-700">Address:</span>
                <p className="text-gray-600">
                  {doctor.address && <>{doctor.address}<br /></>}
                  {doctor.city && doctor.state && (
                    <>{doctor.city}, {doctor.state} {doctor.postalCode}<br /></>
                  )}
                  {doctor.country && <>{doctor.country}</>}
                </p>
              </div>
            </div>
          )}

          {/* Timeline Information */}
          <div className="space-y-3">
            {doctor.addedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">Added to System:</span>
                <span className="text-gray-600">
                  {formattedAddedDate}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </GenericDialog>
  )
}
