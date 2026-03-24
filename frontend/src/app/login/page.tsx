'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      login(response.data);
      toast.success(`Welcome back, ${response.data.name}!`);

      const role = response.data.role;
      const targetPath = role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard';
      router.push(targetPath);
      return;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      console.error('Login Error:', error);
      alert('LOGIN ERROR: ' + msg);
      toast.error(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#fbfcfd]">
      {/* Soft Animated Background Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-100/60 blur-[130px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-rose-50/70 blur-[130px] rounded-full animate-pulse delay-1000"></div>

      <div className="w-full max-w-[360px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl mb-4 shadow-lg shadow-indigo-100/40 border border-white transform hover:scale-105 transition-transform duration-500">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <svg className="w-6 h-6 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-0.5">
            DAMS
          </h1>
          <p className="text-slate-400 font-bold tracking-[0.2em] uppercase text-[8px]">
            Digital Approval Metrics System
          </p>
        </div>

        {/* Login Card (Light Glassmorphism) */}
        <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100/20 relative overflow-hidden">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-0.5">Welcome Back</h2>
            <p className="text-slate-400 text-[11px]">Secure access to your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100/50 rounded-xl px-4 py-3 text-[13px] text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all duration-300"
                placeholder="name@company.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[9px] text-indigo-500 hover:text-indigo-700 font-bold uppercase transition-colors">Forgot?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100/50 rounded-xl px-4 py-3 text-[13px] text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all duration-300"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
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
                  Sign In
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-50 text-center relative z-10">
            <p className="text-slate-400 text-[11px] font-medium">
              New here?{' '}
              <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Minimal Footer */}
        <p className="text-center text-slate-300 text-[9px] mt-6 uppercase tracking-[0.2em] font-bold">
          DAMS &bull; 2024
        </p>
      </div>
    </div>
  );
}
