'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ComplaintTimeline } from '@/components/complaints/complaint-timeline';
import { fetchComplaintById, fetchComplaintHistory, updateComplaintStatus } from '@/lib/data/service';
import { Complaint, ComplaintStatus, ComplaintStatusHistory } from '@/types/database';
import { ISSUE_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS, SEVERITY_COLORS } from '@/types/complaint';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';

function AdminDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="skeleton h-8 w-44 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="skeleton h-6 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/3 rounded mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="skeleton h-24 w-full rounded-xl" />
              <div className="skeleton h-48 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <div className="skeleton h-32 w-full rounded-xl" />
          <div className="skeleton h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function AdminComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<ComplaintStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin Controls State
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>('submitted');
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const c = await fetchComplaintById(id);
      if (c) {
        setComplaint(c);
        setSelectedStatus(c.status);
        setAdminNote(c.admin_note || '');
        const h = await fetchComplaintHistory(c.id);
        setHistory(h);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setUpdating(true);
    setSuccessMsg(null);

    const updated = await updateComplaintStatus(
      complaint.id,
      selectedStatus,
      user?.id || 'adm-9001-uuid',
      adminNote
    );

    setComplaint(updated);
    const newHistory = await fetchComplaintHistory(complaint.id);
    setHistory(newHistory);

    setUpdating(false);
    setSuccessMsg(`Status successfully updated to "${STATUS_LABELS[selectedStatus]}". Resolution timeline updated.`);

    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <AdminDetailSkeleton />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complaint Record Not Found</h2>
        <p className="text-sm text-slate-500">The complaint ID does not match any registered report.</p>
        <Link href="/admin/complaints">
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
            Return to Admin Complaints List
          </Button>
        </Link>
      </div>
    );
  }

  const statusStyle = STATUS_COLORS[complaint.status] || STATUS_COLORS.submitted;
  const sevStyle = SEVERITY_COLORS[complaint.ai_severity || 'medium'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Label */}
        <div className="flex items-center justify-between">
          <Link href="/admin/complaints">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 font-medium">
              <ArrowLeft className="h-4 w-4" /> Back to Admin Complaints List
            </Button>
          </Link>
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Admin Triage Console
          </span>
        </div>

        {/* Success toast */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (Col Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-purple-700 dark:text-purple-400 bg-purple-100/60 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-md">
                        {complaint.complaint_code}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Submitted on {formatDate(complaint.created_at)}
                      </span>
                    </div>
                    <CardTitle className="text-xl sm:text-2xl text-slate-900 dark:text-white font-extrabold pt-1">
                      {ISSUE_TYPE_LABELS[complaint.issue_type] || complaint.issue_type}
                    </CardTitle>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase border shadow-xs ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}>
                      Priority: {complaint.ai_severity || 'medium'}
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
                      Citizen Reported Description
                    </h3>
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      {complaint.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100/60 dark:bg-slate-800/60 px-3.5 py-2.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 w-fit">
                    <MapPin className="h-4 w-4 text-purple-600 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Location:</span>
                    <span>{complaint.location_text}</span>
                  </div>
                </div>

                {/* Evidence Image */}
                {complaint.image_url && (
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Uploaded Photo Evidence
                    </h3>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-80 bg-slate-100 dark:bg-slate-900">
                      <img
                        src={complaint.image_url}
                        alt="Evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Groq AI Analysis Summary Box */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/30 border border-purple-200/80 dark:border-purple-800/80 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Groq AI Triage Assessment
                      </h3>
                      <p className="text-[11px] text-purple-700 dark:text-purple-400">
                        Automated categorization and impact prediction
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-xl border border-purple-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Category</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {complaint.ai_category || 'Overflowing Waste'}
                      </span>
                    </div>

                    <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-xl border border-purple-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Waste Stream</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {complaint.ai_waste_type || 'Mixed Waste'}
                      </span>
                    </div>
                  </div>

                  {complaint.ai_summary && (
                    <div className="text-xs text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 p-3.5 rounded-xl border border-purple-100/80 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white block mb-1">AI Executive Summary:</span>
                      <p className="leading-relaxed">{complaint.ai_summary}</p>
                    </div>
                  )}

                  {complaint.ai_recommendation && (
                    <div className="text-xs text-purple-950 dark:text-purple-200 bg-purple-100/80 dark:bg-purple-950/80 p-3.5 rounded-xl border border-purple-300/60 dark:border-purple-700/60">
                      <span className="font-bold block mb-1 text-purple-950 dark:text-purple-100">Recommended Operational Action:</span>
                      <p className="leading-relaxed">{complaint.ai_recommendation}</p>
                    </div>
                  )}
                </div>

                {/* Status Timeline */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <ComplaintTimeline currentStatus={complaint.status} history={history} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Admin Control Panel (Col Span 1) */}
          <div className="space-y-6">
            {/* Citizen Details */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-600" /> Citizen Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Reporter</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {complaint.profile?.full_name || 'Alex Johnson'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{complaint.profile?.email || 'citizen@eco.org'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{complaint.profile?.phone || '+1 (555) 234-5678'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Status Update Action Box */}
            <Card className="border-purple-200 dark:border-purple-800 shadow-sm overflow-hidden">
              <CardHeader className="bg-purple-600 text-white p-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-200" /> Update Complaint Status
                </CardTitle>
                <CardDescription className="text-xs text-purple-100 mt-0.5">
                  Update operational status and add worker notes
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-900 dark:text-white">
                      Status Workflow Step
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                      className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="assigned">Assigned</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-900 dark:text-white">
                      Admin Note / Update Instructions
                    </label>
                    <Textarea
                      placeholder="Add operational notes (e.g. Dispatched Sanitation Crew #3 to clear location)."
                      rows={4}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className="text-xs focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-bold bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-sm h-10 text-xs"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Updating Status...
                      </>
                    ) : (
                      'Save Status Update'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
