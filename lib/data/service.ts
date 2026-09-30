import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { 
  Complaint, 
  ComplaintStatus, 
  ComplaintStatusHistory, 
  PickupRequest, 
  PickupStatus, 
  AwarenessContent, 
  Profile,
  IssueType,
  PickupWasteType,
  PickupQuantity
} from '@/types/database';
import { 
  INITIAL_COMPLAINTS, 
  INITIAL_PICKUPS, 
  INITIAL_AWARENESS, 
  DEMO_CITIZEN_PROFILE, 
  DEMO_ADMIN_PROFILE 
} from './seedData';
import { generateComplaintCode, generatePickupCode } from '@/lib/utils';

const STORAGE_KEYS = {
  COMPLAINTS: 'swm_complaints_v1',
  PICKUPS: 'swm_pickups_v1',
  HISTORY: 'swm_history_v1',
  CURRENT_USER: 'swm_current_user_v1',
};

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('dummy') && !url.includes('placeholder'));
}

// In-Memory Fallback State (initialized with seed data)
let localComplaints: Complaint[] = [...INITIAL_COMPLAINTS];
let localPickups: PickupRequest[] = [...INITIAL_PICKUPS];
let localHistory: ComplaintStatusHistory[] = [
  {
    id: 'h-1045-1',
    complaint_id: 'c-1045',
    status: 'submitted',
    changed_by: DEMO_CITIZEN_PROFILE.id,
    note: 'Complaint submitted by citizen.',
    created_at: '2026-09-30T08:15:00Z',
  },
  {
    id: 'h-1044-1',
    complaint_id: 'c-1044',
    status: 'submitted',
    changed_by: DEMO_CITIZEN_PROFILE.id,
    note: 'Complaint submitted by citizen.',
    created_at: '2026-09-29T14:30:00Z',
  },
  {
    id: 'h-1044-2',
    complaint_id: 'c-1044',
    status: 'under_review',
    changed_by: DEMO_ADMIN_PROFILE.id,
    note: 'Team inspecting site perimeter for camera footage.',
    created_at: '2026-09-29T16:00:00Z',
  },
  {
    id: 'h-1043-1',
    complaint_id: 'c-1043',
    status: 'submitted',
    changed_by: DEMO_CITIZEN_PROFILE.id,
    note: 'Submitted.',
    created_at: '2026-09-29T10:00:00Z',
  },
  {
    id: 'h-1043-2',
    complaint_id: 'c-1043',
    status: 'under_review',
    changed_by: DEMO_ADMIN_PROFILE.id,
    note: 'Reviewing vehicle logs.',
    created_at: '2026-09-29T10:30:00Z',
  },
  {
    id: 'h-1043-3',
    complaint_id: 'c-1043',
    status: 'assigned',
    changed_by: DEMO_ADMIN_PROFILE.id,
    note: 'Vehicle #4 assigned for evening catch-up round.',
    created_at: '2026-09-29T11:45:00Z',
  },
  {
    id: 'h-1042-1',
    complaint_id: 'c-1042',
    status: 'submitted',
    changed_by: DEMO_CITIZEN_PROFILE.id,
    note: 'Submitted.',
    created_at: '2026-09-28T09:00:00Z',
  },
  {
    id: 'h-1042-2',
    complaint_id: 'c-1042',
    status: 'resolved',
    changed_by: DEMO_ADMIN_PROFILE.id,
    note: 'Pathway swept and cleared at 2:00 PM.',
    created_at: '2026-09-28T14:00:00Z',
  },
];

// Helper to load from window.localStorage if available
function loadLocalState() {
  if (typeof window === 'undefined') return;
  try {
    const savedC = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    if (savedC) localComplaints = JSON.parse(savedC);

    const savedP = localStorage.getItem(STORAGE_KEYS.PICKUPS);
    if (savedP) localPickups = JSON.parse(savedP);

    const savedH = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedH) localHistory = JSON.parse(savedH);
  } catch (e) {
    console.error('Error loading local state:', e);
  }
}

function saveLocalState() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(localComplaints));
    localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(localPickups));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(localHistory));
  } catch (e) {
    console.error('Error saving local state:', e);
  }
}

// ----------------------------------------------------
// COMPLAINT FUNCTIONS
// ----------------------------------------------------

export async function fetchComplaints(userId?: string, isAdmin?: boolean): Promise<Complaint[]> {
  loadLocalState();
  if (!isSupabaseConfigured()) {
    if (isAdmin) return localComplaints;
    if (userId) return localComplaints.filter(c => c.user_id === userId);
    return localComplaints;
  }

  try {
    const supabase = createBrowserClient();
    let query = supabase.from('complaints').select('*, profile:profiles(*)').order('created_at', { ascending: false });

    if (!isAdmin && userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error || !data) throw error;
    return data as Complaint[];
  } catch (e) {
    console.warn('Supabase fetch complaints fallback:', e);
    if (isAdmin) return localComplaints;
    if (userId) return localComplaints.filter(c => c.user_id === userId);
    return localComplaints;
  }
}

