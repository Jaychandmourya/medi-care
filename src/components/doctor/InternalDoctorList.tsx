import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react'
import toast from 'react-hot-toast'

// Import icons file
import { Search, User, Trash2, Edit, Briefcase, Eye, Building, Plus } from 'lucide-react'

// Import UI components
import { Button } from '@/components/common/Button'
import Pagination from '@/components/common/Pagination'
import ThreeDotMenu from '@/components/common/ThreeDotMenu'
import Input from '@/components/common/Input'

// Import Types files
import { type AppDispatch, type RootState } from '@/app/store'
import type { LocalDoctor } from '@/types/doctors/doctorType'
import { type DoctorFormData } from '@/features/doctor/validation/doctorValidation'

// Import dispatch and selector for redux
import { useDispatch, useSelector } from 'react-redux'

// Import Thunk file for redux
import { fetchLocalDoctors, deleteLocalDoctor, updateLocalDoctor, addLocalDoctor } from '@/features/doctor/doctorThunk'

// Lazy loaded components
const DoctorAddEditForm = lazy(() => import('@/components/doctor/DoctorAddEditForm'))
const DoctorViewDetails = lazy(() => import('@/components/doctor/DoctorViewDetails'))
const ConfirmationDialog = lazy(() => import('@/components/common/dialog/ConfirmationDialog'))

