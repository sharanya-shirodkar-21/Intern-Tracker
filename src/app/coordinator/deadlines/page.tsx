'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { runDeadlineReminderScan, ScanResult } from '@/lib/deadlines-engine';
import { 
  Clock, 
  Bell, 
  Mail, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Settings, 
  ArrowLeft, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function CoordinatorDeadlinesPage() {
  const { storeState, refreshStore } = useAuth();

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunScan = () => {
    setIsRunning(true);
    setTimeout(() => {
      const result = runDeadlineReminderScan();
      setScanResult(result);
      refreshStore();
      setIsRunning(false);
    }, 600);
  };

  const deadlines = storeState.deadlines;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/coordinator" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Deadlines & Scheduled Reminders Engine
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated compliance engine. Configures institutional submission rules and dispatches multi-channel student & faculty digest reminders.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isRunning}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition hover:scale-105"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? 'Running Cron Engine...' : 'Trigger Scheduled Job Now (Simulate Cron)'}</span>
        </button>
      </div>

      {/* Scan Results Banner */}
      {scanResult && (
        <div className="p-6 rounded-2xl bg-blue-50/80 border border-blue-200 shadow-sm space-y-4 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-950 font-black text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Cron Job Completed Successfully: Multi-Channel Reminders Dispatched!</span>
            </div>
            <Link
              href="/outbox"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline bg-white px-3 py-1.5 rounded-lg border border-blue-300 shadow-sm"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>Inspect Generated Emails in Outbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-3 rounded-xl border">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Student Reminders</span>
              <p className="text-2xl font-black text-blue-900 mt-1">{scanResult.studentRemindersSent}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">In-app notifications + emails</p>
            </div>

            <div className="bg-white p-3 rounded-xl border">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Faculty Guide Digests</span>
              <p className="text-2xl font-black text-purple-900 mt-1">{scanResult.guideDigestsSent}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Summary of students needing attention</p>
            </div>

            <div className="bg-white p-3 rounded-xl border">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Students Flagged At Risk</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{scanResult.studentsAtRiskCount}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Missing offer letter or locked logs</p>
            </div>
          </div>
        </div>
      )}

      {/* Configurable Deadline Rules */}
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Settings className="w-4 h-4 text-blue-700" />
          <h2 className="font-bold text-sm text-slate-900">
            Institutional Course ET740 Deadline Configuration Rules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rule 1: Offer letter */}
          <div className="p-4 rounded-xl border bg-slate-50 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">1. Offer Letter Rule</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">T + 7 Days</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Mandatory upload of company offer or appointment letter. Counted relative to internship start date.
            </p>
            <div className="pt-2 border-t text-[11px] text-slate-500">
              Reminder Schedule: <b>T-3 days, T-1 day, and on overdue</b>.
            </div>
          </div>

          {/* Rule 2: Weekly Log */}
          <div className="p-4 rounded-xl border bg-slate-50 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">2. Weekly Log & Lock</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">+24h Grace</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Entries for Week 1–8 must be completed by Sunday 23:59:59. Database trigger locks week after 24h grace.
            </p>
            <div className="pt-2 border-t text-[11px] text-slate-500">
              Reminder Schedule: <b>Every Friday 17:00 and Sunday 12:00</b>.
            </div>
          </div>

          {/* Rule 3: Final Report */}
          <div className="p-4 rounded-xl border bg-slate-50 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">3. Final Report & Certificate</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">End + 15 Days</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Completion certificate and B3 report submission due within 15 days of Week 8 completion.
            </p>
            <div className="pt-2 border-t text-[11px] text-slate-500">
              Reminder Schedule: <b>End-5 days, End, and End+10 days</b>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
