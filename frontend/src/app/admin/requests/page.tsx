'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { requestService } from '@/services/requestService';
import { Request, PageResponse, RequestType } from '@/types';
import Navbar from '@/components/layout/Navbar';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

function AdminRequestsContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL Params as source of truth
  const statusFilter = (searchParams.get('status') || 'ALL') as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
  const typeFilter = (searchParams.get('type') || 'ALL') as RequestType | 'ALL';
  const dateRangeFilter = (searchParams.get('dateRange') || 'ALL') as 'ALL' | '7_DAYS' | '30_DAYS';
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '0');

  const [localSearch, setLocalSearch] = useState(searchQuery);

  const [requestsPage, setRequestsPage] = useState<PageResponse<Request> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!authLoading && user?.role === 'EMPLOYEE') router.push('/employee/dashboard');
  }, [user, authLoading, router]);

  const fetchData = useCallback(async (
    page: number, 
    type: RequestType | 'ALL', 
    status: string,
    search: string,
    dateRange: string
  ) => {
    setIsLoading(true);
    try {
      const actualType = type === 'ALL' ? undefined : type;
      const actualStatus = status === 'ALL' ? undefined : status;
      const actualSearch = search.trim() === '' ? undefined : search;
      
      let startDate: string | undefined;
      const today = new Date();
      if (dateRange === '7_DAYS') {
        const d = new Date();
        d.setDate(today.getDate() - 7);
        startDate = d.toISOString().split('T')[0];
      } else if (dateRange === '30_DAYS') {
        const d = new Date();
        d.setDate(today.getDate() - 30);
        startDate = d.toISOString().split('T')[0];
      }

      const response = await requestService.getAllRequests(
        page, 10, actualType, actualStatus, actualSearch, startDate
      );
      setRequestsPage(response.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData(currentPage, typeFilter, statusFilter, searchQuery, dateRangeFilter);
    }
  }, [user, currentPage, typeFilter, statusFilter, searchQuery, dateRangeFilter, fetchData]);

  const updateFilters = (paramsToUpdate: { status?: string, type?: string, page?: number, search?: string, dateRange?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (paramsToUpdate.status !== undefined) params.set('status', paramsToUpdate.status);
    if (paramsToUpdate.type !== undefined) params.set('type', paramsToUpdate.type);
    if (paramsToUpdate.search !== undefined) {
      if (paramsToUpdate.search) params.set('search', paramsToUpdate.search);
      else params.delete('search');
    }
    if (paramsToUpdate.dateRange !== undefined) params.set('dateRange', paramsToUpdate.dateRange);
    
    if (paramsToUpdate.page !== undefined) params.set('page', paramsToUpdate.page.toString());
    else params.set('page', '0'); // Reset page on filter change
    
    router.push(`?${params.toString()}`);
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      if (action === 'approve') {
        await requestService.approveRequest(id);
        toast.success('Request approved');
      } else {
        await requestService.rejectRequest(id);
        toast.success('Request rejected');
      }
      fetchData(currentPage, typeFilter, statusFilter, searchQuery, dateRangeFilter);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!user) return null;

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

  const getDownloadUrl = (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return `${baseUrl}/api/files/${path}`;
  };

  const RequestDetailsModal = ({ request, onClose }: { request: Request, onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getTypeIcon(request.type)}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{request.title}</h3>
              <p className="text-sm text-gray-500">#{request.id} • {request.type.replace('_', ' ')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</h4>
                <div className="flex items-center gap-2">
                  <StatusBadge status={request.status} />
                  {request.approvedAt && (
                    <span className="text-xs text-gray-400">on {new Date(request.approvedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </section>

              <section>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Employee</h4>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="font-semibold text-gray-900">{request.employeeName}</p>
                  <p className="text-sm text-gray-500">{request.employeeEmail}</p>
                  <p className="text-xs text-indigo-600 mt-1 font-medium">{request.employeeDepartment || 'N/A'}</p>
                </div>
              </section>

              {(request.startDate || request.endDate) && (
                <section>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Timeline</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100">
                      <span className="text-[10px] text-blue-500 font-bold block">START</span>
                      {request.startDate ? new Date(request.startDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="w-4 h-px bg-gray-300"></div>
                    <div className="bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100">
                      <span className="text-[10px] text-blue-500 font-bold block">END</span>
                      {request.endDate ? new Date(request.endDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-6">
              <section>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Details</h4>
                <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 leading-relaxed font-normal italic">
                  &quot;{request.description || request.summary || request.itemName || 'No detailed description provided.'}&quot;
                </div>
              </section>

              {request.amount && (
                <section>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Amount</h4>
                  <p className="text-2xl font-bold text-indigo-600">${request.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </section>
              )}

              {(request.projectLink || request.finalDocumentPath || request.supportingDocumentPath) && (
                <section>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Links & Artifacts</h4>
                  <div className="flex flex-col gap-2">
                    {request.projectLink && (
                      <a href={request.projectLink} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-medium">
                        🔗 <span className="truncate">Project Link</span>
                      </a>
                    )}
                    {request.finalDocumentPath && (
                      <a href={getDownloadUrl(request.finalDocumentPath)} target="_blank"
                        className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition-colors text-sm font-medium">
                        📄 <span className="truncate">Final Document (PDF)</span>
                      </a>
                    )}
                    {request.supportingDocumentPath && (
                      <a href={getDownloadUrl(request.supportingDocumentPath)} target="_blank"
                        className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition-colors text-sm font-medium">
                        📄 <span className="truncate">Supporting Document</span>
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            {request.status === 'PENDING' ? (
              <>
                <button
                  onClick={() => { handleAction(request.id, 'reject'); onClose(); }}
                  disabled={actionLoading === request.id}
                  className="px-6 py-2.5 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">
                  Reject Request
                </button>
                <button
                  onClick={() => { handleAction(request.id, 'approve'); onClose(); }}
                  disabled={actionLoading === request.id}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50">
                  {actionLoading === request.id ? 'Approving...' : 'Approve Request'}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request Management</h1>
            <p className="text-gray-500 mt-1">Review and action all employee requests.</p>
          </div>
        </div>

        {/* Requests Table */}
        <div className="card">
          <div className="flex flex-col gap-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-800">All Requests</h2>
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search by name, type, or dept..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && updateFilters({ search: localSearch })}
                  className="input-field pl-10 py-2 text-sm w-full bg-white border-gray-200"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {localSearch !== searchQuery && (
                  <button 
                    onClick={() => updateFilters({ search: localSearch })}
                    className="absolute right-2 top-1.5 px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700 transition-colors"
                  >
                    GO
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type</span>
                <select
                  value={typeFilter}
                  onChange={(e) => updateFilters({ type: e.target.value })}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="LEAVE">🌴 Leave</option>
                  <option value="PROJECT_COMPLETION">✅ Project</option>
                  <option value="PURCHASE">💰 Purchase</option>
                  <option value="OVERTIME">⏰ Overtime</option>
                  <option value="OD_REQUEST">📍 On-Duty</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time</span>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => updateFilters({ dateRange: e.target.value })}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="ALL">All Time</option>
                  <option value="7_DAYS">Last 7 Days</option>
                  <option value="30_DAYS">Last 30 Days</option>
                </select>
              </div>

              <div className="ml-auto flex items-center gap-2">
                {requestsPage && (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">
                    {requestsPage.totalElements} RESULTS
                  </span>
                )}
                {(searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL' || dateRangeFilter !== 'ALL') && (
                  <button 
                    onClick={() => {
                      setLocalSearch('');
                      router.push('/admin/requests');
                    }}
                    className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center"><LoadingSpinner /></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="pb-3 font-semibold text-gray-600">ID</th>
                      <th className="pb-3 font-semibold text-gray-600">Type</th>
                      <th className="pb-3 font-semibold text-gray-600">Details</th>
                      <th className="pb-3 font-semibold text-gray-600 hidden sm:table-cell">Employee & Dept</th>
                      <th className="pb-3 font-semibold text-gray-600">Status</th>
                      <th className="pb-3 font-semibold text-gray-600 hidden md:table-cell">Submitted</th>
                      <th className="pb-3 font-semibold text-gray-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {requestsPage?.content.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-gray-100/50 transition-colors cursor-pointer group"
                        onClick={() => setSelectedRequest(req)}
                      >
                        <td className="py-4 text-gray-400 align-top group-hover:text-indigo-600 transition-colors">#{req.id}</td>
                        <td className="py-4 whitespace-nowrap align-top">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            <span className="mr-1">{getTypeIcon(req.type)}</span>
                            {req.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="font-medium text-gray-800">{req.title}</div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-sm">
                            {req.description || req.summary || req.itemName || 'No details'}
                          </div>
                        </td>
                        <td className="py-4 hidden sm:table-cell align-top">
                          <div className="font-medium text-gray-700">{req.employeeName}</div>
                          <div className="text-xs text-gray-400">{req.employeeEmail}</div>
                          <div className="text-[10px] text-indigo-500 font-bold mt-1 uppercase">{req.employeeDepartment || 'N/A'}</div>
                        </td>
                        <td className="py-4 align-top"><StatusBadge status={req.status} /></td>
                        <td className="py-4 text-gray-500 hidden md:table-cell whitespace-nowrap align-top">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 align-top text-right">
                          {req.status === 'PENDING' ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'approve'); }}
                                disabled={actionLoading === req.id}
                                className="btn-success text-xs px-2 py-1">
                                {actionLoading === req.id ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'reject'); }}
                                disabled={actionLoading === req.id}
                                className="btn-danger text-xs px-2 py-1">
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              {req.approvedAt ? new Date(req.approvedAt).toLocaleDateString() : '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {requestsPage && requestsPage.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-500 italic">
                    Showing page {requestsPage.currentPage + 1} of {requestsPage.totalPages}
                  </p>
                   <div className="flex gap-2">
                    <button
                      onClick={() => updateFilters({ page: currentPage - 1 })}
                      disabled={requestsPage.first}
                      className="btn-secondary text-xs py-1.5 px-3">
                      Previous
                    </button>
                    <button
                      onClick={() => updateFilters({ page: currentPage + 1 })}
                      disabled={requestsPage.last}
                      className="btn-secondary text-xs py-1.5 px-3">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}

export default function AdminRequestsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <AdminRequestsContent />
    </Suspense>
  );
}
