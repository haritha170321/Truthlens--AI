import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export const DistributionChart = ({ data }) => {
  const { isDark } = useTheme();

  const defaultData = [
    { name: 'Supporting evidence found', value: 16, color: '#10B981' },
    { name: 'Conflicting evidence found', value: 11, color: '#EF4444' },
    { name: 'Context required', value: 6, color: '#F59E0B' },
    { name: 'Insufficient evidence', value: 4, color: '#64748B' },
    { name: 'Unable to verify', value: 2, color: '#A855F7' },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#38BDF8'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#0b1329' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
              borderRadius: '12px',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistributionChart;
