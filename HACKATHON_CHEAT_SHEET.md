# Smart Waste Management System — Hackathon Cheat Sheet

## 1. Problem Statement
Cities, educational institutions, residential societies, and public spaces produce massive volumes of waste daily. Traditional waste collection relies heavily on manual, uncoordinated processes leading to:
- Overflowing public garbage bins and uncollected road waste.
- Delayed complaint resolution and lack of citizen tracking transparency.
- Improper waste segregation at source due to lack of public awareness.
- Lack of centralized actionable data for administrators to identify waste hotspots and dispatch sanitation resources efficiently.

---

## 2. Our Solution
**EcoClean AI / Smart Waste Management System** is an end-to-end connected web platform connecting citizens with municipal and campus sanitation administrators.
- **For Citizens**: Report waste issues in seconds with photo evidence & location, track resolution progress step-by-step, request on-demand waste pickups (dry, wet, recyclable, bulk), and use an interactive Groq AI assistant to learn proper segregation.
- **For Admins**: Automated Groq AI triage (categorization, severity scoring, stream detection, recommended operational steps), centralized complaint dashboard with real-time status management, and waste pickup dispatch control.

---

## 3. Target Users
1. **Citizens / Campus Residents**: General public or students reporting waste hazards, tracking complaint status, and scheduling bulk waste pickups.
2. **Sanitation Administrators**: Municipal officers or campus facility managers triaging complaints, monitoring issue distribution, updating resolution workflows, and scheduling collection crews.

---

## 4. Key Features
- **User Authentication & Role-Based Portals**: Distinct workflows and dashboards for `citizen` and `admin` roles.
- **Smart Waste Reporting**: Submit complaints with photo uploads, geotagged/text location, and automated Groq AI analysis.
- **Automated AI Complaint Triage**: Server-side Groq API integration analyzing descriptions and photo evidence to generate issue category, waste stream type, priority level (`low`, `medium`, `high`), summary, and recommended action.
- **Resolution Tracking Timeline**: Step-by-step visual timeline (`submitted` → `under_review` → `assigned` → `resolved`) with full historical audit logs and admin notes.
- **On-Demand Pickup Scheduling**: Request bulk or specialized waste collection (`Wet`, `Dry`, `Recyclable`, `Other`) specifying quantity (`Small`, `Medium`, `Large`) and preferred collection date.
- **Groq AI Segregation Assistant**: Chat and photo-based AI assistant guiding citizens on proper waste disposal according to environmental guidelines.
- **Interactive Awareness Hub**: Visual guidelines on waste stream disposal (wet, dry, recyclable, hazardous).
- **Admin Management Console**: Statistics on active complaints, status distribution metrics, search & filter tools, driver dispatch controls, and administrative note logging.

---

## 5. Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI & Components**: React, Tailwind CSS, shadcn/ui primitives, Lucide React icons
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (with local fallback demo authentication)
- **File Storage**: Supabase Storage (`waste-images` bucket)
- **AI Layer**: Groq API (`llama-3.3-70b-versatile` text model & `llama-3.2-11b-vision-preview` vision model)
- **Deployment**: Vercel

---

## 6. Architecture

```
                               ┌─────────────────────────────────────────┐
                               │             Browser Client              │
                               │     (Next.js App Router / React)        │
                               └────────────────────┬────────────────────┘
                                                    │
                                  ┌─────────────────┴─────────────────┐
                                  ▼                                   ▼
                   ┌───────────────────────────────┐ ┌──────────────────────────────────┐
                   │    Client Components / UI     │ │      Next.js Route Handlers      │
                   │ (Dashboards, Forms, Assistant)│ │        (Server-side Only)        │
                   └──────────────┬────────────────┘ └────────────────┬─────────────────┘
                                  │                                   │
              ┌───────────────────┴───────────────┐                   │
              ▼                                   ▼                   ▼
   ┌────────────────────┐               ┌────────────────────┐ ┌──────────────┐
   │   Supabase Auth    │               │  Supabase Storage  │ │   Groq API   │
   │ (User Sessions &   │               │   (Photo Evidence  │ │(LLM & Vision │
   │  Role Management)  │               │      Buckets)      │ │ Triage Engine│
   └──────────┬─────────┘               └────────────────────┘ └──────────────┘
              │
              ▼
   ┌────────────────────┐
   │Supabase PostgreSQL │
   │(Complaints, Pickups│
   │ & Status Histories)│
   └────────────────────┘
```

