import React from 'react';
import { User, GripVertical } from 'lucide-react';
import type { Appointment, Patient } from '@/features/db/dexie';

interface AppointmentItemProps {
  appointment: Appointment;
  patients: Patient[];
  isDragged: boolean;
  onDragStart: (e: React.DragEvent, appointment: Appointment) => void;
  onClick: (appointment: Appointment) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  showTooltip: boolean;
}

const AppointmentItem: React.FC<AppointmentItemProps> = React.memo(({
  appointment,
  patients,
  isDragged,
  onDragStart,
  onClick,
  onMouseEnter,
  onMouseLeave,
  showTooltip
}) => {
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Find patient by ID
  const patient = patients?.find(p => p.id === appointment.patientId);
  const patientName = patient ? patient.name : `Patient ${appointment.patientId.slice(-4)}`;

  return (
    <div
      key={appointment.id}
      draggable
      onDragStart={(e) => onDragStart(e, appointment)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(appointment);
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`p-2 rounded text-xs border cursor-pointer hover:shadow-md transition-all transform hover:scale-105 relative ${getStatusColor(
        appointment.status
      )} ${isDragged ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center space-x-1 font-medium">
        <GripVertical className="w-3 h-3 shrink-0 cursor-move" />
        <User className="w-3 h-3 shrink-0" />
        <span className="truncate">
          {patientName}
        </span>
      </div>
      <div className="text-xs opacity-75 mt-1 truncate">
        {appointment.reason.slice(0, 15)}...
      </div>
      <div className="text-xs font-semibold mt-1">
        {appointment.duration}min
      </div>

      {/* Show Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
          <div className="text-xs opacity-90 mb-1">Patient: {patientName}</div>
          <div className="text-xs opacity-90 mb-1">Status: {appointment.status.replace('_', ' ').toUpperCase()}</div>
          <div className="text-xs opacity-90 mb-1">Time: {appointment.slot}</div>
          <div className="text-xs opacity-90 mb-1">Duration: {appointment.duration}min</div>
          <div className="text-xs opacity-90">Reason: {appointment.reason}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AppointmentItem;
