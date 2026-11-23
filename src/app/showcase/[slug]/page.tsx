'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Award, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  GraduationCap, 
  Share2, 
  Tag, 
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function PublicShowcaseViewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { storeState } = useAuth();

  // Find showcase profile by slug or fallback to first student for demo
  const showcase = storeState.showcaseProfiles.find((s) => s.slug === slug) || storeState.showcaseProfiles[0];
  const student = showcase
    ? storeState.profiles.find((p) => p.id === showcase.student_id)
    : storeState.profiles.find((p) => p.role === 'student');

  const intern = student ? storeState.internships.find((i) => i.student_id === student.id) : null;
  const weeklyLogs = intern ? storeState.weeklyLogs.filter((w) => w.internship_id === intern.id) : [];
  const entries = storeState.logEntries;
  const confirmations = storeState.supervisorConfirmations;

  if (!showcase || !student || !showcase.is_public) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Showcase Profile Private or Not Found</h1>
        <p className="text-xs text-slate-500">
          This student portfolio has either not been published or does not exist.
        </p>
        <Link href="/" className="inline-block text-xs font-bold text-blue-700 hover:underline">
          Return to InternTrack Home
        </Link>
      </div>
    );
  }

  const visibility = showcase.visibility_json;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border shadow-lg p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-800 text-white flex items-center justify-center font-black text-2xl shadow-md">
                {student.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900">{student.name}</h1>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    ET740
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Roll No: {student.roll_no} • Don Bosco College of Engineering
                </p>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Department of {student.department}
                </p>
              </div>
            </div>

            {visibility.badges && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-right space-y-1">
                <div className="inline-flex items-center gap-1.5 font-bold text-xs">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Verified Intern</span>
                </div>
                <p className="text-[10px] text-emerald-700">Course ET740 • 8 Weeks</p>
              </div>
            )}
          </div>

          {/* Headline */}
          <div className="pt-2 border-t">
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
              {showcase.headline}
            </p>
          </div>

          {/* Company Details if visible */}
          {visibility.company && intern && (
            <div className="p-4 rounded-2xl bg-slate-50 border space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Industry Partner & Project
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{intern.company_name}</h3>
                  <p className="text-slate-600 text-[11px]">{intern.address}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="font-semibold text-slate-800">Mode: {intern.mode.toUpperCase()}</span>
                  <p className="text-slate-500 text-[11px]">Domain: {intern.domain}</p>
                </div>
              </div>
            </div>
          )}

          {/* Technical Skills */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Verified Technical Competencies
            </span>
            <div className="flex flex-wrap gap-1.5">
              {showcase.skills_tags.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5"
                >
                  <Tag className="w-3 h-3 text-blue-600" />
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Weekly Highlights if visible */}
          {visibility.logs && weeklyLogs.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                8-Week Technical Highlights
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {weeklyLogs.map((w) => {
                  const weekEntries = entries.filter((e) => e.weekly_log_id === w.id);
                  const isConfirmed = confirmations.some((c) => c.weekly_log_id === w.id && c.status === 'confirmed');

                  return (
                    <div key={w.id} className="p-3 rounded-xl border bg-slate-50/70 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Week {w.week_no}</span>
                        {isConfirmed && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-2">
                        {weekEntries[0]?.content || 'Completed scheduled milestone tasks.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Institutional Footer */}
          <div className="pt-6 border-t text-center text-xs text-slate-400">
            <p>Don Bosco College of Engineering • Course ET740 BE Sem VII Internship</p>
            <p className="text-[10px] mt-0.5">Authenticity verified by institutional supervisor audit trail.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
