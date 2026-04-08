import { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import type { RootState, AppDispatch } from '@/app/store'
import { createBed, updateBed, deleteBed } from '@/features/bed/bedThunk'
import type { Bed, BedStatus } from '@/features/bed/bedSlice'
import { Button } from '@/components/ui/Button'
import DeleteDialog from '@/components/ui/dialog/DeleteDialog'
import AddEditBedDialog from './dialog/AddEditBedDialog'
import { Plus, Search, Edit2, Trash2, Bed as BedIcon } from 'lucide-react'

interface BedFormData {
  ward: string
  status: BedStatus
  notes?: string
}

interface BedManagementProps {
  onBedClick?: (bed: Bed) => void
}

const BedManagement = ({ onBedClick }: BedManagementProps) => {

  // Redux dispatch and selector
  const dispatch = useDispatch<AppDispatch>()
  const { beds, wards, loading } = useSelector((state: RootState) => state.beds)

  // State management
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterWard, setFilterWard] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [editingBed, setEditingBed] = useState<Bed | null>(null)
  const [bedToDelete, setBedToDelete] = useState<Bed | null>(null)

  // Filter beds based on search, ward, and status
  const filteredBeds = beds.filter(bed => {
    const matchesSearch = bed.bedId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        bed.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (bed.patientId && bed.patientId.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesWard = filterWard === 'all' || bed.ward === filterWard
    const matchesStatus = filterStatus === 'all' || bed.status === filterStatus
    return matchesSearch && matchesWard && matchesStatus
  })

  // Methods
  // Handle modal open
  const handleOpenModal = useCallback((bed?: Bed) => {
    if (bed) {
      setEditingBed(bed)
    } else {
      setEditingBed(null)
    }
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingBed(null)
  }, [])

  const handleSubmit = useCallback(async (formData: BedFormData) => {
    if (editingBed) {
      try {
        await dispatch(updateBed({ bedId: editingBed.bedId, data: formData })).unwrap()
        toast.success('Bed updated successfully!')
      } catch {
        toast.error('Failed to update bed')
      }
    } else {
      try {
        await dispatch(createBed({
          ward: formData.ward,
          status: formData.status,
          notes: formData.notes
        })).unwrap()
        toast.success('Bed created successfully!')
      } catch {
        toast.error('Failed to create bed')
      }
    }
    handleCloseModal()
  }, [dispatch, editingBed, handleCloseModal])

  const handleDeleteClick = useCallback((bed: Bed) => {
    setBedToDelete(bed)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (bedToDelete) {
      try {
        await dispatch(deleteBed(bedToDelete.bedId)).unwrap()
        toast.success('Bed deleted successfully!')
      } catch {
        toast.error('Failed to delete bed')
      }
    }
    setIsDeleteDialogOpen(false)
    setBedToDelete(null)
  }, [dispatch, bedToDelete])

  const getStatusColor = (status: BedStatus) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200'
      case 'occupied': return 'bg-red-100 text-red-700 border-red-200'
      case 'reserved': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'maintenance': return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: BedStatus) => {
    switch (status) {
      case 'available': return '🟢'
      case 'occupied': return '🔴'
      case 'reserved': return '🟡'
      case 'maintenance': return '⚫'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Bed Management</h2>
            <p className="text-gray-500 text-sm mt-1">Manage hospital beds and their assignments</p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Bed
          </Button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search beds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterWard}
              onChange={(e) => setFilterWard(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Wards</option>
              {wards.map(ward => (
                <option key={ward.wardId} value={ward.wardId}>{ward.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Beds Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBeds.length === 0 ? (
          <div className="text-center py-12">
            <BedIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No beds found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Bed ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Ward</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Patient</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Admitted</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBeds.map(bed => (
                  <tr
                    key={bed.bedId}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onBedClick?.(bed)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{bed.bedId}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {wards.find(w => w.wardId === bed.ward)?.name || bed.ward}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(bed.status)}`}>
                        {getStatusIcon(bed.status)} {bed.status.charAt(0).toUpperCase() + bed.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{bed.patientId || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {bed.admittedAt ? new Date(bed.admittedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                      <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenModal(bed)
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(bed)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddEditBedDialog
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingBed={editingBed}
        wards={wards}
      />

      {/* Delete Confirmation */}
      <DeleteDialog
        isOpenDelete={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        deleteTitle="Delete Bed"
        itemName={bedToDelete?.bedId}
        description="Are you sure you want to delete this bed? This action cannot be undone and any patient assigned will be removed."
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default BedManagement
