import React from 'react'
import type{ Bed } from '@/types/bed/bedType'
import { BedDouble, User, Clock, Wrench, BarChart3 } from 'lucide-react'

interface BedAvailabilitySummaryProps {
  beds: Bed[]
  selectedWard: string
}

const BedAvailabilitySummary: React.FC<BedAvailabilitySummaryProps> = ({
  beds,
  selectedWard
}) => {

  const currentWardBeds = beds.filter(bed => bed.ward === selectedWard)

  const statusCounts = {
    available: currentWardBeds.filter(b => b.status === 'available').length,
    occupied: currentWardBeds.filter(b => b.status === 'occupied').length,
    reserved: currentWardBeds.filter(b => b.status === 'reserved').length,
    maintenance: currentWardBeds.filter(b => b.status === 'maintenance').length
  }

  const totalBeds = currentWardBeds.length
  const occupancyRate = totalBeds > 0 ? Math.round((statusCounts.occupied / totalBeds) * 100) : 0

  const summaryItems = [
    {
      label: 'Available',
      count: statusCounts.available,
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: BedDouble
    },
    {
      label: 'Occupied',
      count: statusCounts.occupied,
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: User
    },
    {
      label: 'Reserved',
      count: statusCounts.reserved,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Clock
    },
    {
      label: 'Maintenance',
      count: statusCounts.maintenance,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Wrench
    }
  ]

  return (
    <div className="bg-white border-b">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Bed Availability Summary</h3>
          </div>
          <div className="text-base text-gray-700">
            Occupancy Rate: <span className="font-semibold text-gray-800">{occupancyRate}%</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {summaryItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className={`p-3 rounded-lg border ${item.color} transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span className="text-base font-medium">{item.label}</span>
                  </div>
                  <span className="text-lg font-bold">{item.count}</span>
                </div>
                <div className="mt-1 text-sm opacity-75 font-medium">
                  {totalBeds > 0 && Math.round((item.count / totalBeds) * 100)}% of ward
                </div>
              </div>
            )
          })}
        </div>

        {/* Total Beds */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center gap-4 text-base">
            <span className="text-gray-700 ">Total Beds in Ward:</span>
            <span className="font-semibold text-gray-800">{totalBeds}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BedAvailabilitySummary
