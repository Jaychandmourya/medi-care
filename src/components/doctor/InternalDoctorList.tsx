import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, User, Trash2, Edit, Phone, Briefcase } from 'lucide-react'
import { type AppDispatch, type RootState } from '@/app/store'
import { removeLocalDoctor, updateLocalDoctor, setLocalDoctors } from '@/features/doctor/doctorSlice'
import { doctorDBOperations } from '@/features/doctor/db/doctorDB'
import { type LocalDoctor } from '@/features/doctor/doctorSlice'
import DoctorEditForm from './DoctorEditForm'
import { type DoctorFormData } from '@/features/doctor/validation/doctorValidation'
import DeleteDialog from '@/components/ui/dialog/DeleteDialog'
import { Button } from '@/components/ui/Button'

export default function InternalDoctorList() {
  const dispatch = useDispatch<AppDispatch>()
  const { localDoctors } = useSelector((state: RootState) => state.doctors)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredDoctors, setFilteredDoctors] = useState<LocalDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [editingDoctor, setEditingDoctor] = useState<LocalDoctor | null>(null)
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    doctorId: null as number | null,
    doctorName: ''
  })

  useEffect(() => {
    loadLocalDoctors()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDoctors(localDoctors)
      console.log('filteredDoctors', localDoctors)
    } else {
      const filtered = localDoctors.filter(doctor =>
        doctor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.npi.includes(searchQuery) ||
        doctor.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.country?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleRemoveDoctor = (doctorId: number, doctorName: string) => {
    setDeleteDialog({
      isOpen: true,
      doctorId,
      doctorName
    })
  }

  const handleConfirmDelete = async () => {
    if (!deleteDialog.doctorId) return

    try {
      await doctorDBOperations.remove(deleteDialog.doctorId)
      dispatch(removeLocalDoctor(deleteDialog.doctorId))
      setDeleteDialog({ isOpen: false, doctorId: null, doctorName: '' })
    } catch (error) {
      console.error('Failed to remove doctor:', error)
      // You could add a toast notification here instead of alert
    }
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, doctorId: null, doctorName: '' })
  }

  const handleEditDoctor = (doctor: LocalDoctor) => {
    setEditingDoctor(doctor)
  }

  const handleSaveEdit = async (data: DoctorFormData) => {
    if (!editingDoctor?.id) return
    try {
      // Convert form data to update format
      const updates: Partial<LocalDoctor> = {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        credential: data.credential,
        email: data.email,
        specialty: data.specialty,
        address: data.address,
        city: data.city,
        state: data.state,
        county: data.county,
        postalCode: data.postalCode,
        phone: data.phone,
        contact: data.contact,
        gender: data.gender
      }

      await doctorDBOperations.update(editingDoctor.id, updates)
      dispatch(updateLocalDoctor({ id: editingDoctor.id, updates }))
      setEditingDoctor(null)
    } catch (error) {
      console.error('Failed to update doctor:', error)
      alert('Failed to update doctor')
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

      {/* Doctor Table */}
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NPI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.npi || `doctor-${doctor.firstName}-${doctor.lastName}-${Math.random()}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatFullName(doctor)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Added: {new Date(doctor.addedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doctor.specialty ? (
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">{doctor.specialty}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {doctor.address && <div>{doctor.address}</div>}
                        {(doctor.city || doctor.state || doctor.county) && (
                          <div className="text-xs text-gray-500">
                            {[doctor.city, doctor.state, doctor.county].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doctor.contact ? (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">{formatPhone(doctor.contact)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not available</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {doctor.npi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDoctor(doctor)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveDoctor(doctor.id!, formatFullName(doctor))}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingDoctor && (
        <DoctorEditForm
          doctor={editingDoctor}
          onSave={handleSaveEdit}
          onCancel={() => setEditingDoctor(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpenDelete={deleteDialog.isOpen}
        onClose={handleCloseDeleteDialog}
        deleteTitle="Remove Doctor"
        onConfirm={handleConfirmDelete}
        description="Are you sure you want to remove this doctor from the system? This action cannot be undone."
        itemName={deleteDialog.doctorName}
      />
    </div>
  )
}
