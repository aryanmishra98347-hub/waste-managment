'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ShieldAlert, 
  MapPin, 
  ArrowRight, 
  Layers, 
  RefreshCw, 
  Search, 
  Filter, 
  AlertTriangle,
  Clock,
  Radio,
  FileText,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/context';
import { fetchIncidents, triggerIncidentFusion } from '@/lib/data/service';
import { 
  Incident, 
  IncidentStatus, 
  AttentionLevel,
  INCIDENT_STATUS_LABELS, 
  INCIDENT_STATUS_COLORS, 
  COMMUNITY_SIGNAL_LABELS, 
  COMMUNITY_SIGNAL_COLORS, 
  ATTENTION_LEVEL_LABELS, 
  ATTENTION_LEVEL_COLORS 
} from '@/types/incident';
import { formatDate } from '@/lib/utils';

export default function AdminIncidentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [fusing, setFusing] = useState(false);
  const [fusionNotice, setFusionNotice] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [attentionFilter, setAttentionFilter] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchIncidents();
        setIncidents(data);
      } catch (err) {
        console.error('Error fetching incidents:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRunFusion = async () => {
    setFusing(true);
    setFusionNotice(null);
    try {
      const result = await triggerIncidentFusion();
      setIncidents(result.incidents);
      setFusionNotice(
        result.newIncidentCount > 0
          ? `Fusion complete! Grouped ${result.newIncidentCount} new smart incident(s) from citizen reports.`
          : 'Fusion scan complete. All recent reports are consolidated.'
      );
      setTimeout(() => setFusionNotice(null), 5000);
    } catch (err) {
      console.error('Error running fusion:', err);
    } finally {
      setFusing(false);
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

  // Filter incidents
  const filtered = incidents.filter((inc) => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (attentionFilter !== 'all' && inc.attention_level !== attentionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchCode = inc.incident_code.toLowerCase().includes(q);
      const matchTitle = inc.title.toLowerCase().includes(q);
      const matchLoc = inc.location_text.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchLoc) return false;
    }
    return true;
  });

  const totalReportsConsolidated = incidents.reduce((sum, i) => sum + (i.report_count || 1), 0);
  const openIncidentsCount = incidents.filter((i) => i.status === 'open').length;
  const highAttentionCount = incidents.filter((i) => i.attention_level === 'high').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-purple-900/50">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                <Sparkles className="h-3 w-3 text-purple-300" />
                Smart Waste Incident Fusion
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Smart Incidents
            </h1>
            <p className="text-sm text-purple-200 max-w-2xl leading-relaxed">
              Identify repeated waste problems and focus attention where the community needs it most.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleRunFusion}
              disabled={fusing || loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-10 gap-2 shadow-md shadow-purple-900/40"
            >
              <RefreshCw className={`h-4 w-4 ${fusing ? 'animate-spin' : ''}`} />
              {fusing ? 'Analyzing Complaints...' : 'Run Incident Fusion'}
            </Button>
          </div>
        </div>

        {/* Notice Toast */}
        {fusionNotice && (
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
            <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
            <span>{fusionNotice}</span>
          </div>
        )}

        {/* ── Metric Snapshot Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-purple-600 shadow-xs">
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
                Consolidated Incidents
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                {loading ? '...' : incidents.length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                From {totalReportsConsolidated} individual citizen tickets
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500 shadow-xs">
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
                Active Open Incidents
              </p>
              <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
                {loading ? '...' : openIncidentsCount}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Requiring operational intervention
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-xs">
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
                High Attention Level
              </p>
              <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                {loading ? '...' : highAttentionCount}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Multiple reports or urgent waste types
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 shadow-xs">
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
                Triage Efficiency
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                {totalReportsConsolidated > 0 
                  ? `${Math.round(((totalReportsConsolidated - incidents.length) / totalReportsConsolidated) * 100)}%` 
                  : '0%'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Ticket redundancy reduced
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Search & Filter Bar ── */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search incident code, title, area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {(['all', 'open', 'monitoring', 'resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                      statusFilter === st
                        ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {st === 'all' ? 'All' : st}
                  </button>
                ))}
              </div>

              {/* Attention Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Attention:</span>
                <select
                  value={attentionFilter}
                  onChange={(e) => setAttentionFilter(e.target.value)}
                  className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs px-2.5 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="all">All Levels</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Incidents List / Cards ── */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-slate-200 dark:border-slate-800 p-6">
                  <div className="space-y-3">
                    <div className="skeleton h-5 w-48 rounded" />
                    <div className="skeleton h-7 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-slate-200 dark:border-slate-800 shadow-xs py-16 text-center">
              <div className="max-w-md mx-auto space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mx-auto">
                  <Inbox className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No Smart Incidents Found
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {search || statusFilter !== 'all' || attentionFilter !== 'all'
                    ? 'No incidents match the active search and filter criteria.'
                    : 'No incidents currently consolidated. Click "Run Incident Fusion" to scan and cluster citizen complaint reports.'}
                </p>
                <Button
                  onClick={handleRunFusion}
                  size="sm"
                  variant="outline"
                  className="mt-2 text-xs"
                >
                  Run Incident Fusion
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((incident) => {
                const statusStyle = INCIDENT_STATUS_COLORS[incident.status] || INCIDENT_STATUS_COLORS.open;
                const signalStyle = COMMUNITY_SIGNAL_COLORS[incident.community_signal] || COMMUNITY_SIGNAL_COLORS.weak;
                const attentionStyle = ATTENTION_LEVEL_COLORS[incident.attention_level] || ATTENTION_LEVEL_COLORS.medium;

                return (
                  <Card 
                    key={incident.id} 
                    className="border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all shadow-xs hover:shadow-md"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        
                        {/* Left: Code, Title, Location, Metrics */}
                        <div className="space-y-3 flex-1">
                          {/* Incident Code & Badge Strip */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-xs text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/70 px-2.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                              SMART INCIDENT #{incident.incident_code}
                            </span>

                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                              Status: {INCIDENT_STATUS_LABELS[incident.status] || incident.status}
                            </span>

                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Active since {formatDate(incident.created_at)}
                            </span>
                          </div>

                          {/* Incident Title */}
                          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                            {incident.title}
                          </h2>

                          {/* Location */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{incident.location_text}</span>
                          </div>

                          {/* Metrics Strip */}
                          <div className="pt-2 flex flex-wrap items-center gap-3">
                            {/* Report Count */}
                            <div className="bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                              <Layers className="h-3.5 w-3.5 text-purple-600" />
                              <span>
                                <strong className="text-purple-700 dark:text-purple-400 font-extrabold">{incident.report_count}</strong> related citizen {incident.report_count === 1 ? 'report' : 'reports'}
                              </span>
                            </div>

                            {/* Community Signal */}
                            <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${signalStyle.bg} ${signalStyle.text} ${signalStyle.border}`}>
                              <span className={`h-2 w-2 rounded-full ${signalStyle.indicator}`} />
                              <span>
                                Community Signal: <strong>{COMMUNITY_SIGNAL_LABELS[incident.community_signal]}</strong>
                              </span>
                            </div>

                            {/* Recommended Attention */}
                            <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${attentionStyle.bg} ${attentionStyle.text} ${attentionStyle.border}`}>
                              <span className={`h-2 w-2 rounded-full ${attentionStyle.badge}`} />
                              <span>
                                Recommended Attention: <strong>{ATTENTION_LEVEL_LABELS[incident.attention_level]}</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Action */}
                        <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                          <Link href={`/admin/incidents/${incident.id}`}>
                            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9 px-4 gap-1.5 shadow-xs">
                              View Incident
                              <ArrowRight className="h-3.5 w-3.5" />
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
