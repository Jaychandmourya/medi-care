import { useEffect, useState, useCallback, useMemo, lazy, Suspense } from 'react';

// Import icons file
import { Plus, Filter, Calendar, Printer, Search } from 'lucide-react';

// Import UI components
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Import Type file
import type { RootState } from "@/app/store";

// Import dispatch and selector
import { useAppDispatch, useAppSelector } from '@/app/hooks';

// Import Thunk file
import { getAllPatients } from "@/features/patient/patientThunk";
import { fetchLocalDoctors } from '@/features/doctor/doctorThunk'

// Import Slice file
import {
  fetchDoctorSchedules,
  setSelectedDoctor,
  fetchAppointments,
  updateAppointment,
  setSelectedWeek,
  setSelectedDate,
  setSelectedAppointment,
} from '@/features/appointment/appointmentSlice';

// Lazy loading components
const WeeklyCalendar = lazy(() => import('@/components/admin/appointment/WeeklyCalendar'));
const BookingModal = lazy(() => import('@/components/admin/appointment/dialog/BookingModal'));
const AppointmentDetailModal = lazy(() => import('@/components/admin/appointment/dialog/AppointmentDetailModal'));
const RescheduleModal = lazy(() => import('@/components/admin/appointment/dialog/RescheduleModal'));

// Role-based color configuration
const roleColors = {
  admin: {
    primary: 'bg-purple-600 hover:bg-purple-700',
    secondary: 'bg-purple-100 border-purple-300 text-purple-800',
    calendar: 'border-purple-200 bg-purple-50',
    header: 'bg-purple-600'
  },
  doctor: {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-blue-100 border-blue-300 text-blue-800',
    calendar: 'border-blue-200 bg-blue-50',
    header: 'bg-blue-600'
  },
  receptionist: {
    primary: 'bg-purple-600 hover:bg-purple-700',
    secondary: 'bg-purple-100 border-purple-300 text-purple-800',
    calendar: 'border-purple-200 bg-purple-50',
    header: 'bg-purple-600'
  },
  nurse: {
    primary: 'bg-pink-600 hover:bg-pink-700',
    secondary: 'bg-pink-100 border-pink-300 text-pink-800',
    calendar: 'border-pink-200 bg-pink-50',
    header: 'bg-pink-600'
  }
};


const ReceptionistAppointments = () => {

  // Redux dispatch
  const dispatch = useAppDispatch();

  // Redux selector
  const {
    selectedDoctor,
    appointments,
    loading,
    doctorSchedules
  } = useAppSelector(
    (state) => state.appointments
    );
  const { user } = useAppSelector((state) => state.auth);
  const patients = useAppSelector((state: RootState) => state.patients.list);
  const { localDoctors } = useAppSelector((state: RootState) => state.doctors)

  const userRole = user?.role || 'receptionist';
  const currentRoleColors = roleColors[userRole as keyof typeof roleColors] || roleColors.receptionist;

  // State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false)
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false)

  // UseEffect
  useEffect(() => {

    // Wait a bit longer to ensure database is fully initialized
    const initializeData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch(fetchLocalDoctors());
      dispatch(fetchDoctorSchedules());
      dispatch(getAllPatients());

      // Add another small delay before fetching appointments
      setTimeout(() => {
        dispatch(fetchAppointments({
          doctorId: selectedDoctor || undefined,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }));
      }, 200);
    };

    initializeData();
  }, [dispatch, selectedDoctor]);

  // Method
  const handleDoctorFilter = useCallback((doctorId: string) => {
    dispatch(setSelectedDoctor(doctorId === 'all' ? null : doctorId));
  }, [dispatch]);

  const handlePrintSchedule = useCallback(() => {
    window.print();
  }, []);

  // Memoize filtered doctors to prevent recalculation on every render
  const filteredDoctors = useMemo(() => {
    return localDoctors.filter(doctor =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [localDoctors, searchTerm]);

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
              className={`flex items-center ${currentRoleColors.primary}`}
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
          <div className={`mt-4 flex items-center justify-between p-3 rounded-lg ${currentRoleColors.secondary}`}>
            <span className={`text-sm ${currentRoleColors.secondary.includes('text-') ? currentRoleColors.secondary.split(' ').find(c => c.startsWith('text-')) : 'text-blue-800'}`}>
              Showing appointments for: <strong>
                {localDoctors.find(d => d.id === selectedDoctor)?.name || 'Selected Doctor'}
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
      <div className={`bg-white rounded-lg shadow-md p-6 ${currentRoleColors.calendar}`}>
        <Suspense fallback={<div className="flex justify-center items-center h-64">Loading calendar...</div>}>
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
            roleColors={currentRoleColors}
          />
        </Suspense>
      </div>

      {/* Modals */}
      <Suspense fallback={<div>Loading booking modal...</div>}>
        <BookingModal
          showBookingModal={showBookingModal}
          closeBookingModel={() => setShowBookingModal(false)}
          roleColors={currentRoleColors}
        />
      </Suspense>
      <Suspense fallback={<div>Loading detail modal...</div>}>
        <AppointmentDetailModal showDetailModal={showDetailModal} closeShowDetailModal={() => setShowDetailModal(false)} handleRescheduleModal={ ()=> setShowRescheduleModal(true) } />
      </Suspense>
      <Suspense fallback={<div>Loading reschedule modal...</div>}>
        <RescheduleModal showRescheduleModal={showRescheduleModal} closeRescheduleModal={() => { setShowRescheduleModal(false); setShowDetailModal(false); }} />
      </Suspense>


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
  )
}

export default ReceptionistAppointments