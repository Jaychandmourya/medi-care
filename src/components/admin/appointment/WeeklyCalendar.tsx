import React, { useState, useCallback, useMemo, useEffect } from 'react';

import { format, startOfWeek, addDays, addMinutes, parse, isBefore, isAfter } from 'date-fns';

// Import Icons file
import { Clock } from 'lucide-react';

// Import type file
import type { WeeklyCalendarProps, Appointment } from '@/types/appointment/appointmentType';

// Import components
import CalendarHeader from './CalendarHeader';
import DayHeaders from './DayHeaders';
import TimeSlotColumn from './TimeSlotColumn';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = React.memo(({
  doctorId,
  appointments,
  patients,
  loading,
  doctorSchedules,
  onUpdateAppointment,
  onSetSelectedWeek,
  onSetSelectedDate,
  onSetSelectedAppointment,
  onShowDetailModal,
  onPrint,
  roleColors
}) => {

  // State
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ date: string; time: string; appointmentId: string } | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: string; time: string } | null>(null);
  const [showPastDateDialog, setShowPastDateDialog] = useState(false);
  const [showPastTimeDialog, setShowPastTimeDialog] = useState(false);

  // Sync currentWeek with Redux selectedWeek
  useEffect(() => {
    if (onSetSelectedWeek) {
      onSetSelectedWeek(currentWeek.toISOString());
    }
  }, [currentWeek, onSetSelectedWeek]);

  // Computed values
  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i)),
    [currentWeek]
  );

  // Methods
  // Event handlers
  const handleDragStart = useCallback((e: React.DragEvent, appointment: Appointment) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  // Handle slot drag over
  const handleSlotDragOver = useCallback((e: React.DragEvent, date: string, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ date, time });
  }, []);

  // Handle slot drag leave
  const handleSlotDragLeave = useCallback(() => {
    setDragOverSlot(null);
  }, []);

  // Handle slot drop
  const handleSlotDrop = useCallback((e: React.DragEvent, newDate: string, newTime: string) => {
    e.preventDefault();
    if (draggedAppointment) {
      // Check if the target date is in the past
      const targetDate = parse(newDate, 'yyyy-MM-dd', new Date());
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

      if (isBefore(targetDate, today)) {
        setShowPastDateDialog(true);
        return;
      }

      // Check if the target is today and the time slot is in the past
      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');

      if (newDate === todayStr) {
        // Parse the target time
        const [targetHours, targetMinutes] = newTime.split(':').map(Number);
        const targetTime = new Date();
        targetTime.setHours(targetHours, targetMinutes, 0, 0);

        // If target time is before current time, prevent the drop
        if (isBefore(targetTime, now)) {
          setShowPastTimeDialog(true);
          return;
        }
      }

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

  // Handle dialog confirmation for past date
  const handlePastDateDialogConfirm = useCallback(() => {
    setShowPastDateDialog(false);
    setDraggedAppointment(null);
    setDragOverSlot(null);
  }, []);

  // Handle dialog cancellation for past date
  const handlePastDateDialogCancel = useCallback(() => {
    setShowPastDateDialog(false);
    setDraggedAppointment(null);
    setDragOverSlot(null);
  }, []);

  // Handle dialog confirmation for past time
  const handlePastTimeDialogConfirm = useCallback(() => {
    setShowPastTimeDialog(false);
    setDraggedAppointment(null);
    setDragOverSlot(null);
  }, []);

  // Handle dialog cancellation for past time
  const handlePastTimeDialogCancel = useCallback(() => {
    setShowPastTimeDialog(false);
    setDraggedAppointment(null);
    setDragOverSlot(null);
  }, []);

  // Helper functions
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

  // Time slots for the current doctor
  const timeSlots = useMemo(() =>
    doctorId ? generateTimeSlotsForDoctor(doctorId) : generateTimeSlotsForDoctor(''),
    [doctorId, generateTimeSlotsForDoctor]
  );

  // Get appointments for a specific slot
  const getAppointmentsForSlot = useCallback((date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(
      (apt) => apt.date === dateStr && apt.slot === time && apt.status !== 'no_show'
    );
  }, [appointments]);

  // Handle appointment click
  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    onSetSelectedAppointment(appointment);
    onShowDetailModal();
  }, [onSetSelectedAppointment, onShowDetailModal]);

  // Handle date click
  const handleDateClick = useCallback((date: Date) => {
    onSetSelectedDate(date.toISOString());
  }, [onSetSelectedDate]);

  // Navigate week
  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    const newWeek = addDays(currentWeek, direction === 'next' ? 7 : -7);
    setCurrentWeek(newWeek);
    onSetSelectedWeek(newWeek.toISOString());
  }, [currentWeek, onSetSelectedWeek]);

  // Go to today
  const goToToday = useCallback(() => {
    const today = startOfWeek(new Date());
    setCurrentWeek(today);
    onSetSelectedWeek(today.toISOString());
  }, [onSetSelectedWeek]);

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden relative transition-opacity duration-300 ${roleColors ? roleColors.calendar : ''}`}>
      {/* Calendar Header */}
      <CalendarHeader
        currentWeek={currentWeek}
        onNavigateWeek={navigateWeek}
        onGoToToday={goToToday}
        onPrint={onPrint}
        roleColors={roleColors}
      />

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-200">
          {/* Show Days Header */}
          <DayHeaders
            weekDays={weekDays}
            onDateClick={handleDateClick}
          />

          {/* Time Slots */}
          <div className="max-h-150 overflow-y-auto">
            {timeSlots.map((time, timeIndex) => (
              <div key={time} className={`grid grid-cols-8 border-b border-gray-200 transition-all duration-200 ${
                timeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}>
                {/* Time Column */}
                <div className="p-4 text-center text-sm font-medium text-gray-700 border-r border-gray-300 bg-gray-100 sticky left-0 z-5">
                  <div className="flex items-center justify-center">
                    <Clock className="w-3 h-3 mr-1 text-blue-500" />
                    {time}
                  </div>
                </div>

                {/* Day columns and time slots */}
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
                      patients={patients}
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

      {/* Loading State - Improved with backdrop blur and smooth transition */}
      <div className={`absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
        loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading appointments...</p>
        </div>
      </div>

      {/* Past Date Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showPastDateDialog}
        title="Cannot Move to Past Date"
        message="Appointments cannot be moved to past dates. Please select today's date or a future date."
        confirmText="OK"
        cancelText=""
        type="warning"
        onConfirm={handlePastDateDialogConfirm}
        onCancel={handlePastDateDialogCancel}
      />

      {/* Past Time Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showPastTimeDialog}
        title="Cannot Move to Past Time"
        message="Appointments cannot be moved to earlier time slots on the same day. Please select a current or future time slot."
        confirmText="OK"
        cancelText=""
        type="warning"
        onConfirm={handlePastTimeDialogConfirm}
        onCancel={handlePastTimeDialogCancel}
      />
    </div>
  );
});

export default WeeklyCalendar;
