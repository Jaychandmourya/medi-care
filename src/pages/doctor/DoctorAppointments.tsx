import { useEffect } from 'react';
import WeeklyCalendar from '@/components/admin/appointment/WeeklyCalendar';
import AppointmentDetailModal from '@/components/admin/appointment/dialog/AppointmentDetailModal';
import RescheduleModal from '@/components/admin/appointment/dialog/RescheduleModal';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import {
  fetchAppointments,
  fetchPatients,
  fetchDoctorSchedules,
  updateAppointment,
  setSelectedWeek,
  setSelectedDate,
  setSelectedAppointment,
  setShowDetailModal,
  setShowRescheduleModal,
} from '@/features/appointment/appointmentSlice';
import type { Appointment } from '@/features/db/dexie';
import { startOfWeek, addDays } from 'date-fns';

const DoctorAppointments = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    appointments,
    patients,
    doctorSchedules,
    loading,
    showDetailModal,
    showRescheduleModal,
    selectedAppointment
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

  useEffect(() => {
    // Fetch required data
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = addDays(weekStart, 6);

    dispatch(fetchAppointments({
      doctorId,
      startDate: weekStart,
      endDate: weekEnd
    }));
    dispatch(fetchPatients());
    dispatch(fetchDoctorSchedules());
  }, [dispatch, doctorId]);

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
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
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

          {/* Appointment Details Modal */}
          <AppointmentDetailModal
            showDetailModal={showDetailModal}
            closeShowDetailModal={handleCloseDetailModal}
            handleRescheduleModal={handleShowRescheduleModal}
          />

          {/* Reschedule Modal */}
          <RescheduleModal
            showRescheduleModal={showRescheduleModal}
            closeRescheduleModal={handleCloseRescheduleModal}
          />
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