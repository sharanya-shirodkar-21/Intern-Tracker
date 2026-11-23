'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Mail, Clock, Send, ShieldCheck, User, Trash2, Lock, Shield } from 'lucide-react';
import Link from 'next/link';

export default function OutboxPage() {
  const { storeState, currentUser, currentRole, refreshStore } = useAuth();

  const isStudent = currentRole === 'student';
  const isGuide = currentRole === 'guide';
  const isCoordinator = currentRole === 'coordinator';

  // Strict role-based outbox filtering:
  // - Students ONLY see emails delivered directly to their own email address
  // - Mentors/Faculty guides see emails for themselves or their assigned mentees
  // - Coordinator sees the department system outbox
  const visibleEmails = useMemo(() => {
    if (!currentUser) return [];

    if (isStudent) {
      return storeState.outbox.filter(
        (e) => e.to.toLowerCase() === currentUser.email.toLowerCase()
      );
    }

    if (isGuide) {
      const myAssignments = storeState.guideAssignments.filter((a) => a.guide_id === currentUser.id);
      const menteeIds = myAssignments.map((a) => a.student_id);
      const menteeEmails = storeState.profiles
        .filter((p) => menteeIds.includes(p.id))
        .map((p) => p.email.toLowerCase());

      return storeState.outbox.filter(
        (e) =>
          e.to.toLowerCase() === currentUser.email.toLowerCase() ||
          menteeEmails.includes(e.to.toLowerCase())
      );
    }

    return storeState.outbox;
  }, [storeState.outbox, storeState.guideAssignments, storeState.profiles, currentUser, isStudent, isGuide]);

  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(
    visibleEmails[0]?.id || null
  );

  const selectedEmail = visibleEmails.find((e) => e.id === selectedEmailId) || visibleEmails[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {isStudent ? 'My In-App Mailbox' : isGuide ? 'Mentorship Email Logs' : 'In-App Email Outbox'}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              isStudent
                ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                : isGuide
                ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
            }`}>
              {isStudent
                ? `Private to ${currentUser?.name}`
                : isGuide
                ? 'Assigned Mentees & Self'
                : 'Coordinator System Outbox'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isStudent
              ? `Official reminder emails, deliverable nudges, and OTPs sent directly to ${currentUser?.email}. Other students cannot view your mail.`
              : isGuide
              ? `System emails sent to you or your assigned 10 mentees. Department-wide emails are restricted to the coordinator.`
              : 'All system-generated emails (Supervisor OTPs, secure links, deadline reminders, comments) captured across the department.'}
          </p>
        </div>

        {isStudent && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Strict Role Isolation Active</span>
          </div>
        )}
      </div>

      {visibleEmails.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 shadow-sm">
          <Mail className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">
            {isStudent ? 'Your Mailbox is Empty' : 'No Emails Found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {isStudent
              ? `No reminders or notices have been dispatched to ${currentUser?.email} yet. When your coordinator or guide sends a nudge, it will appear here.`
              : 'No system emails matching your mentorship group have been logged yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px]">
          {/* Email List Column */}
          <div className="md:col-span-5 border-r border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[650px]">
            {visibleEmails.map((mail) => {
              const isSelected = selectedEmail?.id === mail.id;
              return (
                <button
                  key={mail.id}
                  onClick={() => setSelectedEmailId(mail.id)}
                  className={`w-full text-left p-4 transition flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-l-blue-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                      {mail.to}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(mail.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {mail.subject}
                  </p>
                  <span className="inline-block w-fit text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {mail.type}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Email Preview Column */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between">
            {selectedEmail ? (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                      Type: {selectedEmail.type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Sent: {new Date(selectedEmail.sent_at).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedEmail.subject}</h2>
                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p><span className="font-semibold text-slate-800 dark:text-slate-200">To:</span> {selectedEmail.to}</p>
                    <p><span className="font-semibold text-slate-800 dark:text-slate-200">From:</span> notifications@dbce.edu</p>
                  </div>
                </div>

                {/* Body Render */}
                <div 
                  className="prose prose-sm max-w-none text-slate-800 dark:text-slate-200 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select an email to view its content.</p>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>DBCE InternTrack Outbox Logger</span>
              <span>ET740 • BE Semester VII</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
