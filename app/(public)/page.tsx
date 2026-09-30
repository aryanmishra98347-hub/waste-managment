'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Recycle, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  TrendingUp, 
  Truck, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  AlertTriangle,
  BookOpen,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/context';

export default function LandingPage() {
  const { user, loginAsCitizen, loginAsAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -z-10 translate-x-1/4 -translate-y-1/4 w-[700px] h-[700px] bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/4 translate-y-1/4 w-[500px] h-[500px] bg-teal-500/6 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-7">
            <Badge variant="default" className="gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Civic Platform
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Smart Waste Management{' '}
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                From Report to Resolution
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Connect citizens directly with sanitation authorities. Report overflowing bins,
              roadside garbage, or illegal dumping in seconds — and track progress live.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={loginAsCitizen}
                className="gap-2 h-12 px-6 text-base font-semibold shadow-lg shadow-emerald-600/25"
              >
                Report as Citizen
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={loginAsAdmin}
                className="gap-2 h-12 px-6 text-base font-semibold border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-950/60"
              >
                <ShieldCheck className="h-5 w-5" />
                Admin Portal
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Real-time tracking
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Groq AI triage
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                No login required to explore
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Workflow Steps ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            How EcoClean AI Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
            A seamless end-to-end civic waste management workflow
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {[
            {
              step: '1',
              color: 'emerald',
              title: 'Citizen Report',
              desc: 'Snap a photo, pick the location, and select the waste problem type in under 30 seconds.',
            },
            {
              step: '2',
              color: 'teal',
              title: 'Groq AI Analysis',
              desc: 'AI analyzes your description and photo to detect waste type, severity, and priority.',
            },
            {
              step: '3',
              color: 'purple',
              title: 'Admin Triage',
              desc: 'Sanitation authorities review high-priority complaints and assign cleanup crews.',
            },
            {
              step: '4',
              color: 'blue',
              title: 'Live Tracking',
              desc: 'Citizens see real-time status updates from Submitted → Resolved with a timeline.',
            },
          ].map(({ step, color, title, desc }) => (
            <Card
              key={step}
              className={`relative border-${color}-100 dark:border-slate-800 hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-6 space-y-4">
                <div
                  className={`h-10 w-10 rounded-xl bg-${color}-100 dark:bg-${color}-950/60 text-${color}-700 dark:text-${color}-400 flex items-center justify-center font-bold text-base`}
                >
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1.5">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Feature Highlights ── */}
      <section className="bg-white dark:bg-slate-900 py-20 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Everything You Need
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
              Core features built for citizens and administrators alike
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <AlertTriangle className="h-6 w-6" />,
                bg: 'bg-emerald-50 dark:bg-emerald-950/40',
                color: 'text-emerald-600',
                title: 'Waste Issue Reporting',
                desc: 'Report overflowing bins, missed collections, roadside garbage, or illegal dumping instantly with photo evidence.',
              },
              {
                icon: <Truck className="h-6 w-6" />,
                bg: 'bg-blue-50 dark:bg-blue-950/40',
                color: 'text-blue-600',
                title: 'Bulk Pickup Requests',
                desc: 'Schedule on-demand pickups for wet, dry, or recyclable waste with custom dates and quantity details.',
              },
              {
                icon: <BookOpen className="h-6 w-6" />,
                bg: 'bg-amber-50 dark:bg-amber-950/40',
                color: 'text-amber-600',
                title: 'Waste Awareness Guide',
                desc: 'Learn proper segregation rules for organic, recyclable, and hazardous materials with our education portal.',
              },
            ].map(({ icon, bg, color, title, desc }) => (
              <div key={title} className="flex gap-4 items-start">
                <div className={`p-3 rounded-xl ${bg} ${color} shrink-0`}>{icon}</div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1.5">
                    {title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-10 shadow-xl shadow-emerald-600/20">
          <Recycle className="h-10 w-10 text-white/80 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Ready to clean up your city?
          </h3>
          <p className="text-emerald-100 text-sm mb-6">
            Join thousands of citizens making their neighborhoods cleaner with EcoClean AI.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={loginAsCitizen}
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold gap-2 shadow-md"
            >
              Get Started as Citizen
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href="/awareness">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 font-semibold gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Explore Waste Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
