import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Calendar, User, FileText, Search, Eye, Download, Trash2 } from 'lucide-react'
import { loadPrescriptionHistory, deletePrescriptionFromHistory } from '@/features/prescription/prescriptionSlice'
import type { AppDispatch, RootState } from '@/app/store'
import type { Prescription } from '@/features/prescription/prescriptionSlice'

const PrescriptionHistory = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { prescriptionHistory, historyLoading } = useSelector((state: RootState) => state.prescriptions)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null)

  // Load prescription history on component mount
  useEffect(() => {
    dispatch(loadPrescriptionHistory())
  }, [dispatch])

  // Get unique patients from history
  const uniquePatients = Array.from(new Set(prescriptionHistory.map(p => p.patientId)))
    .map(patientId => {
      const prescription = prescriptionHistory.find(p => p.patientId === patientId)
      return { id: patientId, name: prescription?.patientName || 'Unknown' }
    })

  // Filter prescriptions
  const filteredPrescriptions = prescriptionHistory.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPatient = !selectedPatient || prescription.patientId === selectedPatient
    const matchesStatus = !selectedStatus || prescription.status === selectedStatus

    return matchesSearch && matchesPatient && matchesStatus
  })

  // Group prescriptions by date
  const groupedPrescriptions = filteredPrescriptions.reduce((groups, prescription) => {
    const date = new Date(prescription.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(prescription)
    return groups
  }, {} as Record<string, Prescription[]>)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription)
    setShowDetailsModal(true)
  }

  const handleDownloadPrescription = (prescription: Prescription) => {
    // Generate PDF content
    const printContent = generatePrescriptionPDF(prescription)

    // Create a temporary window and print
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()

      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  const generatePrescriptionPDF = (prescription: Prescription) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${prescription.patientName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #333; }
          .header p { margin: 5px 0; color: #666; }
          .section { margin-bottom: 25px; }
          .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .medicine { border-left: 4px solid #007bff; padding-left: 15px; margin-bottom: 15px; }
          .medicine h4 { margin: 0 0 5px 0; color: #333; }
          .medicine p { margin: 3px 0; color: #666; font-size: 14px; }
          .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; text-align: center; color: #666; font-size: 12px; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MEDICAL PRESCRIPTION</h1>
          <p>Dr. ${prescription.doctorName} - General Practitioner</p>
          <p>License: MD123456 | Phone: (555) 123-4567</p>
        </div>

        <div class="section">
          <div class="info-grid">
            <div>
              <strong>Patient:</strong> ${prescription.patientName}<br>
              <strong>Patient ID:</strong> ${prescription.patientId}<br>
              <strong>Date:</strong> ${new Date(prescription.createdAt).toLocaleDateString()}
            </div>
            <div>
              <strong>Prescription ID:</strong> ${prescription.id}<br>
              <strong>Status:</strong> ${prescription.status.toUpperCase()}<br>
              <strong>Follow-up:</strong> ${prescription.followUpDate ? new Date(prescription.followUpDate).toLocaleDateString() : 'Not specified'}
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Diagnosis</h3>
          <p>${prescription.diagnosis}</p>
        </div>

        <div class="section">
          <h3>Medicines (${prescription.medicines.length})</h3>
          ${prescription.medicines.map((medicine, index) => `
            <div class="medicine">
              <h4>${index + 1}. ${medicine.name}</h4>
              <p><strong>Dosage:</strong> ${medicine.dosage}</p>
              <p><strong>Frequency:</strong> ${medicine.frequency}</p>
              <p><strong>Duration:</strong> ${medicine.duration}</p>
              ${medicine.instructions ? `<p><strong>Instructions:</strong> ${medicine.instructions}</p>` : ''}
            </div>
          `).join('')}
        </div>

        ${prescription.generalNotes ? `
          <div class="section">
            <h3>General Notes</h3>
            <p>${prescription.generalNotes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>This prescription was generated electronically on ${new Date(prescription.createdAt).toLocaleString()}</p>
          <p>For medical emergencies, please call 911 or visit the nearest emergency room.</p>
        </div>
      </body>
      </html>
    `
  }

  const handleDeletePrescription = (prescription: Prescription) => {
    setPrescriptionToDelete(prescription)
    setShowDeleteModal(true)
  }

  const confirmDeletePrescription = () => {
    if (prescriptionToDelete) {
      dispatch(deletePrescriptionFromHistory(prescriptionToDelete.id))
      setShowDeleteModal(false)
      setPrescriptionToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setPrescriptionToDelete(null)
  }

  if (historyLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescription history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Prescription History</h2>
        <p className="text-gray-600">View and manage all past prescriptions</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient, doctor, or diagnosis..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Patient Filter */}
          <div>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Patients</option>
              {uniquePatients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-6">
        {Object.entries(groupedPrescriptions).length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          Object.entries(groupedPrescriptions).map(([date, datePrescriptions]) => (
            <div key={date} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* Date Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">{date}</h3>
                  <span className="text-sm text-gray-500">
                    ({datePrescriptions.length} prescription{datePrescriptions.length > 1 ? 's' : ''})
                  </span>
                </div>
              </div>

              {/* Prescriptions for this date */}
              <div className="divide-y divide-gray-200">
                {datePrescriptions.map((prescription) => (
                  <div key={prescription.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{prescription.patientName}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                            {prescription.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Dr. {prescription.doctorName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {new Date(prescription.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Diagnosis:</p>
                          <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Medicines ({prescription.medicines.length}):</p>
                          <div className="flex flex-wrap gap-1">
                            {prescription.medicines.map((medicine) => (
                              <span
                                key={medicine.id}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                              >
                                {medicine.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        {prescription.followUpDate && (
                          <div className="mt-3">
                            <span className="text-sm text-orange-600 font-medium">
                              Follow-up: {new Date(prescription.followUpDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleViewPrescription(prescription)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Prescription"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPrescription(prescription)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrescription(prescription)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Prescription"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Prescription Details Modal */}
      {showDetailsModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Prescription Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedPrescription(null)
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              {/* Prescription Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">MEDICAL PRESCRIPTION</h1>
                <p className="text-gray-600">Dr. {selectedPrescription.doctorName} - General Practitioner</p>
                <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
                  <span>ID: {selectedPrescription.id}</span>
                  <span>Status: <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedPrescription.status)}`}>{selectedPrescription.status}</span></span>
                </div>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Patient Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedPrescription.patientName}</p>
                    <p><strong>Patient ID:</strong> {selectedPrescription.patientId}</p>
                    <p><strong>Date:</strong> {new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
                    {selectedPrescription.followUpDate && (
                      <p><strong>Follow-up:</strong> {new Date(selectedPrescription.followUpDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Doctor Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedPrescription.doctorName}</p>
                    <p><strong>ID:</strong> {selectedPrescription.doctorId}</p>
                    <p><strong>License:</strong> MD123456</p>
                    <p><strong>Phone:</strong> (555) 123-4567</p>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Diagnosis</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-800">{selectedPrescription.diagnosis}</p>
                </div>
              </div>

              {/* Medicines */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Medicines ({selectedPrescription.medicines.length})</h3>
                <div className="space-y-3">
                  {selectedPrescription.medicines.map((medicine, index) => (
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
              {selectedPrescription.generalNotes && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">General Notes</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-800 text-sm">{selectedPrescription.generalNotes}</p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Created: {new Date(selectedPrescription.createdAt).toLocaleString()}</span>
                  {selectedPrescription.updatedAt && (
                    <span>Updated: {new Date(selectedPrescription.updatedAt).toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => handleDownloadPrescription(selectedPrescription)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedPrescription(null)
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && prescriptionToDelete && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="text-center mb-4">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Prescription</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this prescription for <strong>{prescriptionToDelete?.patientName || 'Unknown Patient'}</strong>?
                <br />
                <span className="text-sm text-gray-500">This action cannot be undone.</span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient:</span>
                  <span className="font-medium">{prescriptionToDelete?.patientName || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{prescriptionToDelete?.createdAt ? new Date(prescriptionToDelete.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Diagnosis:</span>
                  <span className="font-medium truncate max-w-xs">{prescriptionToDelete?.diagnosis || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Medicines:</span>
                  <span className="font-medium">{prescriptionToDelete?.medicines?.length || 0} items</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePrescription}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrescriptionHistory
