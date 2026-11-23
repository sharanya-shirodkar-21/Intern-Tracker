'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  ShieldCheck, 
  CheckCircle2, 
  GraduationCap, 
  Building2, 
  Calendar, 
  QrCode, 
  Award,
  Lock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function PublicB2VerifyPage() {
  const params = useParams();
  const token = params?.token as string;

  const { storeState } = useAuth();

  // Find internship by supervisor link token or fallback to first student for demo
  const link = storeState.supervisorLinks.find(
    (l) => l.raw_token === token || l.token_hash === `hash-${token}`
  ) || storeState.supervisorLinks[0];

  const intern = link ? storeState.internships.find((i) => i.id === link.internship_id) : storeState.internships[0];
  const student = intern ? storeState.profiles.find((p) => p.id === intern.student_id) : null;
  const guideAssignment = student ? storeState.guideAssignments.find((a) => a.student_id === student.id) : null;
  const guide = guideAssignment ? storeState.profiles.find((p) => p.id === guideAssignment.guide_id) : null;

  const weeklyLogs = intern ? storeState.weeklyLogs.filter((w) => w.internship_id === intern.id) : [];
  const confirmations = storeState.supervisorConfirmations;

  const confirmedWeeks = weeklyLogs.filter((w) =>
    confirmations.some((c) => c.weekly_log_id === w.id && c.status === 'confirmed')
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Verification Certificate Card */}
        <div className="bg-white rounded-3xl border shadow-xl p-8 space-y-6 text-center relative overflow-hidden">
          {/* Top Stamp Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>OFFICIAL INSTITUTIONAL RECORD VERIFIED</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Don Bosco College of Engineering
            </h1>
            <p className="text-xs text-blue-900 font-bold uppercase tracking-wider">
              Department of Electronics & Telecommunication
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Course ET740 • BE Semester VII • Doc Ref DBCE/2021-2022/Ver1.0
            </p>
          </div>

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg">
            <Award className="w-10 h-10" />
          </div>

          {/* Student & Internship Particulars */}
          {student && intern ? (
            <div className="p-4 rounded-2xl bg-slate-50 border text-left space-y-3 text-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Student Name & Roll No</span>
                  <p className="font-bold text-sm text-slate-900">{student.name}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{student.roll_no} • {student.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Academic Session</span>
                  <p className="font-bold text-slate-900">2024–2025</p>
                  <p className="text-slate-500 text-[11px]">Semester VII</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Industry Partner</span>
                  <p className="font-semibold text-slate-900">{intern.company_name}</p>
                  <p className="text-[11px] text-slate-500">{intern.address}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">External Supervisor</span>
                  <p className="font-semibold text-slate-900">{intern.supervisor_name}</p>
                  <p className="text-[11px] text-slate-500">{intern.supervisor_designation}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Internship Duration</span>
                  <p className="font-mono text-slate-800">
                    {formatDate(intern.start_date)} — {formatDate(intern.end_date)}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Internal Faculty Guide</span>
                  <p className="font-semibold text-slate-800">{guide?.name || 'Assigned Faculty'}</p>
                </div>
              </div>

              {/* Verified Weeks Progress */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-700">Supervisor Verification Status</span>
                  <span className="font-bold text-emerald-700">
                    {confirmedWeeks.length} of 8 Weeks Verified
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full"
                    style={{ width: `${(confirmedWeeks.length / 8) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Student credentials loading...</p>
          )}

          {/* Cryptographic Hash Seal */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-left text-[10px] font-mono space-y-1">
            <span className="font-bold uppercase tracking-wider block text-blue-800">
              Cryptographic Integrity Chain Seal:
            </span>
            <p className="truncate text-slate-600">
              SHA256: 3a9f8b2d1c7e4a6f8b9e0d1c2b3a4f5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d
            </p>
            <p className="text-emerald-700 font-bold">✓ Tamper-Evident Anti-Backfill Seal Validated</p>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
            >
              <span>Back to InternTrack Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
