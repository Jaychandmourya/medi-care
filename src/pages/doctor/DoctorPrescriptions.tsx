import { useState } from 'react'
import { useSelector } from 'react-redux'
import { FileText, History, Plus, Eye } from 'lucide-react'
import type { RootState } from '@/app/store'
import PrescriptionBuilder from '@/components/prescription/PrescriptionBuilder'
import PrescriptionPDFView from '@/components/prescription/PrescriptionPDFView'
import PrescriptionHistory from '@/components/prescription/PrescriptionHistory'

const DoctorPrescriptions = () => {
  const { currentPrescription } = useSelector((state: RootState) => state.prescriptions)
  const [activeView, setActiveView] = useState<'builder' | 'history' | 'preview'>('builder')

  const handleViewChange = (view: 'builder' | 'history' | 'preview') => {
    setActiveView(view)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prescription Management</h1>
          <p className="text-gray-600">Create and manage digital prescriptions with OpenFDA integration</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="flex space-x-1 p-1">
            <button
              onClick={() => handleViewChange('builder')}
              className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg font-medium transition-colors ${
                activeView === 'builder'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Plus className="h-4 w-4" />
              Write Prescription
            </button>
            <button
              onClick={() => handleViewChange('history')}
              className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg font-medium transition-colors ${
                activeView === 'history'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History className="h-4 w-4" />
              History
            </button>
            {currentPrescription && (
              <button
                onClick={() => handleViewChange('preview')}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg font-medium transition-colors ${
                  activeView === 'preview'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Eye className="h-4 w-4" />
                Preview PDF
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          {activeView === 'builder' && <PrescriptionBuilder />}
          {activeView === 'history' && <PrescriptionHistory />}
          {activeView === 'preview' && <PrescriptionPDFView />}
        </div>

        {/* Features Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            OpenFDA Integration Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Real-time drug search with autocomplete suggestions</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Drug recall alerts and safety information</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Detailed drug information including dosage and warnings</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Adverse reactions data from FDA events</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Printable prescription PDFs with professional layout</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Complete prescription history with filtering options</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default DoctorPrescriptions;