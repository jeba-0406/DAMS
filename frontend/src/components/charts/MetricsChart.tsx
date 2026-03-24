'use client';

import { AdminMetrics } from '@/types';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';

interface Props {
  metrics: AdminMetrics;
}

const COLORS = ['#f59e0b', '#10b981', '#ef4444'];

export default function MetricsChart({ metrics }: Props) {
  const pieData = [
    { name: 'Pending', value: metrics.pendingCount },
    { name: 'Approved', value: metrics.approvedCount },
    { name: 'Rejected', value: metrics.rejectedCount },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'Pending', count: metrics.pendingCount, fill: '#f59e0b' },
    { name: 'Approved', count: metrics.approvedCount, fill: '#10b981' },
    { name: 'Rejected', count: metrics.rejectedCount, fill: '#ef4444' },
  ];

  return (
    <>
      {/* Pie Chart */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Request Distribution</h3>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No data to display
          </div>
        )}
      </div>

      {/* Bar Chart */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Request Counts</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
