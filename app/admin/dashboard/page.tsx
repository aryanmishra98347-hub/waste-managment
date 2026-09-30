'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Truck, 
  ArrowRight,
  TrendingUp,
  MapPin,
  BarChart3,
  Inbox
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [issueFilter, setIssueFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    async function loadAdminData() {
      const [cData, pData] = await Promise.all([
        fetchComplaints(undefined, true),
        fetchPickups(undefined, true),
      ]);
      setComplaints(cData);
      setPickups(pData);
      setLoading(false);
    }
    loadAdminData();
  }, []);

  const totalComplaints = complaints.length;
  const submittedCount = complaints.filter(c => c.status === 'submitted').length;
  const inProgressCount = complaints.filter(c => c.status === 'under_review' || c.status === 'assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const totalPickups = pickups.length;

  const issueCounts = {
    overflowing_bin: complaints.filter(c => c.issue_type === 'overflowing_bin').length,
    garbage_on_road: complaints.filter(c => c.issue_type === 'garbage_on_road').length,
    missed_collection: complaints.filter(c => c.issue_type === 'missed_collection').length,
    illegal_dumping: complaints.filter(c => c.issue_type === 'illegal_dumping').length,
    other: complaints.filter(c => c.issue_type === 'other').length,
  };

  const maxCount = Math.max(...Object.values(issueCounts), 1);

  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (issueFilter !== 'all' && c.issue_type !== issueFilter) return false;
    if (priorityFilter !== 'all' && c.ai_severity !== priorityFilter) return false;
    return true;
  });

  const ISSUE_COLORS: Record<string, string> = {
    overflowing_bin: 'bg-rose-500',
    garbage_on_road: 'bg-amber-500',
    missed_collection: 'bg-blue-500',
    illegal_dumping: 'bg-purple-500',
    other: 'bg-slate-400',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Admin Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-2xl shadow-lg shadow-purple-900/30">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Central Sanitation Command Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Admin Operations Dashboard
            </h1>
            <p className="text-sm text-purple-200 mt-1">
              Real-time complaint triage, hotspot monitoring, and pickup management.
            </p>
          </div>
          <Link href="/admin/complaints">
            <Button variant="secondary" className="text-sm font-semibold gap-1.5 text-purple-900 whitespace-nowrap">
              Manage Complaints
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Complaints', value: totalComplaints, color: 'border-l-purple-600', textColor: 'text-slate-900 dark:text-white' },
            { label: 'New Submitted', value: submittedCount, color: 'border-l-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
            { label: 'In Progress', value: inProgressCount, color: 'border-l-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
            { label: 'Resolved', value: resolvedCount, color: 'border-l-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Pickup Requests', value: totalPickups, color: 'border-l-indigo-500', textColor: 'text-indigo-600 dark:text-indigo-400' },
          ].map(({ label, value, color, textColor }) => (
            <Card key={label} className={`border-l-4 ${color} shadow-sm col-span-1`}>
              <CardContent className="p-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
                  {label}
                </p>
                {loading ? (
                  <div className="skeleton h-8 w-14 rounded mt-2" />
                ) : (
                  <h3 className={`text-2xl font-extrabold mt-2 ${textColor}`}>
                    {value}
                  </h3>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Issue Distribution with Progress Bars ── */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              Waste Issue Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Breakdown of complaint types across all reports
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="space-y-1.5">
                    <div className="skeleton h-3.5 w-32 rounded" />
                    <div className="skeleton h-2 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              Object.entries(issueCounts).map(([key, count]) => {
                const pct = totalComplaints > 0 ? Math.round((count / maxCount) * 100) : 0;
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {ISSUE_TYPE_LABELS[key]}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                        {count}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${ISSUE_COLORS[key]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* ── Complaints Triage Table ── */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <CardTitle className="text-base font-semibold">Recent Complaints Triage</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Filter complaints to review AI recommendations and update status
              </CardDescription>
            </div>
            <Link href="/admin/complaints">
              <Button size="sm" variant="outline" className="text-xs h-8 shrink-0 gap-1.5">
                Full Table
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="pt-4 px-0">
            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6 pb-5 border-b border-slate-100 dark:border-slate-800">
              {[
                {
                  label: 'Status',
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: [
                    { value: 'all', label: 'All Statuses' },
                    { value: 'submitted', label: 'Submitted' },
                    { value: 'under_review', label: 'Under Review' },
                    { value: 'assigned', label: 'Assigned' },
                    { value: 'resolved', label: 'Resolved' },
                  ],
                },
                {
                  label: 'Issue Type',
                  value: issueFilter,
                  onChange: setIssueFilter,
                  options: [
                    { value: 'all', label: 'All Types' },
                    { value: 'overflowing_bin', label: 'Overflowing Bin' },
                    { value: 'garbage_on_road', label: 'Garbage on Road' },
                    { value: 'missed_collection', label: 'Missed Collection' },
                    { value: 'illegal_dumping', label: 'Illegal Dumping' },
                    { value: 'other', label: 'Other' },
                  ],
                },
                {
                  label: 'AI Priority',
                  value: priorityFilter,
                  onChange: setPriorityFilter,
                  options: [
                    { value: 'all', label: 'All Priorities' },
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' },
                  ],
                },
              ].map(({ label, value, onChange, options }) => (
                <div key={label}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {label}
                  </label>
                  <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
                  >
                    {options.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Table */}
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
                  {loading ? (
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  ) : filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="py-14 text-center space-y-3">
                          <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                            <Inbox className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            No complaints match your filters
                          </p>
                          <p className="text-xs text-slate-400">
                            Try adjusting the filter criteria above
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.slice(0, 10).map((c) => {
                      const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS.submitted;
                      const sevStyle = SEVERITY_COLORS[c.ai_severity || 'medium'];
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-purple-700 dark:text-purple-400 text-xs">
                            {c.complaint_code}
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-100">
                            {ISSUE_TYPE_LABELS[c.issue_type] || c.issue_type}
                          </td>
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400 max-w-[180px]">
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
                            <Link href={`/admin/complaints/${c.id}`}>
                              <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700 font-semibold">
                                Review
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
