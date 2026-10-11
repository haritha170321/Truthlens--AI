import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export const TrendChart = ({ data }) => {
  const { isDark } = useTheme();

  const defaultData = [
    { date: 'Mon', fake: 3, real: 7, misleading: 2 },
    { date: 'Tue', fake: 5, real: 9, misleading: 1 },
    { date: 'Wed', fake: 2, real: 8, misleading: 4 },
    { date: 'Thu', fake: 6, real: 11, misleading: 3 },
    { date: 'Fri', fake: 4, real: 12, misleading: 2 },
    { date: 'Sat', fake: 7, real: 8, misleading: 3 },
    { date: 'Sun', fake: 5, real: 10, misleading: 1 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorFake" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorMisleading" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
          <XAxis
            dataKey="date"
            stroke={isDark ? '#64748b' : '#94a3b8'}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke={isDark ? '#64748b' : '#94a3b8'}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#0b1329' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
              borderRadius: '12px',
              fontSize: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
              color: isDark ? '#fff' : '#000',
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
          />
          <Area
            type="monotone"
            dataKey="real"
            name="Real News"
            stroke="#10B981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorReal)"
          />
          <Area
            type="monotone"
            dataKey="fake"
            name="Fake News"
            stroke="#EF4444"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorFake)"
          />
          <Area
            type="monotone"
            dataKey="misleading"
            name="Misleading"
            stroke="#F59E0B"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorMisleading)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
