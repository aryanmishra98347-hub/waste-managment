export type UserRole = 'citizen' | 'admin';

export type IssueType = 
  | 'overflowing_bin'
  | 'garbage_on_road'
  | 'missed_collection'
  | 'illegal_dumping'
  | 'other';

export type ComplaintStatus = 
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'resolved';

export type AISeverity = 'low' | 'medium' | 'high';

export type PickupWasteType = 'Wet' | 'Dry' | 'Recyclable' | 'Other';
export type PickupQuantity = 'Small' | 'Medium' | 'Large';
export type PickupStatus = 'pending' | 'scheduled' | 'collected';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  complaint_code: string;
  user_id: string;
  issue_type: IssueType;
  description: string;
  image_url?: string | null;
  location_text: string;
  latitude?: number | null;
  longitude?: number | null;
  ai_category?: string | null;
  ai_waste_type?: string | null;
  ai_severity?: AISeverity | null;
  ai_summary?: string | null;
  ai_recommendation?: string | null;
  status: ComplaintStatus;
  admin_note?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  profile?: Profile;
}

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  status: ComplaintStatus;
  changed_by: string;
  note?: string | null;
  created_at: string;
  // Joined profile of who changed it
  changer_profile?: Profile;
}

export interface PickupRequest {
  id: string;
  pickup_code: string;
  user_id: string;
  waste_type: PickupWasteType;
  quantity: PickupQuantity;
  location_text: string;
  latitude?: number | null;
  longitude?: number | null;
  preferred_date: string;
  status: PickupStatus;
  admin_note?: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface AwarenessContent {
  id: string;
  title: string;
  category: string;
  description: string;
  disposal_instruction: string;
  image_url?: string | null;
  created_at: string;
}

export interface AIAnalysisResult {
  category: string;
  waste_type: string;
  severity: AISeverity;
  summary: string;
  recommended_action: string;
}

export interface AIWasteAssistantResult {
  item_detected: string;
  category: string;
  disposal_instruction: string;
  helpful_tip: string;
}
