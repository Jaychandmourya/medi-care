import { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  User,
  MapPin,
  Phone,
  Briefcase,
  Plus,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { type AppDispatch } from '@/app/store'
import { addLocalDoctor } from '@/features/doctor/doctorSlice'
import { doctorDBOperations } from '@/features/doctor/db/doctorDB'
import { type NPIResult } from '@/features/doctor/doctorSlice'

interface DoctorCardProps {
  doctor: NPIResult
  onViewDetails: (doctor: NPIResult) => void
  isAdded?: boolean
}

export default function DoctorCard({ doctor, onViewDetails, isAdded = false }: DoctorCardProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(isAdded)

  const basic = doctor.basic
  const primaryAddress = doctor.addresses?.find(addr => addr.address_1)
  const primaryTaxonomy = doctor.taxonomies?.find(tax => tax.primary)

  const formatFullName = () => {
    const parts = []
    if (basic?.first_name) parts.push(basic.first_name)
    if (basic?.middle_name) parts.push(basic.middle_name)
    if (basic?.last_name) parts.push(basic.last_name)
    if (basic?.credential) parts.push(`, ${basic.credential}`)
    return parts.join(' ')
  }

  const formatAddress = () => {
    if (!primaryAddress) return 'No address available'
    const parts = []
    if (primaryAddress.address_1) parts.push(primaryAddress.address_1)
    if (primaryAddress.address_2) parts.push(primaryAddress.address_2)
    if (primaryAddress.city || primaryAddress.state || primaryAddress.postal_code) {
      const cityState = [primaryAddress.city, primaryAddress.state]
        .filter(Boolean)
        .join(', ')
      parts.push(cityState)
      if (primaryAddress.postal_code) parts.push(primaryAddress.postal_code)
    }
    return parts.join(', ')
  }

  const formatPhone = () => {
    if (!primaryAddress?.telephone_number) return 'No phone available'
    const phone = primaryAddress.telephone_number
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
    }
    return phone
  }

  const handleAddToSystem = async () => {
    if (!basic?.npi) return

    setAdding(true)
    try {
      // Check if already exists
      const existing = await doctorDBOperations.findByNPI(basic.npi)
      if (existing) {
        setAdded(true)
        return
      }

      // Add to database
      const doctorData = {
        npi: basic.npi,
        firstName: basic.first_name || '',
        lastName: basic.last_name || '',
        middleName: basic.middle_name,
        credential: basic.credential,
        gender: basic.gender,
        specialty: primaryTaxonomy?.desc,
        address: formatAddress(),
        city: primaryAddress?.city,
        state: primaryAddress?.state,
        postalCode: primaryAddress?.postal_code,
        phone: primaryAddress?.telephone_number
      }

      await doctorDBOperations.add(doctorData)

      // Add to Redux store
      dispatch(addLocalDoctor({
        ...doctorData,
        id: Date.now(), // Temporary ID, will be replaced by DB
        addedAt: new Date().toISOString()
      }))

      setAdded(true)
    } catch (error) {
      console.error('Failed to add doctor:', error)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Doctor Info */}
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {formatFullName() || 'Unknown Doctor'}
              </h3>
              {basic?.npi && (
                <p className="text-sm text-gray-500">NPI: {basic.npi}</p>
              )}
            </div>
          </div>

          {/* Specialty */}
          {primaryTaxonomy?.desc && (
            <div className="mt-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{primaryTaxonomy.desc}</span>
            </div>
          )}

          {/* Address */}
          {primaryAddress && (
            <div className="mt-2 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="text-sm text-gray-600">
                <div>{formatAddress()}</div>
              </div>
            </div>
          )}

          {/* Phone */}
          {primaryAddress?.telephone_number && (
            <div className="mt-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{formatPhone()}</span>
            </div>
          )}

          {/* Status */}
          {basic?.status && (
            <div className="mt-2 flex items-center gap-2">
              {basic.status === 'A' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Active</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">{basic.status}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 lg:ml-4">
          <button
            onClick={() => onViewDetails(doctor)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>

          {!added && (
            <button
              onClick={handleAddToSystem}
              disabled={adding}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {adding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to System
                </>
              )}
            </button>
          )}

          {added && (
            <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md">
              <CheckCircle className="w-4 h-4" />
              Added to System
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
