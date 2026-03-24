'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { requestService } from '@/services/requestService';
import { Request, EmployeeStats } from '@/types';
import Navbar from '@/components/layout/Navbar';
import CreateRequestForm from '@/components/forms/CreateRequestForm';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export default function EmployeeDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!authLoading && user?.role === 'ADMIN') router.push('/admin/dashboard');
  }, [user, authLoading, router]);

  const fetchData = useCallback(async () => {
    try {
      const [reqRes, statsRes] = await Promise.all([
        requestService.getMyRequests(),
        requestService.getMyStats(),
      ]);
      setRequests(reqRes.data);
      setStats(statsRes.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'EMPLOYEE') fetchData();
  }, [user, fetchData]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!user) return null;

  const statCards = stats ? [
    { label: 'Total Requests', value: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Approved', value: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rejected', value: stats.rejected, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Approval Rate', value: `${stats.approvalRate}%`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Welcome header rrrrr*/}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}!</h1>
          <p className="text-gray-500 mt-1">Manage your approval requests below.</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className={`stat-card ${card.bg}`}>
                <p className="text-xs font-medium text-gray-500">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Create Request */}
        <CreateRequestForm onSuccess={fetchData} />

        {/* Requests List */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">My Requests</h2>
          {isLoading ? (
            <div className="py-8"><LoadingSpinner /></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="font-medium">No requests yet</p>
              <p className="text-sm">Create your first request above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-3 font-semibold text-gray-600">Title</th>
                    <th className="pb-3 font-semibold text-gray-600 hidden sm:table-cell">Description</th>
                    <th className="pb-3 font-semibold text-gray-600">Status</th>
                    <th className="pb-3 font-semibold text-gray-600 hidden md:table-cell">Submitted</th>
                    <th className="pb-3 font-semibold text-gray-600 hidden md:table-cell">Resolved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-medium text-gray-800 pr-4">{req.title}</td>
                      <td className="py-3 text-gray-500 hidden sm:table-cell max-w-xs truncate pr-4">
                        {req.description || '—'}
                      </td>
                      <td className="py-3"><StatusBadge status={req.status} /></td>
                      <td className="py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                        {req.approvedAt ? new Date(req.approvedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