export default function InternalDoctorList() {

  const dispatch = useDispatch<AppDispatch>()
  const { localDoctors } = useSelector((state: RootState) => state.doctors)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [viewingDoctor, setViewingDoctor] = useState<LocalDoctor | null>(null)
  const [editingDoctor, setEditingDoctor] = useState<LocalDoctor | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    doctorId: string
    doctorName: string
  }>({ isOpen: false, doctorId: '', doctorName: '' })
  const perPage = 10

  const filteredDoctors = useMemo(() => {
    if (searchQuery.trim() === '') {
      return localDoctors
    } else {
      return localDoctors.filter(doctor =>
        doctor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.gender?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
  }, [searchQuery, localDoctors])

  const paginatedDoctors = useMemo(() => {
    return filteredDoctors.slice((page - 1) * perPage, page * perPage)
  }, [filteredDoctors, page])

  const loadLocalDoctors = useCallback(() => {
    dispatch(fetchLocalDoctors())
  }, [dispatch])

  useEffect(() => {
    loadLocalDoctors()
  }, [loadLocalDoctors])

  const handleRemoveDoctor = useCallback((doctorId: string, doctorName: string) => {
    setDeleteDialog({
      isOpen: true,
      doctorId,
      doctorName
    })
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteDialog.doctorId) return

    try {
      await dispatch(deleteLocalDoctor(deleteDialog.doctorId))
      toast.success('Doctor deleted successfully')
    } catch (error) {
      console.error('Failed to remove doctor:', error)
      toast.error('Failed to delete doctor')
    } finally {
      setDeleteDialog({ isOpen: false, doctorId: '', doctorName: '' })
    }
  }, [deleteDialog.doctorId, dispatch])

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialog({ isOpen: false, doctorId: '', doctorName: '' })
  }, [])

  const handleEditDoctor = useCallback((doctor: LocalDoctor) => {
    setEditingDoctor(doctor)
    setIsAddingNew(false)
  }, [])

  const handleAddNewDoctor = useCallback(() => {
    setIsAddingNew(true)
    setEditingDoctor(null)
  }, [])

  const handleSaveNewDoctor = useCallback(async (data: DoctorFormData, shouldCloseDialog: boolean = true): Promise<LocalDoctor | void> => {
    try {
      // Generate a temporary NPI for local doctors (not from NPI registry)
      const tempNpi = `LOCAL-${Date.now()}`

      const newDoctor = {
        npi: tempNpi,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        credential: data.credential,
        gender: data.gender,
        specialty: data.specialty,
        department: data.department,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        contact: data.contact,
        email: data.email,
        addedAt: new Date().toISOString()
      }

      const result = await dispatch(addLocalDoctor(newDoctor)).unwrap()
      if (shouldCloseDialog) {
        setIsAddingNew(false)
      }
      toast.success('Doctor added successfully')
      return result
    } catch (error) {
      console.error('Failed to add doctor:', error)
      toast.error('Failed to add doctor')
      throw error
    }
  }, [dispatch])

  const handleViewDoctor = useCallback((doctor: LocalDoctor) => {
    setViewingDoctor(doctor)
  }, [])

  const handleSaveEdit = useCallback(async (data: DoctorFormData, shouldCloseDialog: boolean = true): Promise<void> => {
    if (!editingDoctor?.id) return
    try {
      const updates: Partial<LocalDoctor> = {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        credential: data.credential,
        specialty: data.specialty,
        department: data.department,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        gender: data.gender,
        contact: data.contact,
        email: data.email
      }

      await dispatch(updateLocalDoctor({ id: editingDoctor.id.toString(), updates })).unwrap()
      if (shouldCloseDialog) {
        setEditingDoctor(null)
      }
      toast.success('Doctor updated successfully')
    } catch (error) {
      console.error('Failed to update doctor:', error)
      toast.error('Failed to update doctor')
      throw error
    }
  }, [editingDoctor, dispatch])

  const formatFullName = useCallback((doctor: LocalDoctor) => {
    const parts = []
    if (doctor.firstName) parts.push(doctor.firstName)
    if (doctor.middleName) parts.push(doctor.middleName)
    if (doctor.lastName) parts.push(doctor.lastName)
    if (doctor.credential) parts.push(`, ${doctor.credential}`)
    return parts.join(' ')
  }, [])

  const formatWorkingDays = useCallback((days: number[]) => {
    if (!days || days.length === 0) return 'No working days'
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days.map(d => dayNames[d]).join(', ')
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingDoctor(null)
    setIsAddingNew(false)
  }, [])

  const handleCloseViewModal = useCallback(() => {
    setViewingDoctor(null)
  }, [])

  return (
    <div className="min-h-screen">
      <div className="space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Doctors
              </h1>
              <p className="text-gray-600 mt-1">Manage your doctor records</p>
            </div>
            <Button
              onClick={handleAddNewDoctor}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Add New Doctor
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, specialty, location, email, department..."
            icon={Search}
            className="pl-10!"
          />
        </div>

        {/* Responsive Table */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 backdrop-blur-sm bg-opacity-95 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
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
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden bg-opacity-95">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Specialty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedDoctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                            {doctor.firstName ? doctor.firstName.charAt(0).toUpperCase() : 'D'}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatFullName(doctor)}
                            </div>
                            {doctor.department && (
                              <div className="text-xs text-gray-500 flex items-center">
                                <Building className="w-3 h-3 mr-1" />
                                {doctor.department}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                          <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                          {doctor.specialty || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {doctor.address || 'N/A'}
                        </div>
                        {doctor.country && (
                          <div className="text-xs text-gray-500">{doctor.country}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {doctor.doctorSchedule ? (
                          <div className="text-sm text-gray-700">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs font-medium text-blue-600">
                                {doctor.doctorSchedule.startTime} - {doctor.doctorSchedule.endTime}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatWorkingDays(doctor.doctorSchedule.workingDays)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {doctor.doctorSchedule.slotDuration} min slots
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No schedule set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <ThreeDotMenu
                          items={[
                            {
                              label: 'View Details',
                              onClick: () => handleViewDoctor(doctor),
                              icon: <Eye className="w-4 h-4" />,
                              className: 'text-gray-700'
                            },
                            {
                              label: 'Edit Doctor',
                              onClick: () => handleEditDoctor(doctor),
                              icon: <Edit className="w-4 h-4" />,
                              className: 'text-gray-700'
                            },
                            {
                              label: 'Delete Doctor',
                              onClick: () => {
                                if (doctor.id) {
                                  handleRemoveDoctor(doctor.id, formatFullName(doctor))
                                }
                              },
                              icon: <Trash2 className="w-4 h-4" />,
                              className: 'text-red-600'
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={page}
          setPage={setPage}
          totalItems={filteredDoctors.length}
          perPage={perPage}
          itemName="doctors"
        />

        {/* Edit Doctor Modal */}
        {(editingDoctor || isAddingNew) && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
          <DoctorAddEditForm
            isOpen={!!(editingDoctor || isAddingNew)}
            doctor={editingDoctor || undefined}
            mode={isAddingNew ? 'add' : 'edit'}
            onSave={isAddingNew ? handleSaveNewDoctor : handleSaveEdit}
            onCancel={handleCancelEdit}
            onComplete={() => dispatch(fetchLocalDoctors())}
          />
        </Suspense>
      )}

        {/* View Doctor Modal */}
        {viewingDoctor && (
          <Suspense fallback={<div>Loading...</div>}>
            <DoctorViewDetails
              doctor={viewingDoctor}
              isOpen={!!viewingDoctor}
              onClose={handleCloseViewModal}
            />
          </Suspense>
        )}

        {/* Delete Confirmation Dialog */}
        <Suspense fallback={<div>Loading...</div>}>
          <ConfirmationDialog
            isOpen={deleteDialog.isOpen}
            title="Delete Doctor"
            message={`Are you sure you want to delete ${deleteDialog.doctorName}? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
            onConfirm={handleConfirmDelete}
            onCancel={handleCloseDeleteDialog}
          />
        </Suspense>
      </div>
    </div>
  )
}
