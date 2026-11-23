'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { StoreManager } from '@/lib/store';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Calendar, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  FileText, 
  Building2, 
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  PhoneCall,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Profile, Internship, WeeklyLog, LogEntry, GuideComment } from '@/types/database';
import { downloadStudentDossierDocument, downloadStudentDossierExcel, getStudentDossierData } from '@/lib/student-dossier';
import { Download, Award, FileSpreadsheet } from 'lucide-react';
import CompletionAnalyticsGraph from '@/components/analytics/CompletionAnalyticsGraph';

export default function GuideDashboardPage() {
  const { currentUser, storeState, refreshStore } = useAuth();
  const guide = currentUser;

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedWeekNo, setSelectedWeekNo] = useState<number>(1);
  const [newCommentBody, setNewCommentBody] = useState<string>('');
  const [commentSuccess, setCommentSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Assigned students
  const assignments = storeState.guideAssignments.filter((a) => a.guide_id === guide?.id);
  const assignedStudentIds = assignments.map((a) => a.student_id);
  const myStudents = storeState.profiles.filter((p) => assignedStudentIds.includes(p.id));

  // Internships of assigned students
  const internships = storeState.internships.filter((i) => assignedStudentIds.includes(i.student_id));
  const weeklyLogs = storeState.weeklyLogs;
  const entries = storeState.logEntries;
  const confirmations = storeState.supervisorConfirmations;
  const comments = storeState.guideComments;
  const documents = storeState.documents;

  // Selected student details
  const activeStudent = myStudents.find((s) => s.id === (selectedStudentId || myStudents[0]?.id));
  const activeDossier = activeStudent ? getStudentDossierData(activeStudent.id) : null;
  const activeIntern = internships.find((i) => i.student_id === activeStudent?.id);
  const activeStudentLogs = activeIntern
    ? weeklyLogs.filter((w) => w.internship_id === activeIntern.id).sort((a, b) => a.week_no - b.week_no)
    : [];
  const activeWeek = activeStudentLogs.find((w) => w.week_no === selectedWeekNo) || activeStudentLogs[0];
  const activeEntries = activeWeek ? entries.filter((e) => e.weekly_log_id === activeWeek.id) : [];
  const activeComments = activeWeek ? comments.filter((c) => c.weekly_log_id === activeWeek.id) : [];

  // Mentee completion counts
  const menteeDossiers = myStudents.map((s) => getStudentDossierData(s.id)).filter(Boolean);
  const menteesCompleted = menteeDossiers.filter((d) => d?.completionStatus === 'Completed').length;
  const menteesInProgress = menteeDossiers.filter((d) => d?.completionStatus === 'In Progress').length;
  const menteesRemaining = menteeDossiers.filter((d) => d?.completionStatus === 'Remaining' || d?.completionStatus === 'Unregistered').length;

  // Heatmap cell evaluator
  // Green = on time (3+ entries)
  // Amber = late / incomplete (1-2 entries)
  // Red = locked without entries / overdue
  // Grey = future / upcoming
  const getCellStatus = (internId: string, weekNo: number) => {
    const w = weeklyLogs.find((log) => log.internship_id === internId && log.week_no === weekNo);
    if (!w) return { color: 'bg-slate-100 text-slate-400', label: 'Upcoming', code: 'grey' };

    const weekEntries = entries.filter((e) => e.weekly_log_id === w.id);
    const isLocked = Boolean(w.locked_at);
    const isConfirmed = confirmations.some((c) => c.weekly_log_id === w.id && c.status === 'confirmed');

    if (isConfirmed || weekEntries.length >= 3) {
      return { color: 'bg-emerald-500 text-white', label: 'On Time (Submitted)', code: 'green' };
    }
    if (weekEntries.length > 0 && !isLocked) {
      return { color: 'bg-amber-400 text-slate-900', label: 'In Progress / At Risk', code: 'amber' };
    }
    if (isLocked && weekEntries.length === 0) {
      return { color: 'bg-red-500 text-white', label: 'Missed / Locked', code: 'red' };
    }
    return { color: 'bg-slate-200 text-slate-500', label: 'Upcoming', code: 'grey' };
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWeek || !guide || !activeStudent || !newCommentBody.trim()) return;

    const store = StoreManager.getInstance();
    const state = store.getState();

    const commentId = `comment-${Date.now()}`;
    const newComment: GuideComment = {
      id: commentId,
      weekly_log_id: activeWeek.id,
      guide_id: guide.id,
      guide_name: guide.name,
      body: newCommentBody.trim(),
      created_at: new Date().toISOString(),
    };

    state.guideComments.push(newComment);

    // Notify student in-app
    store.addNotification(
      activeStudent.id,
      `Guide Feedback on Week ${activeWeek.week_no}`,
      `${guide.name} commented: "${newCommentBody.slice(0, 80)}..."`,
      '/student/weekly-logs'
    );

    // Dispatch email to outbox
    store.addOutboxEmail(
      activeStudent.email,
      `InternTrack: Guide Comment on Week ${activeWeek.week_no} from ${guide.name}`,
      `<p>Dear ${activeStudent.name},<br/>Your internal guide <b>${guide.name}</b> reviewed your Week ${activeWeek.week_no} log and added the following guidance:<br/><br/><i>"${newCommentBody.trim()}"</i></p>`,
      'comment_notification'
    );

    store.addAuditLog(guide.id, 'ADD_GUIDE_COMMENT', 'guide_comments', commentId, null, newComment);
    store.saveState();
    refreshStore();

    setNewCommentBody('');
    setCommentSuccess(`Comment posted! Notification and email dispatched to ${activeStudent.name}.`);
    setTimeout(() => setCommentSuccess(null), 3000);
  };

  const filteredStudents = myStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roll_no && s.roll_no.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Internal Guide Hub</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {guide?.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Student × Week Heatmap Matrix, weekly log review, threaded mentorship comments, and industry contact logs.
          </p>
        </div>

        <Link
          href="/guide/contacts"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900 dark:bg-purple-600 hover:bg-purple-800 dark:hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Industry Contact Journal</span>
        </Link>
      </div>

      {/* Comprehensive Completion & Remaining Analytics Graphs */}
      <CompletionAnalyticsGraph
        initialScope="my_mentees"
        guideId={guide?.id}
        title="Faculty Guide Completion & Progress Analytics"
        subtitle="Interactive visualization showing how many assigned students completed their internship versus remaining deliverables."
        onSelectStudent={(studentId) => {
          setSelectedStudentId(studentId);
        }}
      />

      {/* Heatmap Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              My Assigned Students Heatmap Matrix ({myStudents.length} Students)
            </h2>
            <p className="text-xs text-slate-500">
              Click any cell or student to open their detailed weekly log and comment thread.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span>On Time (Green)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
              <span>Late / Risk (Amber)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-500 inline-block" />
              <span>Missed (Red)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200 inline-block" />
              <span>Upcoming (Grey)</span>
            </div>
          </div>
        </div>

        {/* Heatmap Table */}
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 border-r w-48">Student (Roll No)</th>
                <th className="py-3 px-4 border-r w-44">Company</th>
                <th className="py-3 px-2 text-center w-12 border-r">W1</th>
                <th className="py-3 px-2 text-center w-12 border-r">W2</th>
                <th className="py-3 px-2 text-center w-12 border-r">W3</th>
                <th className="py-3 px-2 text-center w-12 border-r">W4</th>
                <th className="py-3 px-2 text-center w-12 border-r">W5</th>
                <th className="py-3 px-2 text-center w-12 border-r">W6</th>
                <th className="py-3 px-2 text-center w-12 border-r">W7</th>
                <th className="py-3 px-2 text-center w-12 border-r">W8</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => {
                const sIntern = internships.find((i) => i.student_id === s.id);
                const isSelected = activeStudent?.id === s.id;

                return (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`cursor-pointer transition ${
                      isSelected ? 'bg-purple-50/70 border-l-4 border-l-purple-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Student Name */}
                    <td className="py-2.5 px-4 border-r">
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="font-mono text-[10px] text-slate-500">{s.roll_no}</p>
                    </td>

                    {/* Company */}
                    <td className="py-2.5 px-4 border-r">
                      <span className="font-medium text-slate-700 truncate max-w-[150px] block">
                        {sIntern ? sIntern.company_name : 'Unregistered'}
                      </span>
                    </td>

                    {/* Weeks 1 to 8 Heatmap Cells */}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((wNo) => {
                      const cell = sIntern ? getCellStatus(sIntern.id, wNo) : { color: 'bg-slate-100', label: 'N/A' };
                      return (
                        <td
                          key={wNo}
                          className="py-2.5 px-2 border-r text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentId(s.id);
                            setSelectedWeekNo(wNo);
                          }}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold text-[10px] shadow-sm transition hover:scale-110 ${cell.color}`}
                            title={`Week ${wNo}: ${cell.label}`}
                          >
                            {wNo}
                          </span>
                        </td>
                      );
                    })}

                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadStudentDossierDocument(s.id);
                          }}
                          className="p-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition"
                          title="Download Dossier (.txt)"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setSelectedStudentId(s.id)}
                          className="text-purple-700 dark:text-purple-400 hover:underline font-bold text-[11px]"
                        >
                          Inspect →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Student Deep-Dive Review Card */}
      {activeStudent && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          {/* Student Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {activeStudent.name} ({activeStudent.roll_no})
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">
                  Course ET740
                </span>
                {activeDossier && (
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                    Marks: {activeDossier.marks.total_marks} / 30
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeStudent.email} • {activeStudent.phone || 'No phone'} • Batch: {activeStudent.batch}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => downloadStudentDossierDocument(activeStudent.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-900 dark:bg-blue-600 text-white font-bold text-xs shadow hover:bg-blue-800 transition"
                title="Download full student dossier (.txt)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Dossier</span>
              </button>
              <button
                onClick={() => downloadStudentDossierExcel(activeStudent.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                title="Download student spreadsheet (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download Excel</span>
              </button>
            </div>
          </div>

          {/* Continuous Assessment Marks /30 */}
          {activeDossier && (
            <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Continuous Evaluation Rubric (Total: {activeDossier.marks.total_marks} / 30)
                </span>
                <span className="text-xs text-purple-700 dark:text-purple-400 font-semibold">
                  Evaluator: {guide.name}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-center border border-purple-100 dark:border-purple-900">
                  <span className="text-[10px] text-slate-400 uppercase block">Log Regularity</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeDossier.marks.log_regularity_marks} / 10</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-center border border-purple-100 dark:border-purple-900">
                  <span className="text-[10px] text-slate-400 uppercase block">Supervisor Seals</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeDossier.marks.supervisor_verification_marks} / 10</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-center border border-purple-100 dark:border-purple-900">
                  <span className="text-[10px] text-slate-400 uppercase block">Report Quality</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeDossier.marks.report_quality_marks} / 10</span>
                </div>
              </div>
            </div>
          )}

          {/* Week Selector for Feedback */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((wNo) => (
              <button
                key={wNo}
                onClick={() => setSelectedWeekNo(wNo)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedWeekNo === wNo
                    ? 'bg-purple-900 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Week {wNo} Logs & Comments
              </button>
            ))}
          </div>

          {/* Active Week Log Entries Display */}
          <div className="border rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-xs text-slate-800">
                Week {selectedWeekNo} Submitted Entries ({activeEntries.length} logged)
              </span>
              {activeWeek && (
                <span className="font-mono text-[11px] text-slate-500">
                  {formatDate(activeWeek.week_start)} — {formatDate(activeWeek.week_end)}
                </span>
              )}
            </div>

            {activeEntries.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No entries filed by student for Week {selectedWeekNo}.
              </p>
            ) : (
              <div className="space-y-2">
                {activeEntries.map((entry) => (
                  <div key={entry.id} className="p-3 rounded-lg bg-white border text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 font-mono">{formatDate(entry.entry_date)}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                        Quality Score: {entry.specificity_score || 80}%
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Threaded Comments & Comment Form */}
          <div className="border rounded-xl p-5 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-purple-700" />
              Threaded Mentorship Comments (Week {selectedWeekNo})
            </h4>

            {commentSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">{commentSuccess}</span>
              </div>
            )}

            {activeComments.length > 0 ? (
              <div className="space-y-2">
                {activeComments.map((c) => (
                  <div key={c.id} className="p-3 rounded-lg bg-purple-50/50 border border-purple-200 text-xs space-y-1">
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
            ) : (
              <p className="text-xs text-slate-400 italic">No comments on this week yet.</p>
            )}

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="pt-2 space-y-2">
              <textarea
                rows={2}
                required
                value={newCommentBody}
                onChange={(e) => setNewCommentBody(e.target.value)}
                placeholder={`Provide technical feedback or instructions for ${activeStudent.name} on Week ${selectedWeekNo}...`}
                className="w-full p-2.5 border rounded-lg text-xs focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Comment & Dispatch Notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
