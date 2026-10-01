import { Complaint, IssueType } from '@/types/database';
import { 
  Incident, 
  IncidentComplaint, 
  AttentionLevel, 
  CommunitySignal, 
  IncidentStatus 
} from '@/types/incident';
import { 
  INCIDENT_GEO_RADIUS_METRES, 
  INCIDENT_TIME_WINDOW_HOURS, 
  COMMUNITY_SIGNAL_THRESHOLDS,
  ATTENTION_RULES 
} from './constants';

/**
 * Calculates distance in meters between two lat/lng points using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Normalizes text for keyword token matching
 */
function extractSignificantTokens(text: string): Set<string> {
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for',
    'of', 'with', 'by', 'from', 'it', 'this', 'that', 'has', 'have', 'been', 'near',
    'around', 'outside', 'inside', 'front', 'back', 'since', 'yesterday', 'today'
  ]);

  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  );
}

/**
 * Checks if two location strings refer to overlapping landmarks or areas
 */
export function isLocationSimilar(locA: string, locB: string): boolean {
  if (!locA || !locB) return false;
  const tokensA = extractSignificantTokens(locA);
  const tokensB = extractSignificantTokens(locB);

  let common = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) common++;
  });

  return common >= 1;
}

/**
 * Checks if two issue types are identical or closely related
 */
export function areIssueTypesRelated(typeA: string, typeB: string): boolean {
  if (typeA === typeB) return true;

  const relatedPairs = [
    ['overflowing_bin', 'garbage_on_road'],
    ['overflowing_bin', 'missed_collection'],
    ['garbage_on_road', 'illegal_dumping'],
  ];

  return relatedPairs.some(
    ([a, b]) => (typeA === a && typeB === b) || (typeA === b && typeB === a)
  );
}

/**
 * Calculates text similarity token overlap (Jaccard similarity)
 */
export function calculateTextOverlap(textA: string, textB: string): number {
  const tokensA = extractSignificantTokens(textA);
  const tokensB = extractSignificantTokens(textB);

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) intersection++;
  });

  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Evaluates whether two complaints qualify as candidates for the same incident
 */
export function areComplaintsRelated(
  a: Complaint,
  b: Complaint,
  timeWindowHours: number = INCIDENT_TIME_WINDOW_HOURS,
  geoRadiusMetres: number = INCIDENT_GEO_RADIUS_METRES
): boolean {
  // 1. Issue type match or closely related
  if (!areIssueTypesRelated(a.issue_type, b.issue_type)) {
    return false;
  }

  // 2. Time proximity
  const timeA = new Date(a.created_at).getTime();
  const timeB = new Date(b.created_at).getTime();
  const diffHours = Math.abs(timeA - timeB) / (1000 * 60 * 60);
  if (diffHours > timeWindowHours) {
    return false;
  }

  // 3. Geographic proximity
  if (a.latitude && a.longitude && b.latitude && b.longitude) {
    const distance = calculateHaversineDistance(
      Number(a.latitude),
      Number(a.longitude),
      Number(b.latitude),
      Number(b.longitude)
    );
    if (distance <= geoRadiusMetres) {
      return true;
    }
  }

  // Fallback to location text landmark overlap
  if (isLocationSimilar(a.location_text, b.location_text)) {
    return true;
  }

  // 4. Text description relevance
  const overlap = calculateTextOverlap(
    `${a.description} ${a.location_text}`,
    `${b.description} ${b.location_text}`
  );

  return overlap >= 0.2;
}

/**
 * Computes the Community Signal based on number of reports
 * 1-2: Weak
 * 3-5: Moderate
 * 6+: Strong
 */
export function calculateCommunitySignal(reportCount: number): CommunitySignal {
  if (reportCount <= COMMUNITY_SIGNAL_THRESHOLDS.WEAK_MAX) {
    return 'weak';
  }
  if (reportCount <= COMMUNITY_SIGNAL_THRESHOLDS.MODERATE_MAX) {
    return 'moderate';
  }
  return 'strong';
}

/**
 * Computes Recommended Attention Level (Low, Medium, High)
 * Evaluates complaint severities, report count, and issue urgency.
 */
export function calculateAttentionLevel(complaints: Complaint[]): AttentionLevel {
  const count = complaints.length;
  const hasHighSeverity = complaints.some((c) => c.ai_severity === 'high');
  const hasMediumSeverity = complaints.some((c) => c.ai_severity === 'medium');
  const hasCriticalIssue = complaints.some((c) =>
    (ATTENTION_RULES.CRITICAL_ISSUE_TYPES as readonly string[]).includes(c.issue_type)
  );

  if (count >= ATTENTION_RULES.HIGH_REPORT_COUNT_THRESHOLD || hasHighSeverity || (hasCriticalIssue && count >= 2)) {
    return 'high';
  }

  if (count >= 2 || hasMediumSeverity) {
    return 'medium';
  }

  return 'low';
}

/**
 * Generates an incident title based on complaints
 * Example: "Overflowing Waste — Block B"
 */
