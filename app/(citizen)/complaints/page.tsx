'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  AlertCircle, 
  MapPin, 
  PlusCircle, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Search,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/context';
import { fetchComplaints } from '@/lib/data/service';
import { Complaint, ComplaintStatus } from '@/types/database';
import { ISSUE_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS, SEVERITY_COLORS } from '@/types/complaint';
import { formatDate } from '@/lib/utils';

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              My Complaints
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track resolution status, timeline, and admin updates for all your reported waste issues.
            </p>
          </div>
          <Link href="/citizen/report">
            <Button className="gap-2 text-xs font-semibold">
              <PlusCircle className="h-4 w-4" /> Report New Issue
            </Button>
          </Link>
        </div>

        {/* Filter Controls */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by code, description, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['all', 'submitted', 'under_review', 'assigned', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedStatus === st
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All Complaints' : STATUS_LABELS[st] || st}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* List of Complaints */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading complaints...</div>
        ) : filtered.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="py-12 text-center space-y-3">
              <FileText className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No complaints found matching filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((c) => {
              const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS.submitted;
              const sevStyle = SEVERITY_COLORS[c.ai_severity || 'medium'];

              return (
                <Card
                  key={c.id}
                  className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-all space-y-4"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 block">
                          {c.complaint_code}
                        </span>
                        <CardTitle className="text-base text-slate-900 dark:text-white mt-0.5">
                          {ISSUE_TYPE_LABELS[c.issue_type] || c.issue_type}
                        </CardTitle>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 text-xs">
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{c.location_text}</span>
                      </span>
                      <span>{formatDate(c.created_at)}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}
                      >
                        Priority: {c.ai_severity || 'medium'}
                      </span>
                      <Link href={`/citizen/complaints/${c.id}`}>
                        <Button size="sm" variant="ghost" className="gap-1 text-xs text-emerald-600 font-semibold">
                          View Details & Timeline <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
