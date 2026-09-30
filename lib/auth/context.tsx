'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, UserRole } from '@/types/database';
import { DEMO_CITIZEN_PROFILE, DEMO_ADMIN_PROFILE } from '@/lib/data/seedData';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  loginAsCitizen: () => void;
  loginAsAdmin: () => void;
  loginWithSupabase: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check saved session in localStorage or Supabase auth
    const savedUser = localStorage.getItem('swm_session_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(DEMO_CITIZEN_PROFILE);
      }
    } else {
      // Default to demo citizen for quick friction-free demo testing if not logged in
      setUser(DEMO_CITIZEN_PROFILE);
      localStorage.setItem('swm_session_user', JSON.stringify(DEMO_CITIZEN_PROFILE));
    }
    setLoading(false);
  }, []);

  const loginAsCitizen = () => {
    setUser(DEMO_CITIZEN_PROFILE);
    localStorage.setItem('swm_session_user', JSON.stringify(DEMO_CITIZEN_PROFILE));
    router.push('/citizen/dashboard');
  };

  const loginAsAdmin = () => {
    setUser(DEMO_ADMIN_PROFILE);
    localStorage.setItem('swm_session_user', JSON.stringify(DEMO_ADMIN_PROFILE));
    router.push('/admin/dashboard');
  };

  const loginWithSupabase = async (email: string, role: UserRole = 'citizen'): Promise<boolean> => {
    setLoading(true);
    try {
      const supabase = createClient();
      // Attempt supabase login or fallback to dynamic profile
      const userProfile: Profile = {
        id: role === 'admin' ? DEMO_ADMIN_PROFILE.id : `cit-${Date.now()}`,
        full_name: email.split('@')[0],
        email: email,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(userProfile);
      localStorage.setItem('swm_session_user', JSON.stringify(userProfile));
      setLoading(false);
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/citizen/dashboard');
      }
      return true;
    } catch (e) {
      console.error('Supabase login error:', e);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('swm_session_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginAsCitizen,
        loginAsAdmin,
        loginWithSupabase,
        logout,
      }}
    >
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
