import React from 'react';
import { format } from 'date-fns';
import { useAppSelector } from '@/app/hooks';
import type { Appointment, Doctor } from '@/features/patient/db/dexie';

interface DailyPrintViewProps {
  doctorId: string;
  date: string;
}

const DailyPrintView: React.FC<DailyPrintViewProps> = ({ doctorId, date }) => {
  const { appointments, doctors, patients } = useAppSelector((state) => state.appointments);
  
  const doctor = doctors.find(d => d.id === doctorId);
  const dayAppointments = appointments
    .filter(apt => apt.doctorId === doctorId && apt.date === date)
    .sort((a, b) => a.slot.localeCompare(b.slot));

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600';
      case 'confirmed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-yellow-600';
      case 'completed':
        return 'text-gray-600';
      case 'cancelled':
        return 'text-red-600';
      case 'no_show':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Schedule</h1>
        <div className="text-lg text-gray-700">
          <p><strong>Doctor:</strong> Dr. {doctor?.name || 'Unknown'}</p>
          <p><strong>Department:</strong> {doctor?.department || 'Unknown'}</p>
          <p><strong>Date:</strong> {format(new Date(date), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Appointments</h2>
        {dayAppointments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No appointments scheduled for this day</p>
          </div>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Time</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Patient</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Reason</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {dayAppointments.map((appointment, index) => (
                <tr key={appointment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    {appointment.slot}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {getPatientName(appointment.patientId)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {appointment.reason}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {appointment.duration} min
                  </td>
                  <td className={`border border-gray-300 px-4 py-2 font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status.replace('_', ' ').toUpperCase()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {appointment.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Total Appointments:</span> {dayAppointments.length}
          </div>
          <div>
            <span className="font-medium">Completed:</span> {' '}
            {dayAppointments.filter(apt => apt.status === 'completed').length}
          </div>
          <div>
            <span className="font-medium">Pending:</span> {' '}
            {dayAppointments.filter(apt => ['scheduled', 'confirmed'].includes(apt.status)).length}
          </div>
          <div>
            <span className="font-medium">Cancelled/No Show:</span> {' '}
            {dayAppointments.filter(apt => ['cancelled', 'no_show'].includes(apt.status)).length}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
        <p>Generated on {format(new Date(), 'MMMM d, yyyy at h:mm a')}</p>
        <p>MediCare Hospital Management System</p>
      </div>
    </div>
  );
};

export default DailyPrintView;
