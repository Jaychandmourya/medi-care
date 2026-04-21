import { Download } from 'lucide-react'
import { Button } from '@/components/common/Button'
import type { Prescription } from '@/types/prescription/prescriptionType'

interface PrescriptionDetailsDialogProps {
  prescription: Prescription | null
  isOpen: boolean
  onClose: () => void
  onDownload: (prescription: Prescription) => void
  getStatusColor: (status: string) => string
}

const PrescriptionDetailsDialog = ({
  prescription,
  isOpen,
  onClose,
  onDownload,
  getStatusColor
}: PrescriptionDetailsDialogProps) => {
  if (!isOpen || !prescription) return null

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Prescription Details</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-0 h-auto"
          >
            &times;
          </Button>
        </div>

        <div className="p-6">
          {/* Prescription Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">MEDICAL PRESCRIPTION</h1>
            <p className="text-gray-600">Dr. {prescription.doctorName} - General Practitioner</p>
            <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
              <span>ID: {prescription.id}</span>
              <span>Status: <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>{prescription.status}</span></span>
            </div>
          </div>

          {/* Patient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Patient Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {prescription.patientName}</p>
                <p><strong>Patient ID:</strong> {prescription.patientId}</p>
                <p><strong>Date:</strong> {new Date(prescription.createdAt).toLocaleDateString()}</p>
                {prescription.followUpDate && (
                  <p><strong>Follow-up:</strong> {new Date(prescription.followUpDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Doctor Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {prescription.doctorName}</p>
                <p><strong>ID:</strong> {prescription.doctorId}</p>
                <p><strong>License:</strong> MD123456</p>
                <p><strong>Phone:</strong> (555) 123-4567</p>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Diagnosis</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-800">{prescription.diagnosis}</p>
            </div>
          </div>

          {/* Medicines */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Medicines ({prescription.medicines.length})</h3>
            <div className="space-y-3">
              {prescription.medicines.map((medicine, index) => (
                <div key={medicine.id} className="border-l-4 border-blue-500 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{index + 1}. {medicine.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Dosage:</span>
                          <p className="text-gray-800">{medicine.dosage}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Frequency:</span>
                          <p className="text-gray-800">{medicine.frequency}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Duration:</span>
                          <p className="text-gray-800">{medicine.duration}</p>
                        </div>
                      </div>
                      {medicine.instructions && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="font-medium text-gray-600 text-sm">Instructions:</span>
                          <p className="text-gray-800 text-sm mt-1">{medicine.instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Notes */}
          {prescription.generalNotes && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">General Notes</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-800 text-sm">{prescription.generalNotes}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Created: {new Date(prescription.createdAt).toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}</span>
              {prescription.updatedAt && (
                <span>Updated: {new Date(prescription.updatedAt).toLocaleString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
          <Button
            onClick={() => onDownload(prescription)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionDetailsDialog