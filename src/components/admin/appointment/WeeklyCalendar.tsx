import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isToday, addMinutes, parse, isBefore, isAfter } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, GripVertical } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchAppointments, setSelectedWeek, setSelectedDate, setSelectedAppointment, setShowDetailModal, updateAppointment } from '@/features/appointment/appointmentSlice';
import type { Appointment } from '@/features/patient/db/dexie';

interface WeeklyCalendarProps {
  doctorId?: string;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ doctorId }) => {
  const dispatch = useAppDispatch();
  const { appointments, loading, doctorSchedules } = useAppSelector((state) => state.appointments);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ date: string; time: string } | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: string; time: string } | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSlotDragOver = (e: React.DragEvent, date: string, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ date, time });
  };

  const handleSlotDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleSlotDrop = (e: React.DragEvent, newDate: string, newTime: string) => {
    e.preventDefault();
    if (draggedAppointment) {
      const hasConflict = appointments.some(
        (apt) => apt.id !== draggedAppointment.id &&
                apt.doctorId === draggedAppointment.doctorId &&
                apt.date === newDate &&
                apt.slot === newTime
      );

      if (!hasConflict) {
        dispatch(updateAppointment({
          id: draggedAppointment.id,
          updates: { date: newDate, slot: newTime }
        }));
      } else {
        alert('This time slot is already booked for this doctor!');
      }
    }
    setDraggedAppointment(null);
    setDragOverSlot(null);
  };

  const generateTimeSlotsForDoctor = (doctorId: string) => {
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
  };

  const timeSlots = doctorId ? generateTimeSlotsForDoctor(doctorId) : generateTimeSlotsForDoctor('');

  useEffect(() => {
    const startDate = currentWeek;
    const endDate = addDays(currentWeek, 6);
    dispatch(fetchAppointments({ doctorId, startDate, endDate }));
  }, [currentWeek, doctorId, dispatch]);

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

  const getAppointmentsForSlot = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(
      (apt) => apt.date === dateStr && apt.slot === time && apt.status !== 'no_show'
    );
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    dispatch(setSelectedAppointment(appointment));
    dispatch(setShowDetailModal(true));
  };

  const handleDateClick = (date: Date) => {
    dispatch(setSelectedDate(date.toISOString()));
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = addDays(currentWeek, direction === 'next' ? 7 : -7);
    setCurrentWeek(newWeek);
    dispatch(setSelectedWeek(newWeek.toISOString()));
  };

  const goToToday = () => {
    const today = startOfWeek(new Date());
    setCurrentWeek(today);
    dispatch(setSelectedWeek(today.toISOString()));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="w-6 h-6" />
            <h2 className="text-xl font-semibold">
              {format(currentWeek, 'MMMM d, yyyy')} - {format(addDays(currentWeek, 6), 'MMMM d, yyyy')}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded-md text-sm transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-blue-500 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-blue-500 rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-200">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b-2 border-gray-300 bg-gray-50 sticky top-0 z-10">
            <div className="p-4 text-center text-sm font-semibold text-gray-700 border-r border-gray-300 bg-gray-100">
              <Clock className="w-4 h-4 mx-auto mb-1" />
              Time
            </div>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`p-3 text-center border-r border-gray-300 cursor-pointer hover:bg-blue-50 transition-colors ${
                  isToday(day) ? 'bg-blue-100 border-blue-300' : ''
                }`}
                onClick={() => handleDateClick(day)}
              >
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg font-bold mt-1 ${
                  isToday(day) ? 'text-blue-600' : 'text-gray-800'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {format(day, 'MMM')}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots with improved alignment */}
          <div className="max-h-150 overflow-y-auto">
            {timeSlots.map((time, timeIndex) => (
              <div key={time} className={`grid grid-cols-8 border-b border-gray-200 ${
                timeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}>
                {/* Time Column */}
                <div className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-300 bg-gray-100 sticky left-0 z-5">
                  <div className="flex items-center justify-center">
                    <Clock className="w-3 h-3 mr-1 text-blue-500" />
                    {time}
                  </div>
                </div>

                {/* Day Columns */}
                {weekDays.map((day, dayIndex) => {
                  const dayAppointments = getAppointmentsForSlot(day, time);
                  const isWeekend = dayIndex === 0 || dayIndex === 6;

                  return (
                    <div
                      key={dayIndex}
                      className={`p-2 border-r border-gray-200 min-h-16 relative ${
                        isWeekend ? 'bg-gray-50' : 'bg-white hover:bg-blue-50'
                      } transition-colors cursor-pointer ${
                        dragOverSlot?.date === format(day, 'yyyy-MM-dd') && dragOverSlot?.time === time
                          ? 'bg-green-100 border-green-300'
                          : ''
                      }`}
                      onClick={() => handleDateClick(day)}
                      onDragOver={(e) => handleSlotDragOver(e, format(day, 'yyyy-MM-dd'), time)}
                      onDragLeave={handleSlotDragLeave}
                      onDrop={(e) => handleSlotDrop(e, format(day, 'yyyy-MM-dd'), time)}
                    >
                      <div className="space-y-1">
                        {dayAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, appointment)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAppointmentClick(appointment);
                            }}
                            onMouseEnter={() => setHoveredSlot({ date: appointment.date, time: appointment.slot })}
                            onMouseLeave={() => setHoveredSlot(null)}
                            className={`p-2 rounded text-xs border cursor-pointer hover:shadow-md transition-all transform hover:scale-105 relative ${getStatusColor(
                              appointment.status
                            )} ${draggedAppointment?.id === appointment.id ? 'opacity-50' : ''}`}
                          >
                            <div className="flex items-center space-x-1 font-medium">
                              <GripVertical className="w-3 h-3 shrink-0 cursor-move" />
                              <User className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                {/* Patient name would need to be fetched */}
                                Patient {appointment.patientId.slice(-4)}
                              </span>
                            </div>
                            <div className="text-xs opacity-75 mt-1 truncate">
                              {appointment.reason.slice(0, 15)}...
                            </div>
                            <div className="text-xs font-semibold mt-1">
                              {appointment.duration}min
                            </div>

                            {/* Tooltip */}
                            {hoveredSlot?.date === appointment.date && hoveredSlot?.time === appointment.slot && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
                                <div className="font-semibold">Status: {appointment.status.replace('_', ' ').toUpperCase()}</div>
                                <div>Time: {appointment.slot}</div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
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
};

export default WeeklyCalendar;
