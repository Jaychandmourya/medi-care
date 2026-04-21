import { useState, Suspense, lazy } from 'react'

// Import icons file
import { History, Plus, Eye } from 'lucide-react'

// Import Types files
import type { RootState } from '@/app/store'

// Import dispatch and selector for redux
import { useSelector } from 'react-redux'

// Lazy load prescription components
const PrescriptionBuilder = lazy(() => import('@/components/prescription/PrescriptionBuilder'))
const PrescriptionPDFView = lazy(() => import('@/components/prescription/PrescriptionPDFView'))
const PrescriptionHistory = lazy(() => import('@/components/prescription/PrescriptionHistory'))

const AdminPrescriptions = () => {

   // Redux selector
  const { currentPrescription } = useSelector((state: RootState) => state.prescriptions)

  // State management
  const [activeView, setActiveView] = useState<'builder' | 'history' | 'preview'>('builder')

  // Methods
  const handleViewChange = (view: 'builder' | 'history' | 'preview') => {
    setActiveView(view)
  }

  return (
    <div>
      <div className="">
        {/* Header */}
        <div className="bg-white mb-8 p-6 rounded-lg border border-gray-200 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Prescription Management</h1>
          <p className="text-gray-600">Create and manage digital prescriptions with OpenFDA integration</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="flex space-x-1 p-1">
            <button
              onClick={() => handleViewChange('builder')}
              className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg font-medium transition-colors ${
                activeView === 'builder'
                  ? 'bg-blue-600 text-white'
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
                  ? 'bg-blue-600 text-white'
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
                    ? 'bg-blue-600 text-white'
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
          {activeView === 'builder' && (
            <Suspense fallback={<div className="text-center py-8">Loading prescription builder...</div>}>
              <PrescriptionBuilder />
            </Suspense>
          )}
          {activeView === 'history' && (
            <Suspense fallback={<div className="text-center py-8">Loading prescription history...</div>}>
              <PrescriptionHistory />
            </Suspense>
          )}
          {activeView === 'preview' && (
            <Suspense fallback={<div className="text-center py-8">Loading PDF preview...</div>}>
              <PrescriptionPDFView />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPrescriptions