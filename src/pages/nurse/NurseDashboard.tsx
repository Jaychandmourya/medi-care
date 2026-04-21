import { useEffect, useMemo } from 'react'

// Import route navigate
import { useNavigate } from 'react-router-dom'

// Import UI components
import { Button } from '@/components/ui/Button'

// Import Types files
import type { RootState, AppDispatch } from '@/app/store'
import type { BedStatus } from '@/types/bed/bedType'
import type { Patient as VitalsPatient, BedStatusChange } from '@/types/vitals/vitalsType'

// Import utils file
import { getRoleColors } from '@/utils/roleColors'

// Import dispatch and selector for redux
import { useSelector, useDispatch } from 'react-redux'

// Import Thunk file for redux
import { fetchVitals, fetchPatients } from '@/features/vital/VitalThunk'

// Import Slice file for redux
import { initializeBeds, setSelectedWard } from '@/features/bed/bedSlice'

// Interface
interface PendingVitalsPatient extends VitalsPatient {
  lastVitalsTime?: string
  statusReason?: string
}

const NurseDashboard = () => {

  // Router navigate
  const navigate = useNavigate()

  // Redux dispatch
  const dispatch = useDispatch<AppDispatch>()

   // Redux selector
  const { beds, wards, selectedWard } = useSelector((state: RootState) => state.beds)
  const { patients, vitals } = useSelector((state: RootState) => state.vitals)
  const { user } = useSelector((state: RootState) => state.auth)

  const roleColors = getRoleColors(user?.role || 'nurse')

  // Computed
  // Use static dates for demo purposes to avoid impure function calls
  const recentChanges = useMemo<BedStatusChange[]>(() => {
    const now = new Date()
    return [
      {
        id: '1',
        bedId: 'general-001',
        oldStatus: 'available',
        newStatus: 'occupied',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000),
        patientId: 'PAT-123'
      },
      {
        id: '2',
        bedId: 'icu-005',
        oldStatus: 'occupied',
        newStatus: 'available',
        timestamp: new Date(now.getTime() - 45 * 60 * 1000)
      },
      {
        id: '3',
        bedId: 'emergency-002',
        oldStatus: 'maintenance',
        newStatus: 'available',
        timestamp: new Date(now.getTime() - 60 * 60 * 1000)
      }
    ]
  }, [])

  const pendingVitals = useMemo<PendingVitalsPatient[]>(() => {
    const now = new Date()
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000)

    // If no patients data yet, return empty array
    if (patients.length === 0) {
      return []
    }

    return patients
      .map(patient => {
        // Find most recent vitals for this patient
        const patientVitals = vitals.filter(v => v.patientId === patient.id)
        const latestVitals = patientVitals.sort((a, b) =>
          new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
        )[0]

        const needsVitals = !latestVitals || new Date(latestVitals.recordedAt) < fourHoursAgo

        return {
          patient,
          latestVitals,
          needsVitals,
          lastVitalsTime: latestVitals ? latestVitals.recordedAt : undefined,
          statusReason: !latestVitals ? 'No vitals recorded' :
                    new Date(latestVitals.recordedAt).getTime() < fourHoursAgo.getTime() ? 'Vitals overdue' :
                    'Vitals up to date'
        }
      })
      .filter(({ needsVitals }) => needsVitals)
      .map(({ patient, lastVitalsTime, statusReason }): PendingVitalsPatient => ({
        ...patient,
        lastVitalsTime,
        statusReason
      }))
      .slice(0, 5) // Show max 5 pending vitals
  }, [patients, vitals])

  // Effect
  useEffect(() => {
    dispatch(initializeBeds())
    dispatch(fetchVitals())
    dispatch(fetchPatients())
  }, [dispatch])

  const getStatusColor = (status: BedStatus): string => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
      case 'occupied':
        return 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
      case 'reserved':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200'
      case 'maintenance':
        return 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const getStatusIcon = (status: BedStatus): string => {
    switch (status) {
      case 'available':
        return '✓'
      case 'occupied':
        return '👤'
      case 'reserved':
        return '📋'
      case 'maintenance':
        return '🔧'
      default:
        return ''
    }
  }

  const formatTimeAgo = (date: Date): string => {
    const minutes = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60))
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }

  const selectedWardBeds = beds.filter(bed => bed.ward === selectedWard)
  const selectedWardInfo = wards.find(ward => ward.wardId === selectedWard)

  return (
    <div>
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nurse Dashboard</h1>
        <p className="text-gray-600">Monitor ward status and patient vitals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Ward Bed Status Grid */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-wrap gap-2 justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Ward Bed Status</h2>
            <select
              value={selectedWard}
              onChange={(e) => dispatch(setSelectedWard(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {wards.map(ward => (
                <option key={ward.wardId} value={ward.wardId}>
                  {ward.name} (Floor {ward.floor})
                </option>
              ))}
            </select>
          </div>

          {selectedWardInfo && (
            <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm sm:text-base">{selectedWardInfo.name}</h3>
                  <p className="text-blue-700 text-xs sm:text-sm">Floor {selectedWardInfo.floor} • {selectedWardInfo.totalBeds} total beds</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">
                      {selectedWardBeds.filter(b => b.status === 'available').length} <span className="hidden sm:inline">Available</span><span className="sm:hidden">Avail</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">
                      {selectedWardBeds.filter(b => b.status === 'occupied').length} <span className="hidden sm:inline">Occupied</span><span className="sm:hidden">Occ</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">
                      {selectedWardBeds.filter(b => b.status === 'reserved').length} <span className="hidden sm:inline">Reserved</span><span className="sm:hidden">Res</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-600">
                      {selectedWardBeds.filter(b => b.status === 'maintenance').length} <span className="hidden sm:inline">Maintenance</span><span className="sm:hidden">Maint</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
            {selectedWardBeds.map(bed => (
              <div
                key={bed.bedId}
                className={`relative p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${getStatusColor(bed.status)}`}
                title={`Bed ${bed.bedId} - ${bed.status}${bed.patientId ? ` - Patient ${bed.patientId}` : ''}`}
              >
                <div className="text-center">
                  <div className="text-sm sm:text-lg font-bold">{bed.bedId.split('-')[1]}</div>
                  <div className="text-xs mt-0.5 sm:mt-1">{getStatusIcon(bed.status)}</div>
                  {bed.patientId && (
                    <div className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 truncate">{bed.patientId}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Vitals Records */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Vitals</h2>
          <div className="space-y-3">
            {pendingVitals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending vitals</p>
            ) : (
              pendingVitals.map(patient => (
                <div
                  key={patient.id}
                  className="p-3 border border-orange-200 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                      <p className="text-sm text-gray-600">
                        {patient.age}y, {patient.gender} • Bed {patient.bedNumber}
                      </p>
                      {patient.lastVitalsTime && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last: {formatTimeAgo(new Date(patient.lastVitalsTime))}
                        </p>
                      )}
                      <p className="text-xs text-orange-600 mt-1">
                        {patient.statusReason}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">
                      Due
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {pendingVitals.length > 0 && (
            <Button
              onClick={() => navigate('/nurse/vitals')}
              customColor={`bg-gradient-to-r ${roleColors.primary} text-white hover:shadow-lg transform hover:scale-105 focus:ring-orange-500`}
              className="w-full mt-4"
            >
              Record Vitals
            </Button>
          )}
        </div>
      </div>

      {/* Recent Bed Status Changes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Bed Status Changes</h2>
        <div className="space-y-3">
          {recentChanges.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent changes</p>
          ) : (
            recentChanges.map(change => (
              <div
                key={change.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {change.bedId}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      change.newStatus === 'available' ? 'bg-green-100 text-green-800' :
                      change.newStatus === 'occupied' ? 'bg-red-100 text-red-800' :
                      change.newStatus === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {change.newStatus}
                    </span>
                  </div>
                  {change.patientId && (
                    <span className="text-sm text-gray-600">Patient {change.patientId}</span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {formatTimeAgo(change.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default NurseDashboard