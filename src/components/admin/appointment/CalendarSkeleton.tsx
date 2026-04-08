import { Clock } from 'lucide-react';

const CalendarSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Day Headers Skeleton */}
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="p-4 text-center text-sm font-medium text-gray-700 border-r border-gray-300 bg-gray-100">
          <div className="flex items-center justify-center">
            <Clock className="w-3 h-3 mr-1 text-gray-400" />
            <span className="text-gray-400">Time</span>
          </div>
        </div>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="p-4 text-center border-r border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Time Slots Skeleton */}
      <div className="max-h-150 overflow-y-auto">
        {[...Array(12)].map((_, timeIndex) => (
          <div key={timeIndex} className={`grid grid-cols-8 border-b border-gray-200 ${
            timeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
          }`}>
            {/* Time Column */}
            <div className="p-4 text-center text-sm font-medium text-gray-700 border-r border-gray-300 bg-gray-100 sticky left-0 z-5">
              <div className="flex items-center justify-center">
                <Clock className="w-3 h-3 mr-1 text-gray-400" />
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
            </div>

            {/* Day columns skeleton */}
            {[...Array(7)].map((_, dayIndex) => (
              <div key={dayIndex} className="p-2 border-r border-gray-100 min-h-15">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarSkeleton;
