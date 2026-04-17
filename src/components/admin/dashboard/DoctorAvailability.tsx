import { motion } from "framer-motion";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
  avatar?: string;
  department?: string;
  nextAvailable?: string;
}

interface Props {
  doctors?: Doctor[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

export default function DoctorAvailability({ doctors = [] }: Props) {
  const availableCount = doctors.filter((d) => d.available).length;
  const busyCount = doctors.length - availableCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100 h-87.5 flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Doctor Availability
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {doctors.length} doctors on duty
          </p>
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 rounded-full border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-green-700">{availableCount} Available</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 rounded-full border border-red-100">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="font-medium text-red-700">{busyCount} Busy</span>
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="flex-1 min-h-0">
        {doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm">No doctors on duty</span>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-2 overflow-y-auto max-h-44 pr-1"
          >
            {doctors.map((doc) => (
              <motion.div
                key={doc.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01, x: 2 }}
                className="flex items-center justify-between p-2.5 sm:p-3 bg-linear-to-r from-gray-50 to-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-blue-200 transition-all duration-200 group cursor-pointer"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm shrink-0 ${
                      doc.available
                        ? "bg-linear-to-br from-emerald-400 to-emerald-600 shadow-emerald-200 shadow-lg"
                        : "bg-linear-to-br from-rose-400 to-rose-600 shadow-rose-200 shadow-lg"
                    }`}
                  >
                    {doc.avatar ? (
                      <img src={doc.avatar} alt={doc.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      doc.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                      {doc.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-500">{doc.specialty}</span>
                      {doc.department && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-400">{doc.department}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status */}
                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      doc.available
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-rose-100 text-rose-700 border border-rose-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        doc.available ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                      }`}
                    ></span>
                    {doc.available ? "Available" : "Busy"}
                  </span>
                  {doc.nextAvailable && (
                    <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">
                      {doc.available ? "Next: " : "Free: "}
                      <span className="font-medium text-gray-500">{doc.nextAvailable}</span>
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}