---

## 7. Frontend Flow
1. **Landing Page (`/`)**: Hero section, key metrics, workflow breakdown, and quick access portal buttons.
2. **Authentication (`/login`, `/register`)**: Role-based authentication (Citizen / Admin) with quick-access demo credentials.
3. **Citizen Flow**:
   - **Dashboard (`/citizen/dashboard`)**: Summary stats, quick action cards, and recent complaints table.
   - **Report Issue (`/citizen/report`)**: Upload photo, choose category, enter location, submit → triggers server-side AI triage → redirects to detail page.
   - **My Complaints (`/citizen/complaints`) & Detail (`/citizen/complaints/[id]`)**: Filter complaints, view status badges, inspect AI triage breakdown, and track resolution timeline.
   - **Request Pickup (`/citizen/pickups/new`) & Track Pickups (`/citizen/pickups`)**: Schedule bulk waste collection by type, quantity, and date.
   - **AI Assistant (`/citizen/assistant`)**: Ask waste disposal questions or upload photos for instant segregation guidance.
   - **Awareness Hub (`/awareness`)**: Browse waste sorting guidelines.
4. **Admin Flow**:
   - **Dashboard (`/admin/dashboard`)**: City-wide complaint statistics, active resolution progress, and issue stream breakdown.
   - **Complaints Management (`/admin/complaints`) & Triage Console (`/admin/complaints/[id]`)**: Search/filter complaints, review citizen photos & AI triage output, update resolution status (`submitted`, `under_review`, `assigned`, `resolved`), and append operational notes.
   - **Pickups Management (`/admin/pickups`)**: Review scheduling requests, assign driver notes, and update pickup status (`pending`, `scheduled`, `collected`).

---

## 8. Backend / Server Flow
- **Data Service Layer (`lib/data/service.ts`)**: Unified data access layer that checks for active Supabase environment variables. If configured, communicates directly with Supabase PostgreSQL and Storage; if not, seamlessly operates in mock in-memory mode for zero-config offline judging.
- **Server-Side API Routes**:
  - `POST /api/ai/complaint-analysis`: Accepts complaint description and image URL, calls Groq API server-side, parses structured JSON response containing `ai_category`, `ai_waste_type`, `ai_severity`, `ai_summary`, and `ai_recommendation`.
  - `POST /api/ai/waste-assistant`: Accepts user text queries or base64 image data, prompts Groq API server-side, and returns instant disposal instructions.
  - `POST /api/upload`: Handles file upload server-side to Supabase Storage bucket `waste-images` and returns a public CDN URL.

---

## 9. API Endpoints

| Endpoint | Method | Purpose | Server-Side / Client |
|---|---|---|---|
| `/api/ai/complaint-analysis` | `POST` | Groq AI automated complaint triage & severity scoring | Server-Side Only |
| `/api/ai/waste-assistant` | `POST` | Groq AI waste segregation assistant chat & photo analysis | Server-Side Only |
| `/api/upload` | `POST` | Upload evidence photo to Supabase Storage | Server-Side Only |

---

## 10. Database Tables

### `profiles`
- `id` (uuid, primary key, references `auth.users.id`)
- `full_name` (text, required)
- `email` (text, required)
- `role` (text, 'citizen' | 'admin', required)
- `phone` (text, nullable)
- `address` (text, nullable)
- `created_at`, `updated_at` (timestamptz)

