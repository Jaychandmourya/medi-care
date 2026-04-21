import React from 'react'
import type { Ward } from '@/types/bed/bedType'
import { Label } from '@/components/common/Label'
import Input from '@/components/common/Input'

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
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 md:gap-4 p-3 md:p-4 bg-white border-b">
      <div className="flex items-center gap-2">
        <Label className="text-sm md:text-base font-medium text-gray-700 whitespace-nowrap">Ward:</Label>
        <div className="w-full md:w-auto md:min-w-50">
          <Input
            as="select"
            value={selectedWard}
            onChange={(e) => onWardChange(e.target.value)}
            className="w-full md:w-auto appearance-none bg-white border text-gray-800 border-gray-300 rounded-lg px-3 md:px-4 py-2 pr-8 text-sm md:text-base focus:ring-2  cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {wards.map(ward => (
              <option key={ward.wardId} value={ward.wardId}>
                {ward.name} (Floor {ward.floor})
              </option>
            ))}
          </Input>
        </div>
      </div>

      {currentWard && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm md:text-base text-gray-700 md:ml-2">
          <span>Total Beds: <span className="font-semibold text-gray-800">{currentWard.totalBeds}</span></span>
          <span>Floor: <span className="font-semibold text-gray-800">{currentWard.floor}</span></span>
        </div>
      )}
    </div>
  )
}

export default WardSwitcher
