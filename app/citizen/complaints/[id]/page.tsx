'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ComplaintTimeline } from '@/components/complaints/complaint-timeline';
import { fetchComplaintById, fetchComplaintHistory } from '@/lib/data/service';
import { Complaint, ComplaintStatusHistory } from '@/types/database';
import { ISSUE_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS, SEVERITY_COLORS } from '@/types/complaint';
import { formatDate } from '@/lib/utils';

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="skeleton h-8 w-36 rounded-lg" />
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-2">
              <div className="skeleton h-4 w-20 rounded" />
              <div className="skeleton h-7 w-48 rounded" />
              <div className="skeleton h-3 w-32 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="skeleton h-6 w-24 rounded-full" />
              <div className="skeleton h-6 w-24 rounded-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="skeleton h-24 w-full rounded-xl" />
          <div className="skeleton h-48 w-full rounded-xl" />
          <div className="skeleton h-32 w-full rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function CitizenComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<ComplaintStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      if (!id) return;
      const c = await fetchComplaintById(id);
      if (c) {
        setComplaint(c);
        const h = await fetchComplaintHistory(c.id);
        setHistory(h);
      }
      setLoading(false);
    }
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complaint Not Found</h2>
        <p className="text-sm text-slate-500">The requested complaint record does not exist or has been removed.</p>
        <Link href="/citizen/complaints">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            Return to My Complaints
          </Button>
        </Link>
      </div>
    );
  }

  const statusStyle = STATUS_COLORS[complaint.status] || STATUS_COLORS.submitted;
  const sevStyle = SEVERITY_COLORS[complaint.ai_severity || 'medium'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header navigation */}
        <div className="flex items-center justify-between">
          <Link href="/citizen/complaints">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 font-medium">
              <ArrowLeft className="h-4 w-4" /> Back to Complaints
            </Button>
          </Link>
          <span className="text-xs font-medium text-slate-400">
            Citizen Case File
          </span>
        </div>

        {/* Complaint Main Card */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md">
                    {complaint.complaint_code}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Reported on {formatDate(complaint.created_at)}
                  </span>
                </div>
                <CardTitle className="text-xl sm:text-2xl text-slate-900 dark:text-white font-extrabold pt-1">
                  {ISSUE_TYPE_LABELS[complaint.issue_type] || complaint.issue_type}
                </CardTitle>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase border shadow-xs ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}>
                  AI Priority: {complaint.ai_severity || 'medium'}
                </span>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold border shadow-xs ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                  {STATUS_LABELS[complaint.status] || complaint.status}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Description & Location */}
            <div className="space-y-4">
              <div>
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Citizen Description
                </h3>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {complaint.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100/60 dark:bg-slate-800/60 px-3.5 py-2.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 w-fit">
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Location:</span>
                <span>{complaint.location_text}</span>
              </div>
            </div>

            {/* Complaint Image */}
            {complaint.image_url && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Uploaded Evidence Photo
                </h3>
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-96 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={complaint.image_url}
                    alt="Complaint photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Groq AI Assessment Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/80 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Groq AI Automated Triage Analysis
                  </h3>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Real-time visual and textual analysis generated at report submission
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-xl border border-emerald-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Category</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {complaint.ai_category || 'General Waste Issue'}
                  </span>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-xl border border-emerald-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Detected Stream</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {complaint.ai_waste_type || 'Mixed Solid Waste'}
                  </span>
                </div>
              </div>

              {complaint.ai_summary && (
                <div className="text-xs text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 p-3.5 rounded-xl border border-emerald-100/80 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">AI Case Summary:</span>
                  <p className="leading-relaxed">{complaint.ai_summary}</p>
                </div>
              )}

              {complaint.ai_recommendation && (
                <div className="text-xs text-emerald-900 dark:text-emerald-200 bg-emerald-100/80 dark:bg-emerald-950/80 p-3.5 rounded-xl border border-emerald-300/60 dark:border-emerald-700/60">
                  <span className="font-bold block mb-1 text-emerald-950 dark:text-emerald-100">Recommended Resolution Action:</span>
                  <p className="leading-relaxed">{complaint.ai_recommendation}</p>
                </div>
              )}
            </div>

            {/* Admin Note if available */}
            {complaint.admin_note && (
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
                <span className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" /> Official Admin Note:
                </span>
                <p className="text-xs text-purple-950 dark:text-purple-200 leading-relaxed font-medium pl-5">
                  &ldquo;{complaint.admin_note}&rdquo;
                </p>
              </div>
            )}

            {/* Resolution Timeline */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <ComplaintTimeline currentStatus={complaint.status} history={history} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
