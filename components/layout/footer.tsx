import React from 'react';
import Link from 'next/link';
import { Recycle, ShieldCheck, Cpu, Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-16 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Recycle className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                EcoClean AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Production-style centralized Smart Waste Management System connecting citizens with sanitation authorities powered by Groq AI.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/citizen/report" className="hover:text-emerald-600 transition-colors">
                  Report Waste Issue
                </Link>
              </li>
              <li>
                <Link href="/citizen/pickups/new" className="hover:text-emerald-600 transition-colors">
                  Request Waste Pickup
                </Link>
              </li>
              <li>
                <Link href="/citizen/complaints" className="hover:text-emerald-600 transition-colors">
                  Track Complaint Status
                </Link>
              </li>
              <li>
                <Link href="/citizen/assistant" className="hover:text-emerald-600 transition-colors">
                  AI Waste Assistant
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Admin & Governance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin/dashboard" className="hover:text-emerald-600 transition-colors">
                  Centralized Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/complaints" className="hover:text-emerald-600 transition-colors">
                  Hotspot & Complaint Triage
                </Link>
              </li>
              <li>
                <Link href="/admin/pickups" className="hover:text-emerald-600 transition-colors">
                  Pickup Schedule Management
                </Link>
              </li>
              <li>
                <Link href="/awareness" className="hover:text-emerald-600 transition-colors">
                  Waste Awareness Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Technical Stack
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Next.js App Router</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">TypeScript</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Tailwind CSS</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Supabase PostgreSQL</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Groq LLM</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Smart Waste Management System. Hackathon Production Build.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Leaf className="h-3.5 w-3.5" /> Eco-Tech Civic System
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Cpu className="h-3.5 w-3.5" /> Groq AI Enhanced
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
