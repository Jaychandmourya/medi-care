import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

interface Props {
  data: { name: string; patients: number }[];
}

const COLORS = [
  "url(#color1)",
  "url(#color2)",
  "url(#color3)",
  "url(#color4)",
  "url(#color5)",
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { name: string };
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-800">
          {payload[0].payload.name}
        </p>
        <p className="text-sm text-gray-600">
          Patients: <span className="font-bold text-blue-600">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function TopDepartmentsChart({ data }: Props) {
  return (
    <div className="bg-linear-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-100 h-87.5 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-1">
            Top Departments
          </h3>
          <p className="text-xs text-gray-500">
            Patient visits by department
          </p>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      <ResponsiveContainer width="100%" height={270}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="color1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="color2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
              <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="color3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={1}/>
              <stop offset="100%" stopColor="#D97706" stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="color4" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={1}/>
              <stop offset="100%" stopColor="#DC2626" stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="color5" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1}/>
              <stop offset="100%" stopColor="#7C3AED" stopOpacity={1}/>
            </linearGradient>
          </defs>
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 11 }}
          />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="patients"
            radius={[0, 8, 8, 0]}
            animationBegin={0}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}