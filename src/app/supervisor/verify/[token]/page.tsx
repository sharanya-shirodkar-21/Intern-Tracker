'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { StoreManager } from '@/lib/store';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Lock, 
  Clock, 
  Building2, 
  User, 
  Check, 
  Flag, 
  ExternalLink,
  Mail
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { SupervisorConfirmation } from '@/types/database';

export default function SupervisorVerifyPage() {
  const params = useParams();
  const token = params?.token as string;

  const { storeState, refreshStore } = useAuth();

  // Find link by token
  const link = storeState.supervisorLinks.find(
    (l) => l.raw_token === token || l.token_hash === `hash-${token}`
  );

  const intern = link ? storeState.internships.find((i) => i.id === link.internship_id) : null;
  const student = intern ? storeState.profiles.find((p) => p.id === intern.student_id) : null;

  const weeklyLogs = intern
    ? storeState.weeklyLogs
        .filter((w) => w.internship_id === intern.id)
        .sort((a, b) => a.week_no - b.week_no)
    : [];

  const entries = storeState.logEntries;
  const confirmations = storeState.supervisorConfirmations;

  // OTP state
  const [isOtpUnlocked, setIsOtpUnlocked] = useState<boolean>(false);
  const [inputOtp, setInputOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpResent, setOtpResent] = useState<boolean>(false);

  // Action status
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [flagComment, setFlagComment] = useState<{ weekId: string; text: string } | null>(null);

  if (!link || !intern || !student) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Invalid or Expired Verification Link</h1>
        <p className="text-xs text-slate-500">
          This supervisor verification link does not exist, has expired, or has been revoked by the institution.
        </p>
      </div>
    );
  }

  // Handle OTP verification
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    // In demo mode or link OTP matching
    if (inputOtp.trim() === link.otp_code || inputOtp.trim() === '482915') {
      setIsOtpUnlocked(true);
    } else {
      setOtpError('Invalid OTP code. Please check your email or inspect the Demo Outbox.');
    }
  };

  const handleResendOtp = () => {
    const store = StoreManager.getInstance();
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    link.otp_code = newOtp;

    store.addOutboxEmail(
      intern.supervisor_email,
      `InternTrack: Your 6-Digit OTP Code for ${student.name}`,
      `<p>Dear ${intern.supervisor_name},<br/>Your 6-digit confirmation code is: <b>${newOtp}</b></p>`,
      'otp'
    );
    store.saveState();
    refreshStore();

    setOtpResent(true);
    setTimeout(() => setOtpResent(false), 4000);
  };

  // Confirm single week
  const handleConfirmWeek = (weeklyLogId: string) => {
    const store = StoreManager.getInstance();
    const state = store.getState();

    const existingIdx = state.supervisorConfirmations.findIndex((c) => c.weekly_log_id === weeklyLogId);
    const newConf: SupervisorConfirmation = {
      id: `conf-${Date.now()}-${weeklyLogId}`,
      weekly_log_id: weeklyLogId,
      token_hash: link.token_hash,
      status: 'confirmed',
      confirmed_by_name: intern.supervisor_name,
      confirmed_at: new Date().toISOString(),
      ip: '122.172.88.14',
      comment: 'Verified on-site performance.',
    };

    if (existingIdx >= 0) {
      state.supervisorConfirmations[existingIdx] = newConf;
    } else {
      state.supervisorConfirmations.push(newConf);
    }

    // Notify student
    store.addNotification(
      student.id,
      'Supervisor Verified Log',
      `${intern.supervisor_name} verified your weekly progress log.`,
      '/student/weekly-logs'
    );

    store.addAuditLog(
      'supervisor_token',
      'CONFIRM_WEEKLY_LOG',
      'supervisor_confirmations',
      newConf.id,
      null,
      newConf
    );
    store.saveState();
    refreshStore();

    setActionSuccess('Week verified and recorded to official B2 progress report!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Confirm All Weeks
  const handleConfirmAllWeeks = () => {
    const store = StoreManager.getInstance();
    const state = store.getState();

    weeklyLogs.forEach((w) => {
      const existingIdx = state.supervisorConfirmations.findIndex((c) => c.weekly_log_id === w.id);
      const conf: SupervisorConfirmation = {
        id: `conf-${Date.now()}-${w.id}`,
        weekly_log_id: w.id,
        token_hash: link.token_hash,
        status: 'confirmed',
        confirmed_by_name: intern.supervisor_name,
        confirmed_at: new Date().toISOString(),
        ip: '122.172.88.14',
        comment: 'All weekly logs confirmed and approved.',
      };

      if (existingIdx >= 0) {
        state.supervisorConfirmations[existingIdx] = conf;
      } else {
        state.supervisorConfirmations.push(conf);
      }
    });

    store.addNotification(
      student.id,
      'Supervisor Confirmed All Weeks',
      `${intern.supervisor_name} confirmed all your weekly internship logs!`,
      '/student/weekly-logs'
    );

    store.addAuditLog(
      'supervisor_token',
      'CONFIRM_ALL_WEEKS',
      'supervisor_confirmations',
      intern.id,
      null,
      { count: weeklyLogs.length }
    );
    store.saveState();
    refreshStore();

    setActionSuccess('All weeks confirmed and stamped with supervisor verification!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Official Industry Supervisor Verification Portal
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-1">
              Don Bosco College of Engineering — Course ET740
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              BE Semester VII Internship • 8-Week Progress Verification
            </p>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="text-slate-400">Supervisor:</span>
            <p className="font-bold text-slate-900">{intern.supervisor_name}</p>
            <p className="text-slate-500 font-mono text-[11px]">{intern.supervisor_email}</p>
          </div>
        </div>

        {/* Student Meta Pill */}
        <div className="p-3 rounded-xl bg-slate-50 border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Intern</span>
            <p className="font-bold text-slate-900">{student.name}</p>
            <p className="text-[11px] font-mono text-slate-500">{student.roll_no}</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Company</span>
            <p className="font-bold text-slate-900">{intern.company_name}</p>
            <p className="text-[11px] text-slate-500">{intern.mode}</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Duration</span>
            <p className="font-bold text-slate-900">8 Weeks</p>
            <p className="text-[11px] text-slate-500">
              {formatDate(intern.start_date)} — {formatDate(intern.end_date)}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Access Token</span>
            <p className="font-bold text-emerald-700">Authenticated Link</p>
            <p className="text-[10px] text-slate-400">Exp: {new Date(link.expires_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Step 1: OTP Challenge (if not unlocked) */}
      {!isOtpUnlocked ? (
        <div className="bg-white rounded-2xl border shadow-lg p-8 max-w-lg mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
            <Key className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Email OTP Verification Required</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              To prevent forwarded-link abuse and ensure institutional audit integrity, enter the 6-digit confirmation code dispatched to:
            </p>
            <p className="font-mono text-xs font-bold text-blue-900 mt-1">{intern.supervisor_email}</p>
          </div>

          {otpError && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs">
              {otpError}
            </div>
          )}

          {otpResent && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              New OTP code sent! Check your email or inspect the Demo Outbox.
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
            <div>
              <input
                type="text"
                required
                maxLength={6}
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                placeholder="Enter 6-digit OTP (e.g. 482915)"
                className="w-full text-center text-xl font-mono tracking-widest p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                (Demo Hint: Current active code is <b>{link.otp_code || '482915'}</b>)
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition"
              >
                Unlock & Verify Student Logs
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Resend OTP Code
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Step 2: Unlocked Weekly Progress Logs Review */
        <div className="space-y-6 animate-in fade-in-50">
          {actionSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{actionSuccess}</span>
            </div>
          )}

          {/* Quick Action Bar */}
          <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                Weekly Progress Reports (Weeks 1 to 8)
              </h3>
              <p className="text-xs text-slate-500">
                Confirm entries individually or one-click confirm the full period.
              </p>
            </div>

            <button
              onClick={handleConfirmAllWeeks}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
            >
              <Check className="w-4 h-4" />
              <span>Verify & Confirm All 8 Weeks</span>
            </button>
          </div>

          {/* 8 Weeks List */}
          <div className="space-y-4">
            {weeklyLogs.map((w) => {
              const weekEntries = entries.filter((e) => e.weekly_log_id === w.id);
              const confirmation = confirmations.find((c) => c.weekly_log_id === w.id);
              const isConfirmed = confirmation?.status === 'confirmed';

              return (
                <div
                  key={w.id}
                  className={`bg-white rounded-xl border p-5 shadow-sm space-y-3 transition ${
                    isConfirmed ? 'border-emerald-300 bg-emerald-50/20' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">Week {w.week_no}</span>
                      <span className="text-xs font-mono text-slate-500">
                        [{formatDate(w.week_start)} — {formatDate(w.week_end)}]
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified by Supervisor ({formatDate(confirmation.confirmed_at)})
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConfirmWeek(w.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm Week {w.week_no}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Entries */}
                  {weekEntries.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No daily log entries filed for this week.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 text-xs">
                      {weekEntries.map((e) => (
                        <div key={e.id} className="py-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 font-mono">{formatDate(e.entry_date)}</span>
                            <span className="text-[10px] text-slate-400">Specificity: {e.specificity_score || 85}%</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{e.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
