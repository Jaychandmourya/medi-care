import React from 'react';
import { format, isToday } from 'date-fns';
import { Clock } from 'lucide-react';

interface DayHeadersProps {
  weekDays: Date[];
  onDateClick: (date: Date) => void;
}

const DayHeaders: React.FC<DayHeadersProps> = React.memo(({ weekDays, onDateClick }) => {
  return (
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
          onClick={() => onDateClick(day)}
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
  );
});

export default DayHeaders;