### `complaints`
- `id` (uuid, primary key)
- `complaint_code` (text, unique, e.g. `WM-1001`)
- `user_id` (uuid, references `profiles.id`)
- `issue_type` (text, 'overflowing_bin' | 'garbage_on_road' | 'missed_collection' | 'illegal_dumping' | 'other')
- `description` (text, required)
- `image_url` (text, nullable)
- `location_text` (text, required)
- `latitude`, `longitude` (numeric, nullable)
- `ai_category` (text, nullable)
- `ai_waste_type` (text, nullable)
- `ai_severity` (text, 'low' | 'medium' | 'high', nullable)
- `ai_summary` (text, nullable)
- `ai_recommendation` (text, nullable)
- `status` (text, 'submitted' | 'under_review' | 'assigned' | 'resolved')
- `admin_note` (text, nullable)
- `created_at`, `updated_at` (timestamptz)

### `complaint_status_history`
- `id` (uuid, primary key)
- `complaint_id` (uuid, references `complaints.id`)
- `status` (text, required)
- `changed_by` (uuid, references `profiles.id`)
- `note` (text, nullable)
- `created_at` (timestamptz)

### `pickup_requests`
- `id` (uuid, primary key)
- `pickup_code` (text, unique, e.g. `PK-2001`)
- `user_id` (uuid, references `profiles.id`)
- `waste_type` (text, 'Wet' | 'Dry' | 'Recyclable' | 'Other')
- `quantity` (text, 'Small' | 'Medium' | 'Large')
- `location_text` (text, required)
- `preferred_date` (text, required)
- `status` (text, 'pending' | 'scheduled' | 'collected')
- `admin_note` (text, nullable)
- `created_at`, `updated_at` (timestamptz)

### `awareness_content`
- `id` (uuid, primary key)
- `title` (text, required)
- `category` (text, required)
- `description` (text, required)
- `disposal_instruction` (text, required)
- `image_url` (text, nullable)
- `created_at` (timestamptz)

---

## 11. Database Relationships
- `profiles.id` 1 ─── M `complaints.user_id` (One citizen has many complaints)
- `complaints.id` 1 ─── M `complaint_status_history.complaint_id` (One complaint has many history audit entries)
- `profiles.id` 1 ─── M `complaint_status_history.changed_by` (One profile logs status changes)
- `profiles.id` 1 ─── M `pickup_requests.user_id` (One citizen has many pickup requests)

---

## 12. Authentication
- Managed via **Supabase Auth** (`email` / `password`).
- Password storage is securely offloaded to Supabase Auth engine (passwords are never stored in the application schema).
- App context (`lib/auth/context.tsx`) provides seamless role switching with pre-configured demo citizen (`citizen@eco.org`) and admin (`admin@eco.org`) sessions for instant evaluation.

---

## 13. Groq Integration
- Calls execute **strictly server-side** in Next.js Route Handlers (`/api/ai/...`). `GROQ_API_KEY` is kept safe on the server and never exposed to the client bundle.
- **Complaint Analysis (`llama-3.3-70b-versatile` / `llama-3.2-11b-vision-preview`)**:
  - Automatically triggered upon complaint creation.
  - Generates risk severity (`low`, `medium`, `high`), identifies stream type, writes an executive summary, and suggests operational recommendations for sanitation crews.
- **Waste Assistant**:
  - Provides real-time sorting advice based on text descriptions or image inputs.
- **Fail-Safe Enhancement Architecture**:
  - Groq AI serves as an intelligence enhancement layer. If Groq API experiences rate limits or network latency, default fallbacks trigger automatically, ensuring complaints and pickups are stored and actionable without blocking core platform features.

---

