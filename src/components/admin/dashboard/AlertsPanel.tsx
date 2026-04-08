import { useState } from 'react';

interface Alert {
  id: string;
  message: string;
  time: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  read?: boolean;
}

interface Props {
  alerts: Alert[];
}

const getAlertIcon = (type?: 'info' | 'warning' | 'error' | 'success') => {
  switch (type) {
    case 'error':
      return (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case 'success':
      return (
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
  }
};

const getAlertStyles = (type?: 'info' | 'warning' | 'error' | 'success', read?: boolean) => {
  const baseStyles = "p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer relative overflow-hidden";
  const readStyles = read ? "opacity-60" : "";

  const typeStyles = {
    error: "border-red-200 bg-red-50 hover:bg-red-100",
    warning: "border-yellow-200 bg-yellow-50 hover:bg-yellow-100",
    success: "border-green-200 bg-green-50 hover:bg-green-100",
    info: "border-blue-200 bg-blue-50 hover:bg-blue-100"
  };

  return `${baseStyles} ${readStyles} ${typeStyles[type || 'info']}`;
};

export default function AlertsPanel({ alerts }: Props) {
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const formatTime = (time: string) => {
    try {
      if (!time) return 'Unknown time';

      const date = new Date(time);

      // Check if date is invalid
      if (isNaN(date.getTime())) {
        // If it's a relative time string like "2 min ago", return it as is
        if (time.includes('ago') || time.includes('min') || time.includes('hour') || time.includes('day')) {
          return time;
        }
        return 'Unknown time';
      }

      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 0) return 'Just now';
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Unknown time';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Recent Alerts</h3>
              <p className="text-blue-100 text-sm">Last 5 notifications</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm">
              {alerts.filter(a => !a.read).length} unread
            </span>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No alerts yet</p>
            <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className={getAlertStyles(alert.type, alert.read)}
              onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
            >
              {/* Unread indicator */}
              {!alert.read && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}

              <div className="flex items-start space-x-3">
                <div className="shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium leading-relaxed">
                    {alert.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 font-medium">
                      {formatTime(alert.time)}
                    </span>
                    {expandedAlert === alert.id && (
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded content */}
              {/* {expandedAlert === alert.id && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                    <button className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              )} */}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {/* {alerts.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
            View All Alerts →
          </button>
        </div>
      )} */}
    </div>
  );
}