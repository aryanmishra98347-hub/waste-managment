import { Complaint, IssueType } from './database';

export type AttentionLevel = 'low' | 'medium' | 'high';
export type CommunitySignal = 'weak' | 'moderate' | 'strong';
export type IncidentStatus = 'open' | 'monitoring' | 'resolved';

export interface Incident {
  id: string;
  incident_code: string;
  title: string;
  issue_type: IssueType | string;
  location_text: string;
  latitude?: number | null;
  longitude?: number | null;
  report_count: number;
  attention_level: AttentionLevel;
  community_signal: CommunitySignal;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
  // Hydrated complaints
  complaints?: Complaint[];
  first_reported_at?: string;
  latest_reported_at?: string;
}

export interface IncidentComplaint {
  id: string;
  incident_id: string;
  complaint_id: string;
  created_at: string;
  complaint?: Complaint;
}

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  open: 'Open',
  monitoring: 'Monitoring',
  resolved: 'Resolved',
};

export const INCIDENT_STATUS_COLORS: Record<IncidentStatus, { bg: string; text: string; border: string }> = {
  open: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
  },
  monitoring: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  resolved: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
};

export const COMMUNITY_SIGNAL_LABELS: Record<CommunitySignal, string> = {
  weak: 'Weak',
  moderate: 'Moderate',
  strong: 'Strong',
};

export const COMMUNITY_SIGNAL_COLORS: Record<CommunitySignal, { bg: string; text: string; border: string; indicator: string }> = {
  weak: {
    bg: 'bg-slate-50 dark:bg-slate-900',
    text: 'text-slate-600 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    indicator: 'bg-slate-400',
  },
  moderate: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    indicator: 'bg-blue-500',
  },
  strong: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    indicator: 'bg-purple-600',
  },
};

export const ATTENTION_LEVEL_LABELS: Record<AttentionLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const ATTENTION_LEVEL_COLORS: Record<AttentionLevel, { bg: string; text: string; border: string; badge: string }> = {
  low: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-500',
  },
  medium: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-500',
  },
  high: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    badge: 'bg-rose-500',
  },
};
