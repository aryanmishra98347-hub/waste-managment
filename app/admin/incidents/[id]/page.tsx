'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Radio, 
  ExternalLink, 
  AlertTriangle,
  FileText,
  Loader2,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { fetchIncidentById, updateIncidentStatus } from '@/lib/data/service';
import { 
  Incident, 
  IncidentStatus, 
  INCIDENT_STATUS_LABELS, 
  INCIDENT_STATUS_COLORS, 
  COMMUNITY_SIGNAL_LABELS, 
  COMMUNITY_SIGNAL_COLORS, 
  ATTENTION_LEVEL_LABELS, 
  ATTENTION_LEVEL_COLORS 
} from '@/types/incident';
import { Complaint } from '@/types/database';
import { ISSUE_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS, SEVERITY_COLORS } from '@/types/complaint';
import { formatDate } from '@/lib/utils';

export default function AdminIncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, loading: authLoading } = useAuth();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>('open');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const inc = await fetchIncidentById(id);
        if (inc) {
          setIncident(inc);
          setSelectedStatus(inc.status);
        }
      } catch (err) {
        console.error('Error fetching incident details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident) return;

    setUpdating(true);
    setSuccessMsg(null);

    try {
      const updated = await updateIncidentStatus(incident.id, selectedStatus);
      setIncident(updated);
      setSuccessMsg(`Incident status successfully updated to "${INCIDENT_STATUS_LABELS[selectedStatus]}". Underlying citizen tickets remain independent.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error updating incident status:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Auth gate for admin
  if (!authLoading && user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Access Required</h2>
        <p className="text-sm text-slate-500">Citizen accounts cannot access incident intelligence consoles.</p>
        <Link href="/citizen/dashboard">
          <Button size="sm">Return to Citizen Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-48 w-full rounded-2xl" />
          <div className="skeleton h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Smart Incident Not Found</h2>
        <p className="text-sm text-slate-500">The incident ID does not match any registered smart incident.</p>
        <Link href="/admin/incidents">
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
            Return to Smart Incidents List
          </Button>
        </Link>
      </div>
    );
  }

  const statusStyle = INCIDENT_STATUS_COLORS[incident.status] || INCIDENT_STATUS_COLORS.open;
  const signalStyle = COMMUNITY_SIGNAL_COLORS[incident.community_signal] || COMMUNITY_SIGNAL_COLORS.weak;
  const attentionStyle = ATTENTION_LEVEL_COLORS[incident.attention_level] || ATTENTION_LEVEL_COLORS.medium;
  const complaints = incident.complaints || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Label */}
        <div className="flex items-center justify-between">
          <Link href="/admin/incidents">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 font-medium">
              <ArrowLeft className="h-4 w-4" /> Back to Smart Incidents
            </Button>
          </Link>
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Smart Waste Incident Intelligence
          </span>
        </div>

        {/* Success toast */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Main Incident Header Overview ── */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5 bg-gradient-to-br from-slate-900 to-purple-950 text-white">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-purple-500/20 text-purple-200 border border-purple-400/30 px-2.5 py-0.5 rounded-md">
                    SMART INCIDENT #{incident.incident_code}
                  </span>
                  <span className="text-xs text-purple-300 font-medium">
                    Issue Category: {ISSUE_TYPE_LABELS[incident.issue_type] || incident.issue_type}
                  </span>
                </div>
                <CardTitle className="text-2xl sm:text-3xl text-white font-extrabold pt-1">
                  {incident.title}
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-purple-200 pt-1">
                  <MapPin className="h-3.5 w-3.5 text-purple-300 shrink-0" />
                  <span>{incident.location_text}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                  {INCIDENT_STATUS_LABELS[incident.status] || incident.status}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Key Incident Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Related Reports</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5 block">
                  {incident.report_count} Reports
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Community Signal</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-bold text-xs mt-1 border ${signalStyle.bg} ${signalStyle.text} ${signalStyle.border}`}>
                  <span className={`h-2 w-2 rounded-full ${signalStyle.indicator}`} />
                  {COMMUNITY_SIGNAL_LABELS[incident.community_signal]}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Recommended Attention</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-bold text-xs mt-1 border ${attentionStyle.bg} ${attentionStyle.text} ${attentionStyle.border}`}>
                  <span className={`h-2 w-2 rounded-full ${attentionStyle.badge}`} />
                  {ATTENTION_LEVEL_LABELS[incident.attention_level]}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Time Span</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 text-xs mt-1 block">
                  {incident.first_reported_at ? formatDate(incident.first_reported_at) : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Latest: {incident.latest_reported_at ? formatDate(incident.latest_reported_at) : 'N/A'}
                </span>
              </div>
            </div>

            {/* Admin Incident Status Control Form */}
            <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/80">
              <form onSubmit={handleUpdateStatus} className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Manage Incident Operational Status
                  </span>
                  <p className="text-slate-500">
                    Update high-level incident monitoring state without changing underlying citizen complaint workflows.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as IncidentStatus)}
                    className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="open">Open</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={updating}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold h-9 shrink-0 gap-1.5"
                  >
                    {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Status'}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* ── Related Citizen Reports Section ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-600" />
                Related Citizen Reports ({complaints.length})
              </h2>
              <p className="text-xs text-slate-500">
                Individual complaints fused into this incident based on geographic proximity, time window, and issue relevance.
              </p>
            </div>
          </div>

          {complaints.length === 0 ? (
            <Card className="border-slate-200 dark:border-slate-800 py-12 text-center">
              <p className="text-xs text-slate-500">No linked complaints found for this incident record.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {complaints.map((c) => {
                const cStatusStyle = STATUS_COLORS[c.status] || STATUS_COLORS.submitted;
                const cSevStyle = SEVERITY_COLORS[c.ai_severity || 'medium'];

                return (
                  <Card 
                    key={c.id} 
                    className="border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        
                        {/* Thumbnail image if available */}
                        {c.image_url && (
                          <div className="w-full sm:w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-900">
                            <img
                              src={c.image_url}
                              alt="Evidence thumbnail"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Complaint Details */}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-xs text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                              {c.complaint_code}
                            </span>

                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cSevStyle.bg} ${cSevStyle.text} ${cSevStyle.border}`}>
                              {c.ai_severity || 'medium'}
                            </span>

                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cStatusStyle.bg} ${cStatusStyle.text} ${cStatusStyle.border}`}>
                              {STATUS_LABELS[c.status] || c.status}
                            </span>

                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(c.created_at)}
                            </span>
                          </div>

                          {/* Description summary */}
                          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                            {c.description}
                          </p>

                          {/* Location & Reporter */}
                          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {c.location_text}
                            </span>
                            <span>•</span>
                            <span>Reported by: <strong className="text-slate-700 dark:text-slate-300">{c.profile?.full_name || 'Citizen'}</strong></span>
                          </div>
                        </div>

                        {/* Action: Open original complaint detail */}
                        <div className="shrink-0 self-end sm:self-center">
                          <Link href={`/admin/complaints/${c.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs h-8 gap-1.5 font-semibold text-slate-700 dark:text-slate-200"
                            >
                              <span>View Ticket</span>
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
