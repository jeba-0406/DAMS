'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { User, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isEmployee: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = Cookies.get('dams_token') || localStorage.getItem('dams_token');
    const storedUser = localStorage.getItem('dams_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored data
        clearAuth();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((authData: AuthResponse) => {
    const userData: User = {
      id: authData.id,
      name: authData.name,
      email: authData.email,
      role: authData.role,
      department: authData.department,
    };
    // Store in cookie (7 days) and localStorage
    Cookies.set('dams_token', authData.token, { expires: 7, secure: false }); // Allow HTTP for local dev
    localStorage.setItem('dams_token', authData.token);
    localStorage.setItem('dams_user', JSON.stringify(userData));
    setToken(authData.token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, []);

  const clearAuth = () => {
    Cookies.remove('dams_token');
    localStorage.removeItem('dams_token');
    localStorage.removeItem('dams_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = useCallback(() => user?.role === 'ADMIN', [user]);
  const isEmployee = useCallback(() => user?.role === 'EMPLOYEE', [user]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAdmin, isEmployee }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
