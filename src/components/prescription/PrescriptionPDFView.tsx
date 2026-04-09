import { useRef } from 'react'
import toast from 'react-hot-toast'

import { Download, Calendar, User, FileText } from 'lucide-react'

import type { RootState } from '@/app/store'
import type { Prescription } from '@/types/prescription/prescriptionType'

import { useSelector } from 'react-redux'


const PrescriptionPDFView = ({ prescription: propPrescription }: { prescription?: Prescription }) => {

  const { currentPrescription } = useSelector((state: RootState) => state.prescriptions)
  const prescription = propPrescription || currentPrescription
  const printRef = useRef<HTMLDivElement>(null)

  if (!prescription) return null

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    // Create a temporary iframe to hold the content
    const iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.left = '-9999px'
    iframe.style.top = '-9999px'
    iframe.style.width = '0px'
    iframe.style.height = '0px'
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) {
      document.body.removeChild(iframe)
      toast.error('Failed to create print document')
      return
    }

    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${prescription.patientName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none !important; }
            }
            @media screen {
              body { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    iframeDoc.close()

    // Trigger print and clean up
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()

    // Remove iframe after print dialog closes
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 1000)
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:hidden">
      <div className="max-w-4xl mx-auto px-4">
        {/* Print Button */}
        <div className="mb-6 flex justify-end print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>

        {/* Prescription Content */}
        <div ref={printRef} className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:rounded-none print:bg-white print:p-6 print:m-0 print:w-full print:max-w-none">
          {/* Header */}
          <div className="border-b-2 border-blue-600 pb-6 mb-6 print:pb-4 print:mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Medical Prescription</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {currentDate}
                  </div>
                  <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    ID: {currentPrescription.id}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Prescription Date:</div>
                <div className="font-medium">
                  {new Date(currentPrescription.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Patient and Doctor Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:grid-cols-2 print:gap-4 print:mb-6">
            {/* Patient Info */}
            <div className="bg-gray-50 rounded-lg p-4 print:bg-gray-50 print:p-3 print:break-inside-avoid">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Patient Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="ml-2 text-gray-900">{currentPrescription.patientName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Patient ID:</span>
                  <span className="ml-2 text-gray-900">{currentPrescription.patientId}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Phone:</span>
                  <span className="ml-2 text-gray-900">+1 (555) 123-4567</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="ml-2 text-gray-900">patient@example.com</span>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="bg-gray-50 rounded-lg p-4 print:bg-gray-50 print:p-3 print:break-inside-avoid">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                Doctor Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="ml-2 text-gray-900">{currentPrescription.doctorName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">License:</span>
                  <span className="ml-2 text-gray-900">MD123456</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Phone:</span>
                  <span className="ml-2 text-gray-900">+1 (555) 987-6543</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="ml-2 text-gray-900">doctor@hospital.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="mb-8 print:mb-6 print:break-inside-avoid">
            <h3 className="font-semibold text-gray-900 mb-3">Diagnosis</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-800">{currentPrescription.diagnosis}</p>
            </div>
          </div>

          {/* Medicines Table */}
          <div className="mb-8 print:mb-6 print:break-inside-avoid">
            <h3 className="font-semibold text-gray-900 mb-3">Prescribed Medicines</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">S.No</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Medicine Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Dosage</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Frequency</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Duration</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPrescription.medicines.map((medicine, index) => (
                    <tr key={medicine.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-2 font-medium">{medicine.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{medicine.dosage}</td>
                      <td className="border border-gray-300 px-4 py-2">{medicine.frequency}</td>
                      <td className="border border-gray-300 px-4 py-2">{medicine.duration}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">
                        {medicine.instructions || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* General Notes */}
          {currentPrescription.generalNotes && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">General Instructions</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-line">{currentPrescription.generalNotes}</p>
              </div>
            </div>
          )}

          {/* Follow-up Date */}
          {currentPrescription.followUpDate && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Follow-up Information</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">Follow-up Date:</span>
                  <span className="text-gray-800">
                    {new Date(currentPrescription.followUpDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Signature Area */}
          <div className="mt-12 pt-8 border-t border-gray-300 print:mt-8 print:pt-6 print:break-inside-avoid">
            <div className="flex justify-between items-end">
              <div className="text-center">
                <div className="w-48 h-0.5 bg-gray-400 mb-2"></div>
                <p className="text-sm text-gray-600">Patient Signature</p>
              </div>
              <div className="text-center">
                <div className="w-48 h-0.5 bg-gray-400 mb-2"></div>
                <p className="text-sm text-gray-600">Doctor Signature</p>
                <p className="text-xs text-gray-500 mt-1">{currentPrescription.doctorName}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500 print:mt-6 print:pt-3 print:break-inside-avoid">
            <p>This is a digitally generated prescription. Valid only with doctor's signature.</p>
            <p className="mt-1">Generated on {currentDate} from MediCare Hospital Management System</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionPDFView
