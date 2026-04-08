import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/app/store'
import { fetchBeds,fetchWards,updateBedStatus, admitPatient, dischargePatient} from '@/features/bed/bedThunk'
import {
  setSelectedWard,
  toggleSimulation,
  simulateBedStatusChange,
  initializeBeds
} from '@/features/bed/bedSlice'
import { initializeDatabase } from '@/services/bedAndWardServices'
import BedGrid from '@/components/admin/bed/tab/overview/BedGrid'
import BedDetailModal from '@/components/admin/bed/BedDetailModal'
import WardSwitcher from '@/components/admin/bed/tab/overview/WardSwitcher'
import BedAvailabilitySummary from '@/components/admin/bed/tab/overview/BedAvailabilitySummary'
import SimulationControl from '@/components/admin/bed/SimulationControl'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import type { Bed, BedStatus } from '@/features/bed/bedSlice'

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

  const [selectedBed, setSelectedBed] = useState<Bed | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

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
    setSelectedBed(bed)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedBed(null)
  }, [])

  const handleUpdateStatus = useCallback((bedId: string, status: BedStatus, notes?: string) => {
     dispatch(updateBedStatus({ bedId, status, notes }) as any)
  }, [dispatch])

  const handleAdmitPatient = useCallback((bedId: string, patientId: string) => {
    dispatch(admitPatient({ bedId, patientId }) as any)
  }, [dispatch])

  // Discharge Patient: Free a bed and record discharge time in IndexedDB
  const handleDischargePatient = useCallback((bedId: string) => {
    dispatch(dischargePatient(bedId) as any)
  }, [dispatch])

  const handleWardChange = useCallback((wardId: string) => {
    dispatch(setSelectedWard(wardId))
  }, [dispatch])

  const handleToggleSimulation = useCallback(() => {
    dispatch(toggleSimulation())
  }, [dispatch])

  const handleRetry = useCallback(() => {
    dispatch(fetchBeds() as any)
    dispatch(fetchWards() as any)
  }, [dispatch])

  const currentWardBeds = useMemo(() =>
    beds.filter(bed => bed.ward === selectedWard),
    [beds, selectedWard]
  )

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing bed management system...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Error loading bed data</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button
            onClick={handleRetry}
            variant="default"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-4 py-6">
          <Label className="text-2xl font-bold text-gray-800">Bed Management</Label>
          <p className="text-gray-600 mt-1">Manage hospital beds and patient assignments</p>
        </div>
      </div>

      {/* Ward Switcher */}
      <WardSwitcher
        wards={wards}
        selectedWard={selectedWard}
        onWardChange={handleWardChange}
      />

      {/* Bed Availability Summary */}
      <BedAvailabilitySummary
        beds={beds}
        selectedWard={selectedWard}
      />

      {/* Main Content */}
      <div className="bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : currentWardBeds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No beds found in this ward</p>
          </div>
        ) : (
          <BedGrid
            beds={currentWardBeds}
            onBedClick={handleBedClick}
          />
        )}
      </div>

      {/* Bed Detail Modal */}
      {selectedBed && (
        <BedDetailModal
          bed={selectedBed}
          onClose={handleCloseModal}
          onUpdateStatus={handleUpdateStatus}
          onAdmitPatient={handleAdmitPatient}
          onDischargePatient={handleDischargePatient}
        />
      )}

      {/* Simulation Control */}
      <SimulationControl
        isEnabled={simulationEnabled}
        onToggle={handleToggleSimulation}
      />
    </div>
  )
};

export default NurseBeds;