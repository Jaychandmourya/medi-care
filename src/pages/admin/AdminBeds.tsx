import { useEffect, useState, useCallback, useMemo, Suspense, lazy } from 'react'

// Import icons file
import { LayoutGrid, Building2, BedDouble } from 'lucide-react'

// Import UI components
import { FormButton } from '@/components/common/FormButton'
import Tabs from '@/components/common/Tabs'

// Import Types files
import type { RootState, AppDispatch } from '@/app/store'
import type { Bed, BedStatus } from '@/types/bed/bedType'
type TabType = 'overview' | 'beds' | 'wards'

// Import dispatch and selector for redux
import { useSelector, useDispatch } from 'react-redux'

// Import Services file
import { initializeDatabase } from '@/services/bedAndWardServices'

// Import Thunk file for redux
import { fetchBeds, fetchWards, updateBedStatus, admitPatient, dischargePatient } from '@/features/bed/bedThunk'

// Import Slice file for redux
import { initializeBeds } from '@/features/bed/bedSlice'

// Import Components
import WardSwitcher from '@/components/admin/bed/tab/overview/WardSwitcher'

// Lazy loaded components
const BedManagement = lazy(() => import('@/components/admin/bed/tab/beds/BedManagement'))
const WardManagement = lazy(() => import('@/components/admin/bed/tab/wards/WardManagement'))
const BedDetailModal = lazy(() => import('@/components/admin/bed/BedDetailModal'))
const BedGrid = lazy(() => import('@/components/admin/bed/tab/overview/BedGrid'))
const BedAvailabilitySummary = lazy(() => import('@/components/admin/bed/tab/overview/BedAvailabilitySummary'))

const AdminBeds = () => {

  // Redux dispatch and selector
  const dispatch = useDispatch<AppDispatch>()
  const { beds, wards, loading, error } = useSelector((state: RootState) => state.beds)

  // State management
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [overviewWard, setOverviewWard] = useState('general')

  // Get fresh bed data from Redux whenever selectedBedId changes
  const selectedBed = useMemo(() => {
    if (!selectedBedId) return null
    return beds.find(b => b.bedId === selectedBedId) || null
  }, [beds, selectedBedId])

  // Tab configuration static data
  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutGrid },
    { id: 'beds' as TabType, label: 'Manage Beds', icon: BedDouble },
    { id: 'wards' as TabType, label: 'Manage Wards', icon: Building2 },
  ]

  // Effect
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDatabase()
        dispatch(fetchBeds())
        dispatch(fetchWards())
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize bed data:', error)
        dispatch(initializeBeds())
        setIsInitialized(true)
      }
    }

    initialize()
  }, [dispatch])

  // Methods
  const handleBedClick = useCallback((bed: Bed) => {
    setSelectedBedId(bed.bedId)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedBedId(null)
  }, [])

  const handleWardChange = useCallback((wardId: string) => {
    setOverviewWard(wardId)
  }, [])

  const handleRetry = useCallback(() => {
    dispatch(fetchBeds())
    dispatch(fetchWards())
  }, [dispatch])

  // Admit patient
  const handleAdmitPatient = useCallback((bedId: string, patientId: string) => {
    dispatch(admitPatient({ bedId, patientId }))
      .unwrap()
      .then(() => {
        setSelectedBedId(null)
      })
      .catch((error) => {
        console.error('Failed to admit patient:', error)
      })
  }, [dispatch])

  // Discharge bed
  const handleDischargePatient = useCallback((bedId: string) => {
    dispatch(dischargePatient(bedId))
      .unwrap()
      .then(() => {
        setSelectedBedId(null)
        handleRetry()
      })
      .catch((error) => {
        console.error('Failed to discharge patient:', error)
      })
  }, [dispatch, handleRetry])

  // Update bed status
  const handleUpdateStatus = useCallback((bedId: string, status: BedStatus, notes?: string) => {
    dispatch(updateBedStatus({ bedId, status, notes }))
      .unwrap()
      .then(() => {
        setSelectedBedId(null)
      })
      .catch((error) => {
        console.error('Failed to update bed status:', error)
      })
  }, [dispatch])

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing bed management system...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Error loading bed data</p>
            <p className="text-sm">{error}</p>
          </div>
          <FormButton onClick={handleRetry} variant="default">
            Retry
          </FormButton>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-md">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl px-4 lg:px-6">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Bed & Ward Management</h1>
            <p className="text-gray-500 mt-1">Manage hospital beds, wards, and patient assignments</p>
          </div>

          {/* Tabs */}
          <Tabs tabs={tabs} activeTab={activeTab} onChange={(tabId) => setActiveTab(tabId as TabType)} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <Suspense fallback={<div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>}>
                    <BedAvailabilitySummary beds={beds} selectedWard={overviewWard} />
                  </Suspense>
                  <WardSwitcher
                    wards={wards}
                    selectedWard={overviewWard}
                    onWardChange={handleWardChange}
                  />
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <Suspense fallback={<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                      <BedGrid beds={beds.filter(b => b.ward === overviewWard).slice(0, 50)} onBedClick={handleBedClick} />
                    </Suspense>
                  </div>
                </div>
              )}

              {/* Beds Tab */}
              {activeTab === 'beds' && (
                <Suspense fallback={<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                  <BedManagement onBedClick={handleBedClick} />
                </Suspense>
              )}

              {/* Wards Tab */}
              {activeTab === 'wards' && (
                <Suspense fallback={<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                  <WardManagement />
                </Suspense>
              )}
            </>
          )}
      </div>

      {/* Bed Detail Modal */}
      {selectedBed && (
        <Suspense fallback={<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
          <BedDetailModal
            bed={selectedBed}
            onClose={handleCloseModal}
            onUpdateStatus={handleUpdateStatus}
            onAdmitPatient={handleAdmitPatient}
            onDischargePatient={handleDischargePatient}
          />
        </Suspense>
      )}
    </div>
  )
}

export default AdminBeds