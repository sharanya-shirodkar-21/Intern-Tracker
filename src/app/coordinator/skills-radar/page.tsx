'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  ShieldAlert, 
  BarChart3, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Tag, 
  Building2, 
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function SkillsAndRiskRadarPage() {
  const { storeState } = useAuth();

  const students = storeState?.profiles?.filter((p) => p.role === 'student') || [];
  const guides = storeState?.profiles?.filter((p) => p.role === 'guide') || [];
  const internships = storeState?.internships || [];
  const assignments = storeState?.guideAssignments || [];
  const documents = storeState?.documents || [];
  const weeklyLogs = storeState?.weeklyLogs || [];
  const confirmations = storeState?.supervisorConfirmations || [];

  // 1. Calculate Explainable Risk Radar Score for each student
  const riskList = students.map((s) => {
    const intern = internships.find((i) => i.student_id === s.id);
    const assign = assignments.find((a) => a.student_id === s.id);
    const guide = guides.find((g) => g.id === assign?.guide_id);
    const hasOffer = documents.some((d) => d.internship_id === intern?.id && d.type === 'offer_letter');

    const sLogs = intern ? weeklyLogs.filter((w) => w.internship_id === intern.id) : [];
    const lockedEmptyLogs = sLogs.filter((w) => w.locked_at && !(storeState?.logEntries || []).some((e) => e.weekly_log_id === w.id));
    const unconfirmedLogs = sLogs.filter((w) => !confirmations.some((c) => c.weekly_log_id === w.id));

    let score = 0;
    const reasons: string[] = [];

    if (!intern) {
      score += 40;
      reasons.push('Internship not yet registered');
    } else if (!hasOffer) {
      score += 30;
      reasons.push('Offer letter missing after Week 1');
    }

    if (lockedEmptyLogs.length > 0) {
      score += Math.min(lockedEmptyLogs.length * 25, 50);
      reasons.push(`${lockedEmptyLogs.length} week(s) locked without entries`);
    }

    if (intern && unconfirmedLogs.length >= 2) {
      score += 15;
      reasons.push('Supervisor confirmation pending on multiple weeks');
    }

    return {
      student: s,
      intern,
      guide,
      score: Math.min(score, 100),
      reasons,
      level: score >= 50 ? 'High' : score >= 25 ? 'Medium' : 'Low',
    };
  });

  const highRiskStudents = riskList.filter((r) => r.level === 'High');
  const mediumRiskStudents = riskList.filter((r) => r.level === 'Medium');

  // 2. Department Skills & Accreditation Aggregation (NBA / NAAC)
  const domainCounts: Record<string, number> = {};
  const modeCounts = { onsite: 0, hybrid: 0, remote: 0 };
  const allSkills = [
    'Embedded C', 'Microcontrollers (STM32/ESP32)', 'CAN Bus Protocols', 'Signal Processing',
    'Edge AI & Computer Vision', 'Cloud Microservices', 'Hardware Testing', 'VLSI Design', 'IoT Networks'
  ];

  internships.forEach((intern) => {
    const dom = intern.domain || 'General Engineering';
    domainCounts[dom] = (domainCounts[dom] || 0) + 1;
    if (intern.mode && intern.mode in modeCounts) {
      modeCounts[intern.mode as keyof typeof modeCounts]++;
    }
  });

  // Export Accreditation Excel
  const handleExportAccreditationExcel = () => {
    const wsData: any[][] = [];
    wsData.push(['DON BOSCO COLLEGE OF ENGINEERING - DEPARTMENT OF ELECTRONICS & TELECOMMUNICATION']);
    wsData.push(['NBA CRITERION 4 & NAAC INTERNSHIP ACCREDITATION REPORT']);
    wsData.push([`Course: ET740 | Academic Year: 2024-2025 | Total Students: ${students.length}`]);
    wsData.push([]);

    wsData.push(['Sr.No', 'Technical Domain / Specialization', 'Student Count', 'Percentage (%)']);
    Object.entries(domainCounts).forEach(([dom, count], idx) => {
      const denom = students.length > 0 ? students.length : 1;
      wsData.push([idx + 1, dom, count, `${Math.round((count / denom) * 100)}%`]);
    });

    wsData.push([]);
    wsData.push(['Internship Mode', 'Student Count']);
    wsData.push(['On-Site Industrial Training', modeCounts.onsite]);
    wsData.push(['Hybrid Mode', modeCounts.hybrid]);
    wsData.push(['Remote Mode', modeCounts.remote]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'NBA_NAAC_Internship_Report');
    XLSX.writeFile(wb, 'ET740_NBA_Accreditation_Report_2024_2025.xlsx');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/coordinator" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Department Risk Radar & Accreditation Skills Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Explainable rule-based student risk radar and aggregate NBA Criterion 4 / NAAC reporting.
          </p>
        </div>

        <button
          onClick={handleExportAccreditationExcel}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export NBA / NAAC Accreditation Excel</span>
        </button>
      </div>

      {/* 1. Risk Radar Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>Student Compliance Risk Radar (Explainable Scoring)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Scored transparently using missing offer letters (+30), overdue weekly logs (+25), and pending supervisor seals (+15).
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 font-bold border border-red-200 dark:border-red-900">
              {highRiskStudents.length} High Risk
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-900">
              {mediumRiskStudents.length} Medium Risk
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {riskList
            .filter((r) => r.score > 0)
            .slice(0, 6)
            .map(({ student, intern, guide, score, reasons, level }) => (
              <div
                key={student.id}
                className={`p-5 rounded-2xl border space-y-3 transition shadow-sm ${
                  level === 'High' 
                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' 
                    : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{student.name}</h3>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {student.roll_no} • {intern?.company_name || 'Unregistered'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-black ${level === 'High' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {score} pts
                    </span>
                    <span className="text-[10px] uppercase font-bold block text-slate-400">{level} Risk</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Flagged Reasons:</span>
                  <ul className="text-xs space-y-1">
                    {reasons.map((r, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Guide: <b className="text-slate-800 dark:text-slate-200">{guide?.name || 'Unassigned'}</b></span>
                  <Link href="/coordinator" className="text-blue-700 dark:text-blue-400 font-bold hover:underline">
                    View Logs →
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 2. Skills & Accreditation Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
              <span>Department Technical Skills & Industry Domain Aggregations</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Curated for NBA Criterion 4 (Student Performance) and NAAC SSR reports.
            </p>
          </div>
          <span className="text-xs font-mono text-blue-900 dark:text-blue-200 font-bold bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
            Class of 2021–2025
          </span>
        </div>

        {/* Domain Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Domain Distribution Across Cohort</h3>
            <div className="space-y-3">
              {Object.entries(domainCounts).map(([dom, count]) => {
                const denom = students.length > 0 ? students.length : 1;
                const pct = Math.round((count / denom) * 100);
                return (
                  <div key={dom} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{dom}</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">{count} students ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mode & Key Competencies */}
          <div className="space-y-5">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3">Internship Mode Distribution</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">On-Site</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{modeCounts.onsite}</p>
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Hybrid</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{modeCounts.hybrid}</p>
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Remote</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{modeCounts.remote}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3">Batch Core Competencies</h3>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((sk) => (
                  <span key={sk} className="px-3 py-1 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