## 14. Security
- API keys (`GROQ_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are isolated in environment variables (`.env.local`) and accessed only in server-side routes.
- Client requests query Supabase using `NEXT_PUBLIC_SUPABASE_ANON_KEY` with strict Row-Level Security (RLS) policies.
- Form inputs validated with TypeScript interfaces to prevent injection attacks.

---

## 15. Deployment
- **Platform**: Vercel
- **Database & Storage**: Supabase Cloud Project
- **Environment Variables Required**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GROQ_API_KEY`

---

## 16. Known Limitations
- Geolocation currently supports string-based address input with optional coordinate placeholders (full interactive GIS mapping layer is outside hackathon scope).
- Automated SMS / WhatsApp push notifications for status updates are simulated via in-app timeline updates.

---

## 17. Future Improvements
1. **GIS Heatmap & Route Optimization**: Integrate Mapbox / Leaflet to plot complaint clusters on an interactive city map and generate optimized collection routes for drivers.
2. **Automated Driver Dispatch App**: Dedicated mobile interface for sanitation field workers to mark issues resolved on-site.
3. **IoT Smart Bin Sensors**: Connect real-time fill-level sensors to trigger automated complaint generation before bins overflow.
4. **Gamification & Citizen Rewards**: Award Eco-Points to citizens for reporting valid issues and properly segregating waste.

---

## 18. 10-Second Explanation
> "EcoClean AI is an end-to-end smart waste management platform that lets citizens report waste problems and request pickups in seconds, while using Groq AI to instantly analyze, prioritize, and route complaints for city administrators."

---

## 19. 30-Second Explanation
> "Man




ng, and uncoordinated collection. EcoClean AI solves this by connecting citizens with sanitation admins in one platform. Citizens submit photo reports or request bulk waste pickups and track status in real-time. On the backend, Groq AI automatically analyzes complaints—categorizing waste, predicting severity, and recommending operational steps—allowing admins to prioritize critical hotspots and dispatch collection teams efficiently."

---

## 20. 2-Minute Technical Explanation
> "Our architecture is built as a single, unified Next.js App Router application using TypeScript, Tailwind CSS, and shadcn/ui. 
> 
> For data persistence and authentication, we use Supabase PostgreSQL and Supabase Auth with Row-Level Security. Evidence images are stored in Supabase Storage.
> 
> When a citizen reports an issue, the client posts to a server-side Route Handler at `/api/ai/complaint-analysis`. The server invokes the Groq API using `llama-3.3-70b-versatile` and `llama-3.2-11b-vision-preview` to inspect the text description and photo evidence. Groq returns structured JSON containing category classification, waste stream, a calculated severity score (`low`, `medium`, `high`), an executive summary, and actionable resolution steps.
> 
> Crucially, Groq AI acts as an enhancement layer—if the API fails or rate-limits, the system falls back gracefully to standard complaint creation so core operations are never blocked.
> 
> Admins access a dedicated dashboard featuring interactive metric progress indicators, status update controls, and automated audit logging via the `complaint_status_history` table. Citizens can also use our server-side Groq AI Waste Assistant to get instant segregation guidance for any item."

---

## 21. Likely Judge Questions and Answers

### Q1: What happens if the Groq AI API goes down or is slow?
**Answer**: AI is intentionally designed as an enhancement layer, not a hard dependency. If Groq API calls timeout or fail, the system catches the error, logs default fallback categories, and immediately persists the complaint to Supabase. Citizens can still submit issues, and admins can still triage them manually without any disruption.

### Q2: How do you prevent arbitrary users from giving themselves Admin privileges?
**Answer**: Roles (`citizen` vs `admin`) are strictly enforced via the `profiles` table in Supabase PostgreSQL and verified in backend context logic. Public user registration defaults strictly to the `citizen` role. Admin accounts are managed separately by system administrators.

### Q3: Why did you choose Groq API instead of standard OpenAI or custom vision models?
**Answer**: Groq provides ultra-low latency inference (sub-second responses using Llama 3 models), which is essential for giving citizens instant feedback upon complaint submission during a live web session. It allows us to process both text and vision inputs rapidly without blocking the HTTP request stream.

### Q4: How scalable is this schema for an entire city?
**Answer**: PostgreSQL indexed on `complaint_code`, `status`, `user_id`, and `created_at` scales efficiently to millions of rows. Spatial indexing (`postgis`) can be enabled on the existing `latitude` and `longitude` numeric columns for spatial radius queries as scale increases.

### Q5: Is the system fully functional without Supabase configured?
**Answer**: Yes! We built a unified data abstraction layer in `lib/data/service.ts`. If Supabase credentials are missing or unconfigured, the system automatically falls back to an in-memory reactive data store seeded with mock complaints, pickups, and audit logs. This guarantees a 100% working demo during hackathon judging regardless of network environment.
