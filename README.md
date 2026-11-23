# InternTrack: BE Semester VII Internship Management Portal
**Course:** ET740 (8 Weeks)  
**Institution:** Don Bosco College of Engineering, Fatorda, Margao - Goa  
**Department:** Electronics & Telecommunication Engineering  
**Document Ref:** DBCE/2021-2022/Ver1.0  
**Target Replacements:** Appendix B1 (Group List), Appendix B2 (Weekly Progress Report), Appendix B3 (Internship Report Template)  

---

## 1. Overview
InternTrack replaces fragmented physical and paper formats into a unified web portal for engineering college internships:
1. **No Back-Filling (Enforced in Database & UI):** Strict database trigger (`trg_enforce_weekly_lock`) and server timestamp checking prevent students from backfilling weekly logs in the last week. Weeks lock after the 24-hour grace window.
2. **Centralized Document Vault:** Offer letters, completion certificates, and Appendix B3 reports are stored with versioning (v1, v2) in private storage with signed URL access.
3. **Faculty Guide Oversight:** Internal faculty mentors monitor cohort progress via a Student × Week heatmap matrix, comment directly on weekly logs, and record industry interaction journals (visits/calls).
4. **Report Mistake-Proofer:** Pre-submission compliance checker evaluates mandatory B3 chapters, student identity matching, 8-week log counts, and formatting to eliminate common report errors.
5. **Role Isolation:** Strict role-based access control (RBAC). Students only see student workspaces; the Internship Coordinator sees administrative cohort tools; Faculty Guides see assigned mentees; Industry Supervisors access weekly tables via secure expiring links with OTP verification.

---

## 2. Tech Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Lucide Icons + Theme Context (Light/Dark mode)
- **Backend & Database:** Supabase PostgreSQL with Row Level Security (RLS) & Postgres Triggers
- **Excel & PDF Generators:** SheetJS (`xlsx`) for exact Appendix B1 layout; `pdf-lib` and `qrcode` for authentic Appendix B2 PDFs with cryptographic QR verification.
- **Communication:** Multi-channel notification engine (In-App Bell + Resend/Nodemailer email dispatcher with zero-config in-app `/outbox` viewer).
- **Security:** Hashed expiring tokens, 6-digit email OTP challenges for zero-account supervisors, and an append-only audit trail.

---

## 3. Getting Started

### 3.1 Prerequisites
- Node.js 18+ (tested on Node v20.18.1 LTS)
- npm, pnpm, or yarn

### 3.2 Installation & Setup
```bash
# 1. Clone repository
git clone https://github.com/<your-username>/interntrack.git
cd interntrack

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env.local

# 4. Start local development server
npm run dev
```
The application will launch at **`http://localhost:3000`**.

### 3.3 Running Unit Tests & Walkthrough Suite
```bash
# Run unit test suite (Week-lock logic, Date derivation, Hash chain, Deadlines, B1 structure)
node tests/unit-tests.js

# Run full 7-step Acceptance Walkthrough E2E test
node tests/e2e-walkthrough.test.js
```

### 3.4 Production Build & Start
```bash
npm run build
npm run start
```

---

## 4. Role Navigation & Demo Personas

The portal features a dedicated **Sign In** page (`/login`) with instant 1-click Demo Logins:

### 1. Student Persona (`/student`)
- **Key Archetypes:**
  - *Aarav Vernekar (21ETC01)*: On Track (Weeks 1–4 done, Supervisor verified).
  - *Aniket Sawant (21ETC03)*: Behind (Week 2 overdue).
  - *Harsh Rane (21ETC11)*: At Risk (Missing offer letter upload).
  - *Zoya Patel (21ETC27)*: Unregistered (Ready to register at `/register`).
- **Student Workspace**:
  - `My Internship` (`/student`): Milestone ring, 8-week timeline, supervisor details.
  - `Weekly Logs (B2)` (`/student/weekly-logs`): Week 1–8 tables with SHA-256 tamper-evident hash chain and anti-backfill lock.
  - `Documents & Proofer` (`/student/documents`): Offer letter, certificate uploads, versioning, and pre-submission mistake checker (`/student/mistake-proofer`).
  - `My Portfolio` (`/student/showcase`): Shareable public profile and résumé badge card.
  - `Internship Atlas` (`/atlas`): Senior intern advice, welcoming companies, and Q&A.

