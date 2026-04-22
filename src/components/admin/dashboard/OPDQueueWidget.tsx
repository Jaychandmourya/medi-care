import { motion } from "framer-motion";

interface Props {
  queueCount: number;
}

const getStatus = (count: number) => {
  if (count < 10) return {
    color: "from-emerald-500 to-teal-600",
    bgGlow: "shadow-emerald-500/25",
    label: "Low",
    icon: "🟢"
  };
  if (count < 20) return {
    color: "from-amber-500 to-orange-600",
    bgGlow: "shadow-amber-500/25",
    label: "Medium",
    icon: "🟡"
  };
  return {
    color: "from-red-500 to-rose-600",
    bgGlow: "shadow-red-500/25",
    label: "High",
    icon: "🔴"
  };
};

export default function OPDQueueWidget({ queueCount }: Props) {
  const status = getStatus(queueCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${status.color} p-6 md:p-8 shadow-2xl ${status.bgGlow} backdrop-blur-sm border border-white/10 text-white`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <h3 className="text-sm md:text-base font-semibold opacity-90">OPD Queue</h3>
            <p className="text-xs md:text-sm opacity-75">Real-time status</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl">{status.icon}</span>
            <span className="text-xs md:text-sm bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium border border-white/20">
              {status.label}
            </span>
          </div>
        </div>

        <div className="my-6 md:my-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              type: "spring",
              stiffness: 200
            }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums"
          >
            {queueCount}
          </motion.div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50"
            />
            <p className="text-xs md:text-sm opacity-80 font-medium">Live token count</p>
          </div>
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
          />
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute -top-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
    </motion.div>
  );
}