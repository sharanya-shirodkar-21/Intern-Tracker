'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { StoreManager } from '@/lib/store';
import { 
  Building2, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  ArrowLeft, 
  CheckCircle,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Internship, WeeklyLog, SupervisorLink } from '@/types/database';

export default function StudentRegisterPage() {
  const router = useRouter();
  const { currentUser, storeState, refreshStore } = useAuth();
  const student = currentUser;

  const existingIntern = storeState.internships.find((i) => i.student_id === student?.id);

  const [formData, setFormData] = useState({
    company_name: existingIntern?.company_name || '',
    address: existingIntern?.address || '',
    company_email: existingIntern?.company_email || '',
    company_phone: existingIntern?.company_phone || '',
    supervisor_name: existingIntern?.supervisor_name || '',
    supervisor_designation: existingIntern?.supervisor_designation || '',
    supervisor_email: existingIntern?.supervisor_email || '',
    start_date: existingIntern?.start_date || '2024-07-01',
    end_date: existingIntern?.end_date || '2024-08-25',
    mode: existingIntern?.mode || 'onsite',
    domain: existingIntern?.domain || 'Embedded Systems & IoT',
  });

  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const store = StoreManager.getInstance();
    const state = store.getState();

    const internId = existingIntern?.id || `intern-${Date.now()}`;
    const newIntern: Internship = {
      id: internId,
      student_id: student.id,
      company_name: formData.company_name,
      address: formData.address,
      company_email: formData.company_email,
      company_phone: formData.company_phone,
      supervisor_name: formData.supervisor_name,
      supervisor_designation: formData.supervisor_designation,
      supervisor_email: formData.supervisor_email,
      start_date: formData.start_date,
      end_date: formData.end_date,
      mode: formData.mode as any,
      domain: formData.domain,
      status: 'registered',
      created_at: existingIntern?.created_at || new Date().toISOString(),
    };

    // Upsert internship
    const existingIdx = state.internships.findIndex((i) => i.student_id === student.id);
    if (existingIdx >= 0) {
      state.internships[existingIdx] = newIntern;
    } else {
      state.internships.push(newIntern);
    }

    // Pre-render 8 Weekly Logs from start_date
    const existingLogs = state.weeklyLogs.filter((w) => w.internship_id === internId);
    if (existingLogs.length === 0) {
      const generatedLogs: WeeklyLog[] = [];
      const baseDate = new Date(`${formData.start_date}T00:00:00Z`);

      for (let w = 1; w <= 8; w++) {
        const wStart = new Date(baseDate);
        wStart.setUTCDate(wStart.getUTCDate() + (w - 1) * 7);
        const wEnd = new Date(wStart);
        wEnd.setUTCDate(wEnd.getUTCDate() + 6);

        const wStartStr = wStart.toISOString().split('T')[0];
        const wEndStr = wEnd.toISOString().split('T')[0];

        generatedLogs.push({
          id: `wlog-${internId}-${w}`,
          internship_id: internId,
          week_no: w,
          week_start: wStartStr,
          week_end: wEndStr,
          prev_hash: w === 1 ? 'GENESIS-0000000000000000000000000000000000000000000000000000000000000000' : undefined,
          created_at: new Date().toISOString(),
        });
      }
      state.weeklyLogs.push(...generatedLogs);
    }

    // Ensure Supervisor Link exists
    const existingLink = state.supervisorLinks.find((l) => l.internship_id === internId);
    if (!existingLink) {
      const rawToken = `tok-${student.roll_no?.toLowerCase() || 'st'}-${Date.now()}`;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const newLink: SupervisorLink = {
        id: `suplink-${Date.now()}`,
        internship_id: internId,
        token_hash: `hash-${rawToken}`,
        raw_token: rawToken,
        otp_code: otp,
        otp_expires_at: '2026-12-31T23:59:59Z',
        expires_at: '2026-12-31T23:59:59Z',
        created_at: new Date().toISOString(),
      };
      state.supervisorLinks.push(newLink);

      // Dispatch invite email to outbox
      store.addOutboxEmail(
        formData.supervisor_email,
        `InternTrack: Supervisor Verification Link for ${student.name} (${student.roll_no})`,
        `<p>Dear ${formData.supervisor_name},<br/>You have been designated as the industry supervisor for <b>${student.name}</b> (${student.roll_no}) at ${formData.company_name}.</p><p>Please access the student's weekly progress portal using this secure link:<br/><a href="http://localhost:3000/supervisor/verify/${rawToken}">http://localhost:3000/supervisor/verify/${rawToken}</a></p><p>Your 6-digit confirmation OTP is: <b>${otp}</b></p>`,
        'supervisor_invite'
      );
    }

    store.addAuditLog(student.id, 'REGISTER_INTERNSHIP', 'internships', internId, null, newIntern);
    store.saveState();
    refreshStore();

    setMessage('Internship registered successfully! 8 weekly log periods generated.');
    setTimeout(() => {
      router.push('/student');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/student" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {existingIntern ? 'Edit Internship Registration' : 'Register BE Semester VII Internship'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Course ET740 • 8 Weeks. Details will populate official Appendix B1 Group List and Appendix B2 weekly sheets.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border shadow-sm p-6 space-y-6 text-xs">
        {/* Section 1: Company Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Building2 className="w-4 h-4 text-blue-700" />
            <h2 className="font-bold text-sm text-slate-900">1. Company / Organization Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Company / Industry Name *</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="e.g. Goa Shipyard Limited, Siemens Healthineers, D-Link"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Full Postal Address *</label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Plot / Street, Industrial Estate, City, State, PIN"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Company Contact Email *</label>
              <input
                type="email"
                required
                value={formData.company_email}
                onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                placeholder="hr@company.com"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Company Contact Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.company_phone}
                onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                placeholder="0832-2512152"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Industry Supervisor */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b">
            <User className="w-4 h-4 text-purple-700" />
            <h2 className="font-bold text-sm text-slate-900">2. External Industry Supervisor Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Supervisor Full Name *</label>
              <input
                type="text"
                required
                value={formData.supervisor_name}
                onChange={(e) => setFormData({ ...formData, supervisor_name: e.target.value })}
                placeholder="e.g. Cdr. K. V. Rao"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Designation *</label>
              <input
                type="text"
                required
                value={formData.supervisor_designation}
                onChange={(e) => setFormData({ ...formData, supervisor_designation: e.target.value })}
                placeholder="e.g. Chief Engineer (Electronics)"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Supervisor Work Email *</label>
              <input
                type="email"
                required
                value={formData.supervisor_email}
                onChange={(e) => setFormData({ ...formData, supervisor_email: e.target.value })}
                placeholder="supervisor@company.com"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Expiring verification link & OTP will be dispatched here.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Internship Schedule & Domain */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <h2 className="font-bold text-sm text-slate-900">3. Internship Schedule & Technical Domain</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Start Date (Week 1) *</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">End Date (Week 8) *</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Internship Mode *</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 text-xs"
              >
                <option value="onsite">On-Site (At Company Facility)</option>
                <option value="hybrid">Hybrid (Mixed Onsite/Remote)</option>
                <option value="remote">Remote (Virtual)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Technical Domain / Role *</label>
              <input
                type="text"
                required
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="e.g. Embedded C, Signal Processing"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t flex items-center justify-between">
          <Link href="/student" className="text-slate-500 hover:text-slate-800">
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>Save & Generate Appendix B2 Weekly Tables</span>
          </button>
        </div>
      </form>
    </div>
  );
}
