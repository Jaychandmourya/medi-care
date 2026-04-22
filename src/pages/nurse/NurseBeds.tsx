import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react'

// Import UI components
import { FormButton } from '@/components/common/FormButton'
import { Label } from '@/components/common/Label'

// Import Types files
import type { RootState } from '@/app/store'
import type { Bed, BedStatus } from '@/types/bed/bedType'

// Import dispatch and selector for redux
import { useSelector, useDispatch } from 'react-redux'

// Import Services
import { initializeDatabase } from '@/services/bedAndWardServices'

// Import Thunk file for redux
import { fetchBeds, fetchWards, updateBedStatus, admitPatient, dischargePatient } from '@/features/bed/bedThunk'

// Import Slice file for redux
import {
  setSelectedWard,
  toggleSimulation,
  simulateBedStatusChange,
  initializeBeds
} from '@/features/bed/bedSlice'

const WardSwitcher = lazy(() => import('@/components/admin/bed/tab/overview/WardSwitcher'))
const BedGrid = lazy(() => import('@/components/admin/bed/tab/overview/BedGrid'))
const BedDetailModal = lazy(() => import('@/components/admin/bed/BedDetailModal'))
const BedAvailabilitySummary = lazy(() => import('@/components/admin/bed/tab/overview/BedAvailabilitySummary'))
const SimulationControl = lazy(() => import('@/components/admin/bed/SimulationControl'))



const NurseBeds = () => {
  const dispatch = useDispatch()
  const {
    beds,
    wards,
    selectedWard,
    loading,
    error,
    simulationEnabled
  } = useSelector((state: RootState) => state.beds)

  const [selectedBedId, setSelectedBedId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Get fresh bed data from Redux whenever selectedBedId changes
  const selectedBed = useMemo(() => {
    if (!selectedBedId) return null
    return beds.find(b => b.bedId === selectedBedId) || null
  }, [beds, selectedBedId])

  // Initialize data
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDatabase()
        dispatch(fetchBeds() as any)
        dispatch(fetchWards() as any)
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize bed data:', error)
        dispatch(initializeBeds())
        setIsInitialized(true)
      }
    }

    initialize()
  }, [dispatch])

  // Auto Simulation - Randomly changes 1-2 bed statuses every 45 seconds when simulation is ON
  useEffect(() => {
    let interval: number
    if (simulationEnabled && isInitialized) {
      interval = setInterval(() => {
        dispatch(simulateBedStatusChange())
      }, 45000) // 45 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [simulationEnabled, dispatch, isInitialized])

  const handleBedClick = useCallback((bed: Bed) => {
    setSelectedBedId(bed.bedId)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedBedId(null)
  }, [])

  const handleUpdateStatus = useCallback((bedId: string, status: BedStatus, notes?: string) => {
     dispatch(updateBedStatus({ bedId, status, notes }) as any)
  }, [dispatch])

  const handleAdmitPatient = useCallback((bedId: string, patientId: string) => {
    dispatch(admitPatient({ bedId, patientId }) as any)
  }, [dispatch])

   const handleRetry = useCallback(() => {
    dispatch(fetchBeds() as any)
    dispatch(fetchWards() as any)
  }, [dispatch])

  // Discharge Patient: Free a bed and record discharge time in IndexedDB
  const handleDischargePatient = useCallback((bedId: string) => {
    dispatch(dischargePatient(bedId) as any)
    handleRetry()
  }, [dispatch, handleRetry])

  const handleWardChange = useCallback((wardId: string) => {
    dispatch(setSelectedWard(wardId))
  }, [dispatch, handleRetry])

  const handleToggleSimulation = useCallback(() => {
    dispatch(toggleSimulation())
  }, [dispatch])



  const currentWardBeds = useMemo(() =>
    beds.filter(bed => bed.ward === selectedWard),
    [beds, selectedWard]
  )

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing bed management system...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Error loading bed data</p>
            <p className="text-sm">{error}</p>
          </div>
          <FormButton
            onClick={handleRetry}
            variant="default"
          >
            Retry
          </FormButton>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-md shadow-sm">
      {/* Header */}
      <div className="bg-white rounded-t-md border-b">
        <div className="px-4 py-6">
          <Label className="text-2xl font-bold text-gray-800">Bed Management</Label>
          <p className="text-gray-600 mt-1">Manage hospital beds and patient assignments</p>
        </div>
      </div>

      {/* Ward Switcher */}
      <Suspense fallback={<div className="py-4 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div></div>}>
        <WardSwitcher
          wards={wards}
          selectedWard={selectedWard}
          onWardChange={handleWardChange}
        />
      </Suspense>

      {/* Bed Availability Summary */}
      <Suspense fallback={<div className="py-4 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div></div>}>
        <BedAvailabilitySummary
          beds={beds}
          selectedWard={selectedWard}
        />
      </Suspense>

      {/* Main Content */}
      <div className="bg-white rounded-b-md">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : currentWardBeds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No beds found in this ward</p>
          </div>
        ) : (
          <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <BedGrid
              beds={currentWardBeds}
              onBedClick={handleBedClick}
            />
          </Suspense>
        )}
      </div>

      {/* Bed Detail Modal */}
      {selectedBed && (
        <Suspense fallback={<div className="p-4 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div></div>}>
          <BedDetailModal
            bed={selectedBed}
            onClose={handleCloseModal}
            onUpdateStatus={handleUpdateStatus}
            onAdmitPatient={handleAdmitPatient}
            onDischargePatient={handleDischargePatient}
          />
        </Suspense>
      )}

      {/* Simulation Control */}
      <Suspense fallback={null}>
        <SimulationControl
          isEnabled={simulationEnabled}
          onToggle={handleToggleSimulation}
        />
      </Suspense>
    </div>
  )
};

export default NurseBeds;