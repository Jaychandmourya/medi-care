import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  total?: number;
  percentage?: number;
  trend?: 'up' | 'down';
}

export default function PatientsTodayCard({
  total = 128,
  percentage = 12,
  trend = 'up'
}: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(total / 40);

    const interval = setInterval(() => {
      start += step;
      if (start >= total) {
        setCount(total);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [total]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden group"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="text-sm sm:text-base font-medium opacity-90 mb-1">
            Total Patients Today
          </h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${trend === 'up' ? 'bg-green-300' : 'bg-red-300'} animate-pulse`}></div>
            <span className="text-xs sm:text-sm opacity-75">
              Live tracking
            </span>
          </div>
        </div>

        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${
          trend === 'up'
            ? 'bg-green-400/20 text-green-100 border border-green-400/30'
            : 'bg-red-400/20 text-red-100 border border-red-400/30'
        }`}>
          {trend === 'up' ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          {trend === 'up' ? '+' : '-'}{percentage}%
        </div>
      </div>

      {/* Main count */}
      <div className="relative mb-4">
        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold tabular-nums">
          {count.toLocaleString()}
        </div>
        <div className="text-xs sm:text-sm opacity-70 mt-1">
          patients
        </div>
      </div>

      {/* Footer */}
      <div className="relative flex items-center justify-between pt-4 border-t border-white/20">
        <p className="text-xs sm:text-sm opacity-80">
          Compared to yesterday
        </p>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-3 rounded-full transition-all duration-300 ${
                  i < 3 ? 'bg-white/60' : 'bg-white/20'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/5 opacity-0 rounded-3xl"></div>
    </motion.div>
  );
}