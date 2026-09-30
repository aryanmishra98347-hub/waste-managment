'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  Filter, 
  ArrowRight,
  Inbox,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchComplaints } from '@/lib/data/service';
import { Complaint } from '@/types/database';
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

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filtered, setFiltered] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function loadData() {
      const data = await fetchComplaints(undefined, true);
      setComplaints(data);
      setFiltered(data);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    let res = complaints;
    if (statusFilter !== 'all') {
      res = res.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(
        (c) =>
          c.complaint_code.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.location_text.toLowerCase().includes(q) ||
          (c.profile?.full_name || '').toLowerCase().includes(q)
      );
    }
    setFiltered(res);
  }, [statusFilter, search, complaints]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-0.5">
              Sanitation Administration
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Manage Complaints
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Review evidence, AI priority scores, and update complaint status across the city.
            </p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 font-semibold">
              <ArrowLeft className="h-4 w-4" /> Admin Dashboard
            </Button>
          </Link>
        </div>

        {/* Filter Controls */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search code, citizen, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <Filter className="h-4 w-4 text-slate-400 shrink-0 mr-1 hidden sm:block" />
              {['all', 'submitted', 'under_review', 'assigned', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === st
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st === 'all' ? 'All Statuses' : STATUS_LABELS[st] || st}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Table Card */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Citizen</th>
                    <th className="py-3.5 px-4">Issue Type</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">AI Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="max-w-xs mx-auto space-y-3">
                          <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                            <Inbox className="h-6 w-6" />
                          </div>
                          <p className="font-bold text-slate-700 dark:text-slate-300">No complaints found</p>
                          <p className="text-xs text-slate-400">
                            {search || statusFilter !== 'all'
                              ? 'No records match your active search or filter filters.'
                              : 'No complaint reports registered yet.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => {
                      const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS.submitted;
                      const sevStyle = SEVERITY_COLORS[c.ai_severity || 'medium'];

                      return (
                        <tr key={c.id} className="hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-purple-700 dark:text-purple-400">
                            {c.complaint_code}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                            {c.profile?.full_name || 'Citizen'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                            {ISSUE_TYPE_LABELS[c.issue_type] || c.issue_type}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 max-w-[180px] truncate">
                            {c.location_text}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}>
                              {c.ai_severity || 'medium'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                              {STATUS_LABELS[c.status] || c.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link href={`/admin/complaints/${c.id}`}>
                              <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-1">
                                Review <ArrowRight className="h-3 w-3" />
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
