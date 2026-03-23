import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, User, Trash2, Phone, MapPin, Briefcase } from 'lucide-react'
import { type AppDispatch, type RootState } from '@/app/store'
import { removeLocalDoctor, setLocalDoctors } from '@/features/doctor/doctorSlice'
import { doctorDBOperations } from '@/features/doctor/db/doctorDB'
import { type LocalDoctor } from '@/features/doctor/doctorSlice'

export default function InternalDoctorList() {
  const dispatch = useDispatch<AppDispatch>()
  const { localDoctors } = useSelector((state: RootState) => state.doctors)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredDoctors, setFilteredDoctors] = useState<LocalDoctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLocalDoctors()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDoctors(localDoctors)
    } else {
      const filtered = localDoctors.filter(doctor =>
        doctor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.npi.includes(searchQuery) ||
        doctor.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.state?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredDoctors(filtered)
    }
  }, [searchQuery, localDoctors])

  const loadLocalDoctors = async () => {
    try {
      setLoading(true)
      const doctors = await doctorDBOperations.getAll()
      dispatch(setLocalDoctors(doctors))
    } catch (error) {
      console.error('Failed to load local doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDoctor = async (id: number) => {
    try {
      await doctorDBOperations.remove(id)
      dispatch(removeLocalDoctor(id))
    } catch (error) {
      console.error('Failed to remove doctor:', error)
    }
  }

  const formatFullName = (doctor: LocalDoctor) => {
    const parts = []
    if (doctor.firstName) parts.push(doctor.firstName)
    if (doctor.middleName) parts.push(doctor.middleName)
    if (doctor.lastName) parts.push(doctor.lastName)
    if (doctor.credential) parts.push(`, ${doctor.credential}`)
    return parts.join(' ')
  }

  const formatPhone = (phone?: string) => {
    if (!phone) return 'Not available'
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
    }
    return phone
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search local doctors..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Doctor Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
          {searchQuery && ` found for "${searchQuery}"`}
        </p>
      </div>

      {/* Doctor List */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No doctors found' : 'No doctors in system'}
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Add doctors from the NPI registry to get started'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Doctor Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatFullName(doctor)}
                      </h3>
                      <p className="text-sm text-gray-500">NPI: {doctor.npi}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Added: {new Date(doctor.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Specialty */}
                  {doctor.specialty && (
                    <div className="mt-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{doctor.specialty}</span>
                    </div>
                  )}

                  {/* Address */}
                  {doctor.address && (
                    <div className="mt-2 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <div>{doctor.address}</div>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {doctor.phone && (
                    <div className="mt-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatPhone(doctor.phone)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemoveDoctor(doctor.id!)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
