import { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, Filter, Calendar, Printer, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/Button';
import {
  fetchDoctors,
  fetchDoctorSchedules,
  setSelectedDoctor,
  setShowBookingModal,
  fetchAppointments,
  updateAppointment,
  setSelectedWeek,
  setSelectedDate,
  setSelectedAppointment,
  setShowDetailModal
} from '@/features/appointment/appointmentSlice';
import WeeklyCalendar from '@/components/admin/appointment/WeeklyCalendar';
import BookingModal from '@/components/admin/appointment/dialog/BookingModal';
import AppointmentDetailModal from '@/components/admin/appointment/dialog/AppointmentDetailModal';
import RescheduleModal from '@/components/admin/appointment/dialog/RescheduleModal';

const AdminAppointments = () => {
  const dispatch = useAppDispatch();
  const {
    doctors,
    selectedDoctor,
    appointments,
    loading,
    doctorSchedules
  } = useAppSelector(
    (state) => state.appointments
  );
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('AdminAppointments useEffect - fetching initial data');

    // Wait a bit longer to ensure database is fully initialized
    const initializeData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay

      console.log('Starting data fetch...');
      dispatch(fetchDoctors());
      dispatch(fetchDoctorSchedules());

      // Add another small delay before fetching appointments
      setTimeout(() => {
        dispatch(fetchAppointments({
          doctorId: selectedDoctor || undefined,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }));
      }, 200);
    };

    initializeData();
  }, [dispatch]);

  const handleDoctorFilter = useCallback((doctorId: string) => {
    dispatch(setSelectedDoctor(doctorId === 'all' ? null : doctorId));
  }, [dispatch]);

  const handlePrintSchedule = useCallback(() => {
    window.print();
  }, []);

  const handleBookAppointment = useCallback(() => {
    dispatch(setShowBookingModal(true));
  }, [dispatch]);

  // Memoize filtered doctors to prevent recalculation on every render
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [doctors, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-8 h-8 mr-3 text-blue-600" />
              Appointments Management
            </h1>
            <p className="text-gray-600 mt-2">Manage and schedule patient appointments</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleBookAppointment}
              className="flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Book Appointment
            </Button>
            <Button
              onClick={handlePrintSchedule}
              variant="secondary"
              className="flex items-center"
            >
              <Printer className="w-5 h-5 mr-2" />
              Print Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Doctor Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Filter by Doctor
            </label>
            <select
              value={selectedDoctor || 'all'}
              onChange={(e) => handleDoctorFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Doctors</option>
              {filteredDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} - {doctor.department}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search Doctors
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or department..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {selectedDoctor && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
            <span className="text-sm text-blue-800">
              Showing appointments for: <strong>
                {doctors.find(d => d.id === selectedDoctor)?.name || 'Selected Doctor'}
              </strong>
            </span>
            <Button
              onClick={() => handleDoctorFilter('all')}
              variant="link"
              size="sm"
            >
              Clear Filter
            </Button>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <WeeklyCalendar
          doctorId={selectedDoctor || undefined}
          appointments={appointments}
          loading={loading}
          doctorSchedules={doctorSchedules}
          onUpdateAppointment={(params) => dispatch(updateAppointment(params))}
          onSetSelectedWeek={(week) => dispatch(setSelectedWeek(week))}
          onSetSelectedDate={(date) => dispatch(setSelectedDate(date))}
          onSetSelectedAppointment={(appointment) => dispatch(setSelectedAppointment(appointment))}
          onShowDetailModal={(show) => dispatch(setShowDetailModal(show))}
        />
      </div>

      {/* Modals */}
      <BookingModal />
      <AppointmentDetailModal />
      <RescheduleModal />


      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .bg-white.rounded-lg.shadow-md.p-6:last-child,
            .bg-white.rounded-lg.shadow-md.p-6:last-child * {
              visibility: visible;
            }
            .bg-white.rounded-lg.shadow-md.p-6:last-child {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            button {
              display: none !important;
            }
            .overflow-x-auto {
              overflow: visible !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default AdminAppointments;
