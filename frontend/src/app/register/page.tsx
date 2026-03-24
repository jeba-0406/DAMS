'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { AxiosError } from 'axios';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authService.register(form);
      login(response.data);
      toast.success('Account created successfully!');

      const role = response.data.role;
      const targetPath = role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard';
      router.push(targetPath);
      return;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#fbfcfd]">
      {/* Soft Animated Background Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-100/60 blur-[130px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-rose-50/70 blur-[130px] rounded-full animate-pulse delay-1000"></div>

      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {/* Logo Section */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-2xl mb-3 shadow-lg shadow-indigo-100/40 border border-white transform hover:scale-105 transition-transform duration-500">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden">
              <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                {/* Metrics bars */}
                <path d="M6 20v-4" />
                <path d="M10 20v-7" />
                <path d="M14 20v-10" />
                {/* Approval document/checkmark vibe */}
                <path d="M18 20V4" />
                <path d="M18 4h-4" />
                {/* Highlight Checkmark overlay */}
                <path className="text-white" strokeLinecap="round" strokeLinejoin="round" d="m9 11 3 3 7-7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
            DAMS
          </h1>
          <p className="text-slate-400 font-bold tracking-[0.2em] uppercase text-[8px]">
            Digital Approval Metrics System
          </p>
        </div>

        {/* Register Card (Light Glassmorphism) */}
        <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-[2.5rem] p-6 shadow-2xl shadow-indigo-100/20 relative overflow-hidden">
          <div className="mb-4 text-center">
            <h2 className="text-lg font-bold text-slate-800 mb-0.5">Create Account</h2>
            <p className="text-slate-400 text-[10px]">Join our recruitment platform.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100/50 rounded-xl px-4 py-2.5 text-[12px] text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all duration-300"
                  placeholder="John Doe"
                  required
                  minLength={2}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100/50 rounded-xl px-4 py-2.5 text-[12px] text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all duration-300"
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100/50 rounded-xl px-4 py-2.5 text-[12px] text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all duration-300"
                    placeholder="6+ chars"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100/50 rounded-xl px-4 py-2.5 text-[12px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all duration-300 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-200 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:active:scale-100 mt-2 group"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2 text-sm">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 text-sm">
                  Create Account
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-50 text-center relative z-10">
            <p className="text-slate-400 text-[11px] font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Minimal Footer */}
        <p className="text-center text-slate-300 text-[9px] mt-4 uppercase tracking-[0.2em] font-bold">
          DAMS &bull; 2024
        </p>
      </div>
    </div>
  );
}
