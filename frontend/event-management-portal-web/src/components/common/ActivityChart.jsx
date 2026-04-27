import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Dot,
} from 'recharts';

const data = [
  { name: 'T1', post: 2, plan: 4, recap: 1, event: 3 },
  { name: 'T2', post: 3, plan: 3, recap: 2, event: 2 },
  { name: 'T3', post: 4, plan: 2, recap: 3, event: 1 },
  { name: 'T4', post: 3, plan: 4, recap: 2, event: 3 },
  { name: 'T5', post: 2, plan: 3, recap: 4, event: 4 },
  { name: 'T6', post: 5, plan: 5, recap: 3, event: 6 },
  { name: 'T7', post: 4, plan: 6, recap: 5, event: 4 },
  { name: 'T8', post: 6, plan: 4, recap: 4, event: 5 },
  // Bạn có thể thêm nhiều tháng hơn
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="
          bg-white/95 backdrop-blur-md border border-slate-200/70 
          rounded-xl shadow-xl p-4 text-sm min-w-45
          ring-1 ring-black/5
        "
      >
        <p className="font-semibold text-slate-800 mb-2 border-b border-slate-100 pb-1.5">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600 capitalize">{entry.name}</span>
            </div>
            <span className="font-medium text-slate-800">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomDot = (props) => {
  const { cx, cy, stroke, active } = props;
  return (
    <g>
      <circle 
        cx={cx} 
        cy={cy} 
        r={active ? 6 : 4} 
        fill={stroke} 
        stroke="white" 
        strokeWidth={active ? 3 : 2} 
        className="drop-shadow-md transition-all duration-200"
      />
      {active && (
        <circle 
          cx={cx} 
          cy={cy} 
          r={8} 
          fill="none" 
          stroke={stroke} 
          strokeWidth={1.5} 
          strokeOpacity={0.4}
          className="animate-pulse"
        />
      )}
    </g>
  );
};

const ActivityChart = () => {
  return (
    <div className="h-80 md:h-95 w-full bg-white rounded-2xl p-2 md:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <defs>
            <linearGradient id="postGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="planGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="recapGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="4 4" 
            vertical={false} 
            stroke="#e2e8f0" 
            opacity={0.6} 
          />
          
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
            dy={10}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
            dx={-10}
            tickFormatter={(value) => `${value}`}
          />

          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }}
          />

          <Legend 
            verticalAlign="top" 
            height={40}
            wrapperStyle={{ 
              fontSize: '13px', 
              fontWeight: 500, 
              color: '#475569' 
            }}
            iconType="circle"
          />

          <Line
            type="monotone"
            dataKey="post"
            name="Bài post"
            stroke="#ec4899"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={<CustomDot />}
            strokeLinecap="round"
            fill="url(#postGradient)"
          />
          <Line
            type="monotone"
            dataKey="plan"
            name="Kế hoạch"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={<CustomDot />}
            strokeLinecap="round"
            fill="url(#planGradient)"
          />
          <Line
            type="monotone"
            dataKey="recap"
            name="Recap"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={<CustomDot />}
            strokeLinecap="round"
            fill="url(#recapGradient)"
          />
          <Line
            type="monotone"
            dataKey="event"
            name="Sự kiện"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={<CustomDot />}
            strokeLinecap="round"
            fill="url(#eventGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;