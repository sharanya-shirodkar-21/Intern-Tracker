'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { StoreManager } from '@/lib/store';
import { 
  CheckCircle2, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Download, 
  Sparkles, 
  ArrowLeft, 
  Save, 
  Share2, 
  Award,
  Globe,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { ShowcaseProfile } from '@/types/database';

export default function StudentShowcaseEditorPage() {
  const { currentUser, storeState, refreshStore } = useAuth();
  const student = currentUser;

  const intern = storeState.internships.find((i) => i.student_id === student?.id);
  const existingProfile = storeState.showcaseProfiles.find((s) => s.student_id === student?.id);

  const defaultSlug = `${student?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${student?.roll_no?.toLowerCase() || 'intern'}`;

  const [formData, setFormData] = useState<ShowcaseProfile>({
    student_id: student?.id || '',
    is_public: existingProfile ? existingProfile.is_public : true,
    slug: existingProfile?.slug || defaultSlug,
    headline: existingProfile?.headline || `Electronics & Telecommunication Intern @ ${intern?.company_name || 'Engineering'}`,
    skills_tags: existingProfile?.skills_tags || [
      'Embedded C', 'Microcontrollers', 'CAN Bus', 'Signal Analysis', 'Firmware Debugging', 'IoT Protocols'
    ],
    visibility_json: existingProfile?.visibility_json || {
      company: true,
      domain: true,
      logs: true,
      badges: true,
    },
  });

  const [newTag, setNewTag] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggleVisibility = (key: keyof ShowcaseProfile['visibility_json']) => {
    setFormData((prev) => ({
      ...prev,
      visibility_json: {
        ...prev.visibility_json,
        [key]: !prev.visibility_json[key],
      },
    }));
  };

  const handleAddTag = () => {
    if (!newTag.trim() || formData.skills_tags.includes(newTag.trim())) return;
    setFormData((prev) => ({
      ...prev,
      skills_tags: [...prev.skills_tags, newTag.trim()],
    }));
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      skills_tags: prev.skills_tags.filter((t) => t !== tag),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const store = StoreManager.getInstance();
    const state = store.getState();

    const existingIdx = state.showcaseProfiles.findIndex((s) => s.student_id === student.id);
    if (existingIdx >= 0) {
      state.showcaseProfiles[existingIdx] = formData;
    } else {
      state.showcaseProfiles.push(formData);
    }

    store.addAuditLog(student.id, 'UPDATE_SHOWCASE_PROFILE', 'showcase_profiles', student.id, null, formData);
    store.saveState();
    refreshStore();

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/student" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Internship Showcase Portfolio
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Build your opt-in public profile, showcase auto-extracted skills, and generate your 1-page internship résumé card.
          </p>
        </div>

        {formData.is_public && (
          <Link
            href={`/showcase/${formData.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Live Public Portfolio</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Showcase profile preferences updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Form Settings */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border shadow-sm space-y-6 text-xs">
          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border">
            <div>
              <p className="font-bold text-slate-900 text-sm">Public Portfolio Visibility</p>
              <p className="text-slate-500 text-[11px]">
                {formData.is_public
                  ? 'Your portfolio is public and accessible via shareable link and QR code.'
                  : 'Your portfolio is currently private.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
              className={`p-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                formData.is_public
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {formData.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{formData.is_public ? 'Public' : 'Private'}</span>
            </button>
          </div>

          {/* Profile URL Slug */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Public Profile Slug</label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-slate-100 border border-r-0 rounded-l-lg text-slate-500 font-mono text-xs">
                /showcase/
              </span>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full p-2 border rounded-r-lg font-mono text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Professional Headline */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Professional Internship Headline</label>
            <input
              type="text"
              required
              value={formData.headline || ''}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="w-full p-2.5 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Skills Tags */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">Verified Technical Skills (Auto-Extracted)</label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border bg-slate-50 min-h-[48px]">
              {formData.skills_tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-200"
                >
                  <Tag className="w-3 h-3 text-blue-600" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-slate-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add custom skill (e.g. Python, STM32, RTOS)..."
                className="w-full p-2 border rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold text-xs"
              >
                Add
              </button>
            </div>
          </div>

          {/* Section Visibility Controls */}
          <div className="space-y-2 pt-2 border-t">
            <label className="font-bold text-slate-700 block">Choose Visible Sections</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'company', label: 'Company & Supervisor Info' },
                { key: 'domain', label: 'Technical Domain & Mode' },
                { key: 'logs', label: 'Weekly Highlights' },
                { key: 'badges', label: 'Verified Supervisor Stamp' },
              ].map(({ key, label }) => {
                const isChecked = formData.visibility_json[key as keyof ShowcaseProfile['visibility_json']];
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => handleToggleVisibility(key as any)}
                    className={`p-2.5 rounded-lg border text-left transition flex items-center justify-between ${
                      isChecked ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold' : 'bg-white text-slate-500'
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-[10px] uppercase font-bold">{isChecked ? 'Visible' : 'Hidden'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t">
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow transition"
            >
              Save Showcase Preferences
            </button>
          </div>
        </div>

        {/* Right Column: Mini Preview Card */}
        <div className="md:col-span-5 space-y-4">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-500 block">
            Live Preview Card
          </span>

          <div className="bg-white rounded-2xl border p-6 shadow-md space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-base shadow">
                {student?.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{student?.name}</h3>
                <p className="text-[11px] text-slate-500 font-mono">{student?.roll_no} • Class of 2025</p>
              </div>
            </div>

            <p className="font-semibold text-slate-800 leading-snug">{formData.headline}</p>

            {formData.visibility_json.company && intern && (
              <div className="p-3 rounded-lg bg-slate-50 border space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Industry Partner</span>
                <p className="font-bold text-slate-900">{intern.company_name}</p>
                <p className="text-[11px] text-slate-500">{intern.mode.toUpperCase()} • {intern.domain}</p>
              </div>
            )}

            {formData.visibility_json.badges && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-[10px]">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Industry Internship Seal</span>
              </div>
            )}

            <div className="flex flex-wrap gap-1 pt-2">
              {formData.skills_tags.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
