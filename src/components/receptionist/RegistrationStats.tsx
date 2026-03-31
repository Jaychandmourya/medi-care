import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import type { PatientFormData } from '@/lib/patientValidation'
import { Users, TrendingUp, Calendar } from 'lucide-react'

const RegistrationStats = () => {
  const { list: patients } = useSelector((state: RootState) => state.patients)

  const stats = useMemo(() => {
    // Calculate today's registrations
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayRegistrations = patients.filter((patient: PatientFormData) => {
      const registrationDate = new Date(patient.createdAt || '')
      return registrationDate >= today
    })

    // Calculate weekly registrations
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    weekAgo.setHours(0, 0, 0, 0)

    const weeklyRegistrations = patients.filter((patient: PatientFormData) => {
      const registrationDate = new Date(patient.createdAt || '')
      return registrationDate >= weekAgo
    })

    // Calculate monthly registrations
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    monthAgo.setHours(0, 0, 0, 0)

    const monthlyRegistrations = patients.filter((patient: PatientFormData) => {
      const registrationDate = new Date(patient.createdAt || '')
      return registrationDate >= monthAgo
    })

    return {
      todayCount: todayRegistrations.length,
      weeklyCount: weeklyRegistrations.length,
      monthlyCount: monthlyRegistrations.length
    }
  }, [patients])

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-purple-200">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-bold text-purple-900">Today's Registration Count</h2>
      </div>

      {/* Main Today Count */}
      <div className="bg-white rounded-lg p-6 mb-4 border border-purple-200">
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-600 mb-2">{stats.todayCount}</div>
          <div className="text-sm text-gray-600">New Patients Today</div>
          <div className="text-xs text-purple-600 mt-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="space-y-3">
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">This Week</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-purple-600">{stats.weeklyCount}</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">This Month</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-purple-600">{stats.monthlyCount}</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="mt-4 p-3 bg-purple-100 rounded-lg border border-purple-200">
        <div className="text-xs text-purple-700">
          <div className="flex justify-between mb-1">
            <span>Average per day:</span>
            <span className="font-semibold">{stats.weeklyCount > 0 ? Math.round(stats.weeklyCount / 7) : 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Total patients:</span>
            <span className="font-semibold">{patients.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationStats
