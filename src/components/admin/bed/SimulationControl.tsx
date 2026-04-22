import React from 'react'
import { Play, Pause, Zap } from 'lucide-react'
import { FormButton } from '@/components/common/FormButton'

interface SimulationControlProps {
  isEnabled: boolean
  onToggle: () => void
}

const SimulationControl: React.FC<SimulationControlProps> = ({
  isEnabled,
  onToggle
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <FormButton
        onClick={onToggle}
        variant={isEnabled ? 'default' : 'secondary'}
        size="default"
        className={`flex items-center space-x-2 shadow-lg transition-all duration-200 ${
          isEnabled
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-600 hover:bg-gray-700 text-white'
        }`}
      >
        {isEnabled ? (
          <>
            <Pause className="w-5 h-5" />
            <span className="font-medium">Stop Simulation</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            <span className="font-medium">Start Simulation</span>
          </>
        )}
        <Zap className={`w-4 h-4 ${isEnabled ? 'animate-pulse' : ''}`} />
      </FormButton>

      {isEnabled && (
        <div className="absolute bottom-full mb-2 right-0 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
          Auto simulation active - changes every 45s
        </div>
      )}
    </div>
  )
}

export default SimulationControl
