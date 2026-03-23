import React from 'react';
import { format, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CalendarHeaderProps {
  currentWeek: Date;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = React.memo(({
  currentWeek,
  onNavigateWeek,
  onGoToToday
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Calendar className="w-6 h-6" />
          <h2 className="text-xl font-semibold">
            {format(currentWeek, 'MMMM d, yyyy')} - {format(addDays(currentWeek, 6), 'MMMM d, yyyy')}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
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