### 2. Internship Coordinator Persona (`/coordinator`)
- **Dr. Shailesh Khanolkar** (Internship Coordinator & Head of Department).
- **Coordinator Workspace**:
  - `Dashboard` (`/coordinator`): Cohort status KPIs, company distribution, filter by guide/status.
  - `Batch Upload` (`/coordinator/batch-upload`): CSV/XLSX import with row-by-row error validation.
  - `Guide Mapping` (`/coordinator/guide-mapping`): 1-click Auto-Balance across faculty guides.
  - `Export Group List (B1)` (`/coordinator/export-b1`): Generates official Appendix B1 Excel matching `DBCE/2021-2022/Ver1.0`.
  - `Skills & Risk Radar` (`/coordinator/skills-radar`): Transparent explainable risk scoring and NBA/NAAC Accreditation Report.
  - `Internship Atlas` (`/atlas`): Department-wide knowledge base.

### 3. Faculty Guide Persona (`/guide`)
- **Faculty Guides:** Prof. Michelle Araujo, Prof. Flavia Leitao, Prof. Austin Rodrigues.
- **Guide Workspace**:
  - `My Students Matrix` (`/guide`): Heatmap matrix across all 8 weeks for assigned mentees. Threaded comments per week.
  - `Industry Contact Log` (`/guide/contacts`): Log visits, calls, online meetings with industry supervisors.
  - `Internship Atlas` (`/atlas`).

### 4. Industry Supervisor (No Account)
- Access via time-limited, signed token links (e.g. `/supervisor/verify/[token]`).
- Protected by 6-digit email OTP (e.g. `482915` in demo mode).
- One-click confirm/flag weekly progress entries.
- Emits cryptographic verification badge that feeds into official B2 reports.

---

## 5. Database Schema & Security (Supabase)
SQL migration files are located in `supabase/`:
- `supabase/migrations/001_initial_schema.sql`: Full DDL for profiles, guide_assignments, internships, weekly_logs, log_entries, documents, supervisor_links, supervisor_confirmations, guide_comments, guide_contacts, deadlines, notifications, audit_logs. Includes PostgreSQL trigger `trg_enforce_weekly_lock`.
- `supabase/migrations/002_rls_policies.sql`: Row-Level Security policies ensuring strict multi-tenant isolation.
- `supabase/seed.sql`: Realistic cohort seed data.

---

## 6. Project Directory Structure
```
interntrack/
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules (.env*, node_modules, .next)
├── package.json                   # Dependencies and scripts
├── tailwind.config.ts             # Tailwind CSS & theme tokens
├── tsconfig.json                  # TypeScript configuration
├── public/
│   └── manifest.json              # PWA manifest
├── src/
│   ├── app/
│   │   ├── api/export-b2/         # B2 PDF streaming endpoint with QR code
│   │   ├── atlas/                 # Internship Atlas knowledge base
│   │   ├── coordinator/           # Batch upload, mapping, B1 export, risk radar
│   │   ├── guide/                 # Heatmap matrix & contact journal
│   │   ├── login/                 # Dedicated login & 1-click demo personas
│   │   ├── outbox/                # In-app email simulator inspector
│   │   ├── register/              # 4-step student placement registration
│   │   ├── showcase/[slug]/       # Public student portfolio
│   │   ├── student/               # B2 logs, documents, mistake-proofer
│   │   ├── supervisor/verify/     # Secure token + OTP verification portal
│   │   └── verify/b2/[token]/     # Public QR authenticity verification
│   ├── components/
│   │   ├── auth/AuthGuard.tsx     # Role-based route guard
│   │   └── layout/                # Navbar, ThemeToggle
│   ├── lib/
│   │   ├── auth-context.tsx       # Auth provider & session management
│   │   ├── b2-pdf-export.ts       # PDF-lib + QR code report generator
│   │   ├── deadlines-engine.ts    # Compliance scanner & reminder dispatcher
│   │   ├── excel-b1-export.ts     # SheetJS exact Appendix B1 generator
│   │   ├── hash-chain.ts          # SHA-256 tamper-evident integrity engine
│   │   ├── lock-engine.ts         # Strict anti-backfill lock evaluator
│   │   ├── mistake-proofer.ts     # Appendix B3 pre-submission compliance
│   │   ├── offline-drafts.ts      # PWA offline draft synchronization
│   │   ├── store.ts               # Local/Supabase state & 30-student seed
│   │   ├── theme-context.tsx      # Light/Dark mode provider
│   │   └── utils.ts               # Helpers and formatters
│   └── types/database.ts          # TypeScript database definitions
├── supabase/
│   ├── migrations/                # SQL schema & RLS policies
│   └── seed.sql                   # SQL seed script
└── tests/
    ├── unit-tests.js              # Unit tests for core algorithms
    └── e2e-walkthrough.test.js    # 7-step Acceptance Walkthrough suite
```

---

## 7. License
Developed for Don Bosco College of Engineering (DBCE), Fatorda, Goa. Academic use for Course ET740.
