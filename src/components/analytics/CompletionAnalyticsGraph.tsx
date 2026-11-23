'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { StoreManager } from '@/lib/store';
import { 
  getStudentDossierData, 
  StudentDossier, 
  downloadStudentDossierDocument, 
  downloadStudentDossierExcel 
} from '@/lib/student-dossier';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart,
  Users,
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  Send,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  Building2,
  Eye,
  Award,
  Layers
} from 'lucide-react';

interface CompletionAnalyticsGraphProps {
  initialScope?: 'my_mentees' | 'all';
  guideId?: string;
  title?: string;
  subtitle?: string;
  onSelectStudent?: (studentId: string) => void;
}

export default function CompletionAnalyticsGraph({
  initialScope = 'my_mentees',
  guideId,
  title,
  subtitle,
  onSelectStudent,
}: CompletionAnalyticsGraphProps) {
  const { storeState, currentUser, refreshStore } = useAuth();
  
  // Scope toggle state
  const effectiveGuideId = guideId || currentUser?.id;
  const isFacultyGuide = currentUser?.role === 'guide';
  const isCoordinator = currentUser?.role === 'coordinator';

  const [scope, setScope] = useState<'my_mentees' | 'all'>(
    isCoordinator ? 'all' : initialScope
  );

  // Active view tab: 'graphs' (Donut + Milestones) or 'list' (Detailed Student Matrix)
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'remaining_list'>('overview');
  
  // Filter for the student list
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'remaining' | 'in_progress'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [nudgeSuccess, setNudgeSuccess] = useState<string | null>(null);

  // Derive relevant students based on scope
  const assignedStudentIds = useMemo(() => {
    if (!effectiveGuideId) return [];
    return storeState.guideAssignments
      .filter((a) => a.guide_id === effectiveGuideId)
      .map((a) => a.student_id);
  }, [storeState.guideAssignments, effectiveGuideId]);

  const targetStudents = useMemo(() => {
    const allStudents = storeState.profiles.filter((p) => p.role === 'student');
    if (scope === 'my_mentees' && assignedStudentIds.length > 0) {
      return allStudents.filter((s) => assignedStudentIds.includes(s.id));
    }
    return allStudents;
  }, [storeState.profiles, scope, assignedStudentIds]);

  // Compute full dossier records for target students
  const dossiers: StudentDossier[] = useMemo(() => {
    return targetStudents
      .map((s) => getStudentDossierData(s.id))
      .filter((d): d is StudentDossier => Boolean(d));
  }, [targetStudents, storeState]);

  // High-level statistics
  const total = dossiers.length || 1;
  const completedDossiers = dossiers.filter((d) => d.completionStatus === 'Completed');
  const inProgressDossiers = dossiers.filter((d) => d.completionStatus === 'In Progress');
  const remainingDossiers = dossiers.filter((d) => d.completionStatus === 'Remaining' || d.completionStatus === 'Unregistered');
  
  // Strictly incomplete / remaining students who have NOT completed (In Progress + Remaining/Unregistered)
  const allIncompleteDossiers = dossiers.filter((d) => d.completionStatus !== 'Completed');

  const completedCount = completedDossiers.length;
  const inProgressCount = inProgressDossiers.length;
  const remainingCount = allIncompleteDossiers.length;
  const severeRemainingCount = remainingDossiers.length;

  const completedPct = Math.round((completedCount / total) * 100);
  const inProgressPct = Math.round((inProgressCount / total) * 100);
  const severeRemainingPct = Math.round((severeRemainingCount / total) * 100);
  const remainingPct = 100 - completedPct;

  // Milestone statistics
  const milestones = useMemo(() => {
    const registered = dossiers.filter((d) => Boolean(d.internship)).length;
    const logs8Weeks = dossiers.filter((d) => d.completedWeeksCount >= 8).length;
    const supervisorConfirmed = dossiers.filter((d) => {
      if (!d.internship) return false;
      return d.logs.some((w) =>
        storeState.supervisorConfirmations.some((c) => c.weekly_log_id === w.id && c.status === 'confirmed')
      );
    }).length;
    const certificateUploaded = dossiers.filter((d) => Boolean(d.certificateDoc)).length;
    const reportSubmitted = dossiers.filter((d) => Boolean(d.reportDoc)).length;
    const marksGraded = dossiers.filter((d) => Boolean(d.marks && d.marks.total_marks > 0)).length;

    return [
      {
        id: 'registered',
        title: 'Internship Placement & Company Registration',
        shortTitle: 'Registration',
        completed: registered,
        remaining: total - registered,
        pct: Math.round((registered / total) * 100),
        color: 'emerald',
      },
      {
        id: 'logs',
        title: 'Weekly Progress Logs (All 8 Weeks Completed)',
        shortTitle: '8-Week Logs',
        completed: logs8Weeks,
        remaining: total - logs8Weeks,
        pct: Math.round((logs8Weeks / total) * 100),
        color: 'emerald',
      },
      {
        id: 'supervisor',
        title: 'Industry Supervisor Signatures / Verification',
        shortTitle: 'Supervisor Verified',
        completed: supervisorConfirmed,
        remaining: total - supervisorConfirmed,
        pct: Math.round((supervisorConfirmed / total) * 100),
        color: 'blue',
      },
      {
        id: 'certificate',
        title: 'Completion Certificate Upload (Mandatory for completion)',
        shortTitle: 'Completion Certificate',
        completed: certificateUploaded,
        remaining: total - certificateUploaded,
        pct: Math.round((certificateUploaded / total) * 100),
        color: 'amber',
      },
      {
        id: 'report',
        title: 'Final Internship Technical Report (Appendix B3)',
        shortTitle: 'Final Report B3',
        completed: reportSubmitted,
        remaining: total - reportSubmitted,
        pct: Math.round((reportSubmitted / total) * 100),
        color: 'purple',
      },
      {
        id: 'marks',
        title: 'Continuous Assessment Evaluation (Out of 30 Marks)',
        shortTitle: 'Marks Graded /30',
        completed: marksGraded,
        remaining: total - marksGraded,
        pct: Math.round((marksGraded / total) * 100),
        color: 'indigo',
      },
    ];
  }, [dossiers, total, storeState.supervisorConfirmations]);

  // Average Marks
  const avgMarks = (
    dossiers.reduce((acc, d) => acc + (d.marks?.total_marks || 0), 0) / (dossiers.length || 1)
  ).toFixed(1);

  // SVG Donut calculation
  const radius = 80;
  const circumference = 2 * Math.PI * radius; // ~502.65
  const completedStroke = (completedCount / total) * circumference;
  const inProgressStroke = (inProgressCount / total) * circumference;
  const remainingStroke = (severeRemainingCount / total) * circumference;

  const completedOffset = 0;
  const inProgressOffset = completedStroke;
  const remainingOffset = completedStroke + inProgressStroke;

  // Filtered students for detailed list
  const filteredDossiers = useMemo(() => {
    return dossiers.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.student.name.toLowerCase().includes(q) ||
        (d.student.roll_no && d.student.roll_no.toLowerCase().includes(q)) ||
        (d.internship?.company_name && d.internship.company_name.toLowerCase().includes(q));

      let matchesStatus = true;
      if (statusFilter === 'completed') matchesStatus = d.completionStatus === 'Completed';
      if (statusFilter === 'in_progress') matchesStatus = d.completionStatus === 'In Progress';
      if (statusFilter === 'remaining') matchesStatus = d.completionStatus !== 'Completed';

      return matchesSearch && matchesStatus;
    });
  }, [dossiers, searchQuery, statusFilter]);

  // Bulk Nudge Remaining Students Action
  const handleNudgeRemaining = () => {
    const store = StoreManager.getInstance();
    let sentCount = 0;

    allIncompleteDossiers.forEach((d) => {
      const missing: string[] = [];
      if (d.completedWeeksCount < 8) missing.push(`${8 - d.completedWeeksCount} weekly logs`);
      if (!d.certificateDoc) missing.push('Completion Certificate');
      if (!d.reportDoc) missing.push('Final Internship Report (B3)');

      const missingText = missing.join(', ') || 'pending deliverables';

      // In-app notification
      store.addNotification(
        d.student.id,
        'Action Required: Internship Completion Deliverables',
        `Dear ${d.student.name}, please complete your remaining ET740 requirements: ${missingText}.`,
        '/student'
      );

      // Email to outbox
      store.addOutboxEmail(
        d.student.email,
        `InternTrack: Final Deliverables Reminder for ${d.student.name} (${d.student.roll_no || 'ET740'})`,
        `<p>Dear ${d.student.name},<br/><br/>This is an official notification from your internal faculty guide. Your internship completion records show the following items are still remaining:<br/><b>${missingText}</b>.<br/><br/>Please submit these immediately on InternTrack to avoid late penalties in continuous assessment.</p>`,
        'reminder'
      );
      sentCount++;
    });

    store.saveState();
    refreshStore();

    setNudgeSuccess(`Dispatched in-app notifications and email alerts to all ${sentCount} remaining students!`);
    setTimeout(() => setNudgeSuccess(null), 4000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
      {/* Top Banner / Controls */}
      <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <PieChart className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {title || 'Internship Completion & Progress Analytics'}
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Course ET740 • 8 Weeks
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {subtitle || 'Visual data breakdown of how many students have completed their internship versus remaining requirements.'}
            </p>
          </div>

          {/* Scope Toggle & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Scope Pill Toggle */}
            <div className="inline-flex p-1 bg-slate-200/70 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setScope('my_mentees')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  scope === 'my_mentees'
                    ? 'bg-white dark:bg-slate-700 text-purple-900 dark:text-purple-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                My Mentees ({assignedStudentIds.length})
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  scope === 'all'
                    ? 'bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Department Cohort ({storeState.profiles.filter((p) => p.role === 'student').length})
              </button>
            </div>

            {/* Quick Nudge Button for Faculty */}
            <button
              type="button"
              onClick={handleNudgeRemaining}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-95"
              title="Send targeted reminders to all students who have not completed their logs, certificate, or report"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nudge Remaining ({remainingCount})</span>
            </button>
          </div>
        </div>

        {/* Nudge Alert Feedback */}
        {nudgeSuccess && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{nudgeSuccess}</span>
          </div>
        )}

        {/* View Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-200 dark:border-slate-800 pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Donut & Status Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'milestones'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Milestones Comparative Bar Graph</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('remaining_list')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'remaining_list'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Roster & Remaining Drilldown ({dossiers.length})</span>
          </button>
        </div>
      </div>

      {/* Main Body per Active Tab */}
      <div className="p-6 sm:p-8">
        {/* TAB 1: DONUT & STATUS OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Interactive SVG Donut Graph */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    {/* Background Track Circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-700/60"
                      strokeWidth="24"
                    />

                    {/* Completed Segment (Emerald) */}
                    {completedStroke > 0 && (
                      <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="24"
                        strokeDasharray={`${completedStroke} ${circumference - completedStroke}`}
                        strokeDashoffset={-completedOffset}
                        className="transition-all duration-700 ease-out hover:opacity-90"
                      />
                    )}

                    {/* In Progress Segment (Blue) */}
                    {inProgressStroke > 0 && (
                      <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="transparent"
                        stroke="#3b82f6"
                        strokeWidth="24"
                        strokeDasharray={`${inProgressStroke} ${circumference - inProgressStroke}`}
                        strokeDashoffset={-inProgressOffset}
                        className="transition-all duration-700 ease-out hover:opacity-90"
                      />
                    )}

                    {/* Remaining / Needs Attention Segment (Amber) */}
                    {remainingStroke > 0 && (
                      <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="24"
                        strokeDasharray={`${remainingStroke} ${circumference - remainingStroke}`}
                        strokeDashoffset={-remainingOffset}
                        className="transition-all duration-700 ease-out hover:opacity-90"
                      />
                    )}
                  </svg>

                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {completedPct}%
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-1">
                      Completed
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {completedCount} of {total} Students
                    </span>
                  </div>
                </div>

                {/* Graph Legend below Donut */}
                <div className="grid grid-cols-2 gap-3 w-full mt-6 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('completed');
                      setActiveTab('remaining_list');
                    }}
                    className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left hover:bg-emerald-100 transition"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>Completed</span>
                    </div>
                    <div className="text-base font-black text-emerald-900 dark:text-emerald-200 mt-0.5">
                      {completedCount} <span className="text-[10px] font-medium">({completedPct}%)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('in_progress');
                      setActiveTab('remaining_list');
                    }}
                    className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-left hover:bg-blue-100 transition"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      <span>In Progress</span>
                    </div>
                    <div className="text-base font-black text-blue-900 dark:text-blue-200 mt-0.5">
                      {inProgressCount} <span className="text-[10px] font-medium">({inProgressPct}%)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('remaining');
                      setActiveTab('remaining_list');
                    }}
                    className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left hover:bg-amber-100 transition col-span-2"
                  >
                    <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                        <span>Total Remaining (Incomplete)</span>
                      </div>
                      <span className="text-[11px] underline">Click to view roster &rarr;</span>
                    </div>
                    <div className="text-base font-black text-amber-900 dark:text-amber-200 mt-0.5">
                      {remainingCount} Students <span className="text-[10px] font-medium">({remainingPct}%)</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Right Column: Comparative KPI Cards & Progress Breakdown */}
              <div className="lg:col-span-7 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Completed Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Internships Completed
                      </span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {completedCount}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ({completedPct}% of cohort)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
                      Fully satisfied all requirements: 8 weekly progress logs verified, completion certificate uploaded, and final B3 report approved.
                    </p>
                  </div>

                  {/* Remaining Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        Internships Remaining
                      </span>
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {remainingCount}
                      </span>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        ({remainingPct}% of cohort)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
                      Active students with 1 or more pending deliverables (weekly log seals, final report submission, or industry certificate).
                    </p>
                  </div>

                  {/* Average Continuous Assessment Marks Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 dark:border-indigo-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                        Avg Assessment Marks
                      </span>
                      <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {avgMarks}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        / 30 Marks
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
                      Rubric: Log Regularity (10) + Supervisor Verification (10) + Technical Report Depth (10).
                    </p>
                  </div>

                  {/* Deliverables On-Track Rate */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                        Supervisor Verified
                      </span>
                      <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {milestones.find((m) => m.id === 'supervisor')?.pct || 0}%
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        Industry Seal Rate
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
                      External industry supervisors confirmed weekly logs via secure OTP authenticated links.
                    </p>
                  </div>
                </div>

                {/* Direct Action Link to Review Remaining */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Need to inspect who is remaining and what they owe?
                    </span>
                    <p className="text-slate-500 dark:text-slate-400">
                      View the interactive checklist with pending deliverables and individual dossier downloads.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('remaining');
                      setActiveTab('remaining_list');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition shrink-0"
                  >
                    <span>View Remaining List ({remainingCount})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MILESTONES COMPARATIVE BAR GRAPH */}
        {activeTab === 'milestones' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Deliverables Milestone Comparative Graph
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Side-by-side visualization comparing how many students completed each specific requirement versus how many are still remaining.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300">Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-slate-700 dark:text-slate-300">Remaining</span>
                </div>
              </div>
            </div>

            {/* Milestone Bars */}
            <div className="space-y-5">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {m.title}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        {m.completed} Done ({m.pct}%)
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold">
                        {m.remaining} Remaining ({100 - m.pct}%)
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Stacked Bar */}
                  <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full flex overflow-hidden shadow-inner">
                    <div
                      style={{ width: `${m.pct}%` }}
                      className="bg-emerald-500 hover:bg-emerald-400 transition-all duration-500 flex items-center justify-center text-[9px] font-black text-white"
                      title={`${m.completed} students completed (${m.pct}%)`}
                    >
                      {m.pct > 15 && `${m.completed}`}
                    </div>
                    <div
                      style={{ width: `${100 - m.pct}%` }}
                      className="bg-amber-400 hover:bg-amber-300 transition-all duration-500 flex items-center justify-center text-[9px] font-black text-slate-950"
                      title={`${m.remaining} students remaining (${100 - m.pct}%)`}
                    >
                      {100 - m.pct > 15 && `${m.remaining}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REMAINING STUDENTS CHECKLIST & ROSTER */}
        {activeTab === 'remaining_list' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Filter toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold flex-wrap">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    statusFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  All ({dossiers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    statusFilter === 'completed'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800'
                  }`}
                >
                  Completed ({completedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('in_progress')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    statusFilter === 'in_progress'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-700 dark:text-blue-400 hover:text-blue-800'
                  }`}
                >
                  In Progress ({inProgressCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('remaining')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    statusFilter === 'remaining'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-amber-700 dark:text-amber-400 hover:text-amber-800 font-black'
                  }`}
                >
                  Remaining / Incomplete ({remainingCount})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter student or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Student Table / Cards */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Student & Roll No</th>
                    <th className="px-4 py-3">Company & Guide</th>
                    <th className="px-4 py-3 text-center">8-Week Logs</th>
                    <th className="px-4 py-3 text-center">Certificate</th>
                    <th className="px-4 py-3 text-center">Final Report</th>
                    <th className="px-4 py-3 text-center">Marks /30</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Individual Downloads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredDossiers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        No students match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDossiers.map((d) => {
                      const isComplete = d.completionStatus === 'Completed';
                      const isInProgress = d.completionStatus === 'In Progress';

                      return (
                        <tr
                          key={d.student.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition"
                        >
                          {/* Student Info */}
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {d.student.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {d.student.roll_no || 'Unassigned Roll'}
                            </div>
                          </td>

                          {/* Company & Guide */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {d.internship?.company_name || 'Not Registered'}
                            </div>
                            <div className="text-[11px] text-purple-700 dark:text-purple-400">
                              Guide: {d.guide?.name || 'Unassigned'}
                            </div>
                          </td>

                          {/* 8-Week Logs */}
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                                d.completedWeeksCount >= 8
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                  : d.completedWeeksCount > 0
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                              }`}
                            >
                              {d.completedWeeksCount} / 8 Wks
                            </span>
                          </td>

                          {/* Certificate */}
                          <td className="px-4 py-3.5 text-center">
                            {d.certificateDoc ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Uploaded</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Pending</span>
                              </span>
                            )}
                          </td>

                          {/* Final Report */}
                          <td className="px-4 py-3.5 text-center">
                            {d.reportDoc ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Submitted</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Pending</span>
                              </span>
                            )}
                          </td>

                          {/* Marks out of 30 */}
                          <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                            {d.marks?.total_marks ?? '-'}/30
                          </td>

                          {/* Status Pill */}
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isComplete
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : isInProgress
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              }`}
                            >
                              {d.completionStatus}
                            </span>
                          </td>

                          {/* Individual Downloads */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => downloadStudentDossierDocument(d.student.id)}
                                title="Download Official Student Dossier (.txt)"
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadStudentDossierExcel(d.student.id)}
                                title="Download Student Records & Logs (.xlsx)"
                                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                              </button>
                              {onSelectStudent && (
                                <button
                                  type="button"
                                  onClick={() => onSelectStudent(d.student.id)}
                                  title="Open Student in Guide Matrix"
                                  className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 hover:bg-purple-100 transition"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
