import React, { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (e.target.value) {
      setSelectedDate(new Date(e.target.value));
      setCurrentMonth(new Date(e.target.value));
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfMonth(monthStart);
    const endDate = endOfMonth(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const startDayOfWeek = getDay(monthStart);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="absolute top-full left-0 mt-1 z-9999 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-70">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 12))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <select
              value={format(currentMonth, 'yyyy')}
              onChange={(e) => {
                const newYear = parseInt(e.target.value);
                const newDate = new Date(currentMonth);
                newDate.setFullYear(newYear);
                setCurrentMonth(newDate);
              }}
              className="font-semibold text-gray-900 bg-transparent border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 100 }, (_, i) => {
                const year = new Date().getFullYear() - 50 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 12))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            <span className="font-semibold text-gray-900">
              {format(currentMonth, 'MMMM')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
              {day}
            </div>
          ))}
        </div>

        {/* Empty cells for days before month starts */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="p-2" />
          ))}

          {/* Days of the month */}
          {days.map(day => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => handleDateSelect(day)}
                className={`
                  p-2 text-sm rounded hover:bg-blue-50 transition-colors
                  ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                  ${isTodayDate && !isSelected ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                  ${!isSelected && !isTodayDate ? 'text-gray-700' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div ref={datePickerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>
      {isOpen && renderCalendar()}
    </div>
  );
};

export default DatePicker;
