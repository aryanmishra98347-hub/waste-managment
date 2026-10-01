/**
 * Smart Waste Incident Fusion - Configuration Constants
 * Centralized thresholds for geographic radius, time windows, community signals, and attention levels.
 */

// Geographic proximity threshold for GPS-based clustering (in meters)
export const INCIDENT_GEO_RADIUS_METRES = 500;

// Maximum time window between complaints to be candidates for the same incident (in hours)
export const INCIDENT_TIME_WINDOW_HOURS = 24;

// Community Signal thresholds based on report count
export const COMMUNITY_SIGNAL_THRESHOLDS = {
  WEAK_MAX: 2,       // 1-2 reports: weak
  MODERATE_MAX: 5,   // 3-5 reports: moderate
  STRONG_MIN: 6,     // 6+ reports: strong
} as const;

// Text similarity / keyword overlap threshold for candidate grouping (0.0 to 1.0)
export const TEXT_SIMILARITY_THRESHOLD = 0.25;

// Attention level calculation weights and thresholds
export const ATTENTION_RULES = {
  // If report count reaches this, attention is elevated to HIGH automatically
  HIGH_REPORT_COUNT_THRESHOLD: 4,
  // If issue type is severe (e.g., hazardous/illegal dumping) and has multiple reports
  CRITICAL_ISSUE_TYPES: ['illegal_dumping', 'overflowing_bin'],
  // Hours considered "recent" for high priority escalation
  RECENCY_URGENT_HOURS: 12,
} as const;
