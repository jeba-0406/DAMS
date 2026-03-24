'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="font-semibold text-gray-900">DAMS</span>
        <span className="hidden sm:block text-gray-300">|</span>
        <span className="hidden sm:block text-sm text-gray-500">Digital Approval Metrics System</span>

        {user?.role === 'ADMIN' && (
          <div className="hidden md:flex ml-8 space-x-6">
            <a href="/admin/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Dashboard</a>
            <a href="/admin/requests" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Requests</a>
            <a href="/admin/calendar" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Calendar</a>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-indigo-700 font-medium text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>
        <button onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">
          Logout
        </button>
      </div>
    </nav>
  );
}
