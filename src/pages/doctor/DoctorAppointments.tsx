import { useEffect, lazy, Suspense } from 'react';

// Import date package
import { startOfWeek, addDays } from 'date-fns';

// Import Types files
import type { Appointment } from '@/types/appointment/appointmentType';

// Import selector and dispatch for redux
import { useAppSelector, useAppDispatch } from '@/app/hooks';

// Import Thunk file for redux
import { getAllPatients } from "@/features/patient/patientThunk";

// Import Slice file for redux
import {
  fetchAppointments,
  fetchDoctorSchedules,
  updateAppointment,
  setSelectedWeek,
  setSelectedDate,
  setSelectedAppointment,
  setShowDetailModal,
  setShowRescheduleModal,
} from '@/features/appointment/appointmentSlice';

// Import lazy loading
const WeeklyCalendar = lazy(() => import('@/components/admin/appointment/WeeklyCalendar'));
const AppointmentDetailModal = lazy(() => import('@/components/admin/appointment/dialog/AppointmentDetailModal'));
const RescheduleModal = lazy(() => import('@/components/admin/appointment/dialog/RescheduleModal'));

const DoctorAppointments = () => {

  // Redux dispatch
  const dispatch = useAppDispatch();

   // Redux selector
  const { user } = useAppSelector((state) => state.auth);
  const {
    appointments,
    patients,
    doctorSchedules,
    loading,
    showDetailModal,
    showRescheduleModal
  } = useAppSelector((state) => state.appointments);

  // Get current doctor ID from auth or localStorage
  const getCurrentDoctorId = () => {
    if (user?.role === 'doctor') {
      const doctorInfo = localStorage.getItem('doctorInfo');
      if (doctorInfo) {
        const info = JSON.parse(doctorInfo);
        return info.doctorId;
      }
    }
    return null;
  };

  const doctorId = getCurrentDoctorId();

  // Filter appointments for current doctor only
  const doctorAppointments = appointments.filter(apt => apt.doctorId === doctorId);

  // UseEffect
  useEffect(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = addDays(weekStart, 6);

    dispatch(fetchAppointments({
      doctorId,
      startDate: weekStart,
      endDate: weekEnd
    }));
    dispatch(getAllPatients());
    dispatch(fetchDoctorSchedules());
  }, [dispatch, doctorId]);

  // Methods
  const handleUpdateAppointment = (params: { id: string; updates: Partial<Appointment> }) => {
    dispatch(updateAppointment(params));
  };

  const handleSetSelectedWeek = (week: string) => {
    dispatch(setSelectedWeek(week));
  };

  const handleSetSelectedDate = (date: string) => {
    dispatch(setSelectedDate(date));
  };

  const handleSetSelectedAppointment = (appointment: Appointment) => {
    dispatch(setSelectedAppointment(appointment));
  };

  const handleShowDetailModal = () => {
    dispatch(setShowDetailModal(true));
  };

  const handleCloseDetailModal = () => {
    dispatch(setShowDetailModal(false));
  };

  const handleShowRescheduleModal = () => {
    dispatch(setShowRescheduleModal(true));
  };

  const handleCloseRescheduleModal = () => {
    dispatch(setShowRescheduleModal(false));
  };

  // Role colors for doctor
  const roleColors = {
    primary: 'green',
    secondary: 'green-100',
    calendar: 'border-green-200',
    header: 'bg-green-600'
  };

  return (
    <div>
      <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Appointments</h1>
            <p className="text-gray-600">Manage and view your upcoming appointments</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Active</span>
          </div>
        </div>
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>
      {doctorId ? (
        <>
          <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>}>
            <WeeklyCalendar
              doctorId={doctorId}
              appointments={doctorAppointments}
              patients={patients}
              loading={loading}
              doctorSchedules={doctorSchedules}
              onUpdateAppointment={handleUpdateAppointment}
              onSetSelectedWeek={handleSetSelectedWeek}
              onSetSelectedDate={handleSetSelectedDate}
              onSetSelectedAppointment={handleSetSelectedAppointment}
              onShowDetailModal={handleShowDetailModal}
              roleColors={roleColors}
            />
          </Suspense>

          {/* Appointment Details Modal */}
          <Suspense fallback={<div className="flex justify-center items-center p-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div></div>}>
            <AppointmentDetailModal
              showDetailModal={showDetailModal}
              closeShowDetailModal={handleCloseDetailModal}
              handleRescheduleModal={handleShowRescheduleModal}
            />
          </Suspense>

          {/* Reschedule Modal */}
          <Suspense fallback={<div className="flex justify-center items-center p-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div></div>}>
            <RescheduleModal
              showRescheduleModal={showRescheduleModal}
              closeRescheduleModal={handleCloseRescheduleModal}
            />
          </Suspense>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Please log in as a doctor to view appointments.
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;