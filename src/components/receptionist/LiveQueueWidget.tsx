import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import { Monitor, Users, Clock, ArrowRight, RefreshCw } from 'lucide-react'

const LiveQueueWidget = () => {
  const { queue, currentToken, servedToday } = useSelector((state: RootState) => state.opd)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true)

  // Simulate auto-refresh with setInterval
  useEffect(() => {
    if (!isAutoRefreshing) return

    const interval = setInterval(() => {
      setLastUpdate(new Date())
      // In a real app, this would fetch fresh data
      // For now, we just update the timestamp to simulate live updates
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoRefreshing])

  const currentTokenData = queue.find(token => token.tokenId === currentToken)
  const nextTokens = queue.filter(token => token.status === 'waiting').slice(0, 5)
  const waitingCount = queue.filter(token => token.status === 'waiting').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-green-100 text-green-800 border-green-200'
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'skipped': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'done': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatWaitTime = (minutes?: number) => {
    if (!minutes) return 'Just now'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-purple-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-purple-900 flex items-center gap-2">
          <Monitor className="w-6 h-6 text-purple-600" />
          OPD Queue Live View
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAutoRefreshing(!isAutoRefreshing)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              isAutoRefreshing 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isAutoRefreshing ? 'animate-spin' : ''}`} />
            {isAutoRefreshing ? 'Live' : 'Paused'}
          </button>
          <div className="bg-white px-3 py-1 rounded-full shadow border border-purple-200">
            <Users className="w-4 h-4 inline mr-1 text-purple-600" />
            Served Today: {servedToday}
          </div>
        </div>
      </div>

      <div className="text-xs text-purple-600 mb-4 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>

      {/* Current Token */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-purple-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-purple-600 mb-2">Now Serving</h3>
          {currentTokenData ? (
            <div className="space-y-2">
              <div className="text-4xl font-bold text-purple-600">
                #{currentTokenData.tokenId}
              </div>
              <div className="text-xl font-medium text-gray-800">
                {currentTokenData.patientName}
              </div>
              <div className="text-sm text-gray-600">
                {currentTokenData.department} • Dr. {currentTokenData.doctorId}
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                In Progress
              </div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-400 py-8">
              No tokens in progress
            </div>
          )}
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 text-center border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{waitingCount}</div>
          <div className="text-xs text-gray-600">Waiting</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center border border-purple-200">
          <div className="text-2xl font-bold text-green-600">{servedToday}</div>
          <div className="text-xs text-gray-600">Served Today</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center border border-purple-200">
          <div className="text-2xl font-bold text-blue-600">{queue.length}</div>
          <div className="text-xs text-gray-600">Total Today</div>
        </div>
      </div>

      {/* Next 5 Tokens */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
          <ArrowRight className="w-5 h-5" />
          Next in Queue ({nextTokens.length})
        </h3>
        {nextTokens.length > 0 ? (
          <div className="space-y-3">
            {nextTokens.map((token, index) => (
              <div key={token.tokenId} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-200 text-purple-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      #{token.tokenId} • {token.patientName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {token.department}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatWaitTime(token.waitTime)}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(token.status)}`}>
                    {token.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">
            No waiting tokens
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveQueueWidget
