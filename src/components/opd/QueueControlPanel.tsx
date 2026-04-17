import { useEffect, useRef, useMemo, useCallback } from 'react'

// Import icons file
import { Play, Pause, SkipForward, RotateCcw, Clock } from 'lucide-react'

// Import UI components
import { Button } from '@/components/ui/Button'

// Import Types files
import type { AppDispatch, RootState } from '@/app/store'

// Import dispatch and selector for redux
import { useDispatch, useSelector } from 'react-redux'

// Import Slice file for redux
import { advanceQueue, skipToken, requeueToken, toggleSimulation, decrementTimer, resetTimer, updateWaitTimes } from '@/features/opd/opdSlice'

const QueueControlPanel = () => {

  const dispatch = useDispatch<AppDispatch>()

  // Redux selector - combine into single selector to reduce re-renders
  const { queue, currentToken, simulationRunning, countdownTimer } = useSelector((state: RootState) => ({
    queue: state.opd.queue,
    currentToken: state.opd.currentToken,
    simulationRunning: state.opd.simulationRunning,
    countdownTimer: state.opd.countdownTimer
  }))

  // Refs
  const intervalRef = useRef<number | null>(null)

  // Effects
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
      const hasWaiting = queue.some(token => token.status === 'waiting')
      const hasInProgress = queue.some(token => token.status === 'in-progress')
      if (!hasWaiting && !hasInProgress) {
        dispatch(toggleSimulation())
      }
    }
  }, [simulationRunning, queue, dispatch])

  // Update wait times every minute
  useEffect(() => {
    const waitTimeInterval = setInterval(() => {
      dispatch(updateWaitTimes())
    }, 60000) // 1 minute

    return () => clearInterval(waitTimeInterval)
  }, [dispatch])

  // Computed values to prevent recalculation on every render
  const currentTokenData = useMemo(() =>
    queue.find(token => token.tokenId === currentToken),
    [queue, currentToken]
  )

  const skippedTokens = useMemo(() =>
    queue.filter(token => token.status === 'skipped'),
    [queue]
  )

  // Handlers to prevent unnecessary function recreation
  const handleAdvance = useCallback(() => {
    dispatch(advanceQueue())
  }, [dispatch])

  const handleSkip = useCallback(() => {
    if (currentToken) {
      dispatch(skipToken(currentToken))
    }
  }, [dispatch, currentToken])

  const handleRequeue = useCallback((tokenId: number) => {
    dispatch(requeueToken(tokenId))
  }, [dispatch])

  const toggleSimulationHandler = useCallback(() => {
    dispatch(toggleSimulation())
  }, [dispatch])

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      {/* Header */}
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2 text-black">
        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
        Queue Control
      </h2>

      {/* Simulation Control */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700">Auto Simulation</h3>
          <Button
            onClick={toggleSimulationHandler}
            variant={simulationRunning ? 'destructive' : 'default'}
            className="w-full sm:w-auto justify-center"
            size="sm"
          >
            {simulationRunning ? (
              <>
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                <span className="sm:hidden">Stop</span>
                <span className="hidden sm:inline">Stop Simulation</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                <span className="sm:hidden">Start</span>
                <span className="hidden sm:inline">Start Simulation</span>
              </>
            )}
          </Button>
        </div>

        {simulationRunning && (
          <div className="bg-green-50 border border-green-200 rounded-md p-2.5 sm:p-3 text-xs sm:text-sm text-green-700">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0"></div>
                <span className="truncate">Auto-advancing queue</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-bold text-base sm:text-lg">{countdownTimer}s</span>
              </div>
            </div>
            <div className="mt-2 bg-green-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdownTimer / 30) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Controls */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Manual Controls</h3>
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
          <Button
            onClick={handleAdvance}
            disabled={!currentToken}
            variant="default"
            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2"
            size="sm"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="sm:hidden">Next</span>
            <span className="hidden sm:inline">Call Next</span>
          </Button>
          <Button
            onClick={handleSkip}
            disabled={!currentToken}
            variant="destructive"
            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="sm:hidden">Skip</span>
            <span className="hidden sm:inline">Skip Current</span>
          </Button>
        </div>
      </div>

      {/* Current Token Info */}
      {currentTokenData && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="text-xs sm:text-sm font-semibold text-blue-800 mb-1.5 sm:mb-2">Currently Serving</h3>
          <div className="text-base sm:text-lg font-bold text-blue-900 truncate">
            #{currentTokenData.tokenId} - {currentTokenData.patientName}
          </div>
          <div className="text-xs sm:text-sm text-blue-700">
            {currentTokenData.department}
          </div>
        </div>
      )}

      {/* Skipped Tokens */}
      {skippedTokens.length > 0 && (
        <div>
          <h3 className="text-sm sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Skipped Patients ({skippedTokens.length})</h3>
          <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
            {skippedTokens.map(token => (
              <div key={token.tokenId} className="flex flex-col xs:flex-row xs:items-center xs:justify-between p-2.5 sm:p-3 bg-orange-50 border border-orange-200 rounded-md gap-2 xs:gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-gray-800 text-sm sm:text-base truncate">
                    #{token.tokenId} - {token.patientName}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {token.department}
                  </div>
                </div>
                <Button
                  onClick={() => handleRequeue(token.tokenId)}
                  variant="destructive"
                  size="sm"
                  className="w-full xs:w-auto shrink-0 text-xs sm:text-sm"
                >
                  Re-queue
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!currentToken && skippedTokens.length === 0 && (
        <div className="text-center text-gray-400 py-6 sm:py-8">
          <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
          <div className="text-sm sm:text-base">No active tokens in queue</div>
        </div>
      )}
    </div>
  )
}

export default QueueControlPanel
