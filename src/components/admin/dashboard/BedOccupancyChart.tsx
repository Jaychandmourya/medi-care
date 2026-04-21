import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

interface Props {
  occupied: number;
  available: number;
  maintenance: number;
}

const COLORS = {
  occupied: "#dc2626", // red-600
  available: "#16a34a", // green-600
  maintenance: "#f59e0b", // amber-500
};

export default function BedOccupancyChart({
  occupied = 70,
  available = 20,
  maintenance = 10,
}: Props) {
  const data = [
    { name: "Occupied", value: occupied, fill: COLORS.occupied },
    { name: "Available", value: available, fill: COLORS.available },
    { name: "Maintenance", value: maintenance, fill: COLORS.maintenance },
  ];

  const totalBeds = occupied + available + maintenance;
  const occupancyRate = Math.round((occupied / totalBeds) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-4 md:p-6 shadow-lg h-64 md:h-80"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">
          Bed Occupancy
        </h3>
        <span className="text-sm font-medium text-gray-600">
          {occupancyRate}% used
        </span>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={2}
            cornerRadius={8}
            labelLine={false}
          />
          <Tooltip
            formatter={(value) => [`${value} beds`, ""]}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}