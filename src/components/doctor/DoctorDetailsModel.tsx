import { memo } from 'react'
import { User, X, Building2, Plus, CheckCircle2, Briefcase, MapPin, Phone } from 'lucide-react'

// Import UI components
import { Button } from '@/components/ui/Button'

// Import Types files
import type { NPIResult } from '@/types/doctors/NpiType'

// Doctor Details Modal Component
interface DoctorDetailsModalProps {
  doctor: NPIResult
  onClose: () => void
  onAddToInternal?: (doctor: NPIResult) => void
  isAdded?: boolean
}

const DoctorDetailsModal = memo(function DoctorDetailsModal({ doctor, onClose, onAddToInternal, isAdded }: DoctorDetailsModalProps) {
  const basic = doctor.basic
  const addresses = doctor.addresses || []
  const taxonomies = doctor.taxonomies || []
  const primaryAddress = addresses.find((addr: { address_1?: string }) => addr.address_1)
  const primaryTaxonomy = taxonomies.find((tax: { primary?: boolean }) => tax.primary)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 z-10">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Doctor Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shrink-0">
              <User className="w-7 h-7 sm:w-10 sm:h-10 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                {basic?.first_name} {basic?.middle_name ? basic.middle_name + ' ' : ''}{basic?.last_name}
              </h4>
              {basic?.credential && <p className="text-base sm:text-lg text-gray-600">{basic.credential}</p>}
              <p className="text-sm text-gray-500 mt-1">NPI: {doctor?.basic?.npi}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  basic?.status === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {basic?.status === 'A' ? 'Active' : 'Inactive'}
                </span>
                {basic?.gender && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {basic.gender === 'M' ? 'Male' : basic.gender === 'F' ? 'Female' : 'Other'}
                  </span>
                )}
              </div>
            </div>
          </div>
          {primaryTaxonomy && (
            <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
              <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Primary Specialty
              </h5>
              <p className="text-blue-800 font-medium text-sm sm:text-base">{primaryTaxonomy.desc}</p>
              <p className="text-sm text-blue-600">Code: {primaryTaxonomy.code}</p>
              {primaryTaxonomy.primary && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-200 text-blue-800 text-xs rounded-full">
                  Primary Taxonomy
                </span>
              )}
            </div>
          )}
          {primaryAddress && (
            <div>
              <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                Primary Address
              </h5>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-gray-700 text-sm sm:text-base">
                <p>{primaryAddress.address_1}</p>
                {primaryAddress.address_2 && <p>{primaryAddress.address_2}</p>}
                <p>{primaryAddress.city}, {primaryAddress.state} {primaryAddress.postal_code}</p>
                {primaryAddress.telephone_number && (
                  <p className="flex items-center gap-2 mt-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {primaryAddress.telephone_number}
                  </p>
                )}
              </div>
            </div>
          )}
          {taxonomies.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-3">All Specialties & Taxonomy</h5>
              <div className="flex flex-wrap gap-2">
                {taxonomies.map((tax, idx) => (
                  <span
                    key={idx}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium ${
                      tax.primary
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tax.desc}
                    {tax.primary && <span className="ml-1 text-xs">(Primary)</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
          {doctor.practiceLocations && doctor.practiceLocations.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                Affiliated Organizations
              </h5>
              <div className="space-y-3">
                {doctor.practiceLocations.map((location, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{location.name || 'Unknown Organization'}</p>
                    {location.address && (
                      <p className="text-sm text-gray-600 mt-1">
                        {location.address.city}, {location.address.state}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-white flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 p-3 sm:p-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Close</Button>
          {onAddToInternal && (
            <Button
              onClick={() => onAddToInternal(doctor)}
              disabled={isAdded}
              className={`w-full sm:w-auto ${isAdded
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              }`}
            >
              {isAdded ? (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Added to System</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> Add to Internal System</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
})

export default DoctorDetailsModal
