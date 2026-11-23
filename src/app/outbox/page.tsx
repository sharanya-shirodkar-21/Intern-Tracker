'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Mail, Clock, Send, ShieldCheck, User, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function OutboxPage() {
  const { storeState, refreshStore } = useAuth();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(
    storeState.outbox[0]?.id || null
  );

  const emails = storeState.outbox;
  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">In-App Email Outbox</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Zero-Config Demo Simulator
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            All system-generated emails (Supervisor OTPs, secure links, deadline reminders, comments) are captured here in real-time.
          </p>
        </div>
      </div>

      {emails.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center space-y-3">
          <Mail className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700">Outbox is Empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When supervisor links are generated, reminders are triggered, or OTPs are requested, the emails will display here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-xl border shadow-sm overflow-hidden min-h-[500px]">
          {/* Email List Column */}
          <div className="md:col-span-5 border-r border-slate-200 divide-y overflow-y-auto max-h-[650px]">
            {emails.map((mail) => {
              const isSelected = selectedEmail?.id === mail.id;
              return (
                <button
                  key={mail.id}
                  onClick={() => setSelectedEmailId(mail.id)}
                  className={`w-full text-left p-4 transition flex flex-col gap-1.5 ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-l-blue-700' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">{mail.to}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(mail.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">{mail.subject}</p>
                  <span className="inline-block w-fit text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-700 border">
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
                <div className="border-b pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Type: {selectedEmail.type}
                    </span>
                    <span className="text-xs text-slate-400">
                      Sent on: {new Date(selectedEmail.sent_at).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{selectedEmail.subject}</h2>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p><span className="font-semibold text-slate-800">To:</span> {selectedEmail.to}</p>
                    <p><span className="font-semibold text-slate-800">From:</span> notifications@dbce.edu</p>
                  </div>
                </div>

                {/* Body Render */}
                <div 
                  className="prose prose-sm max-w-none text-slate-800 p-4 rounded-lg bg-slate-50 border text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select an email to view its content.</p>
            )}

            <div className="pt-4 border-t text-[11px] text-slate-400 flex items-center justify-between">
              <span>DBCE InternTrack Outbox Logger</span>
              <span>ET740 • BE Semester VII</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
