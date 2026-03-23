import { X, User, MapPin, Phone, Briefcase, Calendar } from 'lucide-react'
import { type NPIResult, type NPIAddress } from '@/features/doctor/doctorSlice'

interface DoctorProfileProps {
  doctor: NPIResult | null
  onClose: () => void
}

export default function DoctorProfile({ doctor, onClose }: DoctorProfileProps) {
  if (!doctor) return null

  const basic = doctor.basic
  const primaryTaxonomy = doctor.taxonomies?.find(tax => tax.primary)

  const formatFullName = () => {
    const parts = []
    if (basic?.first_name) parts.push(basic.first_name)
    if (basic?.middle_name) parts.push(basic.middle_name)
    if (basic?.last_name) parts.push(basic.last_name)
    if (basic?.credential) parts.push(`, ${basic.credential}`)
    return parts.join(' ')
  }

  const formatAddress = (address: NPIAddress) => {
    const parts = []
    if (address.address_1) parts.push(address.address_1)
    if (address.address_2) parts.push(address.address_2)
    if (address.city || address.state || address.postal_code) {
      const cityState = [address.city, address.state]
        .filter(Boolean)
        .join(', ')
      parts.push(cityState)
      if (address.postal_code) parts.push(address.postal_code)
    }
    if (address.country_code && address.country_code !== 'US') {
      parts.push(address.country_code)
    }
    return parts.join(', ')
  }

  const formatPhone = (phone: string) => {
    if (!phone) return 'Not available'
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
    }
    return phone
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Doctor Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {formatFullName() || 'Unknown Doctor'}
                </h3>
                {basic?.npi && (
                  <p className="text-lg text-gray-600">NPI: {basic.npi}</p>
                )}
                {basic?.status && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium">
                    {basic.status === 'A' ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-700">Active</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-yellow-700">{basic.status}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {basic?.gender && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <User className="w-4 h-4" />
                    Gender
                  </div>
                  <p className="font-semibold text-gray-900 capitalize">{basic.gender}</p>
                </div>
              )}

              {basic?.enumeration_date && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    Enumeration Date
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatDate(basic.enumeration_date)}
                  </p>
                </div>
              )}

              {basic?.last_updated && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    Last Updated
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatDate(basic.last_updated)}
                  </p>
                </div>
              )}

              {primaryTaxonomy && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Briefcase className="w-4 h-4" />
                    Primary Specialty
                  </div>
                  <p className="font-semibold text-gray-900">{primaryTaxonomy.desc}</p>
                  <p className="text-xs text-gray-500 mt-1">{primaryTaxonomy.code}</p>
                </div>
              )}
            </div>
          </div>

          {/* Addresses */}
          {doctor.addresses && doctor.addresses.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Addresses
              </h4>
              <div className="space-y-4">
                {doctor.addresses.map((address, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">
                          {index === 0 ? 'Practice Location' : 'Mailing Address'}
                        </h5>
                        <p className="text-gray-700">{formatAddress(address)}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Contact</h5>
                        {address.telephone_number && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-4 h-4" />
                            <span>{formatPhone(address.telephone_number)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Taxonomies */}
          {doctor.taxonomies && doctor.taxonomies.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Specialties & Taxonomies
              </h4>
              <div className="space-y-3">
                {doctor.taxonomies.map((taxonomy, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 ${
                      taxonomy.primary ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-gray-900">{taxonomy.desc}</h5>
                          {taxonomy.primary && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Code: {taxonomy.code}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
