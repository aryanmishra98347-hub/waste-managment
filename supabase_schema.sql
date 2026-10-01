-- SMART WASTE MANAGEMENT SYSTEM
-- Database Schema Definition & RLS Policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'admin')),
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_code TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    issue_type TEXT NOT NULL CHECK (issue_type IN ('overflowing_bin', 'garbage_on_road', 'missed_collection', 'illegal_dumping', 'other')),
    description TEXT NOT NULL,
    image_url TEXT,
    location_text TEXT NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    ai_category TEXT,
    ai_waste_type TEXT,
    ai_severity TEXT CHECK (ai_severity IN ('low', 'medium', 'high')),
    ai_summary TEXT,
    ai_recommendation TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'assigned', 'resolved')),
    admin_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. COMPLAINT STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.complaint_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('submitted', 'under_review', 'assigned', 'resolved')),
    changed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PICKUP REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.pickup_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pickup_code TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    waste_type TEXT NOT NULL CHECK (waste_type IN ('Wet', 'Dry', 'Recyclable', 'Other')),
    quantity TEXT NOT NULL CHECK (quantity IN ('Small', 'Medium', 'Large')),
    location_text TEXT NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    preferred_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'collected')),
    admin_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AWARENESS CONTENT TABLE
CREATE TABLE IF NOT EXISTS public.awareness_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    disposal_instruction TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaint_history_complaint_id ON public.complaint_status_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_pickups_user_id ON public.pickup_requests(user_id);

-- TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pickups_updated_at BEFORE UPDATE ON public.pickup_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- AUTOMATIC PROFILE CREATION ON SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awareness_content ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile or admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- COMPLAINTS POLICIES
CREATE POLICY "Citizens can view own complaints or admins can view all"
  ON public.complaints FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Citizens can insert own complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update complaints"
  ON public.complaints FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- COMPLAINT STATUS HISTORY POLICIES
CREATE POLICY "Users can view history of accessible complaints"
  ON public.complaint_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_status_history.complaint_id
      AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admins or System can insert history"
  ON public.complaint_status_history FOR INSERT
  WITH CHECK (
    changed_by = auth.uid() OR public.is_admin()
  );

-- PICKUP REQUESTS POLICIES
CREATE POLICY "Citizens can view own pickups or admins can view all"
  ON public.pickup_requests FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Citizens can insert own pickups"
  ON public.pickup_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update pickups"
  ON public.pickup_requests FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- AWARENESS CONTENT POLICIES
CREATE POLICY "Anyone can view awareness content"
  ON public.awareness_content FOR SELECT
  USING (true);

-- STORAGE BUCKET POLICIES (complaint-images)
-- Run in Supabase SQL editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('complaint-images', 'complaint-images', true) ON CONFLICT DO NOTHING;

-- SEED DEMO AWARENESS CONTENT
INSERT INTO public.awareness_content (title, category, description, disposal_instruction)
VALUES
('Food Scraps & Organic Waste', 'Wet Waste', 'Leftover meals, fruit peels, vegetable scraps, tea bags, and coffee grounds.', 'Segregate in green organic bins. Keep separate from dry packaging to prevent contamination and odor.'),
('Paper & Cardboard Packaging', 'Dry Waste', 'Clean paper, cardboard boxes, newspapers, magazines, and paper bags.', 'Flatten cardboard boxes to save space. Keep dry and free of oil or food stains before placing in blue dry bins.'),
('Plastic Bottles & Containers', 'Recyclable Waste', 'PET drink bottles, HDPE milk jugs, shampoo bottles, and clean plastic containers.', 'Rinse out any residual liquids. Crush bottles to minimize space and cap them tightly for recycling.'),
('Batteries & E-Waste', 'Hazardous Waste', 'Used lithium batteries, old phones, chargers, light bulbs, and small electronics.', 'Never dispose of with general waste. Drop off at designated college/city e-waste collection points.')
ON CONFLICT DO NOTHING;

-- ==================================================
-- 6. SMART WASTE INCIDENTS
-- ==================================================
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    location_text TEXT NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    report_count INTEGER NOT NULL DEFAULT 1,
    attention_level TEXT NOT NULL CHECK (attention_level IN ('low', 'medium', 'high')),
    community_signal TEXT NOT NULL CHECK (community_signal IN ('weak', 'moderate', 'strong')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'monitoring', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================================================
-- 7. INCIDENT COMPLAINTS RELATION
-- ==================================================
CREATE TABLE IF NOT EXISTS public.incident_complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_incident_complaint UNIQUE (incident_id, complaint_id)
);

-- INDEXES FOR INCIDENTS
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_attention ON public.incidents(attention_level);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_complaints_incident_id ON public.incident_complaints(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_complaints_complaint_id ON public.incident_complaints(complaint_id);

-- TRIGGER FOR INCIDENTS UPDATED_AT
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ROW LEVEL SECURITY FOR INCIDENTS (ADMIN ONLY)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view incidents"
  ON public.incidents FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Only admins can insert incidents"
  ON public.incidents FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update incidents"
  ON public.incidents FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can view incident complaints"
  ON public.incident_complaints FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Only admins can insert incident complaints"
  ON public.incident_complaints FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete incident complaints"
  ON public.incident_complaints FOR DELETE
  USING (public.is_admin());
