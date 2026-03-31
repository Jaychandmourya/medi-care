import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '@/app/store'
import { Users, Calendar, Plus, Ticket, TrendingUp, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import LiveQueueWidget from '@/components/receptionist/LiveQueueWidget'
import RegistrationStats from '@/components/receptionist/RegistrationStats'
import PendingAppointments from '@/components/receptionist/PendingAppointments'

const ReceptionistDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRegisterPatient = () => {
    navigate('/receptionist/patients')
  }

  const handleIssueToken = () => {
    navigate('/receptionist/opd')
  }

  const handleBookAppointment = () => {
    navigate('/receptionist/appointments')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-900 flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                Receptionist Dashboard
              </h1>
              <p className="text-purple-700 mt-2 text-sm sm:text-base lg:text-lg">
                Welcome back, {user?.name || 'Receptionist'} • {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
              </p>
            </div>
            <div className="bg-white px-4 sm:px-6 py-3 rounded-xl shadow-lg border border-purple-200 backdrop-blur-sm bg-opacity-90">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <span className="font-semibold text-purple-900 text-sm sm:text-base">Role: Receptionist</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-purple-200 backdrop-blur-sm bg-opacity-90">
            <h2 className="text-lg sm:text-xl font-bold text-purple-900 mb-4 sm:mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Button
                onClick={handleRegisterPatient}
                className="flex items-center justify-center gap-2 h-14 sm:h-16 text-sm sm:text-base lg:text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Register New Patient
              </Button>
              <Button
                onClick={handleIssueToken}
                className="flex items-center justify-center gap-2 h-14 sm:h-16 text-sm sm:text-base lg:text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl"
              >
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
                Issue Token
              </Button>
              <Button
                onClick={handleBookAppointment}
                className="flex items-center justify-center gap-2 h-14 sm:h-16 text-sm sm:text-base lg:text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Book Appointment
              </Button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - OPD Queue Live View */}
          <div className="xl:col-span-2">
            <LiveQueueWidget />
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-4 sm:space-y-6">
            <RegistrationStats />
            <PendingAppointments />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceptionistDashboard