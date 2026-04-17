import { useEffect, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { startOfWeek } from 'date-fns';

// Import icons file
import { Plus, Filter, Calendar, Printer, Search } from 'lucide-react';

// Import UI components
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';

//  Import dispatch and selector type for redux
import { useAppDispatch, useAppSelector } from '@/app/hooks';

// Import Type file
import type { RootState } from "@/app/store";

// Import Thunk file for redux
import { getAllPatients } from "@/features/patient/patientThunk";
import { fetchLocalDoctors } from '@/features/doctor/doctorThunk'

// Import Slice file for redux
import {
  fetchDoctorSchedules,
  setSelectedDoctor,
  fetchAppointments,
  updateAppointment,
  setSelectedWeek,
  setSelectedDate,
  setSelectedAppointment,
} from '@/features/appointment/appointmentSlice';

// Import components files
import CalendarSkeleton from '@/components/admin/appointment/CalendarSkeleton';

// Lazy loaded components
const WeeklyCalendar = lazy(() => import('@/components/admin/appointment/WeeklyCalendar'));
const BookingModal = lazy(() => import('@/components/admin/appointment/dialog/BookingModal'));
const AppointmentDetailModal = lazy(() => import('@/components/admin/appointment/dialog/AppointmentDetailModal'));
const RescheduleModal = lazy(() => import('@/components/admin/appointment/dialog/RescheduleModal'));

const AdminAppointments = () => {

  // Redux dispatch
  const dispatch = useAppDispatch();

  // Redux selector
  const {
    selectedDoctor,
    appointments,
    loading,
    doctorSchedules,
    selectedWeek
  } = useAppSelector(
    (state: RootState) => state.appointments
  );

  const patients = useAppSelector((state: RootState) => state.patients.list);
  const { localDoctors } = useAppSelector((state: RootState) => state.doctors)

  // State
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false)
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Use useEffect state
  useEffect(() => {
    // Wait a bit longer to ensure database is fully initialized
    const initializeData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      dispatch(fetchLocalDoctors());
      dispatch(fetchDoctorSchedules());
      dispatch(getAllPatients());
    };

    initializeData();
  }, [dispatch]);

  // Separate effect for fetching appointments based on selected week and doctor
  useEffect(() => {
    const fetchAppointmentsForWeek = async () => {
      // Get the current week start from Redux state or use current week
      const weekStart = selectedWeek ? new Date(selectedWeek) : startOfWeek(new Date());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6); // End of the week (6 days after start)

      // Only fetch if we have the necessary data
      if (localDoctors.length > 0) {
        dispatch(fetchAppointments({
          doctorId: selectedDoctor || undefined,
          startDate: weekStart,
          endDate: weekEnd
        }));
      }
    };

    // Add a small delay to prevent flickering during rapid changes
    const timeoutId = setTimeout(fetchAppointmentsForWeek, 100);
    return () => clearTimeout(timeoutId);
  }, [dispatch, selectedDoctor, selectedWeek, localDoctors.length]);

  // Memoize filtered doctors to prevent recalculation on every render
  const filteredDoctors = useMemo(() => {
    return localDoctors.filter(doctor =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [localDoctors, searchTerm]);

  //  Method
  const handleDoctorFilter = useCallback((doctorId: string) => {
    dispatch(setSelectedDoctor(doctorId === 'all' ? null : doctorId));
  }, [dispatch]);

  const handlePrintSchedule = useCallback(() => {
    window.print();
  }, []);

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

      {/* Weekly calendar */}
      <div id="weekly-calendar-container" className="bg-white rounded-lg shadow-md p-6">
        <Suspense fallback={<CalendarSkeleton />}>
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
            onPrint={handlePrintSchedule}
          />
        </Suspense>
      </div>

      {/* Modals */}
      <Suspense fallback={<div>Loading...</div>}>
        <BookingModal showBookingModal={showBookingModal} closeBookingModel={() => setShowBookingModal(false) } />
        <AppointmentDetailModal showDetailModal={showDetailModal} closeShowDetailModal={() => setShowDetailModal(false)} handleRescheduleModal={ ()=> setShowRescheduleModal(true) } />
        <RescheduleModal showRescheduleModal={showRescheduleModal} closeRescheduleModal={() => { setShowRescheduleModal(false); setShowDetailModal(false); }} />
      </Suspense>


      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #weekly-calendar-container,
            #weekly-calendar-container * {
              visibility: visible;
            }
            #weekly-calendar-container {
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