export async function fetchComplaintById(id: string): Promise<Complaint | null> {
  loadLocalState();
  if (!isSupabaseConfigured()) {
    return localComplaints.find(c => c.id === id || c.complaint_code === id) || null;
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('complaints')
      .select('*, profile:profiles(*)')
      .or(`id.eq.${id},complaint_code.eq.${id}`)
      .single();

    if (error || !data) throw error;
    return data as Complaint;
  } catch (e) {
    console.warn('Supabase fetchComplaintById fallback:', e);
    return localComplaints.find(c => c.id === id || c.complaint_code === id) || null;
  }
}

export async function createComplaint(params: {
  user_id: string;
  issue_type: IssueType;
  description: string;
  image_url?: string | null;
  location_text: string;
  latitude?: number | null;
  longitude?: number | null;
  ai_category?: string | null;
  ai_waste_type?: string | null;
  ai_severity?: 'low' | 'medium' | 'high' | null;
  ai_summary?: string | null;
  ai_recommendation?: string | null;
  userProfile?: Profile;
}): Promise<Complaint> {
  loadLocalState();
  const nextNum = 1000 + localComplaints.length + 1;
  const complaint_code = generateComplaintCode(nextNum);
  const newId = `c-${Date.now()}`;
  const now = new Date().toISOString();

  const newComplaint: Complaint = {
    id: newId,
    complaint_code,
    user_id: params.user_id,
    issue_type: params.issue_type,
    description: params.description,
    image_url: params.image_url || null,
    location_text: params.location_text,
    latitude: params.latitude || null,
    longitude: params.longitude || null,
    ai_category: params.ai_category || null,
    ai_waste_type: params.ai_waste_type || null,
    ai_severity: params.ai_severity || 'medium',
    ai_summary: params.ai_summary || null,
    ai_recommendation: params.ai_recommendation || null,
    status: 'submitted',
    admin_note: null,
    created_at: now,
    updated_at: now,
    profile: params.userProfile || DEMO_CITIZEN_PROFILE,
  };

  const initialHistory: ComplaintStatusHistory = {
    id: `h-${Date.now()}`,
    complaint_id: newId,
    status: 'submitted',
    changed_by: params.user_id,
    note: 'Complaint created and submitted by citizen.',
    created_at: now,
  };

  if (!isSupabaseConfigured()) {
    localComplaints.unshift(newComplaint);
    localHistory.push(initialHistory);
    saveLocalState();
    return newComplaint;
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('complaints')
      .insert({
        complaint_code,
        user_id: params.user_id,
        issue_type: params.issue_type,
        description: params.description,
        image_url: params.image_url || null,
        location_text: params.location_text,
        latitude: params.latitude || null,
        longitude: params.longitude || null,
        ai_category: params.ai_category || null,
        ai_waste_type: params.ai_waste_type || null,
        ai_severity: params.ai_severity || 'medium',
        ai_summary: params.ai_summary || null,
        ai_recommendation: params.ai_recommendation || null,
        status: 'submitted',
      })
      .select()
      .single();

    if (error || !data) throw error;

    // Insert history
    await supabase.from('complaint_status_history').insert({
      complaint_id: data.id,
      status: 'submitted',
      changed_by: params.user_id,
      note: 'Complaint created and submitted by citizen.',
    });

    return data as Complaint;
  } catch (e) {
    console.warn('Supabase createComplaint fallback to local:', e);
    localComplaints.unshift(newComplaint);
    localHistory.push(initialHistory);
    saveLocalState();
    return newComplaint;
  }
}

export async function updateComplaintStatus(
  complaintId: string,
  newStatus: ComplaintStatus,
  adminId: string,
  adminNote?: string | null
): Promise<Complaint> {
  loadLocalState();
  const now = new Date().toISOString();

  // Find complaint in local
  const cIndex = localComplaints.findIndex(c => c.id === complaintId);
  if (cIndex !== -1) {
    localComplaints[cIndex] = {
      ...localComplaints[cIndex],
      status: newStatus,
      admin_note: adminNote ?? localComplaints[cIndex].admin_note,
      updated_at: now,
    };
  }

  const historyItem: ComplaintStatusHistory = {
    id: `h-${Date.now()}`,
    complaint_id: complaintId,
    status: newStatus,
    changed_by: adminId,
    note: adminNote || `Status updated to ${newStatus}`,
    created_at: now,
  };
  localHistory.push(historyItem);
  saveLocalState();

  if (!isSupabaseConfigured()) {
    return localComplaints[cIndex] || localComplaints[0];
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('complaints')
      .update({
        status: newStatus,
        admin_note: adminNote,
        updated_at: now,
      })
      .eq('id', complaintId)
      .select()
      .single();

    if (error || !data) throw error;

    // Add status history record
    await supabase.from('complaint_status_history').insert({
      complaint_id: complaintId,
      status: newStatus,
      changed_by: adminId,
      note: adminNote || `Status updated to ${newStatus}`,
    });

    return data as Complaint;
  } catch (e) {
    console.warn('Supabase updateComplaintStatus fallback:', e);
    return localComplaints[cIndex] || localComplaints[0];
  }
}

