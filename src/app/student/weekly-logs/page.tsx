'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { StoreManager } from '@/lib/store';
import { 
  validateLogEntryLock, 
  saveLogEntryWithAudit, 
  DEFAULT_GRACE_HOURS 
} from '@/lib/lock-engine';
import { 
  Calendar, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  ArrowLeft, 
  Clock, 
  MessageSquare, 
  ShieldAlert, 
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { WeeklyLog, LogEntry } from '@/types/database';

export default function WeeklyLogsPage() {
  const { currentUser, storeState, refreshStore } = useAuth();
  const student = currentUser;

  const intern = storeState.internships.find((i) => i.student_id === student?.id);
  const studentLogs = intern
    ? storeState.weeklyLogs
        .filter((w) => w.internship_id === intern.id)
        .sort((a, b) => a.week_no - b.week_no)
    : [];

  const [activeWeekNo, setActiveWeekNo] = useState<number>(1);
  const activeWeek = studentLogs.find((w) => w.week_no === activeWeekNo) || studentLogs[0];

  const entries = activeWeek
    ? storeState.logEntries.filter((e) => e.weekly_log_id === activeWeek.id)
    : [];

  const confirmation = activeWeek
    ? storeState.supervisorConfirmations.find((c) => c.weekly_log_id === activeWeek.id)
    : undefined;

  const comments = activeWeek
    ? storeState.guideComments.filter((c) => c.weekly_log_id === activeWeek.id)
    : [];

  // Active entry editing state
  const [selectedDate, setSelectedDate] = useState<string>(activeWeek?.week_start || '');
  const [content, setContent] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (activeWeek) {
      setSelectedDate(activeWeek.week_start);
      const existing = storeState.logEntries.find(
        (e) => e.weekly_log_id === activeWeek.id && e.entry_date === activeWeek.week_start
      );
      setContent(existing?.content || '');
    }
  }, [activeWeek?.id, activeWeek?.week_start, student?.id]);

  // If week switches, reset entry form
  const handleSelectWeek = (weekNo: number) => {
    setActiveWeekNo(weekNo);
    const targetWeek = studentLogs.find((w) => w.week_no === weekNo);
    if (targetWeek) {
      setSelectedDate(targetWeek.week_start);
      // Pre-fill existing entry if any
      const existing = storeState.logEntries.find(
        (e) => e.weekly_log_id === targetWeek.id && e.entry_date === targetWeek.week_start
      );
      setContent(existing?.content || '');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  };

  const handleSelectDateForEdit = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = entries.find((e) => e.entry_date === dateStr);
    setContent(existing?.content || '');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Heuristic Quality Coach calculation
  const calculateSpecificity = (text: string) => {
    if (!text || text.trim().length === 0) return 0;
    const words = text.trim().split(/\s+/).length;
    let score = Math.min(words * 3, 40); // word volume (max 40)

    // Key technical action verbs
    const technicalKeywords = [
      'built', 'configured', 'debugged', 'implemented', 'analyzed', 'tested',
      'calibrated', 'integrated', 'designed', 'optimized', 'measured', 'simulated',
      'interfaced', 'microcontroller', 'firmware', 'protocol', 'oscilloscope', 'circuit',
      'api', 'database', 'latency', 'can bus', 'sensor'
    ];

    const lower = text.toLowerCase();
    technicalKeywords.forEach((kw) => {
      if (lower.includes(kw)) score += 8;
    });

    // Penalize vague filler phrases
    const vaguePhrases = ['worked on project', 'did tasks', 'continued work', 'regular meeting'];
    vaguePhrases.forEach((v) => {
      if (lower.includes(v)) score -= 15;
    });

    return Math.max(5, Math.min(100, score));
  };

  const specificityScore = calculateSpecificity(content);

  const handleSaveEntry = () => {
    if (!activeWeek || !student) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    // Call strict lock engine
    const result = saveLogEntryWithAudit(
      activeWeek,
      selectedDate,
      content,
      student.id,
      specificityScore
    );

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to save entry');
      return;
    }

    setSuccessMessage(`Log entry for ${formatDate(selectedDate)} successfully recorded to audit trail!`);
    refreshStore();
  };

  // Explicit Anti-Backfill Demonstration Test
  const handleTestBackfillLock = () => {
    if (!studentLogs[0]) return;
    // Attempt to write an entry to Week 1 (which is simulated as locked)
    const lockedWeek = studentLogs[0];
    const testResult = saveLogEntryWithAudit(
      lockedWeek,
      lockedWeek.week_start,
      'Attempting to edit locked week in retrospect.',
      student?.id || 'demo'
    );

    if (!testResult.success) {
      setErrorMessage(
        `[DATABASE TRIGGER REJECTION TEST PASSED]\n${testResult.error}`
      );
    } else {
      setSuccessMessage('Entry succeeded');
    }
  };

  if (!intern || studentLogs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Please Register Your Internship First</h2>
        <Link href="/student/register" className="px-4 py-2 bg-blue-900 text-white rounded-lg inline-block">
          Register Internship
        </Link>
      </div>
    );
  }

  // Generate all 5 workdays for the active week
  const weekDates: string[] = [];
  const baseStart = new Date(`${activeWeek.week_start}T00:00:00Z`);
  for (let d = 0; d < 5; d++) {
    const curDate = new Date(baseStart);
    curDate.setUTCDate(curDate.getUTCDate() + d);
    weekDates.push(curDate.toISOString().split('T')[0]);
  }

  const isCurrentWeekLocked = Boolean(activeWeek.locked_at);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/student" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Appendix B2: Weekly Progress Report (Weeks 1–8)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Course ET740. One official table per week. Database lock activates after the 24h grace window.
          </p>
        </div>

        {/* Anti-Backfill Test Button */}
        <button
          onClick={handleTestBackfillLock}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 font-bold text-xs transition"
          title="Simulate modifying a locked week to assert database rejection"
        >
          <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span>Test Anti-Backfill Trigger (Assert Lock)</span>
        </button>
      </div>

      {/* Notifications / Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs flex items-start gap-3 whitespace-pre-line animate-in fade-in-50">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">LOCK ENGINE BLOCKED ACTION:</p>
            <p className="font-mono text-[11px]">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Week Selector Tabs (Weeks 1 to 8) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {studentLogs.map((w) => {
          const isSelected = w.week_no === activeWeekNo;
          const isLocked = Boolean(w.locked_at);
          const isConfirmed = storeState.supervisorConfirmations.some(
            (c) => c.weekly_log_id === w.id && c.status === 'confirmed'
          );

          return (
            <button
              key={w.id}
              onClick={() => handleSelectWeek(w.week_no)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-900 dark:bg-blue-600 text-white border-blue-900 dark:border-blue-600 shadow-md'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>Week {w.week_no}</span>
              {isConfirmed ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Supervisor Verified" />
              ) : isLocked ? (
                <Lock className="w-3 h-3 text-slate-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Week Appendix B2 Layout Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        {/* Week Summary Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Week {activeWeek.week_no} Progress Table
              </h2>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                [{formatDate(activeWeek.week_start)} — {formatDate(activeWeek.week_end)}]
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Course: ET740 • Student: {student?.name} ({student?.roll_no}) • Company: {intern.company_name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {confirmation ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Verified by Supervisor: {confirmation.confirmed_by_name}
              </span>
            ) : isCurrentWeekLocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                <Lock className="w-3.5 h-3.5" />
                Locked Past Grace Period
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                <Clock className="w-3.5 h-3.5" />
                Open for Daily Logs
              </span>
            )}
          </div>
        </div>

        {/* Official Appendix B2 Table Layout */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-32 border-r border-slate-200 dark:border-slate-800">Date</th>
                <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-800">Work Carried Out / Learnt / Studied</th>
                <th className="py-3 px-4 w-52 text-center">Supervisor Confirmation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {weekDates.map((dateStr) => {
                const entry = entries.find((e) => e.entry_date === dateStr);
                const isSelectedForEdit = selectedDate === dateStr;

                return (
                  <tr
                    key={dateStr}
                    onClick={() => !isCurrentWeekLocked && handleSelectDateForEdit(dateStr)}
                    className={`transition cursor-pointer ${
                      isSelectedForEdit
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-l-blue-700 dark:border-l-blue-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Date */}
                    <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatDate(dateStr)}
                    </td>

                    {/* Content */}
                    <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800">
                      {entry ? (
                        <div className="space-y-1">
                          <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{entry.content}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">
                              Specificity Score: <b>{entry.specificity_score || 75}%</b>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Saved at: {new Date(entry.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">
                          {isCurrentWeekLocked ? 'No entry recorded before week lock' : 'Click to write log for this day'}
                        </span>
                      )}
                    </td>

                    {/* Supervisor Confirmation Status */}
                    <td className="py-3 px-4 text-center">
                      {confirmation ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 italic">
                          Awaiting Verification
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Inline Day Editor & Quality Coach */}
        {!isCurrentWeekLocked && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                  Log Daily Progress for: <span className="font-mono text-blue-900 dark:text-blue-300">{formatDate(selectedDate)}</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select any date above and enter technical actions, outcomes, and tools learned.
                </p>
              </div>

              {/* Real-time Quality Coach Gauge */}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Quality Coach Meter:</span>
                <span
                  className={`text-xs font-black ${
                    specificityScore >= 70
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : specificityScore >= 40
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-500 dark:text-red-400'
                  }`}
                >
                  {specificityScore}%
                </span>
              </div>
            </div>

            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Configured UART communication between STM32 microcontroller and sensor module. Debugged timing latency using logic analyzer. Measured 2ms data transfer rate."
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                Word Count: {content.trim() ? content.trim().split(/\s+/).length : 0} words
              </span>

              <button
                onClick={handleSaveEntry}
                disabled={!content.trim()}
                className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-lg font-bold text-xs transition ${
                  !content.trim()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-900 hover:bg-blue-800 text-white shadow-md'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save to Appendix B2 & Audit Log</span>
              </button>
            </div>
          </div>
        )}

        {/* Threaded Guide Feedback */}
        {comments.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-purple-700" />
              Faculty Guide Comments on Week {activeWeek.week_no}
            </h3>
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="p-3 rounded-lg bg-purple-50/70 border border-purple-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950">{c.guide_name}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-800 leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
