'use client';

import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { ComplaintStatus, ComplaintStatusHistory } from '@/types/database';
import { STATUS_LABELS } from '@/types/complaint';
import { formatDate } from '@/lib/utils';

interface ComplaintTimelineProps {
  currentStatus: ComplaintStatus;
  history: ComplaintStatusHistory[];
}

const ORDERED_STATUSES: ComplaintStatus[] = [
  'submitted',
  'under_review',
  'assigned',
  'resolved',
];

const STATUS_ICONS: Record<string, string> = {
  submitted: '📥',
  under_review: '🔍',
  assigned: '👷',
  resolved: '✅',
};

export function ComplaintTimeline({ currentStatus, history }: ComplaintTimelineProps) {
  const currentStepIndex = ORDERED_STATUSES.indexOf(currentStatus);

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <Clock className="h-4 w-4 text-emerald-600" />
        Resolution Timeline
      </h3>

      {/* Visual Step Progress */}
      <div className="relative">
        {/* Track line */}
        <div className="absolute left-5 top-5 bottom-5 w-px bg-slate-200 dark:bg-slate-700 -z-0" />

        <div className="space-y-1">
          {ORDERED_STATUSES.map((step, idx) => {
            const isPassed = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const historyEntry = history.find(h => h.status === step);

            return (
              <div key={step} className="flex items-start gap-4 py-2">
                {/* Step circle */}
                <div
                  className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center text-sm shrink-0 font-semibold transition-all ${
                    isCurrent
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/60 shadow-md'
                      : isPassed
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isPassed ? (
                    isCurrent ? (
                      <span className="text-base">{STATUS_ICONS[step]}</span>
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )
                  ) : (
                    <span className="text-xs">{idx + 1}</span>
                  )}
                </div>

                {/* Step label & metadata */}
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : isPassed
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {STATUS_LABELS[step]}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full font-semibold">
                        Current
                      </span>
                    )}
                    {historyEntry && (
                      <span className="text-[11px] text-slate-400">
                        {new Date(historyEntry.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                  {historyEntry?.note && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed italic">
                      "{historyEntry.note}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed History Log */}
      {history.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Status Change Log
          </h4>
          <div className="space-y-2.5 border-l-2 border-slate-200 dark:border-slate-700 ml-3 pl-5">
            {history.map((item) => (
              <div key={item.id} className="relative">
                <div className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {STATUS_LABELS[item.status] || item.status}
                    </span>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  {item.note && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed italic">
                      "{item.note}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
