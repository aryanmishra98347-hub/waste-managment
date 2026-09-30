# 🌍 EcoClean AI - Smart Waste Management System

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_AI-f55036?style=for-the-badge)

A centralized, AI-powered civic platform connecting citizens with sanitation authorities to streamline waste reporting, automated triage, and scheduled collections. 

🚀 **Live Demo:** [https://smart-waste-management-sandy.vercel.app](https://smart-waste-management-sandy.vercel.app)

---

## 🔑 Demo Access
You can test the application without creating an account by using the quick-access buttons in the top navigation bar, or manually logging in with:
- **Citizen Account:** `citizen@eco.org`
- **Admin Account:** `admin@eco.org`

---

## ✨ Key Features

### 👤 For Citizens
* **AI Waste Assistant:** Upload a photo or type a waste item to get instant AI-powered disposal and recycling instructions.
* **Smart Issue Reporting:** Report overflowing bins, illegal dumping, or roadside garbage in seconds with GPS location tagging and photo evidence.
* **On-Demand Pickups:** Schedule specialized waste pickups (Wet, Dry, Recyclable, e-waste) directly from the dashboard.
* **Live Tracking Timeline:** Track the real-time status of reported issues from `Submitted` to `Resolved`.
* **Awareness Portal:** Explore guides on proper segregation, recycling best practices, and hazardous waste disposal.

### 🛡️ For Administrators & Sanitation Authorities
* **Groq AI Triage Engine:** Automatically analyzes citizen reports and photos to predict severity, detect waste streams, and recommend operational actions before human review.
* **Centralized Dashboard:** View real-time metrics on open complaints, active pickups, and geographical hotspots.
* **Dispatch & Resolution Console:** Update complaint statuses, assign workers, and leave official dispatch notes to keep citizens informed.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui, Lucide Icons.
* **Backend:** Next.js API Routes (Serverless).
* **AI Integration:** Groq API (Llama 3 / Mixtral models for hyper-fast inference).
* **Database & Auth:** Supabase (PostgreSQL, Authentication, Storage).
* **Resiliency:** Custom hybrid data layer that gracefully falls back to local storage if the database is unreachable (perfect for hackathon demos).
* **Deployment:** Vercel.

---

## 💻 Local Setup & Development

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/smart-waste-management.git
cd smart-waste-management
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add your API keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 🗄️ Database Architecture
The application uses the following core tables in Supabase (fully documented in the Hackathon Cheat Sheet):
* `profiles`: User information and role definitions (`citizen`, `admin`).
* `complaints`: Geotagged waste reports containing AI analysis data.
* `complaint_status_history`: Audit log tracking the lifecycle of an issue.
* `pickup_requests`: User-scheduled bulk waste collection jobs.

---

## 📝 License
This project was built for a hackathon and is open-sourced under the MIT License.
