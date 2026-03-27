import React from 'react';
import { format } from 'date-fns';
import AppointmentItem from './AppointmentItem';
import type { Appointment, Patient } from '@/features/db/dexie';

interface TimeSlotColumnProps {
  time: string;
  day: Date;
  dayIndex: number;
  appointments: Appointment[];
  patients: Patient[];
  isDragOver: boolean;
  draggedAppointment: Appointment | null;
  hoveredSlot: { date: string; time: string; appointmentId: string } | null;
  onDateClick: (date: Date) => void;
  onSlotDragOver: (e: React.DragEvent, date: string, time: string) => void;
  onSlotDragLeave: () => void;
  onSlotDrop: (e: React.DragEvent, newDate: string, newTime: string) => void;
  onAppointmentDragStart: (e: React.DragEvent, appointment: Appointment) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onHoverSlot: (slot: { date: string; time: string; appointmentId: string } | null) => void;
}

const TimeSlotColumn: React.FC<TimeSlotColumnProps> = React.memo(({
  time,
  day,
  dayIndex,
  appointments,
  patients,
  isDragOver,
  draggedAppointment,
  hoveredSlot,
  onDateClick,
  onSlotDragOver,
  onSlotDragLeave,
  onSlotDrop,
  onAppointmentDragStart,
  onAppointmentClick,
  onHoverSlot
}) => {
  const isWeekend = dayIndex === 0 || dayIndex === 6;
  const dayDateStr = format(day, 'yyyy-MM-dd');

  return (
    <div
      className={`p-3 border-r border-gray-200 min-h-16 relative ${
        isWeekend ? 'bg-gray-50' : 'bg-white hover:bg-blue-50'
      } transition-colors cursor-pointer ${
        isDragOver ? 'bg-green-100 border-green-300' : ''
      }`}
      onClick={() => onDateClick(day)}
      onDragOver={(e) => onSlotDragOver(e, dayDateStr, time)}
      onDragLeave={onSlotDragLeave}
      onDrop={(e) => onSlotDrop(e, dayDateStr, time)}
    >
      <div className="space-y-1">
        {/* Show appointments in this time slot and card */}
        {appointments.map((appointment) => (
          <AppointmentItem
            key={appointment.id}
            appointment={appointment}
            patients={patients}
            isDragged={draggedAppointment?.id === appointment.id}
            onDragStart={onAppointmentDragStart}
            onClick={onAppointmentClick}
            onMouseEnter={() => onHoverSlot({ date: appointment.date, time: appointment.slot, appointmentId: appointment.id })}
            onMouseLeave={() => onHoverSlot(null)}
            showTooltip={hoveredSlot?.date === appointment.date && hoveredSlot?.time === appointment.slot && hoveredSlot?.appointmentId === appointment.id}
          />
        ))}
      </div>
    </div>
  );
});

export default TimeSlotColumn;
