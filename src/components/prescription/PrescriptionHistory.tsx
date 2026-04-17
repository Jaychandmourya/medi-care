import { useState, useEffect, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'

// Import icons file
import { Calendar, User, FileText, Search, Eye, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

// Import Types files
import type { AppDispatch, RootState } from '@/app/store'
import type { Appointment } from '@/features/db/dexie'
import type { Prescription } from '@/types/prescription/prescriptionType'

// Import UI components
import Input from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// Import dispatch and selector for redux
import { useSelector, useDispatch } from 'react-redux'

// Import Thunk file for redux
import { getAllPatients } from '@/features/patient/patientThunk'

// Import Slice file for redux
import { loadPrescriptionHistory, deletePrescriptionFromHistory } from '@/features/prescription/prescriptionSlice'

// Import Dialog components
import PrescriptionDetailsDialog from '@/components/prescription/dialog/PrescriptionDetailsDialog'
import DeleteDialog from '@/components/ui/dialog/DeleteDialog'

const PrescriptionHistory = () => {

  // Redux dispatch
  const dispatch = useDispatch<AppDispatch>()

  // Redux selector
  const { prescriptionHistory, historyLoading } = useSelector((state: RootState) => state.prescriptions)
  const { user } = useSelector((state: RootState) => state.auth)
  const appointments = useSelector((state: RootState) => state.appointments.appointments)
  const patients = useSelector((state: RootState) => state.patients.list)

  // State
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedPatient, setSelectedPatient] =  useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const ITEMS_PER_PAGE = 5

  // Get current doctor's ID from localStorage
  const getCurrentDoctorId = useCallback(() => {
    if (user?.role === 'doctor') {
      const doctorInfo = localStorage.getItem('doctorInfo')
      if (doctorInfo) {
        const info = JSON.parse(doctorInfo)
        return info.doctorId
      }
    }
    return null
  }, [user])

  // Effect
  // Load prescription history and patients on component mount
  useEffect(() => {
    dispatch(loadPrescriptionHistory())
    dispatch(getAllPatients())
  }, [dispatch])

  // Filter prescriptions by current doctor if user is a doctor
  const filteredPrescriptionHistory = useMemo(() => {
    const currentDoctorId = getCurrentDoctorId()

    if (!currentDoctorId || user?.role !== 'doctor') {
      return prescriptionHistory
    }
    return prescriptionHistory.filter(p => p.doctorId === currentDoctorId)
  }, [prescriptionHistory, getCurrentDoctorId, user])

  // This ensures both the patient dropdown and history show the same patient list
  const uniquePatients = useMemo(() => {
    const currentDoctorId = getCurrentDoctorId()
    if (!currentDoctorId || user?.role !== 'doctor') {
      return patients.map(patient => ({
        id: patient.patientId,
        name: patient.name
      }))
    }

    // Filter patients who have appointments with the current doctor
    const doctorPatientIds = appointments
      .filter((apt: Appointment) => apt.doctorId === currentDoctorId)
      .map((apt: Appointment) => apt.patientId)

    // Get unique patient IDs
    const uniquePatientIds = Array.from(new Set(doctorPatientIds))

    // Match with patients table to get patient names
    return uniquePatientIds
      .map(patientId => {
        const patient = patients.find(p => p.id === patientId)
        return {
          id: patient?.patientId || patientId,
          name: patient?.name || 'Unknown Patient'
        }
      })
      .filter(patient => patient.name !== 'Unknown Patient')
  }, [patients, getCurrentDoctorId, user, appointments])

  // Filter and sort prescriptions
  const filteredPrescriptions = useMemo(() => {
    return filteredPrescriptionHistory
      .filter(prescription => {
        const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesPatient = !selectedPatient || prescription.patientId === selectedPatient
        const matchesStatus = !selectedStatus || prescription.status === selectedStatus
        return matchesSearch && matchesPatient && matchesStatus
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })
  }, [filteredPrescriptionHistory, searchTerm, selectedPatient, selectedStatus])

  // Paginate prescriptions (5 per page, based on individual records)
  const paginatedGroupedPrescriptions = useMemo(() => {
    const allPrescriptions = filteredPrescriptions
    const totalPages = Math.ceil(allPrescriptions.length / ITEMS_PER_PAGE)
    const safePage = Math.min(currentPage, totalPages || 1)
    const start = (safePage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    const pageItems = allPrescriptions.slice(start, end)

    // Re-group the paginated items by date
    const grouped = pageItems.reduce((groups, prescription) => {
      const date = new Date(prescription.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      if (!groups[date]) groups[date] = []
      groups[date].push(prescription)
      return groups
    }, {} as Record<string, Prescription[]>)

    // Sort prescriptions within each date group by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    })

    // Sort date groups descending
    const sorted = Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .reduce((acc, [date, prescriptions]) => {
        acc[date] = prescriptions
        return acc
      }, {} as Record<string, Prescription[]>)

    return { grouped: sorted, totalPages, safePage }
  }, [filteredPrescriptions, currentPage])

  const getStatusColor = useCallback((status: string) => {
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
  }, [])

  const handleViewPrescription = useCallback((prescription: Prescription) => {
    setSelectedPrescription(prescription)
    setShowDetailsModal(true)
  }, [])

  const generatePrescriptionPDF = useCallback((prescription: Prescription) => {
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
          <p>This prescription was generated electronically on ${new Date(prescription.createdAt).toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
          <p>For medical emergencies, please call 911 or visit the nearest emergency room.</p>
        </div>
      </body>
      </html>
    `
  }, [])

  const handleDownloadPrescription = useCallback((prescription: Prescription) => {
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
  }, [generatePrescriptionPDF])

  const handleDeletePrescription = useCallback((prescription: Prescription) => {
    setPrescriptionToDelete(prescription)
    setShowDeleteModal(true)
  }, [])

  const confirmDeletePrescription = useCallback(() => {
    if (prescriptionToDelete) {
      dispatch(deletePrescriptionFromHistory(prescriptionToDelete.id))
      toast.success(`Prescription for ${prescriptionToDelete.patientName} deleted successfully`)
      setShowDeleteModal(false)
      setPrescriptionToDelete(null)
    }
  }, [prescriptionToDelete, dispatch])

  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false)
    setPrescriptionToDelete(null)
  }, [])

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
            <Input
              type="text"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              placeholder="Search by patient, doctor, or diagnosis..."
              icon={Search}
              iconPosition="left"
              className="pl-10"
            />
          </div>

          {/* Patient Filter */}
          <div>
            <Input
              as="select"
              value={selectedPatient}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setSelectedPatient(e.target.value); setCurrentPage(1) }}
              className="px-3 py-2"
            >
              <option value="">All Patients</option>
              {uniquePatients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </Input>
          </div>

          {/* Status Filter */}
          <div>
            <Input
              as="select"
              value={selectedStatus}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setSelectedStatus(e.target.value); setCurrentPage(1) }}
              className="px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Input>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-6">
        {filteredPrescriptions.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Results info */}
            <div className="text-sm text-gray-500">
              Showing {Math.min((paginatedGroupedPrescriptions.safePage - 1) * ITEMS_PER_PAGE + 1, filteredPrescriptions.length)}–{Math.min(paginatedGroupedPrescriptions.safePage * ITEMS_PER_PAGE, filteredPrescriptions.length)} of {filteredPrescriptions.length} prescriptions
            </div>

            {Object.entries(paginatedGroupedPrescriptions.grouped).map(([date, datePrescriptions]) => (
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
                      <div className="flex flex-col sm:flex-row justify-between items-start">
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
                              <span>Created: {new Date(prescription.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                              })}</span>
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

                        <div className="flex gap-2 sm:ml-4 mt-3 sm:mt-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewPrescription(prescription)}
                            className="p-2 text-blue-600 hover:bg-blue-50"
                            title="View Prescription"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadPrescription(prescription)}
                            className="p-2 text-green-600 hover:bg-green-50"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePrescription(prescription)}
                            className="p-2 text-red-600 hover:bg-red-50"
                            title="Delete Prescription"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {paginatedGroupedPrescriptions.totalPages > 1 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Previous button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={paginatedGroupedPrescriptions.safePage === 1}
                    className="flex items-center gap-1 w-full sm:w-auto"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    {(() => {
                      const total = paginatedGroupedPrescriptions.totalPages
                      const current = paginatedGroupedPrescriptions.safePage
                      const pages: (number | string)[] = []

                      if (total <= 7) {
                        for (let i = 1; i <= total; i++) pages.push(i)
                      } else {
                        pages.push(1)
                        if (current > 3) pages.push('start-ellipsis')
                        const start = Math.max(2, current - 1)
                        const end = Math.min(total - 1, current + 1)
                        for (let i = start; i <= end; i++) pages.push(i)
                        if (current < total - 2) pages.push('end-ellipsis')
                        pages.push(total)
                      }

                      return pages.map((page, idx) => {
                        if (typeof page === 'string') {
                          return (
                            <span key={page} className="px-2 py-1 text-gray-400 select-none">…</span>
                          )
                        }
                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-9 h-9 px-3 rounded-md text-sm font-medium transition-colors ${
                              page === current
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })
                    })()}
                  </div>

                  {/* Next button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(paginatedGroupedPrescriptions.totalPages, p + 1))}
                    disabled={paginatedGroupedPrescriptions.safePage === paginatedGroupedPrescriptions.totalPages}
                    className="flex items-center gap-1 w-full sm:w-auto"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Prescription Details Modal */}
      <PrescriptionDetailsDialog
        prescription={selectedPrescription}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedPrescription(null)
        }}
        onDownload={handleDownloadPrescription}
        getStatusColor={getStatusColor}
      />

      {/* Delete Confirmation Modal */}
      <DeleteDialog
        isOpenDelete={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDeletePrescription}
        deleteTitle="Delete Prescription"
        itemName={prescriptionToDelete?.patientName || 'Unknown Patient'}
        description={`Are you sure you want to delete this prescription for ${prescriptionToDelete?.patientName || 'Unknown Patient'}? This action cannot be undone.`}
      />
    </div>
  )
}

export default PrescriptionHistory
