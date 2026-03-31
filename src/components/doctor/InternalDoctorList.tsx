import { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, User, Trash2, Edit, Briefcase, MoreVertical, Eye, ChevronLeft, ChevronRight, Mail, Building } from 'lucide-react'
import { type AppDispatch, type RootState } from '@/app/store'
import { fetchLocalDoctors, deleteLocalDoctor, updateLocalDoctor } from '@/features/doctor/doctorThunk'
import { type LocalDoctor } from '@/features/doctor/doctorSlice'
import DoctorEditForm from './DoctorEditForm'
import DoctorViewModal from './DoctorViewModal'
import { type DoctorFormData } from '@/features/doctor/validation/doctorValidation'
import DeleteDialog from '@/components/ui/dialog/DeleteDialog'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function InternalDoctorList() {
  const dispatch = useDispatch<AppDispatch>()
  const { localDoctors } = useSelector((state: RootState) => state.doctors)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [viewingDoctor, setViewingDoctor] = useState<LocalDoctor | null>(null)
  const [editingDoctor, setEditingDoctor] = useState<LocalDoctor | null>(null)
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
        doctor.county?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    setActiveDropdown(null)
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
    setActiveDropdown(null)
  }, [])

  const handleViewDoctor = useCallback((doctor: LocalDoctor) => {
    setViewingDoctor(doctor)
    setActiveDropdown(null)
  }, [])

  const toggleDropdown = useCallback((doctorId: string) => {
    setActiveDropdown(activeDropdown === doctorId ? null : doctorId)
  }, [activeDropdown])

  const handleSaveEdit = useCallback(async (data: DoctorFormData) => {
    if (!editingDoctor?.id) return
    try {
      // Convert form data to update format
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
        county: data.county,
        postalCode: data.postalCode,
        gender: data.gender,
        contact: data.contact,
        email: data.email
      }

      await dispatch(updateLocalDoctor({ id: editingDoctor.id.toString(), updates }))
      setEditingDoctor(null)
      toast.success('Doctor updated successfully')
    } catch (error) {
      console.error('Failed to update doctor:', error)
      toast.error('Failed to update doctor')
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

  const handleCancelEdit = useCallback(() => {
    setEditingDoctor(null)
  }, [])

  const handleCloseViewModal = useCallback(() => {
    setViewingDoctor(null)
  }, [])

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Doctors
              </h1>
              <p className="text-gray-600 mt-1">Manage your doctor records</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, specialty, location, email, department..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
                      Email
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
                          {doctor.city && doctor.state
                            ? `${doctor.city}, ${doctor.state}`
                            : doctor.city || doctor.state || 'N/A'
                          }
                        </div>
                        {doctor.county && (
                          <div className="text-xs text-gray-500">{doctor.county}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {doctor.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDropdown(doctor.id)}
                            className="text-gray-600 hover:text-gray-800 p-2"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>

                          {activeDropdown === doctor.id && (
                            <>
                              {/* Backdrop to close dropdown when clicking outside */}
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveDropdown(null)}
                              />
                              {/* Dropdown menu */}
                              <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 animate-in slide-in-from-right-2 duration-200">
                                <div className="py-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewDoctor(doctor)}
                                    className="flex items-center w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md mx-1"
                                  >
                                    <Eye className="w-4 h-4 mr-3 text-gray-400" />
                                    View Details
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditDoctor(doctor)}
                                    className="flex items-center w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md mx-1"
                                  >
                                    <Edit className="w-4 h-4 mr-3 text-blue-400" />
                                    Edit Doctor
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveDoctor(doctor.id, formatFullName(doctor))}
                                    className="flex items-center w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md mx-1"
                                  >
                                    <Trash2 className="w-4 h-4 mr-3 text-red-400" />
                                    Delete Doctor
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, filteredDoctors.length)} of {filteredDoctors.length} doctors
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center px-3 py-2 text-sm text-gray-700">
                Page {page} of {Math.ceil(filteredDoctors.length / perPage) || 1}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(Math.ceil(filteredDoctors.length / perPage), page + 1))}
                disabled={page >= Math.ceil(filteredDoctors.length / perPage)}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Edit Doctor Modal */}
        {editingDoctor && (
          <DoctorEditForm
            doctor={editingDoctor}
            onCancel={handleCancelEdit}
            onSave={handleSaveEdit}
          />
        )}

        {/* View Doctor Modal */}
        {viewingDoctor && (
          <DoctorViewModal
            doctor={viewingDoctor}
            isOpen={!!viewingDoctor}
            onClose={handleCloseViewModal}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Delete Doctor"
          message={`Are you sure you want to delete ${deleteDialog.doctorName}? This action cannot be undone.`}
        />
      </div>
    </div>
  )
}
