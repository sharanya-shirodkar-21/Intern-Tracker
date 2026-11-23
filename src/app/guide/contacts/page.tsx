'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { StoreManager } from '@/lib/store';
import { 
  PhoneCall, 
  Calendar, 
  MapPin, 
  User, 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Building2,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { GuideContact, ContactType } from '@/types/database';

export default function GuideContactsPage() {
  const { currentUser, storeState, refreshStore } = useAuth();
  const guide = currentUser;

  // Assigned students
  const assignments = storeState.guideAssignments.filter((a) => a.guide_id === guide?.id);
  const assignedStudentIds = assignments.map((a) => a.student_id);
  const myStudents = storeState.profiles.filter((p) => assignedStudentIds.includes(p.id));
  const myInternships = storeState.internships.filter((i) => assignedStudentIds.includes(i.student_id));

  // Contacts
  const contacts = storeState.guideContacts.filter((c) => c.guide_id === guide?.id);

  const [formData, setFormData] = useState({
    internship_id: myInternships[0]?.id || '',
    type: 'online' as ContactType,
    contact_date: new Date().toISOString().split('T')[0],
    with_whom: '',
    summary: '',
    outcome: 'Satisfactory progress. Student demonstrating good discipline.',
    follow_up_date: '',
  });

  const [message, setMessage] = useState<string | null>(null);

  const handleStudentChange = (internId: string) => {
    const selectedIntern = myInternships.find((i) => i.id === internId);
    setFormData((prev) => ({
      ...prev,
      internship_id: internId,
      with_whom: selectedIntern ? `${selectedIntern.supervisor_name} (${selectedIntern.supervisor_designation})` : '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guide || !formData.internship_id) return;

    const store = StoreManager.getInstance();
    const state = store.getState();

    const newContact: GuideContact = {
      id: `contact-${Date.now()}`,
      internship_id: formData.internship_id,
      guide_id: guide.id,
      type: formData.type,
      contact_date: formData.contact_date,
      with_whom: formData.with_whom,
      summary: formData.summary,
      outcome: formData.outcome,
      follow_up_date: formData.follow_up_date || undefined,
      created_at: new Date().toISOString(),
    };

    state.guideContacts.unshift(newContact);
    store.addAuditLog(guide.id, 'RECORD_INDUSTRY_CONTACT', 'guide_contacts', newContact.id, null, newContact);
    store.saveState();
    refreshStore();

    setMessage('Industry interaction successfully logged to journal and audit trail!');
    setFormData({
      ...formData,
      summary: '',
    });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/guide" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Industry Interaction Journal</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Record and review faculty visits, phone conferences, and online calls with external supervisors.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* Grid: Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b">
            <PhoneCall className="w-4 h-4 text-purple-700" />
            Record Interaction with Industry Supervisor
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Student & Company *</label>
              <select
                required
                value={formData.internship_id}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="" disabled>-- Choose an assigned student --</option>
                {myInternships.map((intern) => {
                  const student = myStudents.find((s) => s.id === intern.student_id);
                  return (
                    <option key={intern.id} value={intern.id}>
                      {student?.roll_no}: {student?.name} — {intern.company_name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Interaction Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="online">Online Conference (Meet/Zoom)</option>
                  <option value="phone">Telephone Call</option>
                  <option value="visit">Physical Industry Visit</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date of Contact *</label>
                <input
                  type="date"
                  required
                  value={formData.contact_date}
                  onChange={(e) => setFormData({ ...formData, contact_date: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Person Spoken To *</label>
              <input
                type="text"
                required
                value={formData.with_whom}
                onChange={(e) => setFormData({ ...formData, with_whom: e.target.value })}
                placeholder="e.g. Cdr. K. V. Rao (Chief Engineer)"
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Summary of Discussion *</label>
              <textarea
                required
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Discussed student punctuality, project progress, and mentor evaluation..."
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Outcome / Observations *</label>
              <input
                type="text"
                required
                value={formData.outcome}
                onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Next Follow-Up Date (Optional)</label>
              <input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save to Interaction Journal</span>
              </button>
            </div>
          </form>
        </div>

        {/* History Column */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 pb-2 border-b">
            Logged Industry Contacts History ({contacts.length})
          </h2>

          {contacts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No interactions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {contacts.map((c) => {
                const intern = myInternships.find((i) => i.id === c.internship_id);
                const student = myStudents.find((s) => s.id === intern?.student_id);

                return (
                  <div key={c.id} className="p-4 rounded-xl border bg-slate-50 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{student?.name}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                          {c.type}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">{c.contact_date}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium">
                      Company: <b>{intern?.company_name}</b> • Spoke With: <b>{c.with_whom}</b>
                    </p>

                    <div className="p-2.5 rounded bg-white border text-slate-800 leading-relaxed">
                      <p className="font-semibold text-slate-900 text-[11px]">Discussion Summary:</p>
                      <p className="mt-0.5">{c.summary}</p>
                    </div>

                    {c.outcome && (
                      <p className="text-[11px] text-emerald-800">
                        <b>Outcome:</b> {c.outcome}
                      </p>
                    )}

                    {c.follow_up_date && (
                      <p className="text-[10px] text-slate-400">
                        Scheduled Follow-up: <b>{c.follow_up_date}</b>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
