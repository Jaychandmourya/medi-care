import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import { BarChart3, Clock, Users, TrendingUp, Activity } from 'lucide-react'

const QueueAnalytics = () => {
  const { queue, servedToday } = useSelector((state: RootState) => state.opd)

  // Calculate analytics
  const waitingTokens = queue.filter(token => token.status === 'waiting')
  const inProgressTokens = queue.filter(token => token.status === 'in-progress')
  const skippedTokens = queue.filter(token => token.status === 'skipped')
  const doneTokens = queue.filter(token => token.status === 'done')

  // Calculate wait times
  const waitTimes = waitingTokens.map(token => token.waitTime || 0)
  const averageWaitTime = waitTimes.length > 0 
    ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
    : 0
  
  const longestWait = waitTimes.length > 0 ? Math.max(...waitTimes) : 0

  // Department breakdown
  const departmentStats = queue.reduce((acc, token) => {
    if (!acc[token.department]) {
      acc[token.department] = {
        waiting: 0,
        inProgress: 0,
        skipped: 0,
        done: 0
      }
    }
    acc[token.department][token.status === 'in-progress' ? 'inProgress' : token.status]++
    return acc
  }, {} as Record<string, { waiting: number; inProgress: number; skipped: number; done: number }>)

  // Peak hour simulation (based on current hour)
  const currentHour = new Date().getHours()
  const isPeakHour = currentHour >= 9 && currentHour <= 11 || currentHour >= 16 && currentHour <= 18

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Queue Analytics
      </h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Total Active</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {waitingTokens.length + inProgressTokens.length + skippedTokens.length}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            {waitingTokens.length} waiting
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="text-xs text-green-600 font-medium">Served Today</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {servedToday}
          </div>
          <div className="text-xs text-green-700 mt-1">
            +{doneTokens.length} recent
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">Avg Wait</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {formatTime(averageWaitTime)}
          </div>
          <div className="text-xs text-orange-700 mt-1">
            Longest: {formatTime(longestWait)}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">Flow Rate</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {servedToday > 0 ? Math.round((servedToday / (waitingTokens.length + servedToday)) * 100) : 0}%
          </div>
          <div className="text-xs text-purple-700 mt-1">
            {isPeakHour ? 'Peak hours' : 'Normal hours'}
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Status Distribution</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xl font-bold text-yellow-700">{waitingTokens.length}</div>
            <div className="text-xs text-yellow-600">Waiting</div>
          </div>
          <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-xl font-bold text-green-700">{inProgressTokens.length}</div>
            <div className="text-xs text-green-600">In Progress</div>
          </div>
          <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-xl font-bold text-orange-700">{skippedTokens.length}</div>
            <div className="text-xs text-orange-600">Skipped</div>
          </div>
          <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-gray-700">{doneTokens.length}</div>
            <div className="text-xs text-gray-600">Done</div>
          </div>
        </div>
      </div>

      {/* Department Analytics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Department Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(departmentStats).map(([department, stats]) => {
            const total = stats.waiting + stats.inProgress + stats.skipped + stats.done
            const completionRate = total > 0 ? Math.round((stats.done / total) * 100) : 0
            
            return (
              <div key={department} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-800">{department}</div>
                  <div className="text-sm text-gray-600">
                    {total} total • {completionRate}% completed
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="font-bold text-yellow-700">{stats.waiting}</div>
                    <div className="text-yellow-600">Waiting</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-bold text-green-700">{stats.inProgress}</div>
                    <div className="text-green-600">In Progress</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="font-bold text-orange-700">{stats.skipped}</div>
                    <div className="text-orange-600">Skipped</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-gray-700">{stats.done}</div>
                    <div className="text-gray-600">Done</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Performance Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${averageWaitTime > 30 ? 'bg-red-500' : averageWaitTime > 15 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <span className="text-gray-600">Wait Time: {averageWaitTime > 30 ? 'High' : averageWaitTime > 15 ? 'Moderate' : 'Good'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${skippedTokens.length > 3 ? 'bg-red-500' : skippedTokens.length > 1 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <span className="text-gray-600">Skip Rate: {skippedTokens.length > 3 ? 'High' : skippedTokens.length > 1 ? 'Moderate' : 'Low'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPeakHour ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            <span className="text-gray-600">Peak Hours: {isPeakHour ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QueueAnalytics
