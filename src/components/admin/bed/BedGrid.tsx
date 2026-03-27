import React, { useEffect, useState, useMemo, useCallback } from 'react'
import type { Bed } from '@/features/bed/bedSlice'
import { BedDouble, User, Clock, AlertTriangle, Wrench } from 'lucide-react'
import { getPatientNamesForBeds } from '@/utils/patientUtils'

interface BedGridProps {
  beds: Bed[]
  onBedClick: (bed: Bed) => void
}

const statusColors = {
  available: 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200',
  occupied: 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200',
  reserved: 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200',
  maintenance: 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200'
}

const statusIcons = {
  available: BedDouble,
  occupied: User,
  reserved: Clock,
  maintenance: Wrench
}

const BedGrid: React.FC<BedGridProps> = React.memo(({ beds, onBedClick }) => {
  const [patientNames, setPatientNames] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    const fetchPatientNames = async () => {
      const names = await getPatientNamesForBeds(beds)
      setPatientNames(names)
    }
    fetchPatientNames()
  }, [beds])

  const handleBedClick = useCallback((bed: Bed) => {
    onBedClick(bed)
  }, [onBedClick])

  const bedElements = useMemo(() => {
    return beds.map((bed) => {
      const StatusIcon = statusIcons[bed.status]
      const patientName = bed.patientId ? patientNames.get(bed.patientId) : undefined
      return (
        <button
          key={bed.bedId}
          onClick={() => handleBedClick(bed)}
          className={`
            relative p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105
            flex flex-col items-center justify-center min-h-25 cursor-pointer
            ${statusColors[bed.status]}
          `}
        >
          <StatusIcon className="w-6 h-6 mb-2" />
          <span className="font-semibold text-sm">{bed.bedId}</span>

          {patientName && (
            <span className="text-xs mt-1 opacity-75">{patientName}</span>
          )}

          {bed.status === 'maintenance' && (
            <AlertTriangle className="absolute top-2 right-2 w-4 h-4" />
          )}

          <div className="absolute bottom-2 right-2">
            <div className={`
              w-3 h-3 rounded-full
              ${bed.status === 'available' ? 'bg-green-500' : ''}
              ${bed.status === 'occupied' ? 'bg-red-500' : ''}
              ${bed.status === 'reserved' ? 'bg-yellow-500' : ''}
              ${bed.status === 'maintenance' ? 'bg-gray-500' : ''}
            `} />
          </div>
        </button>
      )
    })
  }, [beds, patientNames, handleBedClick])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4">
      {bedElements}
    </div>
  )
})

export default BedGrid
