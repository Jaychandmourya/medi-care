import { useState, useEffect, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'

// Import icon file
import { Users, Calendar, Plus, Ticket, TrendingUp, Activity } from 'lucide-react'

// Import UI components
import { Button } from '@/components/common/Button'

// Import types file
import type { RootState } from '@/app/store'

import { useSelector } from 'react-redux'

// Lazy loaded components
const LiveQueueWidget = lazy(() => import('@/components/receptionist/LiveQueueWidget'))
const RegistrationStats = lazy(() => import('@/components/receptionist/RegistrationStats'))
const PendingAppointments = lazy(() => import('@/components/receptionist/PendingAppointments'))


const ReceptionistDashboard = () => {

  const navigate = useNavigate()

  // Redux Selector
  const { user } = useSelector((state: RootState) => state.auth)

  // State
  const [currentTime, setCurrentTime] = useState(new Date())

  // UseEffect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Method
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
    <div>
      <div className="">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-purple-200 backdrop-blur-sm bg-opacity-90 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-purple-900 flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                Receptionist Dashboard
              </h1>
              <p className="text-purple-700 mt-2 text-sm sm:text-base">
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
            <Suspense fallback={
              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200 animate-pulse">
                <div className="h-4 bg-purple-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            }>
              <LiveQueueWidget />
            </Suspense>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-4 sm:space-y-6">
            <Suspense fallback={
              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200 animate-pulse">
                <div className="h-4 bg-purple-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            }>
              <RegistrationStats />
            </Suspense>
            <Suspense fallback={
              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200 animate-pulse">
                <div className="h-4 bg-purple-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            }>
              <PendingAppointments />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceptionistDashboard