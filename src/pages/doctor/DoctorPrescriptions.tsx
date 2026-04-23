import { useState, lazy, Suspense, useMemo } from 'react'

// Import icons file
import { FileText, History, Plus, Eye } from 'lucide-react'

// Import components
import Tabs from '@/components/common/Tabs'

// Import type file
import type { RootState } from '@/app/store'

// Import selector file
import { useSelector } from 'react-redux'

const PrescriptionBuilder = lazy(() => import('@/components/prescription/PrescriptionBuilder'))
const PrescriptionPDFView = lazy(() => import('@/components/prescription/PrescriptionPDFView'))
const PrescriptionHistory = lazy(() => import('@/components/prescription/PrescriptionHistory'))

type TabType = 'builder' | 'history' | 'preview'

const DoctorPrescriptions = () => {

  // Redux selector
  const { currentPrescription } = useSelector((state: RootState) => state.prescriptions)

  // State management
  const [activeTab, setActiveTab] = useState<TabType>('builder')

  // Tab configuration
  const tabs = useMemo(() => [
    { id: 'builder' as TabType, label: 'Write Prescription', icon: Plus },
    { id: 'history' as TabType, label: 'History', icon: History },
    ...(currentPrescription ? [{ id: 'preview' as TabType, label: 'Preview PDF', icon: Eye }] : [])
  ], [currentPrescription])

  return (
    <div className="bg-gray-50 rounded-md">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl px-4 lg:px-6">
          <div className="py-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Prescription Management</h1>
            <p className="text-gray-500 mt-1">Create and manage digital prescriptions with OpenFDA integration</p>
          </div>

          {/* Tabs */}
          <Tabs tabs={tabs} activeTab={activeTab} onChange={(tabId) => setActiveTab(tabId as TabType)} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border px-4 sm:px-6 lg:px-8 py-6 border-gray-100 overflow-hidden">
          {activeTab === 'builder' && (
            <Suspense fallback={<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <PrescriptionBuilder />
            </Suspense>
          )}
          {activeTab === 'history' && (
            <Suspense fallback={<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <PrescriptionHistory />
            </Suspense>
          )}
          {activeTab === 'preview' && (
            <Suspense fallback={<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <PrescriptionPDFView />
            </Suspense>
          )}
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
}

export default DoctorPrescriptions