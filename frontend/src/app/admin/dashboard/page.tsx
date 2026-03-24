'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { requestService } from '@/services/requestService';
import { AdminMetrics } from '@/types';
import Navbar from '@/components/layout/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatApprovalTime = (hours: number) => {
    if (hours < 24) return `${hours.toFixed(1)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    if (remainingHours === 0) return `${days}d`;
    return `${days}d ${remainingHours}h`;
  };

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!authLoading && user?.role === 'EMPLOYEE') router.push('/employee/dashboard');
  }, [user, authLoading, router]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const metricsRes = await requestService.getAdminMetrics();
      setMetrics(metricsRes.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchData();
  }, [user, fetchData]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!user) return null;

  const metricCards = metrics ? [
    { label: 'Total Requests', value: metrics.totalRequests, color: 'text-indigo-600', bg: 'bg-indigo-50', status: 'ALL' },
    { label: 'Pending', value: metrics.pendingCount, color: 'text-amber-600', bg: 'bg-amber-50', status: 'PENDING' },
    { label: 'Approved', value: metrics.approvedCount, color: 'text-emerald-600', bg: 'bg-emerald-50', status: 'APPROVED' },
    { label: 'Rejected', value: metrics.rejectedCount, color: 'text-red-600', bg: 'bg-red-50', status: 'REJECTED' },
    { label: 'Approval Rate', value: `${metrics.approvalRate}%`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    {
      label: 'Average Approval Time',
      value: metrics.averageApprovalTimeHours != null
        ? formatApprovalTime(metrics.averageApprovalTimeHours)
        : 'N/A',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ] : [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LEAVE': return '🌴';
      case 'PROJECT_COMPLETION': return '✅';
      case 'PURCHASE': return '💰';
      case 'OVERTIME': return '⏰';
      case 'OD_REQUEST': return '📍';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Real-time metrics and system analytics.</p>
          </div>
          <button 
            onClick={() => router.push('/admin/requests')}
            className="btn-primary"
          >
            Manage Requests
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : (
          <>
            {/* Metrics Cards */}
            {metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {metricCards.map((card: any) => (
                  <div 
                    key={card.label} 
                    className={`stat-card ${card.bg} ${card.status ? 'cursor-pointer hover:shadow-md transition-all duration-200' : ''}`}
                    onClick={() => card.status && router.push(`/admin/requests?status=${card.status}`)}
                  >
                    <p className="text-xs font-medium text-gray-500">{card.label}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Detailed Metrics Rows */}
            {metrics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Employees Leaderboard */}
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    🏆 Top Approved Employees
                  </h2>
                  {metrics.topApprovedEmployees && metrics.topApprovedEmployees.length > 0 ? (
                    <div className="space-y-3">
                      {metrics.topApprovedEmployees.map((emp: any, index: number) => (
                        <div key={emp.employeeName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index === 0 ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                              index === 1 ? 'bg-gray-200 text-gray-600 border border-gray-300' :
                              index === 2 ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                              'bg-indigo-50 text-indigo-600 border border-indigo-100'
                            }`}>
                              #{index + 1}
                            </div>
                            <span className="font-medium text-gray-700">{emp.employeeName}</span>
                          </div>
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-sm border border-emerald-100">
                            {emp.approvedCount}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">No approved requests yet.</p>
                  )}
                </div>

                {/* Requests By Type Breakdown */}
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    📊 Requests by Type
                  </h2>
                  {metrics.requestsByType && Object.keys(metrics.requestsByType).length > 0 ? (
                    <div className="space-y-4 pt-2">
                      {Object.entries(metrics.requestsByType)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([type, count]) => {
                          const percentage = metrics.totalRequests > 0 ? Math.round(((count as number) / metrics.totalRequests) * 100) : 0;
                          return (
                            <div key={type} className="space-y-1.5 p-2 bg-gray-50 rounded-lg border border-gray-50 hover:border-indigo-100 transition-colors">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-700 flex items-center gap-2">
                                  <span>{getTypeIcon(type)}</span>
                                  {type.replace('_', ' ')}
                                </span>
                                <span className="text-gray-900 font-bold">{count as number} <span className="text-gray-400 font-normal text-xs ml-1">({percentage}%)</span></span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">No requests to break down.</p>
                  )}
                </div>
              </div>
            )}

            {/* Rejection & Aging Rows */}
            {metrics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rejection Rate by Type */}
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    ❌ Rejection Rate by Type
                  </h2>
                  {metrics.rejectionRateByType && metrics.rejectionRateByType.length > 0 ? (
                    <div className="space-y-3">
                      {metrics.rejectionRateByType.map((stat: any) => (
                        <div key={stat.type} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                              <span>{getTypeIcon(stat.type)}</span>
                              {stat.type.replace(/_/g, ' ')}
                            </span>
                            <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${
                              stat.rejectionRate >= 50 ? 'text-red-700 bg-red-50 border border-red-100' :
                              stat.rejectionRate >= 20 ? 'text-amber-700 bg-amber-50 border border-amber-100' :
                              'text-emerald-700 bg-emerald-50 border border-emerald-100'
                            }`}>
                              {stat.rejectionRate}% rejected
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-700 ${
                                stat.rejectionRate >= 50 ? 'bg-red-500' :
                                stat.rejectionRate >= 20 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${stat.rejectionRate}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic text-center py-6">No data available.</p>
                  )}
                </div>

                {/* Pending Aging Table */}
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    ⏳ Pending Request Aging
                  </h2>
                  {metrics.pendingAging && metrics.pendingAging.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {metrics.pendingAging.map((item: any) => {
                        const isUrgent = item.agingDays >= 3;
                        const isWarning = item.agingDays >= 1 && item.agingDays < 3;
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isUrgent ? 'bg-red-50 border-red-100' :
                              isWarning ? 'bg-amber-50 border-amber-100' :
                              'bg-emerald-50 border-emerald-100'
                            }`}
                          >
                            <div className="min-w-0 flex-1 mr-2">
                              <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                              <p className="text-xs text-gray-500">{item.employeeName} • {item.type.replace(/_/g, ' ')}</p>
                            </div>
                            <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                              isUrgent ? 'bg-red-100 text-red-700' :
                              isWarning ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {item.agingDays === 0 ? 'Today' : `${item.agingDays}d`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <span className="text-3xl">✅</span>
                      <p className="text-sm text-gray-500 mt-2">No pending requests!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Charts */}
            {metrics && (
              <div className="grid grid-cols-1 gap-6">
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    📈 Monthly Request Trend <span className="text-xs font-normal text-gray-400 ml-2">(Current Year)</span>
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics.monthlyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => [v, 'Requests']} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#6366f1' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
