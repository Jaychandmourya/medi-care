import { useEffect, useState } from 'react';
import { Plus, Filter, Calendar, Printer, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchDoctors,
  fetchDoctorSchedules,
  setSelectedDoctor,
  setShowBookingModal,
  setShowRescheduleModal
} from '@/features/appointment/appointmentSlice';
import WeeklyCalendar from '@/components/admin/appointment/WeeklyCalendar';
import BookingModal from '@/components/admin/appointment/BookingModal';
import AppointmentDetailModal from '@/components/admin/appointment/AppointmentDetailModal';
import RescheduleModal from '@/components/admin/appointment/RescheduleModal';
import DailyPrintView from '@/components/admin/appointment/DailyPrintView';

const AdminAppointments = () => {
  const dispatch = useAppDispatch();
  const { doctors, selectedDoctor, showBookingModal, showDetailModal, showRescheduleModal } = useAppSelector(
    (state) => state.appointments
  );
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchDoctors());
    dispatch(fetchDoctorSchedules());
  }, [dispatch]);

  const handleDoctorFilter = (doctorId: string) => {
    dispatch(setSelectedDoctor(doctorId === 'all' ? null : doctorId));
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <button
              onClick={() => dispatch(setShowBookingModal(true))}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Book Appointment
            </button>
            <button
              onClick={handlePrintSchedule}
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-5 h-5 mr-2" />
              Print Schedule
            </button>
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
              {doctors.map((doctor) => (
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
            <button
              onClick={() => handleDoctorFilter('all')}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <WeeklyCalendar doctorId={selectedDoctor || undefined} />
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
