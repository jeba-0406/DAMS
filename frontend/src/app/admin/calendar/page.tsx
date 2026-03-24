'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { requestService } from '@/services/requestService';
import { CalendarResponse } from '@/types';
import Navbar from '@/components/layout/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

// Helper to check if a date string falls on a specific date object
// Fix timezone parsing by appending T00:00:00 to raw date strings from backend
const isEventOnDate = (eventStart: string | Date, eventEnd: string | Date, targetDate: Date) => {
  const start = new Date(typeof eventStart === 'string' ? `${eventStart}T00:00:00` : eventStart);
  const end = new Date(typeof eventEnd === 'string' ? `${eventEnd}T00:00:00` : eventEnd);
  
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  return target >= start && target <= end;
};

export default function AdminCalendar() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [calendarData, setCalendarData] = useState<CalendarResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Date state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!authLoading && user?.role === 'EMPLOYEE') router.push('/employee/dashboard');
  }, [user, authLoading, router]);

  const fetchCalendar = useCallback(async (year: number, month: number) => {
    setIsLoading(true);
    try {
      const res = await requestService.getCalendarView(year, month);
      setCalendarData(res.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || 'Failed to fetch calendar data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchCalendar(currentDate.getFullYear(), currentDate.getMonth() + 1);
    }
  }, [user, currentDate, fetchCalendar]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate calendar grid (days of the month)
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  // Create array with empty slots for padding
  const calendarDays = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8 overflow-hidden">
        
        {/* Main Calendar Section */}
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-gray-600">&lt;</button>
              <h1 className="text-xl font-bold text-gray-900 min-w-[160px] text-center">{currentMonthName}</h1>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-gray-600">&gt;</button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-blue-400 rounded-full"></div>
                  <span>Pending</span>
                </div>
              </div>
              <button onClick={handleToday} className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                Today
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden min-h-[600px] max-h-[calc(100vh-160px)]">
            <div className="grid grid-cols-7 border-b border-gray-100 shrink-0">
              {weekDays.map(day => (
                <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50/50"><LoadingSpinner size="lg" /></div>
            ) : (
              <div className="flex-1 grid grid-cols-7 auto-rows-fr font-medium overflow-y-auto">
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="border-r border-b border-gray-50 bg-gray-50/30 p-2 min-h-[120px]"></div>;
                  }

                  const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const isToday = new Date().toDateString() === dateObj.toDateString();
                  const isSelected = selectedDate.toDateString() === dateObj.toDateString();
                  
                  // Find events for this day
                  let dayEvents = [] as any[];
                  if (calendarData?.events) {
                    dayEvents = calendarData.events.filter(e => isEventOnDate(e.startDate, e.endDate, dateObj));
                  }

                  return (
                    <div 
                      key={`day-${day}`} 
                      onClick={() => handleDateClick(day)}
                      className={`border-r border-b border-gray-100 p-2 min-h-[120px] transition-colors relative group hover:bg-gray-50/80 flex flex-col gap-1 cursor-pointer 
                        ${isSelected ? 'bg-blue-50/40' : (isToday ? 'bg-blue-50/10' : '')}
                      `}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm ${isToday ? 'text-blue-600 font-bold' : (isSelected ? 'text-indigo-600 font-bold' : 'text-gray-600 font-semibold')}`}>
                          {day}
                        </span>
                        {isToday && <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">TODAY</span>}
                      </div>
                      
                      {/* Events block */}
                      <div className="flex-1 space-y-1.5 overflow-y-auto hide-scrollbar pb-2">
                        {dayEvents.map(event => {
                          const isApproved = event.status === 'APPROVED';
                          return (
                            <div 
                              key={`${event.id}-${day}`} 
                              title={event.title}
                              className={`text-xs px-2 py-1.5 rounded truncate transition-all duration-200 cursor-default
                                ${isApproved 
                                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm' 
                                  : 'bg-white border text-blue-500 border-blue-300 hover:bg-blue-50'
                                }`}
                            >
                              {event.employeeName}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Border highlight for selected/today */}
                      {isSelected && <div className="absolute inset-0 border-2 border-indigo-400 rounded-sm pointer-events-none z-10 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]"></div>}
                      {!isSelected && isToday && <div className="absolute inset-0 border border-blue-400 rounded-sm pointer-events-none z-10 opacity-50"></div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Side Panels */}
        <div className="w-full lg:w-80 flex flex-col space-y-6 shrink-0 lg:overflow-y-auto hide-scrollbar max-h-[calc(100vh-100px)] lg:pb-8">
          
          {/* Selected Date Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {selectedDate.toDateString() === new Date().toDateString() ? "Today's Overview" : `${selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric'})} Overview`}
              </h2>
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            
            <div className="flex items-baseline gap-3 my-4">
              <span className="text-5xl font-extrabold text-blue-600">
                {isLoading ? '-' : (calendarData?.events?.filter(e => isEventOnDate(e.startDate, e.endDate, selectedDate) && (e.status === 'APPROVED' || e.status === 'PENDING')).length || 0).toString().padStart(2, '0')}
              </span>
              <span className="text-base font-semibold text-gray-600">Out</span>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
              <span>Total Company Headcount</span>
              <span className="font-bold text-gray-900">{isLoading ? '-' : calendarData?.todaysOverview?.totalCompanyHeadcount || '-'}</span>
            </div>
          </div>

          {/* Selected Date Out List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Currently Out ({selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })})
            </h2>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2 py-1"><div className="h-3 bg-gray-200 rounded w-1/2"></div><div className="h-2 bg-gray-200 rounded w-2/3"></div></div>
                    </div>
                  ))}
                </div>
              ) : (() => {
                const dayUsers = calendarData?.events
                  ?.filter(e => isEventOnDate(e.startDate, e.endDate, selectedDate) && (e.status === 'APPROVED' || e.status === 'PENDING'))
                  .map(e => ({
                     name: e.employeeName,
                     department: e.employeeDepartment,
                     endDate: e.endDate,
                     status: e.status
                  })) || [];
                
                if (dayUsers.length === 0) {
                  return <p className="text-sm text-gray-500 italic pb-2 text-center">No one is out.</p>;
                }

                return dayUsers.map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                          {user.department} • {new Date(`${user.endDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}
                        </p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 ${user.status === 'APPROVED' ? 'bg-blue-500' : 'bg-blue-300 border border-blue-400'} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-gray-900">Upcoming</h2>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next 7 Days</span>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                  ))}
                </div>
              ) : calendarData?.upcoming && calendarData.upcoming.length > 0 ? (
                calendarData.upcoming.map((absence, idx) => {
                  const sDate = new Date(`${absence.startDate}T00:00:00`);
                  return (
                    <div key={idx} className="flex items-stretch gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="bg-gray-50 rounded-lg p-2 min-w-[50px] flex flex-col items-center justify-center text-center border border-gray-100">
                        <span className="text-[10px] uppercase font-bold text-gray-400">{sDate.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg font-black text-gray-800 leading-none">{sDate.getDate()}</span>
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-sm font-bold text-gray-900">{absence.name}</p>
                        <p className="text-[11px] text-gray-500">
                          {absence.type} • {absence.durationDays} day{absence.durationDays !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 italic pb-2 text-center">No upcoming absences.</p>
              )}
            </div>
            
            <button className="mt-6 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-blue-600 text-xs font-bold rounded-lg transition-colors">
              View Full Schedule
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
