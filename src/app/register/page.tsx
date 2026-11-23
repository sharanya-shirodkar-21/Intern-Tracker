'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { StoreManager } from '@/lib/store';
import { 
  Building2, 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { Internship, WeeklyLog, SupervisorLink } from '@/types/database';

export default function RegisterPage() {
  const router = useRouter();
  const { storeState, switchUser, refreshStore } = useAuth();

  const students = storeState.profiles.filter((p) => p.role === 'student');
  // Find unregistered students
  const unregisteredStudents = students.filter(
    (s) => !storeState.internships.some((i) => i.student_id === s.id)
  );

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    unregisteredStudents[0]?.id || students[0]?.id || ''
  );

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const [formData, setFormData] = useState({
    company_name: 'Optimus IoT Systems Pvt Ltd',
    address: 'Plot 45, Verna Industrial Estate, Goa 403722',
    company_email: 'internships@optimusiot.com',
    company_phone: '0832-2783900',
    supervisor_name: 'Dr. Vikram Naik',
    supervisor_designation: 'VP of Embedded Hardware',
    supervisor_email: 'vikram.naik@optimusiot.com',
    start_date: '2024-07-01',
    end_date: '2024-08-25',
    mode: 'onsite' as 'onsite' | 'remote' | 'hybrid',
    domain: 'Embedded Firmware & CAN Bus Networks',
  });

  const [success, setSuccess] = useState(false);

  const handleQuickFill = () => {
    setFormData({
      company_name: 'Optimus IoT Systems Pvt Ltd',
      address: 'Plot 45, Verna Industrial Estate, Goa 403722',
      company_email: 'internships@optimusiot.com',
      company_phone: '0832-2783900',
      supervisor_name: 'Dr. Vikram Naik',
      supervisor_designation: 'VP of Embedded Hardware',
      supervisor_email: 'vikram.naik@optimusiot.com',
      start_date: '2024-07-01',
      end_date: '2024-08-25',
      mode: 'onsite',
      domain: 'Embedded Firmware & CAN Bus Networks',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const store = StoreManager.getInstance();
    const state = store.getState();

    // 1. Create or update internship
    const newInternId = `intern-${Date.now()}`;
    const newInternship: Internship = {
      id: newInternId,
      student_id: selectedStudent.id,
      company_name: formData.company_name,
      address: formData.address,
      company_email: formData.company_email,
      company_phone: formData.company_phone,
      supervisor_name: formData.supervisor_name,
      supervisor_designation: formData.supervisor_designation,
      supervisor_email: formData.supervisor_email,
      start_date: formData.start_date,
      end_date: formData.end_date,
      mode: formData.mode,
      domain: formData.domain,
      status: 'registered',
      created_at: new Date().toISOString(),
    };

    // Remove old if exists and add new
    const filteredInternships = state.internships.filter((i) => i.student_id !== selectedStudent.id);
    state.internships = [...filteredInternships, newInternship];

    // 2. Generate the 8 weekly logs derived from start_date
    const filteredWeeklyLogs = state.weeklyLogs.filter((w) => w.internship_id !== newInternId);
    const newLogs: WeeklyLog[] = [];
    const baseDate = new Date(formData.start_date);

    for (let w = 1; w <= 8; w++) {
      const wStart = new Date(baseDate);
      wStart.setDate(baseDate.getDate() + (w - 1) * 7);

      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 6);

      newLogs.push({
        id: `week-${newInternId}-${w}`,
        internship_id: newInternId,
        week_no: w,
        week_start: wStart.toISOString().split('T')[0],
        week_end: wEnd.toISOString().split('T')[0],
        locked_at: null,
        prev_hash: w === 1 ? '0000000000000000000000000000000000000000000000000000000000000000' : null,
        hash: null,
        created_at: new Date().toISOString(),
      });
    }
    state.weeklyLogs = [...filteredWeeklyLogs, ...newLogs];

    // 3. Create supervisor link + 6-digit OTP
    const rawToken = `tok_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const supLink: SupervisorLink = {
      id: `suplink-${Date.now()}`,
      internship_id: newInternId,
      token_hash: rawToken,
      raw_token: rawToken,
      otp_code: otp,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    };
    state.supervisorLinks = [...state.supervisorLinks.filter((l) => l.internship_id !== newInternId), supLink];

    // 4. Log audit and outbox notification
    store.addAuditLog(
      selectedStudent.id,
      'REGISTER_INTERNSHIP',
      'internships',
      newInternId,
      undefined,
      newInternship
    );

    store.addOutboxEmail(
      formData.supervisor_email,
      `InternTrack: Supervisor Verification Link for ${selectedStudent.name}`,
      `<p>Dear ${formData.supervisor_name},<br/>Your intern <b>${selectedStudent.name}</b> (${selectedStudent.roll_no}) has registered their 8-week internship at ${formData.company_name}.<br/>Use verification code: <b>${otp}</b> to confirm weekly progress.</p>`,
      'supervisor_invitation'
    );

    store.saveState();
    switchUser(selectedStudent);
    refreshStore();

    setSuccess(true);
    setTimeout(() => {
      router.push('/student');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            BE Semester VII Internship Registration
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Course ET740 • 8 Weeks Industrial Training • Don Bosco College of Engineering
          </p>
        </div>

        <button
          type="button"
          onClick={handleQuickFill}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold shadow-sm hover:bg-amber-200 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Demo Fill</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-sm font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p>Registration Successful!</p>
            <p className="text-xs font-normal text-emerald-700 dark:text-emerald-300">
              Generated 8-week progress logs, derived dates, and dispatched supervisor token. Redirecting to Student Dashboard...
            </p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-8">
        {/* Step 1: Student Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              1. Enrolling Student Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Select Student to Register *
              </label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
              >
                {unregisteredStudents.length > 0 && (
                  <optgroup label="Unregistered Students (Ready to Enroll):">
                    {unregisteredStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        ⭐ {s.roll_no}: {s.name} ({s.email})
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="All Cohort Students:">
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.roll_no}: {s.name} ({s.email})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {selectedStudent && (
              <>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedStudent.department}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Batch & Semester</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    Batch {selectedStudent.batch} • Sem {selectedStudent.semester}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Step 2: Company Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              2. Industrial Training Organization
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Company / Industry Name *</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Company Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Official Company Email</label>
              <input
                type="email"
                required
                value={formData.company_email}
                onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Company Contact Phone</label>
              <input
                type="tel"
                required
                value={formData.company_phone}
                onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Industry Supervisor */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              3. Industry Supervisor Details (For Verification Link)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Supervisor Full Name *</label>
              <input
                type="text"
                required
                value={formData.supervisor_name}
                onChange={(e) => setFormData({ ...formData, supervisor_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Designation *</label>
              <input
                type="text"
                required
                value={formData.supervisor_designation}
                onChange={(e) => setFormData({ ...formData, supervisor_designation: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Supervisor Email *</label>
              <input
                type="email"
                required
                value={formData.supervisor_email}
                onChange={(e) => setFormData({ ...formData, supervisor_email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Dates & Domain */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              4. Duration, Mode & Technical Domain
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">End Date (8 Wks) *</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Mode *</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="onsite">On-Site Industrial</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Technical Domain *</label>
              <input
                type="text"
                required
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancel & Return to Login
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-lg transition"
          >
            <span>Complete Registration & Open Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