export function generateIncidentTitle(complaints: Complaint[]): string {
  if (complaints.length === 0) return 'General Waste Incident';

  const first = complaints[0];
  let issuePrefix = 'Waste Issue';
  switch (first.issue_type) {
    case 'overflowing_bin':
      issuePrefix = 'Overflowing Waste';
      break;
    case 'garbage_on_road':
      issuePrefix = 'Roadside Litter';
      break;
    case 'missed_collection':
      issuePrefix = 'Uncollected Waste';
      break;
    case 'illegal_dumping':
      issuePrefix = 'Unauthorized Dumping';
      break;
    default:
      issuePrefix = 'Waste Problem';
  }

  // Extract a concise location reference from location_text
  let loc = first.location_text;
  if (loc.includes(',')) {
    loc = loc.split(',')[0].trim();
  }
  if (loc.length > 28) {
    loc = loc.slice(0, 28).trim();
  }

  return `${issuePrefix} — ${loc}`;
}

/**
 * Generates a standard incident code: SI-1001, SI-1002, etc.
 */
export function generateIncidentCode(index: number = 1001): string {
  return `SI-${index}`;
}

/**
 * Groups complaints into smart incidents using deterministic hybrid clustering
 */
export function clusterComplaintsIntoIncidents(
  complaints: Complaint[],
  existingIncidents: Incident[] = [],
  existingRelations: IncidentComplaint[] = []
): { incidents: Incident[]; relations: IncidentComplaint[] } {
  const assignedComplaintIds = new Set(existingRelations.map((r) => r.complaint_id));
  const incidents = [...existingIncidents];
  const relations = [...existingRelations];

  // Helper to find complaints belonging to an incident
  const getComplaintsForIncident = (incId: string): Complaint[] => {
    const cIds = relations.filter((r) => r.incident_id === incId).map((r) => r.complaint_id);
    return complaints.filter((c) => cIds.includes(c.id));
  };

  // 1. Try to attach unassigned complaints to existing open/monitoring incidents
  for (const complaint of complaints) {
    if (assignedComplaintIds.has(complaint.id)) continue;

    // Search existing active incidents
    for (const incident of incidents) {
      if (incident.status === 'resolved') continue;

      const incComplaints = getComplaintsForIncident(incident.id);
      // Check if complaint relates to any complaint in this incident or the incident itself
      const matches = incComplaints.length > 0
        ? incComplaints.some((existingC) => areComplaintsRelated(complaint, existingC))
        : areIssueTypesRelated(complaint.issue_type, incident.issue_type) &&
          isLocationSimilar(complaint.location_text, incident.location_text);

      if (matches) {
        // Link to this incident
        const newRel: IncidentComplaint = {
          id: `ic-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          incident_id: incident.id,
          complaint_id: complaint.id,
          created_at: new Date().toISOString(),
          complaint,
        };
        relations.push(newRel);
        assignedComplaintIds.add(complaint.id);

        // Update incident stats
        const updatedComplaints = [...incComplaints, complaint];
        incident.report_count = updatedComplaints.length;
        incident.community_signal = calculateCommunitySignal(updatedComplaints.length);
        incident.attention_level = calculateAttentionLevel(updatedComplaints);
        incident.updated_at = new Date().toISOString();
        break;
      }
    }
  }

  // 2. Cluster remaining unassigned complaints into new incidents
  const unassigned = complaints.filter((c) => !assignedComplaintIds.has(c.id));
  const visited = new Set<string>();

  for (let i = 0; i < unassigned.length; i++) {
    const root = unassigned[i];
    if (visited.has(root.id)) continue;

    const cluster: Complaint[] = [root];
    visited.add(root.id);

    for (let j = i + 1; j < unassigned.length; j++) {
      const candidate = unassigned[j];
      if (visited.has(candidate.id)) continue;

      // If candidate is related to ANY member of the cluster
      const isRelated = cluster.some((member) => areComplaintsRelated(member, candidate));
      if (isRelated) {
        cluster.push(candidate);
        visited.add(candidate.id);
      }
    }

    // Only create an incident if there are related complaints (or at least 1 report)
    // To identify repeated reports of the same real-world waste problem:
    const incidentIndex = 1001 + incidents.length;
    const incidentCode = generateIncidentCode(incidentIndex);
    const incidentId = `inc-${Date.now()}-${incidentIndex}`;
    const now = new Date().toISOString();

    const newIncident: Incident = {
      id: incidentId,
      incident_code: incidentCode,
      title: generateIncidentTitle(cluster),
      issue_type: root.issue_type,
      location_text: root.location_text,
      latitude: root.latitude || null,
      longitude: root.longitude || null,
      report_count: cluster.length,
      attention_level: calculateAttentionLevel(cluster),
      community_signal: calculateCommunitySignal(cluster.length),
      status: 'open',
      created_at: cluster[0]?.created_at || now,
      updated_at: now,
      complaints: cluster,
    };

    incidents.push(newIncident);

    // Create relation records
    for (const c of cluster) {
      relations.push({
        id: `ic-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        incident_id: incidentId,
        complaint_id: c.id,
        created_at: now,
        complaint: c,
      });
      assignedComplaintIds.add(c.id);
    }
  }

  return { incidents, relations };
}
