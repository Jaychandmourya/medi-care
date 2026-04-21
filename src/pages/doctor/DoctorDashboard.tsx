import { useEffect, useMemo } from 'react'

// Import Date time package
import { format, isToday, startOfDay, endOfDay, parseISO } from 'date-fns'

// Import icons file
import {
  Calendar,
  Clock,
  Users,
  FileText,
  ChevronRight,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  PlayCircle
} from 'lucide-react'

// Import router navigate
import { useNavigate } from 'react-router-dom'

// Import dispatch and selector for redux
import { useAppSelector, useAppDispatch } from '@/app/hooks'

// Import Thunk file for redux
import { getAllPatients } from '@/features/patient/patientThunk'

// Import Slice file for redux
import { fetchAppointments, fetchDoctorSchedules } from '@/features/appointment/appointmentSlice'
import { loadPrescriptionHistory } from '@/features/prescription/prescriptionSlice'

const DoctorDashboard = () => {

  const navigate = useNavigate()

  // Redux dispatch
  const dispatch = useAppDispatch()

  // Redux selector
  const { user } = useAppSelector((state) => state.auth)
  const {
    appointments,
    doctorSchedules
  } = useAppSelector((state) => state.appointments)
  const { prescriptionHistory } = useAppSelector((state) => state.prescriptions)
  const patients = useAppSelector((state) => state.patients.list)

  // Computed

  // Get current doctor ID from auth or localStorage
  const getCurrentDoctorId = () => {
    if (user?.role === 'doctor') {
      const doctorInfo = localStorage.getItem('doctorInfo')
      if (doctorInfo) {
        const info = JSON.parse(doctorInfo)
        return info.doctorId
      }
    }
    return null
  }

  const doctorId = getCurrentDoctorId()

  // UseEffect
  useEffect(() => {
    if (doctorId) {
      const today = new Date()
      const todayStart = startOfDay(today)
      const todayEnd = endOfDay(today)

      dispatch(fetchAppointments({
        doctorId,
        startDate: todayStart,
        endDate: todayEnd
      }))
      dispatch(getAllPatients())
      dispatch(fetchDoctorSchedules())
      dispatch(loadPrescriptionHistory())
    }
  }, [dispatch, doctorId])

  // Filter data for current doctor only
  const doctorAppointments = useMemo(() => {
    return appointments.filter(apt => apt.doctorId === doctorId)
  }, [appointments, doctorId])

  const todayAppointments = useMemo(() => {
    return doctorAppointments.filter(apt =>
      isToday(parseISO(apt.date))
    ).sort((a, b) => a.slot.localeCompare(b.slot))
  }, [doctorAppointments])

  const nextPatient = useMemo(() => {
    const now = new Date()
    const currentTime = format(now, 'HH:mm')

    const upcomingAppointments = todayAppointments.filter(apt =>
      apt.status === 'scheduled' && apt.slot > currentTime
    )

    return upcomingAppointments.length > 0 ? upcomingAppointments[0] : null
  }, [todayAppointments])

  const prescriptionsToday = useMemo(() => {
    return prescriptionHistory.filter(prescription =>
      prescription.doctorId === doctorId &&
      isToday(parseISO(prescription.createdAt))
    ).length
  }, [prescriptionHistory, doctorId])

    const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    return patient?.name || 'Unknown Patient'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'no_show':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-3 w-3" />
      case 'confirmed':
        return <CheckCircle className="h-3 w-3" />
      case 'in_progress':
        return <PlayCircle className="h-3 w-3" />
      case 'completed':
        return <CheckCircle className="h-3 w-3" />
      case 'cancelled':
        return <AlertCircle className="h-3 w-3" />
      case 'no_show':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Waiting'
      case 'confirmed':
        return 'Confirmed'
      case 'in_progress':
        return 'In Progress'
      case 'completed':
        return 'Done'
      case 'cancelled':
        return 'Cancelled'
      case 'no_show':
        return 'No Show'
      default:
        return status
    }
  }

  // Get today's schedule slots
  const todaySchedule = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()

    const schedule = doctorSchedules.find(ds =>
      ds.doctorId === doctorId &&
      ds.workingDays.includes(dayOfWeek)
    )

    if (!schedule) return []

    const slots = []
    const start = schedule.startTime
    const end = schedule.endTime
    const duration = schedule.slotDuration

    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)

    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    for (let time = startTime; time < endTime; time += duration) {
      const hour = Math.floor(time / 60)
      const minute = time % 60
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    }

    return slots
  }, [doctorSchedules, doctorId])

  if (!doctorId) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Please log in as a doctor to view the dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div>
        {/* Header */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your overview for today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{todayAppointments.length}</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {todayAppointments.filter(apt => apt.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-100 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/doctor/prescriptions')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prescriptions Today</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{prescriptionsToday}</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center text-blue-600 mt-2 text-sm">
              <span>View all</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {new Set(todayAppointments.map(apt => apt.patientId)).size}
                </p>
              </div>
              <div className="bg-indigo-100 rounded-lg p-3">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Next Patient Card */}
          <div className="lg:col-span-1">
            <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Next Patient
              </h2>
              {nextPatient ? (
                <div>
                  <div className="bg-white/20 backdrop-blur rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold mb-2">
                      {getPatientName(nextPatient.patientId)}
                    </h3>
                    <div className="space-y-2 text-blue-100">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{nextPatient.slot}</span>
                      </div>
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        <span>{nextPatient.reason}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/doctor/appointments')}
                    className="w-full bg-white text-blue-600 rounded-lg py-2 px-4 font-medium hover:bg-blue-50 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-blue-100">No more patients today</p>
                </div>
              )}
            </div>
          </div>

          {/* Today's Appointments List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Today's Appointments
              </h2>
              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate('/doctor/appointments')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 rounded-lg p-2">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {getPatientName(appointment.patientId)}
                              </h3>
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{appointment.slot}</p>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              {getStatusText(appointment.status)}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Summary */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Today's Schedule Summary
            </h2>
            {todaySchedule.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {todaySchedule.map((slot, index) => {
                  const hasAppointment = todayAppointments.find(apt => apt.slot === slot)
                  return (
                    <div
                      key={index}
                      className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium ${
                        hasAppointment
                          ? hasAppointment.status === 'completed'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : hasAppointment.status === 'in_progress'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {slot}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">No schedule available for today</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard