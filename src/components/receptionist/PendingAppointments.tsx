import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import { Calendar, Clock, User, AlertCircle } from 'lucide-react'

interface Appointment {
  id?: string
  date?: string
  dateTime?: string
  status?: string
  patientName?: string
  doctorName?: string
  doctorId?: string
  department?: string
}

const PendingAppointments = () => {
  const { appointments } = useSelector((state: RootState) => state.appointments)

  const todayAppointments = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return appointments.filter((appointment: Appointment) => {
      const appointmentDate = new Date(appointment.date || appointment.dateTime || '')
      return appointmentDate >= today && appointmentDate < tomorrow &&
             appointment.status !== 'completed' && appointment.status !== 'cancelled'
    })
  }, [appointments])

  const pendingCount = todayAppointments.length
  const upcomingAppointments = todayAppointments.slice(0, 5)

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-purple-200">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-bold text-purple-900">Pending Appointments</h2>
      </div>

      {/* Pending Count */}
      <div className="bg-white rounded-lg p-6 mb-4 border border-purple-200">
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-600 mb-2">{pendingCount}</div>
          <div className="text-sm text-gray-600">Pending for Today</div>
          <div className="text-xs text-purple-600 mt-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Alert if high pending count */}
      {pendingCount > 10 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">High pending appointments count</span>
          </div>
        </div>
      )}

      {/* Upcoming Appointments List */}
      <div className="space-y-3">
        {upcomingAppointments.length > 0 ? (
          upcomingAppointments.map((appointment: Appointment, index: number) => (
            <div key={appointment.id || index} className="bg-white rounded-lg p-4 border border-purple-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-800">{appointment.patientName || 'Patient'}</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status || 'pending')}`}>
                  {appointment.status || 'pending'}
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(appointment.date || appointment.dateTime || '')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>Dr. {appointment.doctorName || appointment.doctorId || 'Doctor'}</span>
                </div>
                {appointment.department && (
                  <div className="text-xs text-purple-600">
                    {appointment.department}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No pending appointments for today</p>
          </div>
        )}
      </div>

      {/* Show more indicator */}
      {pendingCount > 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
            View {pendingCount - 5} more appointments →
          </button>
        </div>
      )}
    </div>
  )
}

export default PendingAppointments
