'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  AlertCircle, 
  MapPin, 
  PlusCircle, 
  FileText, 
  Search,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/context';
import { fetchComplaints } from '@/lib/data/service';
import { Complaint } from '@/types/database';
import { ISSUE_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS, SEVERITY_COLORS } from '@/types/complaint';
import { formatDate } from '@/lib/utils';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'resolved', label: 'Resolved' },
];

export default function CitizenComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filtered, setFiltered] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    async function loadComplaints() {
      if (!user) return;
      const data = await fetchComplaints(user.id, false);
      setComplaints(data);
      setFiltered(data);
      setLoading(false);
    }
    loadComplaints();
  }, [user]);

  useEffect(() => {
    let result = complaints;
    if (selectedStatus !== 'all') {
      result = result.filter((c) => c.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.complaint_code.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.location_text.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [selectedStatus, searchQuery, complaints]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
              My Complaints
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Reported Issues
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track resolution status, timeline, and admin updates for your reports.
            </p>
          </div>
          <Link href="/citizen/report">
            <Button className="gap-2 font-semibold shrink-0">
              <PlusCircle className="h-4 w-4" />
              Report New Issue
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by code, description, or location…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              {STATUS_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedStatus(key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedStatus === key
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-6 space-y-3">
                  <div className="skeleton h-4 w-20 rounded" />
                  <div className="skeleton h-5 w-40 rounded" />
                  <div className="skeleton h-3.5 w-full rounded" />
                  <div className="skeleton h-3.5 w-4/5 rounded" />
                  <div className="flex justify-between pt-2">
                    <div className="skeleton h-6 w-24 rounded-full" />
                    <div className="skeleton h-6 w-20 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="py-16 text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                <FileText className="h-7 w-7 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {searchQuery || selectedStatus !== 'all'
                    ? 'No complaints match your filters'
                    : 'No complaints yet'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchQuery || selectedStatus !== 'all'
                    ? 'Try clearing your search or status filter'
                    : 'Start by reporting a waste issue in your area'}
                </p>
              </div>
              {!searchQuery && selectedStatus === 'all' && (
                <Link href="/citizen/report">
                  <Button size="sm">Report Your First Issue</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((c) => {
              const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS.submitted;
              const sevStyle = SEVERITY_COLORS[c.ai_severity || 'medium'];
              return (
                <Card
                  key={c.id}
                  className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                          {c.complaint_code}
                        </span>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-0.5 truncate">
                          {ISSUE_TYPE_LABELS[c.issue_type] || c.issue_type}
                        </h3>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 max-w-[150px]">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{c.location_text}</span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}
                        >
                          {c.ai_severity || 'medium'}
                        </span>
                      </div>
                      <Link href={`/citizen/complaints/${c.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-semibold">
                          Details
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Results count */}
        {!loading && filtered.length > 0 && (
          <p className="text-xs text-slate-400 text-center">
            Showing {filtered.length} of {complaints.length} complaints
          </p>
        )}
      </div>
    </div>
  );
}
