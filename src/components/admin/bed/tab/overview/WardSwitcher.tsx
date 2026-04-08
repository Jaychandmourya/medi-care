import React from 'react'
import type { Ward } from '@/features/bed/bedSlice'
import { ChevronDown } from 'lucide-react'
import { Label } from '@/components/ui/Label'

interface WardSwitcherProps {
  wards: Ward[]
  selectedWard: string
  onWardChange: (wardId: string) => void
}

const WardSwitcher: React.FC<WardSwitcherProps> = ({
  wards,
  selectedWard,
  onWardChange
}) => {
  const currentWard = wards.find(w => w.wardId === selectedWard)

  return (
    <div className="flex items-center space-x-4 p-4 bg-white border-b">
      <div className="flex items-center space-x-2">
        <Label className="text-base font-medium text-gray-700">Ward:</Label>
        <div className="relative">
          <select
            value={selectedWard}
            onChange={(e) => onWardChange(e.target.value)}
            className="appearance-none bg-white border text-gray-800 border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {wards.map(ward => (
              <option key={ward.wardId} value={ward.wardId}>
                {ward.name} (Floor {ward.floor})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {currentWard && (
        <div className="flex items-center space-x-4 text-base text-gray-700">
          <span>Total Beds: <span className="font-semibold text-gray-800">{currentWard.totalBeds}</span></span>
          <span>Floor: <span className="font-semibold text-gray-800">{currentWard.floor}</span></span>
        </div>
      )}
    </div>
  )
}

export default WardSwitcher
