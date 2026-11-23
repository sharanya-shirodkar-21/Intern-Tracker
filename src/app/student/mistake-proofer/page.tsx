'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  runMistakeProofer, 
  generatePrefilledB3Skeleton, 
  ProoferReport 
} from '@/lib/mistake-proofer';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  ArrowLeft, 
  FileText, 
  Sparkles,
  FileCode,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function MistakeProoferPage() {
  const { currentUser, storeState } = useAuth();
  const student = currentUser;

  const intern = storeState.internships.find((i) => i.student_id === student?.id);
  const assignment = storeState.guideAssignments.find((a) => a.student_id === student?.id);
  const guide = storeState.profiles.find((p) => p.id === assignment?.guide_id);

  const studentLogs = intern ? storeState.weeklyLogs.filter((w) => w.internship_id === intern.id) : [];
  const entries = storeState.logEntries;

  const [reportResult, setReportResult] = useState<ProoferReport | null>(() => {
    if (student && intern) {
      return runMistakeProofer(student, intern, studentLogs, entries);
    }
    return null;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);

  if (!student || !intern) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Please Register Your Internship First</h2>
        <Link href="/student/register" className="px-4 py-2 bg-blue-900 text-white rounded-lg inline-block">
          Register Internship
        </Link>
      </div>
    );
  }

  const handleDownloadSkeleton = () => {
    const content = generatePrefilledB3Skeleton(student, intern, guide?.name || 'Assigned Faculty Guide');
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Appendix_B3_Report_Skeleton_${student.roll_no}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmitReport = () => {
    if (reportResult && !reportResult.canSubmit) {
      setSubmitWarning(
        `PRE-SUBMISSION BLOCKED: You have ${reportResult.failCount} failed check(s). Please review and resolve the exact fixes highlighted in red below before departmental submission.`
      );
      return;
    }
    alert('Report passed Mistake-Proofer verification! Submitted successfully to the department.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/student" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Appendix B3: Report Mistake-Proofer
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated compliance engine. Evaluates mandatory chapters, identity verification, 8-week log counts, and formatting prior to final submission.
          </p>
        </div>

        <button
          onClick={handleDownloadSkeleton}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold text-xs border border-blue-200 shadow-sm transition"
        >
          <FileCode className="w-4 h-4 text-blue-700" />
          <span>Download Prefilled B3 Skeleton (.md/.doc)</span>
        </button>
      </div>

      {submitWarning && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">SUBMISSION BLOCKED BY PROOFER:</p>
            <p>{submitWarning}</p>
          </div>
        </div>
      )}

      {/* Score Overview Card */}
      {reportResult && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Appendix B3 Report Compliance Score</span>
            </div>
            <h2 className="text-2xl font-black">
              {reportResult.score >= 80 ? 'High Compliance — Ready for Review' : 'Adjustments Required'}
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Verified against college document specification DBCE/2021-2022/Ver1.0. All mandatory sections and metadata cross-referenced with database records.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="text-4xl font-black text-emerald-400">{reportResult.score}%</span>
              <span className="text-[10px] text-slate-300 block uppercase font-bold mt-1">Compliance Score</span>
            </div>

            <div className="border-l border-white/20 pl-6 space-y-1 text-xs">
              <p className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> {reportResult.passCount} Passed
              </p>
              <p className="flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" /> {reportResult.warnCount} Warnings
              </p>
              <p className="flex items-center gap-1.5 text-red-300">
                <XCircle className="w-3.5 h-3.5" /> {reportResult.failCount} Failures
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Grid */}
      {reportResult && (
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Pre-Submission Verification Checklist</h3>
              <p className="text-xs text-slate-500">Every check shows real-time status and actionable fixes.</p>
            </div>

            <button
              onClick={handleSubmitReport}
              className={`px-5 py-2.5 rounded-lg font-bold text-xs shadow-md transition ${
                reportResult.canSubmit
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <span>{reportResult.canSubmit ? 'Submit Final Report to Department' : 'Attempt Submission (Test Warning)'}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {reportResult.checks.map((check) => (
              <div key={check.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {check.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {check.status === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    {check.status === 'fail' && <XCircle className="w-4 h-4 text-red-600" />}
                    <h4 className="font-bold text-xs text-slate-900">{check.title}</h4>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border">
                      {check.category}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      check.status === 'pass'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : check.status === 'warn'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    {check.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 pl-6">{check.description}</p>

                {check.exactFix && (
                  <div className="ml-6 p-2.5 rounded-lg bg-slate-50 border text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Recommended Fix: </span>
                    {check.exactFix}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
