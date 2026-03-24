import apiClient from '@/lib/apiClient';
import { ApiResponse, PageResponse, Request, RequestType, EmployeeStats, AdminMetrics, CalendarResponse } from '@/types';

export const requestService = {
  // Employee endpoints
  async createRequest(data: {
    title: string;
    description: string;
    type: RequestType;
    startDate?: string;
    endDate?: string;
    itemName?: string;
    amount?: number;
    hours?: number;
    overtimeDate?: string;
    actualStartDate?: string;
    actualEndDate?: string;
    completionDate?: string;
    projectLink?: string;
    summary?: string;
    odDate?: string;
    approvedByFaculty?: string;
    finalDocument?: File;
    supportingDocument?: File;
  }) {
    const formData = new FormData();

    // Create the "request" blob for the JSON part
    const requestData = { ...data };
    delete requestData.finalDocument;
    delete requestData.supportingDocument;

    formData.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));

    if (data.finalDocument) {
      formData.append('finalDocument', data.finalDocument);
    }

    if (data.supportingDocument) {
      formData.append('supportingDocument', data.supportingDocument);
    }

    const response = await apiClient.post<ApiResponse<Request>>('/api/requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getMyRequests() {
    const response = await apiClient.get<ApiResponse<Request[]>>('/api/requests/my');
    return response.data;
  },

  async getMyStats() {
    const response = await apiClient.get<ApiResponse<EmployeeStats>>('/api/requests/my/stats');
    return response.data;
  },

  // Admin endpoints
  async getAllRequests(
    page = 0,
    size = 20,
    type?: RequestType,
    status?: string,
    search?: string,
    startDate?: string,
    endDate?: string
  ) {
    const query = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (type) query.append('type', type);
    if (status) query.append('status', status);
    if (search) query.append('search', search);
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);

    const response = await apiClient.get<ApiResponse<PageResponse<Request>>>(
      `/api/admin/requests?${query.toString()}`
    );
    return response.data;
  },

  async approveRequest(id: number) {
    const response = await apiClient.put<ApiResponse<Request>>(`/api/admin/requests/${id}/approve`);
    return response.data;
  },

  async rejectRequest(id: number) {
    const response = await apiClient.put<ApiResponse<Request>>(`/api/admin/requests/${id}/reject`);
    return response.data;
  },

  async getAdminMetrics() {
    const response = await apiClient.get<ApiResponse<AdminMetrics>>('/api/admin/metrics');
    return response.data;
  },

  async getCalendarView(year: number, month: number) {
    const response = await apiClient.get<ApiResponse<CalendarResponse>>(`/api/admin/calendar?year=${year}&month=${month}`);
    return response.data;
  },
};
