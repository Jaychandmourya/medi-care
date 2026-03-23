import React, { useState, useCallback, useMemo } from 'react';
import { format, startOfWeek, addDays, addMinutes, parse, isBefore, isAfter } from 'date-fns';
import { Clock } from 'lucide-react';
import CalendarHeader from './CalendarHeader';
import DayHeaders from './DayHeaders';
import TimeSlotColumn from './TimeSlotColumn';
import type { Appointment } from '@/features/patient/db/dexie';

interface WeeklyCalendarProps {
  doctorId?: string;
  appointments: Appointment[];
  loading: boolean;
  doctorSchedules: Array<{ doctorId: string; startTime: string; endTime: string; lunchBreakStart?: string; lunchBreakEnd?: string; slotDuration: number }>;
  onUpdateAppointment: (params: { id: string; updates: Partial<Appointment> }) => void;
  onSetSelectedWeek: (week: string) => void;
  onSetSelectedDate: (date: string) => void;
  onSetSelectedAppointment: (appointment: Appointment) => void;
  onShowDetailModal: (show: boolean) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = React.memo(({
  doctorId,
  appointments,
  loading,
  doctorSchedules,
  onUpdateAppointment,
  onSetSelectedWeek,
  onSetSelectedDate,
  onSetSelectedAppointment,
  onShowDetailModal
}) => {

  console.log('WeeklyCalendar props:', { doctorId, appointments: appointments?.length, loading, doctorSchedules: doctorSchedules?.length });

  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ date: string; time: string; appointmentId: string } | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: string; time: string } | null>(null);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i)),
    [currentWeek]
  );

  const handleDragStart = useCallback((e: React.DragEvent, appointment: Appointment) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleSlotDragOver = useCallback((e: React.DragEvent, date: string, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ date, time });
  }, []);

  const handleSlotDragLeave = useCallback(() => {
    setDragOverSlot(null);
  }, []);

  const handleSlotDrop = useCallback((e: React.DragEvent, newDate: string, newTime: string) => {
    e.preventDefault();
    if (draggedAppointment) {
      const hasConflict = appointments.some(
        (apt) => apt.id !== draggedAppointment.id &&
                apt.doctorId === draggedAppointment.doctorId &&
                apt.date === newDate &&
                apt.slot === newTime
      );

      if (!hasConflict) {
        onUpdateAppointment({
          id: draggedAppointment.id,
          updates: { date: newDate, slot: newTime }
        });
      } else {
        alert('This time slot is already booked for this doctor!');
      }
    }
    setDraggedAppointment(null);
    setDragOverSlot(null);
  }, [draggedAppointment, appointments, onUpdateAppointment]);

  const generateTimeSlotsForDoctor = useCallback((doctorId: string) => {
    const schedule = doctorSchedules.find(s => s.doctorId === doctorId);
    if (!schedule) {
      // Fallback to default slots if no schedule found
      const slots = [];
      for (let hour = 8; hour < 20; hour++) {
        for (let minutes = 0; minutes < 60; minutes += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          slots.push(time);
        }
      }
      return slots;
    }

    const slots = [];
    const startTime = parse(schedule.startTime, 'HH:mm', new Date());
    const endTime = parse(schedule.endTime, 'HH:mm', new Date());

    let currentTime = startTime;
    while (isBefore(currentTime, endTime)) {
      const slotTime = format(currentTime, 'HH:mm');

      // Skip lunch break
      if (schedule.lunchBreakStart && schedule.lunchBreakEnd) {
        const lunchStart = parse(schedule.lunchBreakStart, 'HH:mm', new Date());
        const lunchEnd = parse(schedule.lunchBreakEnd, 'HH:mm', new Date());

        if (!isAfter(currentTime, lunchStart) || !isBefore(currentTime, lunchEnd)) {
          slots.push(slotTime);
        }
      } else {
        slots.push(slotTime);
      }

      currentTime = addMinutes(currentTime, schedule.slotDuration);
    }

    return slots;
  }, [doctorSchedules]);

  const timeSlots = useMemo(() =>
    doctorId ? generateTimeSlotsForDoctor(doctorId) : generateTimeSlotsForDoctor(''),
    [doctorId, generateTimeSlotsForDoctor]
  );

  const getAppointmentsForSlot = useCallback((date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(
      (apt) => apt.date === dateStr && apt.slot === time && apt.status !== 'no_show'
    );
  }, [appointments]);

  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    onSetSelectedAppointment(appointment);
    onShowDetailModal(true);
  }, [onSetSelectedAppointment, onShowDetailModal]);

  const handleDateClick = useCallback((date: Date) => {
    onSetSelectedDate(date.toISOString());
  }, [onSetSelectedDate]);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    const newWeek = addDays(currentWeek, direction === 'next' ? 7 : -7);
    setCurrentWeek(newWeek);
    onSetSelectedWeek(newWeek.toISOString());
  }, [currentWeek, onSetSelectedWeek]);

  const goToToday = useCallback(() => {
    const today = startOfWeek(new Date());
    setCurrentWeek(today);
    onSetSelectedWeek(today.toISOString());
  }, [onSetSelectedWeek]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <CalendarHeader
        currentWeek={currentWeek}
        onNavigateWeek={navigateWeek}
        onGoToToday={goToToday}
      />

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-200">
          <DayHeaders
            weekDays={weekDays}
            onDateClick={handleDateClick}
          />

          {/* Time Slots */}
          <div className="max-h-150 overflow-y-auto">
            {timeSlots.map((time, timeIndex) => (
              <div key={time} className={`grid grid-cols-8 border-b border-gray-200 ${
                timeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}>
                {/* Time Column */}
                <div className="p-4 text-center text-sm font-medium text-gray-700 border-r border-gray-300 bg-gray-100 sticky left-0 z-5">
                  <div className="flex items-center justify-center">
                    <Clock className="w-3 h-3 mr-1 text-blue-500" />
                    {time}
                  </div>
                </div>

                {/* Day Columns */}
                {weekDays.map((day, dayIndex) => {
                  const dayAppointments = getAppointmentsForSlot(day, time);
                  const isDragOver = dragOverSlot?.date === format(day, 'yyyy-MM-dd') && dragOverSlot?.time === time;

                  return (
                    <TimeSlotColumn
                      key={dayIndex}
                      time={time}
                      day={day}
                      dayIndex={dayIndex}
                      appointments={dayAppointments}
                      isDragOver={isDragOver}
                      draggedAppointment={draggedAppointment}
                      hoveredSlot={hoveredSlot}
                      onDateClick={handleDateClick}
                      onSlotDragOver={handleSlotDragOver}
                      onSlotDragLeave={handleSlotDragLeave}
                      onSlotDrop={handleSlotDrop}
                      onAppointmentDragStart={handleDragStart}
                      onAppointmentClick={handleAppointmentClick}
                      onHoverSlot={setHoveredSlot}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="text-blue-600">Loading appointments...</div>
        </div>
      )}
    </div>
  );
});

export default WeeklyCalendar;
