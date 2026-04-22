import { useMemo, useCallback } from 'react'
import { User, MapPin, Phone, Briefcase, Calendar, Clock, CheckCircle, AlertCircle, Hash, Plus } from 'lucide-react'
import { Button } from '@/components/common/Button'
import FormDialog from '@/components/common/dialog/FormDialog'
import type { NPIResult } from '@/types/doctors/NpiType'

// Interface
interface DoctorDetailsModalProps {
  selectedDoctor: NPIResult | null
  showDetailsModal: boolean
  onCloseModal: () => void
  onAddToSystem: (doctor: NPIResult) => void
  adding: boolean
}

export default function DoctorSearchDetails({
  selectedDoctor,
  showDetailsModal,
  onCloseModal,
  onAddToSystem,
  adding
}: DoctorDetailsModalProps) {

  const basic = selectedDoctor?.basic
  const primaryAddress = selectedDoctor?.addresses?.find((addr) => addr.address_1)
  const primaryTaxonomy = selectedDoctor?.taxonomies?.find((tax) => tax.primary)

  const formattedEnumerationDate = useMemo(() => {
    if (!basic?.enumeration_date) return null
    return new Date(basic.enumeration_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [basic])

  const formattedLastUpdatedDate = useMemo(() => {
    if (!basic?.last_updated) return null
    return new Date(basic.last_updated).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [basic])

  const genderDisplay = useMemo(() => {
    if (!basic?.gender) return null
    return basic.gender === 'M' ? 'Male' : basic.gender === 'F' ? 'Female' : 'Other'
  }, [basic])

  const addressDisplay = useMemo(() => {
    if (!selectedDoctor) return null
    const hasAddress = primaryAddress?.address_1 || primaryAddress?.city || primaryAddress?.state
    return hasAddress
  }, [primaryAddress, selectedDoctor])

  const handleAddToSystem = useCallback(() => {
    if (selectedDoctor) {
      onAddToSystem(selectedDoctor)
      onCloseModal()
    }
  }, [selectedDoctor, onAddToSystem, onCloseModal])

  // Custom footer with Close and Add to System buttons
  const footer = (
    <div className="flex gap-3 justify-end">
      <Button
        onClick={onCloseModal}
        variant="secondary"
      >
        Close
      </Button>
      <Button
        onClick={handleAddToSystem}
        loading={adding}
        customColor="bg-green-600 hover:bg-green-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add to System
      </Button>
    </div>
  )

  if (!selectedDoctor) {
    return null
  }

  return (
    <FormDialog
      isOpen={showDetailsModal}
      onClose={onCloseModal}
      title="Doctor Details"
      showDefaultButtons={false}
      footer={footer}
      maxWidth="max-w-2xl"
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
            <h3 className="text-xl font-semibold text-gray-900">
              {basic?.first_name} {basic?.middle_name ? basic.middle_name + ' ' : ''}{basic?.last_name}
              {basic?.credential && (
                <span className="ml-2 text-sm text-gray-500">{basic.credential}</span>
              )}
            </h3>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-gray-600">NPI: {basic?.npi}</p>
              {basic?.status && (
                <div className="flex items-center gap-1">
                  {basic.status === 'A' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    basic.status === 'A' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {basic.status === 'A' ? 'Active' : basic.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-3">
            {primaryTaxonomy?.desc && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">Specialty:</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {primaryTaxonomy.desc}
                </span>
                {primaryTaxonomy.code && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Code: {primaryTaxonomy.code}
                  </span>
                )}
              </div>
            )}

            {basic?.credential && (
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">Credentials:</span>
                <span className="text-gray-600">{basic.credential}</span>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="space-y-3">
            {basic?.gender && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">Gender:</span>
                <span className="text-gray-600">
                  {genderDisplay}
                </span>
              </div>
            )}

            {basic?.middle_name && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">Middle Name:</span>
                <span className="text-gray-600">{basic.middle_name}</span>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            {primaryAddress?.telephone_number && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">Contact:</span>
                <a
                  href={`tel:${primaryAddress.telephone_number}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {primaryAddress.telephone_number}
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
                  {primaryAddress?.address_1 && <>{primaryAddress.address_1}<br /></>}
                  {primaryAddress?.address_2 && <>{primaryAddress.address_2}<br /></>}
                  {primaryAddress?.city && primaryAddress?.state && (
                    <>{primaryAddress.city}, {primaryAddress.state} {primaryAddress.postal_code}<br /></>
                  )}
                  {selectedDoctor?.country && <>{selectedDoctor.country}</>}
                </p>
              </div>
            </div>
          )}

          {/* Timeline Information */}
          <div className="space-y-3">
            {basic?.enumeration_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">Enumeration Date:</span>
                <span className="text-gray-600">
                  {formattedEnumerationDate}
                </span>
              </div>
            )}

            {basic?.last_updated && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">Last Updated:</span>
                <span className="text-gray-600">
                  {formattedLastUpdatedDate}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormDialog>
  )
}