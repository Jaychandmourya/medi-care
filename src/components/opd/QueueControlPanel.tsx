import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { advanceQueue, skipToken, requeueToken, toggleSimulation, decrementTimer, resetTimer, updateWaitTimes } from '@/features/opd/opdSlice'
import type { AppDispatch, RootState } from '@/app/store'
import { Play, Pause, SkipForward, RotateCcw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const QueueControlPanel = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { queue, currentToken, simulationRunning, countdownTimer } = useSelector((state: RootState) => state.opd)
  const { user } = useSelector((state: RootState) => state.auth)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    let countdownInterval: number | null = null
    let advanceInterval: number | null = null

    if (simulationRunning) {
      // Countdown timer - decrement every second
      countdownInterval = setInterval(() => {
        dispatch(decrementTimer())
      }, 1000)

      // Auto advance every 30 seconds
      advanceInterval = setInterval(() => {
        dispatch(advanceQueue())
        dispatch(updateWaitTimes())
        dispatch(resetTimer())
      }, 30000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval)
      if (advanceInterval) clearInterval(advanceInterval)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [simulationRunning, dispatch])

  // Auto-stop simulation when no more tokens
  useEffect(() => {
    if (simulationRunning) {
      const waitingTokens = queue.filter(token => token.status === 'waiting')
      const inProgressTokens = queue.filter(token => token.status === 'in-progress')

      if (waitingTokens.length === 0 && inProgressTokens.length === 0) {
        dispatch(toggleSimulation())
      }
    }
  }, [queue, simulationRunning, dispatch])

  // Update wait times every minute
  useEffect(() => {
    const waitTimeInterval = setInterval(() => {
      dispatch(updateWaitTimes())
    }, 60000) // 1 minute

    return () => clearInterval(waitTimeInterval)
  }, [dispatch])

  const currentTokenData = queue.find(token => token.tokenId === currentToken)
  const skippedTokens = queue.filter(token => token.status === 'skipped')

  const handleAdvance = () => {
    dispatch(advanceQueue())
  }

  const handleSkip = () => {
    if (currentToken) {
      dispatch(skipToken(currentToken))
    }
  }

  const handleRequeue = (tokenId: number) => {
    dispatch(requeueToken(tokenId))
  }

  const toggleSimulationHandler = () => {
    dispatch(toggleSimulation())
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-black">
        <Clock className="w-5 h-5" />
        Queue Control
      </h2>

      {/* Simulation Control */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Auto Simulation</h3>
          <Button
            onClick={toggleSimulationHandler}
            variant={simulationRunning ? 'destructive' : 'default'}
            className="flex items-center gap-2"
            customColor={!simulationRunning && user?.role === 'receptionist' ? 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg transform hover:scale-105 focus:ring-purple-500' : undefined}
          >
            {simulationRunning ? (
              <>
                <Pause className="w-5 h-5" />
                Stop Simulation
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Simulation
              </>
            )}
          </Button>
        </div>

        {simulationRunning && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Auto-advancing queue
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-bold text-lg">{countdownTimer}s</span>
              </div>
            </div>
            <div className="mt-2 bg-green-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdownTimer / 30) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Manual Controls</h3>
        <div className="flex gap-3">
          <Button
            onClick={handleAdvance}
            disabled={!currentToken}
            variant="default"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <SkipForward className="w-5 h-5" />
            Call Next
          </Button>
          <Button
            onClick={handleSkip}
            disabled={!currentToken}
            variant="destructive"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Skip Current
          </Button>
        </div>
      </div>

      {/* Current Token Info */}
      {currentTokenData && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Currently Serving</h3>
          <div className="text-lg font-bold text-blue-900">
            #{currentTokenData.tokenId} - {currentTokenData.patientName}
          </div>
          <div className="text-sm text-blue-700">
            {currentTokenData.department}
          </div>
        </div>
      )}

      {/* Skipped Tokens */}
      {skippedTokens.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Skipped Patients</h3>
          <div className="space-y-2">
            {skippedTokens.map(token => (
              <div key={token.tokenId} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-md">
                <div>
                  <div className="font-medium text-gray-800">
                    #{token.tokenId} - {token.patientName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {token.department}
                  </div>
                </div>
                <Button
                  onClick={() => handleRequeue(token.tokenId)}
                  variant="destructive"
                  size="sm"
                >
                  Re-queue
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!currentToken && skippedTokens.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <div>No active tokens in queue</div>
        </div>
      )}
    </div>
  )
}

export default QueueControlPanel
