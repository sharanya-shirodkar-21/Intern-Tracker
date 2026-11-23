'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { 
  Users, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Upload, 
  Filter, 
  Search, 
  FileText, 
  ShieldCheck, 
  GraduationCap, 
  Download,
  Building2,
  ChevronRight,
  Award,
  Eye,
  X,
  PieChart,
  BarChart2
} from 'lucide-react';
import { downloadB1Excel } from '@/lib/excel-b1-export';
import { 
  getStudentDossierData, 
  downloadStudentDossierDocument, 
  downloadStudentDossierExcel, 
  downloadCohortComprehensiveExcel,
  StudentDossier
} from '@/lib/student-dossier';

export default function CoordinatorDashboard() {
  const { storeState } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [activeModalStudentId, setActiveModalStudentId] = useState<string | null>(null);

  const students = storeState.profiles.filter((p) => p.role === 'student');
  const guides = storeState.profiles.filter((p) => p.role === 'guide');
  const internships = storeState.internships;
  const assignments = storeState.guideAssignments;
  const documents = storeState.documents;
  const weeklyLogs = storeState.weeklyLogs;

  // Build dossier data for all students
  const studentDossiers: StudentDossier[] = students
    .map((s) => getStudentDossierData(s.id))
    .filter((d): d is StudentDossier => d !== null);

  // Completion Analytics
  const totalStudents = students.length;
  const completedStudents = studentDossiers.filter((d) => d.completionStatus === 'Completed');
  const inProgressStudents = studentDossiers.filter((d) => d.completionStatus === 'In Progress');
  const remainingStudents = studentDossiers.filter((d) => d.completionStatus === 'Remaining');
  const unregisteredStudents = studentDossiers.filter((d) => d.completionStatus === 'Unregistered');

  const completedCount = completedStudents.length;
  const inProgressCount = inProgressStudents.length;
  const remainingCount = remainingStudents.length;
  const unregisteredCount = unregisteredStudents.length;

  const completedPct = Math.round((completedCount / (totalStudents || 1)) * 100);
  const inProgressPct = Math.round((inProgressCount / (totalStudents || 1)) * 100);
  const remainingPct = Math.round((remainingCount / (totalStudents || 1)) * 100);
  const unregisteredPct = Math.round((unregisteredCount / (totalStudents || 1)) * 100);

  // Deliverables counts
  const allLogsCompletedCount = studentDossiers.filter((d) => d.completedWeeksCount >= 8).length;
  const certificateCount = studentDossiers.filter((d) => Boolean(d.certificateDoc)).length;
  const reportCount = studentDossiers.filter((d) => Boolean(d.reportDoc)).length;
  const offerLetterCount = studentDossiers.filter((d) => Boolean(d.offerDoc)).length;

  // Average Marks out of 30 for registered students
  const registeredDossiers = studentDossiers.filter((d) => d.internship);
  const avgMarks = registeredDossiers.length > 0
    ? (registeredDossiers.reduce((acc, d) => acc + d.marks.total_marks, 0) / registeredDossiers.length).toFixed(1)
    : '0';

  // Extract distinct company names
  const companies = Array.from(new Set(internships.map((i) => i.company_name))).filter(Boolean);

  // Filtered dataset
  const filteredDossiers = studentDossiers.filter(({ student, internship, guide, completionStatus }) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      student.name.toLowerCase().includes(q) ||
      (student.roll_no && student.roll_no.toLowerCase().includes(q)) ||
      (internship?.company_name && internship.company_name.toLowerCase().includes(q));

    const matchesGuide = selectedGuide === 'all' || guide?.id === selectedGuide;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'completed' && completionStatus === 'Completed') ||
      (selectedStatus === 'in_progress' && completionStatus === 'In Progress') ||
      (selectedStatus === 'remaining' && completionStatus === 'Remaining') ||
      (selectedStatus === 'unregistered' && completionStatus === 'Unregistered');
    const matchesCompany = selectedCompany === 'all' || internship?.company_name === selectedCompany;

    return matchesSearch && matchesGuide && matchesStatus && matchesCompany;
  });

  const activeModalDossier = activeModalStudentId
    ? studentDossiers.find((d) => d.student.id === activeModalStudentId)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header & Cohort Export CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Internship Coordinator Hub</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
              Class of 2021-2025 • ETC
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Department-wide monitoring, batch uploads, data visualizations, individual student dossier downloads, and B1 export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/coordinator/batch-upload"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 font-semibold text-xs transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Batch</span>
          </Link>

          <Link
            href="/coordinator/guide-mapping"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 font-semibold text-xs transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Map Guides</span>
          </Link>

          <button
            onClick={() => downloadCohortComprehensiveExcel()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 font-bold text-xs shadow-md transition"
            title="Download complete cohort assessment spreadsheet with marks out of 30, logs, and document records"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Cohort Audit (.xlsx)</span>
          </button>

          <button
            onClick={() => downloadB1Excel(students, internships, assignments, guides)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-md transition"
            title="Export official Appendix B1 Group List"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export B1 Excel</span>
          </button>
        </div>
      </div>

      {/* 1. DATA VISUALIZATION: COMPLETED VS REMAINING */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-700 dark:text-blue-400" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Cohort Progress & Completion Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visualizing how many students have completed versus remaining in Course ET740 (8 Weeks).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
              Avg Marks: {avgMarks} / 30
            </span>
          </div>
        </div>

        {/* Multi-Segment Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">Cohort Completion Breakdown ({totalStudents} Students)</span>
            <span className="text-emerald-700 dark:text-emerald-400">{completedCount} of {totalStudents} Completed ({completedPct}%)</span>
          </div>

          <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden shadow-inner">
            <div
              style={{ width: `${completedPct}%` }}
              className="bg-emerald-500 hover:bg-emerald-400 transition-all duration-500"
              title={`Completed: ${completedCount} students (${completedPct}%)`}
            />
            <div
              style={{ width: `${inProgressPct}%` }}
              className="bg-blue-500 hover:bg-blue-400 transition-all duration-500"
              title={`In Progress: ${inProgressCount} students (${inProgressPct}%)`}
            />
            <div
              style={{ width: `${remainingPct}%` }}
              className="bg-amber-400 hover:bg-amber-300 transition-all duration-500"
              title={`Remaining / Needs Attention: ${remainingCount} students (${remainingPct}%)`}
            />
            <div
              style={{ width: `${unregisteredPct}%` }}
              className="bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 transition-all duration-500"
              title={`Unregistered: ${unregisteredCount} students (${unregisteredPct}%)`}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Completed: <b>{completedCount}</b> ({completedPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">In Progress / On Track: <b>{inProgressCount}</b> ({inProgressPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Remaining / Pending Logs: <b>{remainingCount}</b> ({remainingPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Unregistered: <b>{unregisteredCount}</b> ({unregisteredPct}%)</span>
            </div>
          </div>
        </div>

        {/* 4 Deliverables KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Card 1: 8 Weeks Logs */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              All 8 Weeks Logs
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{allLogsCompletedCount} / {totalStudents}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round((allLogsCompletedCount / (totalStudents || 1)) * 100)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {totalStudents - allLogsCompletedCount} students remaining
            </p>
          </div>

          {/* Card 2: Certificates */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Completion Certificates
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{certificateCount} / {totalStudents}</span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {Math.round((certificateCount / (totalStudents || 1)) * 100)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {totalStudents - certificateCount} certificates remaining
            </p>
          </div>

          {/* Card 3: Final Reports */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Final Reports (B3)
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{reportCount} / {totalStudents}</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {Math.round((reportCount / (totalStudents || 1)) * 100)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {totalStudents - reportCount} reports remaining
            </p>
          </div>

          {/* Card 4: Offer Letters (Optional) */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Offer Letters
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                Optional
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{offerLetterCount} / {totalStudents}</span>
              <span className="text-xs font-bold text-slate-500">
                {Math.round((offerLetterCount / (totalStudents || 1)) * 100)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Optional per college policy
            </p>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROLS */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search name, roll no, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div>
            <select
              value={selectedGuide}
              onChange={(e) => setSelectedGuide(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="all">All Faculty Guides ({guides.length})</option>
              {guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="all">All Companies ({companies.length})</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="all">All Statuses ({studentDossiers.length})</option>
              <option value="completed">Completed ({completedCount})</option>
              <option value="in_progress">In Progress ({inProgressCount})</option>
              <option value="remaining">Remaining ({remainingCount})</option>
              <option value="unregistered">Unregistered ({unregisteredCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. COHORT MASTER TABLE WITH INDIVIDUAL STUDENT DOWNLOADS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Student Master Register ({filteredDossiers.length} Students)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download complete logs, continuous assessment marks out of 30, and documents per individual student.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
            {filteredDossiers.length} Records Showing
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Company & Domain</th>
                <th className="py-3 px-3">Guide</th>
                <th className="py-3 px-3 text-center">Weekly Logs</th>
                <th className="py-3 px-3 text-center">Certificate</th>
                <th className="py-3 px-3 text-center">Report</th>
                <th className="py-3 px-3 text-center">Offer Letter</th>
                <th className="py-3 px-3 text-center">Marks (/30)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Individual Downloads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDossiers.map(({ student, internship, guide, marks, completedWeeksCount, certificateDoc, reportDoc, offerDoc, completionStatus }) => (
                <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  {/* Student Name */}
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                    <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{student.roll_no}</p>
                  </td>

                  {/* Company */}
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                      {internship ? internship.company_name : 'Not Registered'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                      {internship?.domain || '—'}
                    </p>
                  </td>

                  {/* Faculty Guide */}
                  <td className="py-3 px-3">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {guide?.name?.split(' ')[1] || guide?.name || 'Unassigned'}
                    </span>
                  </td>

                  {/* Weekly Logs */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded-lg text-[11px] ${
                      completedWeeksCount >= 8
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : completedWeeksCount > 0
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {completedWeeksCount} / 8
                    </span>
                  </td>

                  {/* Certificate */}
                  <td className="py-3 px-3 text-center">
                    {certificateDoc ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold" title="Certificate uploaded">✅</span>
                    ) : (
                      <span className="text-slate-400" title="Pending">⏳</span>
                    )}
                  </td>

                  {/* Report */}
                  <td className="py-3 px-3 text-center">
                    {reportDoc ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold" title="Report uploaded">✅</span>
                    ) : (
                      <span className="text-slate-400" title="Pending">⏳</span>
                    )}
                  </td>

                  {/* Offer Letter (Optional) */}
                  <td className="py-3 px-3 text-center">
                    {offerDoc ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold" title="Offer letter uploaded">✅</span>
                    ) : (
                      <span className="text-slate-400 text-[10px] font-medium" title="Optional per college policy">Opt</span>
                    )}
                  </td>

                  {/* Marks out of 30 */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-black text-slate-900 dark:text-white text-xs" title={`Logs: ${marks.log_regularity_marks}/10, Sup: ${marks.supervisor_verification_marks}/10, Rep: ${marks.report_quality_marks}/10`}>
                      {marks.total_marks} / 30
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                      completionStatus === 'Completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : completionStatus === 'In Progress'
                        ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                        : completionStatus === 'Remaining'
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}>
                      {completionStatus}
                    </span>
                  </td>

                  {/* Individual Download Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => downloadStudentDossierDocument(student.id)}
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition font-bold text-[11px] inline-flex items-center gap-1"
                        title="Download full individual dossier (.txt)"
                      >
                        <Download className="w-3 h-3" />
                        <span className="hidden sm:inline">Dossier</span>
                      </button>

                      <button
                        onClick={() => downloadStudentDossierExcel(student.id)}
                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition font-bold text-[11px] inline-flex items-center gap-1"
                        title="Download student data spreadsheet (.xlsx)"
                      >
                        <FileSpreadsheet className="w-3 h-3" />
                        <span className="hidden sm:inline">Excel</span>
                      </button>

                      <button
                        onClick={() => setActiveModalStudentId(student.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Quick View Dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. INDIVIDUAL STUDENT DOSSIER PREVIEW MODAL */}
      {activeModalDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Student Internship Dossier: {activeModalDossier.student.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {activeModalDossier.student.roll_no} • {activeModalDossier.student.email}
                </p>
              </div>
              <button
                onClick={() => setActiveModalStudentId(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Marks Out of 30 Overview */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Continuous Assessment (Marks Out of 30)
                </span>
                <span className="text-xl font-black text-blue-900 dark:text-blue-200">
                  {activeModalDossier.marks.total_marks} / 30
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Logs Timeliness</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{activeModalDossier.marks.log_regularity_marks} / 10</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Supervisor Seals</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{activeModalDossier.marks.supervisor_verification_marks} / 10</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Report Quality</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{activeModalDossier.marks.report_quality_marks} / 10</span>
                </div>
              </div>
            </div>

            {/* Placement & Mentor Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Industry Placement</span>
                <p className="font-bold text-slate-900 dark:text-white">{activeModalDossier.internship?.company_name || 'Unregistered'}</p>
                <p className="text-slate-500">{activeModalDossier.internship?.domain}</p>
                <p className="text-[11px] text-slate-400">Supervisor: {activeModalDossier.internship?.supervisor_name || '—'}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Internal Faculty Guide</span>
                <p className="font-bold text-slate-900 dark:text-white">{activeModalDossier.guide?.name || 'Unassigned'}</p>
                <p className="text-slate-500">{activeModalDossier.guide?.department}</p>
                <p className="text-[11px] text-slate-400">Contact: {activeModalDossier.guide?.email || '—'}</p>
              </div>
            </div>

            {/* Deliverables Checklist */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Deliverables & Evidence</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">Weekly Logs</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeModalDossier.completedWeeksCount} / 8 Weeks</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">Certificate</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {activeModalDossier.certificateDoc ? 'Submitted' : 'Pending'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">Offer Letter</span>
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    {activeModalDossier.offerDoc ? 'Submitted' : 'Optional (None)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => downloadStudentDossierDocument(activeModalDossier.student.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-900 dark:bg-blue-600 text-white font-bold text-xs shadow hover:bg-blue-800 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Dossier (.txt)</span>
              </button>
              <button
                onClick={() => downloadStudentDossierExcel(activeModalDossier.student.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download Excel (.xlsx)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
