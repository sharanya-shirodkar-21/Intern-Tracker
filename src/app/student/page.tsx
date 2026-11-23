'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  Building2, 
  UserCheck, 
  ExternalLink,
  Lock,
  Edit3
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getStudentDossierData, downloadStudentDossierDocument, downloadStudentDossierExcel } from '@/lib/student-dossier';
import { Award, Download } from 'lucide-react';

export default function StudentHomePage() {
  const { currentUser, isHydrated, storeState } = useAuth();

  // If not hydrated yet, show loading skeleton
  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center text-slate-500">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Active student: currentUser is guaranteed by AuthGuard
  const student = currentUser;

  const intern = storeState.internships.find((i) => i.student_id === student?.id);
  const assignment = storeState.guideAssignments.find((a) => a.student_id === student?.id);
  const guide = storeState.profiles.find((p) => p.id === assignment?.guide_id);

  const studentLogs = intern ? storeState.weeklyLogs.filter((w) => w.internship_id === intern.id) : [];
  const entries = storeState.logEntries;
  const confirmations = storeState.supervisorConfirmations;
  const comments = storeState.guideComments;
  const documents = intern ? storeState.documents.filter((d) => d.internship_id === intern.id) : [];

  // If student hasn't registered yet, show registration prompt
  if (!intern) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Internship Registration Pending</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Welcome, <span className="font-bold text-slate-900 dark:text-white">{student?.name}</span> ({student?.roll_no}). You have not registered your BE Semester VII internship details yet.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-900 dark:bg-blue-600 text-white font-bold text-sm hover:bg-blue-800 dark:hover:bg-blue-500 shadow-lg transition"
            >
              <span>Register Internship (ET740) Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate completed weeks
  const completedWeeks = studentLogs.filter((w) => {
    const weekEntries = entries.filter((e) => e.weekly_log_id === w.id);
    return weekEntries.length >= 3;
  }).length;

  const progressPercentage = Math.round((completedWeeks / 8) * 100);

  // Find active week
  const today = new Date().toISOString().split('T')[0];
  const currentWeek = studentLogs.find((w) => today >= w.week_start && today <= w.week_end) || studentLogs[2] || studentLogs[0];

  // Document status
  const offerDoc = documents.find((d) => d.type === 'offer_letter');
  const certDoc = documents.find((d) => d.type === 'certificate');
  const reportDoc = documents.find((d) => d.type === 'report');

  // Supervisor link
  const supervisorLink = storeState.supervisorLinks.find((l) => l.internship_id === intern.id);
  const dossier = student ? getStudentDossierData(student.id) : null;
  const marks = dossier?.marks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* "Where am I?" Hero Dashboard Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left summary */}
          <div className="md:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700 text-blue-200 text-xs font-semibold">
              <span>{intern.company_name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="capitalize">{intern.mode}</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Where Am I in My Internship?
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Course ET740 • BE Semester VII (8 Weeks). Log daily progress, prevent lockouts, and upload verified credentials.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/student/weekly-logs"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-lg transition hover:scale-105"
              >
                <Edit3 className="w-4 h-4" />
                <span>Log Today&apos;s Progress</span>
              </Link>

              <Link
                href="/student/documents"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur transition border border-white/20"
              >
                <FileText className="w-4 h-4 text-emerald-300" />
                <span>Uploads & Mistake-Proofer</span>
              </Link>

              <button
                onClick={() => student && downloadStudentDossierDocument(student.id)}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
                title="Download full individual dossier with logs and assessment marks"
              >
                <Download className="w-4 h-4" />
                <span>Download My Dossier (.txt)</span>
              </button>
            </div>
          </div>

          {/* Right: Circular Progress Ring & Next Deadline */}
          <div className="md:col-span-4 flex flex-col items-center md:items-end justify-center space-y-3">
            <div className="relative flex items-center justify-center">
              {/* Circular SVG Ring */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={326}
                  strokeDashoffset={326 - (326 * progressPercentage) / 100}
                  className="text-emerald-400 transition-all duration-1000 ease-out"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-white">{progressPercentage}%</span>
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  {completedWeeks} of 8 Wks
                </span>
              </div>
            </div>

            {/* Next Deadline Card */}
            <div className="bg-white/10 backdrop-blur rounded-lg p-2.5 border border-white/20 text-right w-full sm:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center justify-end gap-1">
                <Clock className="w-3 h-3" /> Next Deadline
              </span>
              <p className="text-xs font-semibold text-white mt-0.5">
                Week Log Due: Sunday 23:59 (+24h Grace)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Week Visual Interactive Progress Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">8-Week Internship Journey Timeline</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live status across Weeks 1–8 (Derived from Start Date: {formatDate(intern.start_date)})
            </p>
          </div>
          <Link
            href="/student/weekly-logs"
            className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline flex items-center gap-1"
          >
            <span>Open B2 Weekly Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 8 Weeks Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {studentLogs.map((w) => {
            const weekEntries = entries.filter((e) => e.weekly_log_id === w.id);
            const isConfirmed = confirmations.some((c) => c.weekly_log_id === w.id && c.status === 'confirmed');
            const hasGuideComment = comments.some((c) => c.weekly_log_id === w.id);
            const isLocked = Boolean(w.locked_at);

            let statusBadge = { label: 'Upcoming', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' };
            if (isConfirmed) {
              statusBadge = { label: 'Verified', color: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold' };
            } else if (isLocked) {
              statusBadge = { label: 'Locked', color: 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800 font-bold' };
            } else if (weekEntries.length > 0) {
              statusBadge = { label: 'Active', color: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-bold' };
            }

            return (
              <div
                key={w.id}
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition ${
                  isConfirmed 
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' 
                    : isLocked 
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800' 
                    : 'bg-white dark:bg-slate-800/80 border-blue-200 dark:border-blue-800 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">Week {w.week_no}</span>
                    {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatDate(w.week_start)}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className={`inline-block text-[9px] uppercase px-1.5 py-0.5 rounded border w-fit ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>

                  <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                    <span>{weekEntries.length} entries</span>
                    {hasGuideComment && <span className="text-purple-600 dark:text-purple-400 font-bold" title="Guide commented">💬</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continuous Assessment Marks Card (Out of 30) */}
      {marks && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Continuous Assessment Marks (Out of 30)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluated by faculty guide ({marks.graded_by}) based on log timeliness, supervisor seals, and report rigor.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xl font-black text-blue-900 dark:text-blue-300">
                  {marks.total_marks} / 30
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Score</span>
              </div>
              <button
                onClick={() => student && downloadStudentDossierDocument(student.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 dark:bg-blue-600 text-white font-bold text-xs hover:bg-blue-800 transition shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Assessment</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                1. Log Regularity & Discipline
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900 dark:text-white">{marks.log_regularity_marks} / 10</span>
                <span className="text-[10px] text-slate-500">Anti-Backfill On-Time</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                2. Industry Verification
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900 dark:text-white">{marks.supervisor_verification_marks} / 10</span>
                <span className="text-[10px] text-slate-500">Supervisor Seals</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                3. Technical Depth & Report
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900 dark:text-white">{marks.report_quality_marks} / 10</span>
                <span className="text-[10px] text-slate-500">Appendix B3 Quality</span>
              </div>
            </div>
          </div>

          {marks.comments && (
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50">
              💡 <b>Faculty Remark:</b> {marks.comments}
            </p>
          )}
        </div>
      )}

      {/* Profile & Credentials Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company & Supervisor Details */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Company & Supervisor Profile</h3>
            </div>
            <Link href="/student/register" className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline">
              Edit
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Company Name:</span>
              <p className="font-bold text-slate-900 dark:text-white">{intern.company_name}</p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">{intern.address}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Industry Supervisor:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{intern.supervisor_name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{intern.supervisor_designation}</p>
                <p className="text-[11px] text-blue-700 dark:text-blue-400 font-mono">{intern.supervisor_email}</p>
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400">Internal Faculty Guide:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{guide?.name || 'Assigned by Coordinator'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{guide?.department}</p>
              </div>
            </div>

            {/* Direct Link to Supervisor Verification Link */}
            {supervisorLink && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Supervisor Secure Token Link
                </span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="truncate pr-2">
                    <p className="font-mono text-[10px] text-emerald-900 dark:text-emerald-200 truncate">
                      /supervisor/verify/{supervisorLink.raw_token}
                    </p>
                    <span className="text-[9px] text-emerald-700 dark:text-emerald-400">6-Digit OTP: <b>{supervisorLink.otp_code}</b></span>
                  </div>
                  <Link
                    href={`/supervisor/verify/${supervisorLink.raw_token}`}
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Required Documents Checklist */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Mandatory Documents Status</h3>
            </div>
            <Link href="/student/documents" className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {/* Offer Letter */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">1. Offer Letter</p>
                    <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-semibold">Optional</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Optional — upload if issued by company</p>
                </div>
              </div>
              {offerDoc ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> Uploaded (v{offerDoc.version})
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700">
                  Optional
                </span>
              )}
            </div>

            {/* Completion Certificate */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">2. Completion Certificate</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Signed & stamped by industry supervisor</p>
                </div>
              </div>
              {certDoc ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> Uploaded (v{certDoc.version})
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                  Pending End Date
                </span>
              )}
            </div>

            {/* Final Report (Appendix B3) */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">3. Final Report (Appendix B3)</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Mistake-proofer check required before submission</p>
                </div>
              </div>
              {reportDoc ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800">
                  <CheckCircle2 className="w-3 h-3" /> Verified ({reportDoc.checks_json?.mistakeProoferScore || 90}% score)
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