export async function fetchComplaintHistory(complaintId: string): Promise<ComplaintStatusHistory[]> {
  loadLocalState();
  if (!isSupabaseConfigured()) {
    return localHistory
      .filter(h => h.complaint_id === complaintId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('complaint_status_history')
      .select('*, changer_profile:profiles(*)')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: true });

    if (error || !data) throw error;
    return data as ComplaintStatusHistory[];
  } catch (e) {
    console.warn('Supabase fetchComplaintHistory fallback:', e);
    return localHistory
      .filter(h => h.complaint_id === complaintId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
}

// ----------------------------------------------------
// PICKUP REQUEST FUNCTIONS
// ----------------------------------------------------

export async function fetchPickups(userId?: string, isAdmin?: boolean): Promise<PickupRequest[]> {
  loadLocalState();
  if (!isSupabaseConfigured()) {
    if (isAdmin) return localPickups;
    if (userId) return localPickups.filter(p => p.user_id === userId);
    return localPickups;
  }

  try {
    const supabase = createBrowserClient();
    let query = supabase.from('pickup_requests').select('*, profile:profiles(*)').order('created_at', { ascending: false });

    if (!isAdmin && userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error || !data) throw error;
    return data as PickupRequest[];
  } catch (e) {
    console.warn('Supabase fetchPickups fallback:', e);
    if (isAdmin) return localPickups;
    if (userId) return localPickups.filter(p => p.user_id === userId);
    return localPickups;
  }
}

export async function createPickupRequest(params: {
  user_id: string;
  waste_type: PickupWasteType;
  quantity: PickupQuantity;
  location_text: string;
  latitude?: number | null;
  longitude?: number | null;
  preferred_date: string;
  userProfile?: Profile;
}): Promise<PickupRequest> {
  loadLocalState();
  const nextNum = 2000 + localPickups.length + 1;
  const pickup_code = generatePickupCode(nextNum);
  const newId = `p-${Date.now()}`;
  const now = new Date().toISOString();

  const newPickup: PickupRequest = {
    id: newId,
    pickup_code,
    user_id: params.user_id,
    waste_type: params.waste_type,
    quantity: params.quantity,
    location_text: params.location_text,
    latitude: params.latitude || null,
    longitude: params.longitude || null,
    preferred_date: params.preferred_date,
    status: 'pending',
    admin_note: null,
    created_at: now,
    updated_at: now,
    profile: params.userProfile || DEMO_CITIZEN_PROFILE,
  };

  if (!isSupabaseConfigured()) {
    localPickups.unshift(newPickup);
    saveLocalState();
    return newPickup;
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('pickup_requests')
      .insert({
        pickup_code,
        user_id: params.user_id,
        waste_type: params.waste_type,
        quantity: params.quantity,
        location_text: params.location_text,
        latitude: params.latitude || null,
        longitude: params.longitude || null,
        preferred_date: params.preferred_date,
        status: 'pending',
      })
      .select()
      .single();

    if (error || !data) throw error;
    return data as PickupRequest;
  } catch (e) {
    console.warn('Supabase createPickupRequest fallback:', e);
    localPickups.unshift(newPickup);
    saveLocalState();
    return newPickup;
  }
}

export async function updatePickupStatus(
  pickupId: string,
  newStatus: PickupStatus,
  adminNote?: string | null
): Promise<PickupRequest> {
  loadLocalState();
  const now = new Date().toISOString();

  const pIndex = localPickups.findIndex(p => p.id === pickupId);
  if (pIndex !== -1) {
    localPickups[pIndex] = {
      ...localPickups[pIndex],
      status: newStatus,
      admin_note: adminNote ?? localPickups[pIndex].admin_note,
      updated_at: now,
    };
    saveLocalState();
  }

  if (!isSupabaseConfigured()) {
    return localPickups[pIndex] || localPickups[0];
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('pickup_requests')
      .update({
        status: newStatus,
        admin_note: adminNote,
        updated_at: now,
      })
      .eq('id', pickupId)
      .select()
      .single();

    if (error || !data) throw error;
    return data as PickupRequest;
  } catch (e) {
    console.warn('Supabase updatePickupStatus fallback:', e);
    return localPickups[pIndex] || localPickups[0];
  }
}

// ----------------------------------------------------
// AWARENESS CONTENT FUNCTIONS
// ----------------------------------------------------

export async function fetchAwarenessContent(): Promise<AwarenessContent[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_AWARENESS;
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('awareness_content')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) return INITIAL_AWARENESS;
    return data as AwarenessContent[];
  } catch (e) {
    console.warn('Supabase fetchAwarenessContent fallback:', e);
    return INITIAL_AWARENESS;
  }
}
