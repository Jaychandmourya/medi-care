import React, { useState } from 'react'
import type { Bed, BedStatus } from '@/features/bed/bedSlice'
import { X, User, Calendar, Clock, FileText, Save, UserPlus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'

interface BedDetailModalProps {
  bed: Bed | null
  onClose: () => void
  onUpdateStatus: (bedId: string, status: BedStatus, notes?: string) => void
  onAdmitPatient: (bedId: string, patientId: string) => void
  onDischargePatient: (bedId: string) => void
}

const bedStatusOptions: { value: BedStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800' },
  { value: 'occupied', label: 'Occupied', color: 'bg-red-100 text-red-800' },
  { value: 'reserved', label: 'Reserved', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-gray-100 text-gray-800' }
]

const BedDetailModal: React.FC<BedDetailModalProps> = ({
  bed,
  onClose,
  onUpdateStatus,
  onAdmitPatient,
  onDischargePatient
}) => {
  const [selectedStatus, setSelectedStatus] = useState<BedStatus>(bed?.status || 'available')
  const [notes, setNotes] = useState(bed?.notes || '')
  const [patientId, setPatientId] = useState('')

  if (!bed) return null

  const handleUpdateStatus = () => {
    onUpdateStatus(bed.bedId, selectedStatus, notes)
    onClose()
  }

  const handleAdmitPatient = () => {
    if (patientId.trim()) {
      onAdmitPatient(bed.bedId, patientId.trim())
      onClose()
    }
  }

  const handleDischargePatient = () => {
    onDischargePatient(bed.bedId)
    onClose()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <Label className="text-2xl font-bold text-gray-800">Bed Details</Label>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Bed Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">{bed.bedId}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                bedStatusOptions.find(s => s.value === bed.status)?.color
              }`}>
                {bedStatusOptions.find(s => s.value === bed.status)?.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-700" />
                <span className="text-gray-700">Patient:</span>
                <span className="font-bold text-black">{bed.patientId || 'None'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-700" />
                <span className="text-gray-700">Ward:</span>
                <span className="font-bold capitalize text-black">{bed.ward}</span>
              </div>

              {bed.admittedAt && (
                <div className="flex items-center space-x-2 col-span-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Admitted:</span>
                  <span className="font-medium">{formatDate(bed.admittedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Update */}
          <div className="space-y-3">
            <Label className="block text-sm font-medium text-gray-700">Update Status</Label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as BedStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {bedStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label className="block text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 inline mr-2" />
              Notes
            </Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this bed..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Patient Actions */}
          {bed.status === 'available' && (
            <div className="space-y-3">
              <Label className="block text-sm font-medium text-gray-700">
                <UserPlus className="w-4 h-4 inline mr-2" />
                Admit Patient
              </Label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Patient ID (e.g., PAT-001)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button
                  onClick={handleAdmitPatient}
                  disabled={!patientId.trim()}
                  variant="default"
                  size="default"
                  className="px-4 py-2"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {bed.status === 'occupied' && (
            <Button
              onClick={handleDischargePatient}
              variant="destructive"
              size="default"
              className="w-full px-4 py-2 flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Discharge Patient</span>
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
            size="default"
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="default"
            size="default"
            className="px-4 py-2 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BedDetailModal
