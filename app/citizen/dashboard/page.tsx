'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Truck, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  FileText,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/context';
import { fetchComplaints, fetchPickups } from '@/lib/data/service';
import { Complaint, PickupRequest } from '@/types/database';
import { ISSUE_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS, SEVERITY_COLORS } from '@/types/complaint';
import { formatDate } from '@/lib/utils';

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <td key={i} className="py-4 px-4">
          <div className="skeleton h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  );
}

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const [cData, pData] = await Promise.all([
        fetchComplaints(user.id, false),
        fetchPickups(user.id, false),
      ]);
      setComplaints(cData);
      setPickups(pData);
      setLoading(false);
    }
    loadData();
  }, [user]);

  const activeComplaints = complaints.filter(c => c.status !== 'resolved');
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
  const pendingPickups = pickups.filter(p => p.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Welcome Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
              Citizen Portal
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Good day, {user?.full_name || 'Citizen'} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track your waste reports and pickup requests in real-time.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/citizen/report">
              <Button className="gap-2 font-semibold">
                <PlusCircle className="h-4 w-4" />
                Report Issue
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Active Complaints
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {loading ? (
                    <span className="skeleton inline-block h-8 w-12 rounded align-bottom" />
                  ) : (
                    activeComplaints.length
                  )}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <AlertCircle className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Resolved
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {loading ? (
                    <span className="skeleton inline-block h-8 w-12 rounded align-bottom" />
                  ) : (
                    resolvedComplaints.length
                  )}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Pending Pickups
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {loading ? (
                    <span className="skeleton inline-block h-8 w-12 rounded align-bottom" />
                  ) : (
                    pendingPickups.length
                  )}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <Truck className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/citizen/report" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all hover:shadow-md">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 group-hover:scale-105 transition-transform shrink-0">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    Report Waste Issue
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Submit overflowing bins, missed collection, or roadside litter with optional photo & GPS.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/citizen/pickups/new" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-md">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 group-hover:scale-105 transition-transform shrink-0">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    Request Waste Pickup
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Book an on-demand pickup for wet, dry, or recyclable waste on your preferred date.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/citizen/assistant" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-md">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 group-hover:scale-105 transition-transform shrink-0">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                    AI Waste Assistant
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Upload an item or ask Groq AI for instant waste classification and segregation rules.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* ── Recent Complaints ── */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Recent Waste Complaints
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Your latest reported issues and their current status
              </CardDescription>
            </div>
            <Link href="/citizen/complaints">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="pt-0 px-0">
            {loading ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {['Code', 'Issue', 'Location', 'AI Priority', 'Status', 'Date', 'Action'].map((h) => (
                        <th key={h} className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </tbody>
                </table>
              </div>
            ) : complaints.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                  <FileText className="h-7 w-7 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No complaints yet</p>
                  <p className="text-xs text-slate-400 mt-1">Start by reporting a waste issue in your area.</p>
                </div>
                <Link href="/citizen/report">
                  <Button size="sm" className="mt-2">Create First Report</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {['Code', 'Issue', 'Location', 'AI Priority', 'Status', 'Date', 'Action'].map((h, i) => (
                        <th key={h} className={`py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i === 6 ? 'text-right' : ''}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                    {complaints.slice(0, 5).map((c) => {
                      const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS.submitted;
                      const sevStyle = SEVERITY_COLORS[c.ai_severity || 'medium'];
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                            {c.complaint_code}
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-100">
                            {ISSUE_TYPE_LABELS[c.issue_type] || c.issue_type}
                          </td>
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400 max-w-[200px]">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                              <span className="truncate">{c.location_text}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}>
                              {c.ai_severity || 'medium'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                              {STATUS_LABELS[c.status] || c.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                            {formatDate(c.created_at)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Link href={`/citizen/complaints/${c.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-semibold">
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
