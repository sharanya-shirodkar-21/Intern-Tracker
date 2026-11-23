'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Shield, 
  UserCheck, 
  GraduationCap, 
  FileSpreadsheet, 
  Calendar, 
  CheckCircle, 
  ArrowRight, 
  AlertTriangle,
  FileCheck,
  Compass,
  Mail,
  Lock,
  QrCode,
  Sparkles,
  Building2,
  KeyRound,
  ExternalLink,
  Award,
  Zap,
  CheckCircle2,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, currentRole, storeState, switchUser } = useAuth();

  const totalStudents = storeState.profiles.filter((p) => p.role === 'student').length;
  const registeredCount = storeState.internships.length;
  const offerLetterCount = storeState.documents.filter((d) => d.type === 'offer_letter').length;
  const outboxCount = storeState.outbox.length;

  const coordinator = storeState.profiles.find((p) => p.role === 'coordinator');
  const sampleGuide = storeState.profiles.find((p) => p.role === 'guide');
  const sampleStudent = storeState.profiles.find((p) => p.roll_no === '21ETC01') || storeState.profiles.find((p) => p.role === 'student');

  const aaravIntern = storeState.internships.find((i) => i.student_id === sampleStudent?.id);
  const supervisorLink = storeState.supervisorLinks.find((l) => l.internship_id === aaravIntern?.id);

  const handleQuickRole = (user: any, path: string) => {
    if (user) {
      switchUser(user);
      router.push(path);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Hero Welcome Banner with Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-8 sm:p-12 text-white shadow-2xl border border-blue-900/50">
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 border border-blue-700/60 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              Don Bosco College of Engineering • Dept of ETC
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 text-xs font-medium">
              Course ET740 • BE Semester VII (8 Weeks)
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-800">
              Doc DBCE/2021-2022/Ver1.0
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              InternTrack: Unified Internship Portal for Engineering Excellence
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              Replacing fragmented physical formats into one institutional workflow: Appendix B1 (Group List), Appendix B2 (Weekly Progress Report with Hard Anti-Backfill Lock), and Appendix B3 (Final Report Mistake-Proofer).
            </p>
          </div>

          {/* Primary CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-sm shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-blue-500/25"
            >
              <LogIn className="w-4 h-4" />
              <span>Portal Sign In & Demo Access</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur transition border border-white/20"
            >
              <UserPlus className="w-4 h-4 text-emerald-300" />
              <span>Register Internship</span>
            </Link>

            <Link
              href="/atlas"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur transition border border-white/20"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>Internship Atlas</span>
            </Link>

            {currentUser?.role === 'coordinator' && (
              <Link
                href="/coordinator/skills-radar"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur transition border border-white/20"
              >
                <Award className="w-4 h-4 text-cyan-300" />
                <span>Skills & Risk Radar</span>
              </Link>
            )}
          </div>

          {/* Active persona quick resume pill */}
          {currentUser && (
            <div className="pt-2 flex items-center gap-2 text-xs text-blue-200 bg-blue-900/40 p-2.5 rounded-xl border border-blue-800/50 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Logged in as <b>{currentUser.name}</b> ({currentUser.role.toUpperCase()})</span>
              <span className="text-slate-400">•</span>
              <Link
                href={currentUser.role === 'student' ? '/student' : currentUser.role === 'guide' ? '/guide' : '/coordinator'}
                className="underline hover:text-white font-bold ml-1"
              >
                Go directly to your workspace →
              </Link>
            </div>
          )}
        </div>

        {/* Ambient background glow decoration */}
        <div className="absolute right-0 top-0 -mt-16 -mr-16 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 -mb-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Real-time Department Cohort Snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Cohort</span>
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totalStudents}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Class of 2021-2025 (ETC)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{registeredCount} / {totalStudents}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {Math.round((registeredCount / (totalStudents || 1)) * 100)}% registered
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Offer Letters</span>
            <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{offerLetterCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Uploaded & Versioned</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Anti-Backfill</span>
            <Lock className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">Active</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">24h Grace + Trigger Guard</p>
        </div>
      </div>

      {/* 1-Click Interactive Persona Jump Section */}
      <div className="bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Interactive Persona Jump (Test Any Role in 1-Click)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any persona card to instantly switch role and load their workspace.
            </p>
          </div>
          <Link
            href="/login"
            className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All 30 Demo Logins</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Student Aarav */}
          <button
            onClick={() => handleQuickRole(sampleStudent, '/student')}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 text-left transition hover:-translate-y-1 hover:shadow-lg space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Student
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                {sampleStudent?.name || 'Aarav Vernekar'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Roll No: {sampleStudent?.roll_no || '21ETC01'} • Goa Shipyard
              </p>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              On Track: Weeks 1-4 logged & confirmed by supervisor.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>Open Student Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* Card 2: Faculty Guide */}
          <button
            onClick={() => handleQuickRole(sampleGuide, '/guide')}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 dark:hover:border-purple-500 text-left transition hover:-translate-y-1 hover:shadow-lg space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                Faculty Guide
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                {sampleGuide?.name || 'Prof. Michelle Araujo'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Internal Guide • 10 Assigned Mentees
              </p>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Review student × week heatmaps, weekly feedback & visit log.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
              <span>Open Guide Matrix</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* Card 3: Internship Coordinator */}
          <button
            onClick={() => handleQuickRole(coordinator, '/coordinator')}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-700 dark:hover:border-blue-400 text-left transition hover:-translate-y-1 hover:shadow-lg space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold">
                <Shield className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                Internship Coordinator
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition">
                {coordinator?.name || 'Dr. Shailesh Khanolkar'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Internship Coordinator & HOD
              </p>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Batch upload, guide balancing, risk radar, and Appendix B1 export.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
              <span>Enter Internship Coordinator Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* Card 4: Supervisor */}
          {supervisorLink ? (
            <Link
              href={`/supervisor/verify/${supervisorLink.raw_token}`}
              className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 hover:border-emerald-500 text-left transition hover:-translate-y-1 hover:shadow-lg space-y-3 group block"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Supervisor
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                  Cdr. K. V. Rao
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chief Engineer • Goa Shipyard
                </p>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Expiring link + OTP <b>482915</b> (No college password needed).
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Test Supervisor Seal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </Link>
          ) : (
            <div className="p-5 rounded-2xl border bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-xs">
              No active supervisor token.
            </div>
          )}
        </div>
      </div>

      {/* Six Pillars of InternTrack Feature Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Comprehensive ET740 Compliance Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Engineered specifically to fulfill accreditation requirements (NBA Criterion 4 & NAAC) and eliminate manual paperwork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Appendix B1 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Appendix B1: Group List Excel
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generates byte-exact Excel sheets conforming to DBCE/2021-2022/Ver1.0, including all 10 columns, configurable department dates, and the 5-tier signatory footer.
            </p>
            <div className="pt-2">
              <Link href="/coordinator/export-b1" className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                <span>Export B1 Excel</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Feature 2: Appendix B2 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Appendix B2: Hard Anti-Backfill Lock
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Stops last-week log dumping. Each week locks after week-end + 24h grace window enforced via database trigger. Includes SHA-256 tamper-evident chaining.
            </p>
            <div className="pt-2">
              <Link href="/student/weekly-logs" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1">
                <span>Test Anti-Backfill Lock</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Feature 3: Appendix B3 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Appendix B3: Report Mistake-Proofer
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Automated compliance engine checks registered company, guide matching, date boundaries, and required report sections before final upload with downloadable skeleton.
            </p>
            <div className="pt-2">
              <Link href="/student/mistake-proofer" className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline inline-flex items-center gap-1">
                <span>Run Mistake-Proofer</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Feature 4: Zero-Account Supervisor */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Zero-Account Supervisor Verification
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Expiring links allow industry mentors to verify logs from phones with 6-digit email OTP protection, eliminating lost email signatures.
            </p>
            <div className="pt-2">
              <Link href="/outbox" className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1">
                <span>Inspect Outbox OTPs</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Feature 5: Explainable Risk Radar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Explainable Risk Radar & NBA Reporting
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Transparent scoring (+30 missing offer letter, +25 overdue log, +15 pending supervisor seal) flags students needing faculty follow-up without black-box AI.
            </p>
            <div className="pt-2">
              <Link
                href={currentUser?.role === 'coordinator' ? '/coordinator/skills-radar' : '/login'}
                className="text-xs font-bold text-red-700 dark:text-red-400 hover:underline inline-flex items-center gap-1"
              >
                <span>View Risk Radar</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Feature 6: Internship Atlas */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Internship Atlas for Future Batches
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Anonymized peer knowledge base with &quot;Most Welcoming Companies&quot; leaderboard, interview questions, stipend insights, and anonymous junior Q&amp;A.
            </p>
            <div className="pt-2">
              <Link href="/atlas" className="text-xs font-bold text-cyan-700 dark:text-cyan-400 hover:underline inline-flex items-center gap-1">
                <span>Explore Atlas</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-8 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Ready to Begin Semester VII Industrial Training?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Sign in with your student, guide, or coordinator account, or register your new internship placement to initialize your 8-week progress timeline.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-white text-blue-950 font-black text-xs shadow-lg hover:bg-slate-100 transition"
          >
            Sign In / Demo Access
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition"
          >
            Register Internship
          </Link>
        </div>
      </div>
    </div>
  );
}
