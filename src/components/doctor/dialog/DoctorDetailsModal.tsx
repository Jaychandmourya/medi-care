import { useMemo, useCallback } from 'react'
import { User, MapPin, Phone, Briefcase, Calendar, Clock, CheckCircle, AlertCircle, Hash, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { AutocompleteDoctor } from '@/types/doctors/doctorType'

// Interface
interface DoctorDetailsModalProps {
  selectedDoctor: AutocompleteDoctor | null
  showDetailsModal: boolean
  onCloseModal: () => void
  onAddToSystem: (doctor: AutocompleteDoctor) => void
  adding: boolean
}

export default function DoctorDetailsModal({
  selectedDoctor,
  showDetailsModal,
  onCloseModal,
  onAddToSystem,
  adding
}: DoctorDetailsModalProps) {

  const formattedEnumerationDate = useMemo(() => {
    if (!selectedDoctor?.enumerationDate) return null
    return new Date(selectedDoctor.enumerationDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [selectedDoctor])

  const formattedLastUpdatedDate = useMemo(() => {
    if (!selectedDoctor?.lastUpdated) return null
    return new Date(selectedDoctor.lastUpdated).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [selectedDoctor])

  const genderDisplay = useMemo(() => {
    if (!selectedDoctor?.gender) return null
    return selectedDoctor.gender === 'M' ? 'Male' : selectedDoctor.gender === 'F' ? 'Female' : 'Other'
  }, [selectedDoctor])

  const addressDisplay = useMemo(() => {
    if (!selectedDoctor) return null
    const hasAddress = selectedDoctor.address || selectedDoctor.city || selectedDoctor.state
    return hasAddress
  }, [selectedDoctor])

  const handleAddToSystem = useCallback(() => {
    if (selectedDoctor) {
      onAddToSystem(selectedDoctor)
      onCloseModal()
    }
  }, [selectedDoctor, onAddToSystem, onCloseModal])

  if (!showDetailsModal || !selectedDoctor) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Doctor Details</h2>
          <button
            onClick={onCloseModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-6">
            <div className="shrink-0">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
            </div>

            <div className="flex-1 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedDoctor.fullName}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-gray-600">NPI: {selectedDoctor.npi}</p>
                  {selectedDoctor.status && (
                    <div className="flex items-center gap-1">
                      {selectedDoctor.status === 'Active' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        selectedDoctor.status === 'Active' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {selectedDoctor.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-3">
                {selectedDoctor.specialty && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">Specialty:</span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {selectedDoctor.specialty}
                    </span>
                    {selectedDoctor.taxonomyCode && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Code: {selectedDoctor.taxonomyCode}
                      </span>
                    )}
                  </div>
                )}

                {selectedDoctor.credential && (
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">Credentials:</span>
                    <span className="text-gray-600">{selectedDoctor.credential}</span>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className="space-y-3">
                {selectedDoctor.gender && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">Gender:</span>
                    <span className="text-gray-600">
                      {genderDisplay}
                    </span>
                  </div>
                )}

                {selectedDoctor.middleName && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">Middle Name:</span>
                    <span className="text-gray-600">{selectedDoctor.middleName}</span>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                {selectedDoctor.contact && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">Contact:</span>
                    <a
                      href={`tel:${selectedDoctor.contact}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {selectedDoctor.contact}
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
                      {selectedDoctor.address && <>{selectedDoctor.address}<br /></>}
                      {selectedDoctor.address2 && <>{selectedDoctor.address2}<br /></>}
                      {selectedDoctor.city && selectedDoctor.state && (
                        <>{selectedDoctor.city}, {selectedDoctor.state} {selectedDoctor.postalCode}<br /></>
                      )}
                      {selectedDoctor.country && <>{selectedDoctor.country}</>}
                    </p>
                  </div>
                </div>
              )}

              {/* Timeline Information */}
              <div className="space-y-3">
                {selectedDoctor.enumerationDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">Enumeration Date:</span>
                    <span className="text-gray-600">
                      {formattedEnumerationDate}
                    </span>
                  </div>
                )}

                {selectedDoctor.lastUpdated && (
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

          <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3 justify-end">
            <Button
              onClick={onCloseModal}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
            <Button
              onClick={handleAddToSystem}
              loading={adding}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to System
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}