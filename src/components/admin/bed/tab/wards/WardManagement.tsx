import { useState, useCallback } from 'react'

// Import icons file
import { Plus, Search, Edit2, Trash2, Building2, Users, BedSingle } from 'lucide-react'

// Import components
import { Button } from '@/components/common/Button'
import Input from '@/components/common/Input'

// Import types
import type { RootState, AppDispatch } from '@/app/store'
import type { Ward } from '@/types/bed/bedType'


// Import redux
import { useSelector, useDispatch } from 'react-redux'

// Import thunks
import { deleteWard } from '@/features/bed/bedThunk'

// Import components
import ConfirmationDialog from '@/components/common/dialog/ConfirmationDialog'
import AddEditWard from '@/components/admin/bed/tab/wards/AddEditWard'
import ThreeDotMenu from '@/components/common/ThreeDotMenu'

// Import toast
import toast from 'react-hot-toast'

interface WardManagementProps {
  onWardClick?: (ward: Ward) => void
}

const WardManagement = ({ onWardClick }: WardManagementProps) => {

  const dispatch = useDispatch<AppDispatch>()
  const { wards, beds, loading } = useSelector((state: RootState) => state.beds)

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [editingWard, setEditingWard] = useState<Ward | null>(null)
  const [wardToDelete, setWardToDelete] = useState<Ward | null>(null)

  const filteredWards = wards.filter(ward =>
    ward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ward.floor.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getBedCountForWard = useCallback((wardId: string) => {
    return beds.filter(bed => bed.ward === wardId).length
  }, [beds])

  const getOccupiedCountForWard = useCallback((wardId: string) => {
    return beds.filter(bed => bed.ward === wardId && bed.status === 'occupied').length
  }, [beds])

  const truncateWardName = useCallback((name: string, maxLength: number = 15) => {
    if (!name || name.length <= maxLength) {
      return name
    }
    return name.substring(0, maxLength) + '...'
  }, [])

  const handleOpenModal = useCallback((ward?: Ward) => {
    if (ward) {
      setEditingWard(ward)
    } else {
      setEditingWard(null)
    }
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingWard(null)
  }, [])


  const handleDeleteClick = useCallback((ward: Ward) => {
    setWardToDelete(ward)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (wardToDelete) {
      try {
        await dispatch(deleteWard(wardToDelete.wardId)).unwrap()
        toast.success(`Deleted ward successfully!`)
      } catch (error) {
        console.error('Error deleting ward:', error)
        toast.error('Failed to delete ward. Please try again.')
      }
    }
    setIsDeleteDialogOpen(false)
    setWardToDelete(null)
  }, [dispatch, wardToDelete])

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">Ward Management</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage hospital wards and their bed capacity</p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 w-full sm:w-auto justify-center shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Ward
          </Button>
        </div>

        {/* Search */}
        <div className="mt-4 sm:mt-6">
          <Input
            type="text"
            placeholder="Search wards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
            iconPosition="left"
            className="text-sm border-gray-200"
          />
        </div>
      </div>

      {/* Wards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredWards.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No wards found</p>
          </div>
        ) : (
          filteredWards.map(ward => {
            const bedCount = getBedCountForWard(ward.wardId)
            const occupiedCount = getOccupiedCountForWard(ward.wardId)
            const availableCount = bedCount - occupiedCount
            const occupancyRate = bedCount > 0 ? Math.round((occupiedCount / bedCount) * 100) : 0

            return (
              <div
                key={ward.wardId}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onWardClick?.(ward)}
              >
                {/* Ward Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {truncateWardName(ward.name)}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">Floor {ward.floor}</p>
                    </div>
                  </div>
                  <div className="relative ml-3" onClick={(e) => e.stopPropagation()}>
                    <ThreeDotMenu
                      items={[
                        {
                          label: 'Edit',
                          onClick: () => handleOpenModal(ward),
                          icon: <Edit2 className="w-4 h-4" />,
                          className: 'text-gray-700'
                        },
                        {
                          label: 'Delete',
                          onClick: () => handleDeleteClick(ward),
                          icon: <Trash2 className="w-4 h-4" />,
                          className: 'text-red-600'
                        }
                      ]}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                  <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                      <BedSingle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-[10px] sm:text-xs">Total</span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">{bedCount}</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <BedSingle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-[10px] sm:text-xs">Free</span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-green-700">{availableCount}</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-[10px] sm:text-xs">Occ</span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-red-700">{occupiedCount}</p>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Occupancy Rate</span>
                    <span className={`font-medium ${
                      occupancyRate >= 90 ? 'text-red-600' :
                      occupancyRate >= 70 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {occupancyRate}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancyRate >= 90 ? 'bg-red-500' :
                        occupancyRate >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] sm:text-xs text-gray-500 truncate">
                    ID: {ward.wardId}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    bedCount >= ward.totalBeds
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {bedCount >= ward.totalBeds ? 'At Capacity' : 'Available'}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddEditWard
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingWard={editingWard}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Ward"
        message={`Are you sure you want to delete ${wardToDelete?.name}? This will also delete ${getBedCountForWard(wardToDelete?.wardId || '')} bed(s) in this ward. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  )
}

export default WardManagement
