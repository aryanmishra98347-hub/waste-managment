'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Recycle, Shield, User, LogOut, Sparkles, AlertTriangle, Truck } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();
  const { user, loginAsCitizen, loginAsAdmin, logout } = useAuth();

  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Recycle className="h-6 w-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 dark:text-white leading-none block">
              EcoClean <span className="text-emerald-600 font-extrabold">AI</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
              Smart Waste Management
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Overview
          </Link>
          <Link
            href="/awareness"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith('/awareness')
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Waste Awareness
          </Link>

          {user?.role === 'citizen' && (
            <>
              <Link
                href="/citizen/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/citizen/dashboard')
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/citizen/report"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/citizen/report')
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Report Waste
              </Link>
              <Link
                href="/citizen/pickups"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/citizen/pickups')
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pickups
              </Link>
              <Link
                href="/citizen/assistant"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  pathname.startsWith('/citizen/assistant')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI Assistant
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <Link
                href="/admin/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin/dashboard')
                    ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Admin Dashboard
              </Link>
              <Link
                href="/admin/complaints"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin/complaints')
                    ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Manage Complaints
              </Link>
              <Link
                href="/admin/pickups"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin/pickups')
                    ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Manage Pickups
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions: Demo Switcher & User Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Demo Switcher Buttons for Hackathon Judges */}
          <div className="hidden lg:flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-3 mr-1">
            <Button
              variant={user?.role === 'citizen' ? 'default' : 'outline'}
              size="sm"
              onClick={loginAsCitizen}
              className="text-xs h-8 gap-1"
            >
              <User className="h-3.5 w-3.5" />
              Citizen Demo
            </Button>
            <Button
              variant={user?.role === 'admin' ? 'secondary' : 'outline'}
              size="sm"
              onClick={loginAsAdmin}
              className="text-xs h-8 gap-1 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border-purple-200 dark:border-purple-800"
            >
              <Shield className="h-3.5 w-3.5" />
              Admin Demo
            </Button>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                  {user.full_name}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">
                  Role: <span className="font-bold text-emerald-600 dark:text-emerald-400">{user.role}</span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Log Out"
                className="text-slate-500 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
