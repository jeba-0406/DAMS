export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  department?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  department?: string;
}

export type RequestType = 'LEAVE' | 'PROJECT_COMPLETION' | 'PURCHASE' | 'OVERTIME' | 'OD_REQUEST';

export interface Request {
  id: number;
  title: string;
  description: string;
  type: RequestType;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approvedAt: string | null;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  employeeDepartment: string;

  // Existing Dynamic Fields
  startDate?: string;
  endDate?: string;
  itemName?: string;
  amount?: number;
  hours?: number;
  overtimeDate?: string;

  // PROJECT_COMPLETION Specific Fields
  actualStartDate?: string;
  actualEndDate?: string;
  completionDate?: string;
  projectLink?: string;
  finalDocumentPath?: string;
  summary?: string;

  // OD_REQUEST Specific Fields
  odDate?: string;
  approvedByFaculty?: string;
  supportingDocumentPath?: string;
}

export interface EmployeeStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: number;
}

export interface MonthlyCount {
  month: string;
  count: number;
}

export interface RejectionRateStat {
  type: string;
  total: number;
  rejected: number;
  rejectionRate: number;
}

export interface PendingAgingStat {
  id: number;
  title: string;
  employeeName: string;
  type: string;
  agingDays: number;
}

export interface AdminMetrics {
  totalRequests: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  approvalRate: number;
  averageApprovalTimeHours: number | null;
  requestsByType: Record<string, number>;
  topApprovedEmployees: { employeeName: string; approvedCount: number }[];
  monthlyTrend: MonthlyCount[];
  rejectionRateByType: RejectionRateStat[];
  pendingAging: PendingAgingStat[];
}

export interface PageResponse<T> {
  content: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

// Calendar Specific Types
export interface CalendarEvent {
  id: number;
  employeeName: string;
  title: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  employeeDepartment: string;
}

export interface TodaysOverview {
  outToday: number;
  totalCompanyHeadcount: number;
}

export interface CurrentlyOutUser {
  name: string;
  department: string;
  startDate: string;
  endDate: string;
}

export interface UpcomingAbsence {
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  durationDays: number;
}

export interface CalendarResponse {
  events: CalendarEvent[];
  todaysOverview: TodaysOverview;
  currentlyOut: CurrentlyOutUser[];
  upcoming: UpcomingAbsence[];
}
