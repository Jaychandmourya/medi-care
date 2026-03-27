import { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, Filter, Calendar, Printer, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  fetchDoctors,
  fetchDoctorSchedules,
  fetchPatients,
  setSelectedDoctor,
  fetchAppointments,
  updateAppointment,
  setSelectedWeek,
  setSelectedDate,
  setSelectedAppointment,
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
    patients,
    loading,
    doctorSchedules
  } = useAppSelector(
    (state) => state.appointments
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false)
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false)

  useEffect(() => {

    // Wait a bit longer to ensure database is fully initialized
    const initializeData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      dispatch(fetchDoctors());
      dispatch(fetchDoctorSchedules());
      dispatch(fetchPatients());

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
  }, [dispatch, selectedDoctor]);

  const handleDoctorFilter = useCallback((doctorId: string) => {
    dispatch(setSelectedDoctor(doctorId === 'all' ? null : doctorId));
  }, [dispatch]);

  const handlePrintSchedule = useCallback(() => {
    window.print();
  }, []);

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
              onClick={() => setShowBookingModal(true)}
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
            <Input
              id="doctor-filter"
              as="select"
              label="Filter by Doctor"
              icon={Filter}
              value={selectedDoctor || 'all'}
              onChange={(e) => handleDoctorFilter(e.target.value)}
            >
              <option value="all">All Doctors</option>
              {filteredDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} - {doctor.department}
                </option>
              ))}
            </Input>
          </div>

          {/* Search */}
          <div className="flex-1">
            <Input
              id="doctor-search"
              type="text"
              label="Search Doctors"
              icon={Search}
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          patients={patients}
          loading={loading}
          doctorSchedules={doctorSchedules}
          onUpdateAppointment={(params) => dispatch(updateAppointment(params))}
          onSetSelectedWeek={(week) => dispatch(setSelectedWeek(week))}
          onSetSelectedDate={(date) => dispatch(setSelectedDate(date))}
          onSetSelectedAppointment={(appointment) => dispatch(setSelectedAppointment(appointment))}
          onShowDetailModal={() => setShowDetailModal(true)}
        />
      </div>

      {/* Modals */}
      <BookingModal showBookingModal={showBookingModal} closeBookingModel={() => setShowBookingModal(false) } />
      <AppointmentDetailModal showDetailModal={showDetailModal} closeShowDetailModal={() => setShowDetailModal(false)} handleRescheduleModal={ ()=> setShowRescheduleModal(true) } />
      <RescheduleModal showRescheduleModal={showRescheduleModal} closeRescheduleModal={() => { setShowRescheduleModal(false); setShowDetailModal(false); }} />


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
