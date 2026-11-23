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
  ChevronRight
} from 'lucide-react';
import { downloadB1Excel } from '@/lib/excel-b1-export';

export default function CoordinatorDashboard() {
  const { storeState } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');

  const students = storeState.profiles.filter((p) => p.role === 'student');
  const guides = storeState.profiles.filter((p) => p.role === 'guide');
  const internships = storeState.internships;
  const assignments = storeState.guideAssignments;
  const documents = storeState.documents;
  const weeklyLogs = storeState.weeklyLogs;

  // KPI Calculations
  const totalStudents = students.length;
  const registeredCount = internships.length;
  const unregisteredCount = totalStudents - registeredCount;

  const offerLetterCount = documents.filter((d) => d.type === 'offer_letter').length;
  const certificateCount = documents.filter((d) => d.type === 'certificate').length;
  const reportCount = documents.filter((d) => d.type === 'report').length;

  // Compute on-track vs behind students:
  // On-track: registered, has offer letter, Week 1-2 logs submitted
  const studentsWithStatus = students.map((s) => {
    const intern = internships.find((i) => i.student_id === s.id);
    const assign = assignments.find((a) => a.student_id === s.id);
    const guide = guides.find((g) => g.id === assign?.guide_id);
    const hasOffer = documents.some((d) => d.internship_id === intern?.id && d.type === 'offer_letter');
    const hasCert = documents.some((d) => d.internship_id === intern?.id && d.type === 'certificate');
    const hasReport = documents.some((d) => d.internship_id === intern?.id && d.type === 'report');

    const studentLogs = intern ? weeklyLogs.filter((w) => w.internship_id === intern.id) : [];
    const lockedOrSubmittedLogs = studentLogs.filter((w) => w.locked_at || w.hash);

    let progressStatus: 'on_track' | 'behind' | 'at_risk' | 'completed' | 'unregistered' = 'unregistered';
    if (!intern) {
      progressStatus = 'unregistered';
    } else if (hasCert && hasReport) {
      progressStatus = 'completed';
    } else if (!hasOffer || lockedOrSubmittedLogs.length < 2) {
      progressStatus = 'behind';
    } else {
      progressStatus = 'on_track';
    }

    return {
      student: s,
      intern,
      guide,
      hasOffer,
      hasCert,
      hasReport,
      progressStatus,
      completedWeeksCount: lockedOrSubmittedLogs.length,
    };
  });

  const onTrackCount = studentsWithStatus.filter((s) => s.progressStatus === 'on_track').length;
  const behindCount = studentsWithStatus.filter((s) => s.progressStatus === 'behind').length;
  const completedCount = studentsWithStatus.filter((s) => s.progressStatus === 'completed').length;

  // Extract distinct company names
  const companies = Array.from(new Set(internships.map((i) => i.company_name))).filter(Boolean);

  // Filtered dataset
  const filteredStudents = studentsWithStatus.filter(({ student, intern, guide, progressStatus }) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.roll_no && student.roll_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (intern?.company_name && intern.company_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGuide = selectedGuide === 'all' || guide?.id === selectedGuide;
    const matchesStatus = selectedStatus === 'all' || progressStatus === selectedStatus;
    const matchesCompany = selectedCompany === 'all' || intern?.company_name === selectedCompany;

    return matchesSearch && matchesGuide && matchesStatus && matchesCompany;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Coordinator Department Hub</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Class of 2021-2025 • ETC
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Department-wide monitoring, batch uploads, faculty guide assignments, and official Appendix B1 exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/coordinator/batch-upload"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 font-semibold text-xs transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Batch</span>
          </Link>

          <Link
            href="/coordinator/guide-mapping"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 font-semibold text-xs transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Map Guides (Auto-Balance)</span>
          </Link>

          <button
            onClick={() => downloadB1Excel(students, internships, assignments, guides)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export B1 Excel</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Cohort</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalStudents}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{registeredCount} Registered / {unregisteredCount} Pending</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Offer Letters</span>
          <p className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1">{offerLetterCount}</p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">{Math.round((offerLetterCount / (registeredCount || 1)) * 100)}% of registered</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Logs On Track</span>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">{onTrackCount}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Submitting on time</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Logs Behind / Risk</span>
          <p className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-1">{behindCount}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Missing logs / offer letter</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Reports Submitted</span>
          <p className="text-2xl font-black text-purple-900 dark:text-purple-200 mt-1">{reportCount}</p>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">{certificateCount} Certificates uploaded</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search name, roll no, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={selectedGuide}
              onChange={(e) => setSelectedGuide(e.target.value)}
              className="w-full p-2 text-xs border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Internal Guides</option>
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
              className="w-full p-2 text-xs border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Companies</option>
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
              className="w-full p-2 text-xs border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="on_track">On Track</option>
              <option value="behind">Behind / At Risk</option>
              <option value="completed">Fully Completed</option>
              <option value="unregistered">Not Registered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Master Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-slate-900">Student Progress & Assignment Directory</h2>
            <p className="text-xs text-slate-500">Showing {filteredStudents.length} of {totalStudents} students</p>
          </div>
          <Link
            href="/coordinator/export-b1"
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 hover:underline"
          >
            Customize B1 Format
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Roll No & Student</th>
                <th className="py-3 px-4">Assigned Guide</th>
                <th className="py-3 px-4">Internship & Mode</th>
                <th className="py-3 px-4">Offer Letter</th>
                <th className="py-3 px-4">Logs (8 Wks)</th>
                <th className="py-3 px-4">Report</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(({ student, intern, guide, hasOffer, hasReport, progressStatus, completedWeeksCount }) => (
                <tr key={student.id} className="hover:bg-slate-50/70 transition">
                  {/* Student Roll & Name */}
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{student.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{student.roll_no} • {student.email}</p>
                  </td>

                  {/* Guide */}
                  <td className="py-3 px-4">
                    {guide ? (
                      <span className="font-medium text-slate-800">{guide.name}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Company */}
                  <td className="py-3 px-4">
                    {intern ? (
                      <div>
                        <p className="font-medium text-slate-900 truncate max-w-[200px]">{intern.company_name}</p>
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          {intern.mode} • {intern.domain}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not Registered</span>
                    )}
                  </td>

                  {/* Offer Letter */}
                  <td className="py-3 px-4">
                    {hasOffer ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Uploaded
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">Missing</span>
                    )}
                  </td>

                  {/* Weekly Logs Progress */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(completedWeeksCount / 8) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-600">{completedWeeksCount}/8</span>
                    </div>
                  </td>

                  {/* Final Report */}
                  <td className="py-3 px-4">
                    {hasReport ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Submitted
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Pending</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-right">
                    {progressStatus === 'completed' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        Completed
                      </span>
                    )}
                    {progressStatus === 'on_track' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        On Track
                      </span>
                    )}
                    {progressStatus === 'behind' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Behind
                      </span>
                    )}
                    {progressStatus === 'unregistered' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Unregistered
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
