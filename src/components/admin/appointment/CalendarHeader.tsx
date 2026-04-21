import React from 'react';
import { format, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Printer } from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { RoleColors } from '@/types/appointment/appointmentType';

interface CalendarHeaderProps {
  currentWeek: Date;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onPrint?: () => void;
  roleColors?: RoleColors;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = React.memo(({
  currentWeek,
  onNavigateWeek,
  onGoToToday,
  onPrint,
  roleColors
}) => {
  const getHeaderClass = () => {
    if (!roleColors) return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4';

    switch (roleColors.header) {
      case 'bg-purple-600':
        return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4';
      case 'bg-blue-600':
        return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4';
      case 'bg-green-600':
        return 'bg-gradient-to-r from-green-600 to-green-700 text-white p-4';
      case 'bg-pink-600':
        return 'bg-gradient-to-r from-pink-600 to-pink-700 text-white p-4';
      default:
        return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4';
    }
  };

  return (
    <div className={getHeaderClass()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Calendar className="w-6 h-6" />
          <h2 className="text-xl font-semibold">
            {format(currentWeek, 'MMMM d, yyyy')} - {format(addDays(currentWeek, 6), 'MMMM d, yyyy')}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {onPrint && (
            <Button
              onClick={onPrint}
              variant="secondary"
              size="sm"
              className="flex items-center"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
          )}
          <Button
            onClick={onGoToToday}
            variant="secondary"
            size="sm"
          >
            Today
          </Button>
          <Button
            onClick={() => onNavigateWeek('prev')}
            variant="ghost"
            size="icon"
            className='hover:text-black text-white'
          >
            <ChevronLeft className="w-5 h-5 " />
          </Button>
          <Button
            onClick={() => onNavigateWeek('next')}
            variant="ghost"
            size="icon"
            className='hover:text-black text-white'
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
});

export default CalendarHeader;
