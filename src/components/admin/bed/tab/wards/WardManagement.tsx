import { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/app/store'
import { createWard, updateWard, deleteWard } from '@/features/bed/bedThunk'
import type { Ward } from '@/features/bed/bedSlice'
import { Button } from '@/components/ui/Button'
import DeleteDialog from '@/components/ui/dialog/DeleteDialog'
import { Plus, Search, Edit2, Trash2, Building2, Users, BedSingle } from 'lucide-react'

interface WardFormData {
  name: string
  floor: string
  totalBeds: number
}

interface WardManagementProps {
  onWardClick?: (ward: Ward) => void
}

const WardManagement = ({ onWardClick }: WardManagementProps) => {

  const dispatch = useDispatch<AppDispatch>()
  const { wards, beds, loading } = useSelector((state: RootState) => state.beds)

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingWard, setEditingWard] = useState<Ward | null>(null)
  const [wardToDelete, setWardToDelete] = useState<Ward | null>(null)
  const [formData, setFormData] = useState<WardFormData>({
    name: '',
    floor: '',
    totalBeds: 0
  })

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

  const handleOpenModal = useCallback((ward?: Ward) => {
    if (ward) {
      setEditingWard(ward)
      setFormData({
        name: ward.name,
        floor: ward.floor,
        totalBeds: ward.totalBeds
      })
    } else {
      setEditingWard(null)
      setFormData({ name: '', floor: '', totalBeds: 10 })
    }
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingWard(null)
    setFormData({ name: '', floor: '', totalBeds: 10 })
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingWard) {
      dispatch(updateWard({ wardId: editingWard.wardId, data: formData }))
    } else {
      dispatch(createWard({
        name: formData.name,
        floor: formData.floor,
        totalBeds: formData.totalBeds
      }))
    }
    handleCloseModal()
  }, [dispatch, editingWard, formData, handleCloseModal])

  const handleDeleteClick = useCallback((ward: Ward) => {
    setWardToDelete(ward)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (wardToDelete) {
      dispatch(deleteWard(wardToDelete.wardId))
    }
    setIsDeleteDialogOpen(false)
    setWardToDelete(null)
  }, [dispatch, wardToDelete])

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Ward Management</h2>
            <p className="text-gray-500 text-sm mt-1">Manage hospital wards and their bed capacity</p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Ward
          </Button>
        </div>

        {/* Search */}
        <div className="mt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search wards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Wards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onWardClick?.(ward)}
              >
                {/* Ward Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{ward.name}</h3>
                      <p className="text-sm text-gray-500">Floor {ward.floor}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenModal(ward)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(ward)
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                      <BedSingle className="w-4 h-4" />
                      <span className="text-xs">Total</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{bedCount}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <BedSingle className="w-4 h-4" />
                      <span className="text-xs">Free</span>
                    </div>
                    <p className="text-xl font-bold text-green-700">{availableCount}</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">Occ</span>
                    </div>
                    <p className="text-xl font-bold text-red-700">{occupiedCount}</p>
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
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingWard ? 'Edit Ward' : 'Add New Ward'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Cardiology Ward"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                <input
                  type="text"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="e.g., 1, 2, Ground"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Beds Capacity</label>
                <input
                  type="number"
                  value={formData.totalBeds}
                  onChange={(e) => setFormData({ ...formData, totalBeds: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is the target capacity. Actual beds can be added/removed separately.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingWard ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteDialog
        isOpenDelete={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        deleteTitle="Delete Ward"
        itemName={wardToDelete?.name}
        description={`Are you sure you want to delete this ward? This will also delete ${getBedCountForWard(wardToDelete?.wardId || '')} bed(s) in this ward. This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default WardManagement
