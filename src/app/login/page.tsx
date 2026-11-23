'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { 
  GraduationCap, 
  Shield, 
  UserCheck, 
  KeyRound, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  ExternalLink, 
  Building2, 
  CheckCircle2, 
  Lock, 
  UserPlus
} from 'lucide-react';
import { Profile } from '@/types/database';

export default function LoginPage() {
  const router = useRouter();
  const { storeState, switchUser, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'student' | 'guide' | 'coordinator' | 'supervisor'>('student');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const coordinator = storeState.profiles.find((p) => p.role === 'coordinator');
  const guides = storeState.profiles.filter((p) => p.role === 'guide');
  const students = storeState.profiles.filter((p) => p.role === 'student');

  // Key Student Demo Archetypes
  const featuredStudents = [
    { roll: '21ETC01', tag: 'On Track (Weeks 1-4 done, Supervisor verified)', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' },
    { roll: '21ETC03', tag: 'Behind (Week 2 overdue - Risk alert)', color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
    { roll: '21ETC11', tag: 'At Risk (Missing offer letter upload)', color: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800' },
    { roll: '21ETC27', tag: 'Unregistered (New Registration Demo)', color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
  ];

  // Supervisor link
  const aaravIntern = storeState.internships.find((i) => i.student_id === students[0]?.id);
  const supervisorLink = storeState.supervisorLinks.find((l) => l.internship_id === aaravIntern?.id);

  const handleDemoLogin = (user: Profile, destinationPath: string) => {
    switchUser(user);
    router.push(destinationPath);
  };

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const email = emailInput.trim().toLowerCase();
    const matchedUser = storeState.profiles.find(
      (p) => p.email.toLowerCase() === email || p.roll_no?.toLowerCase() === email
    );

    if (matchedUser) {
      switchUser(matchedUser);
      if (matchedUser.role === 'student') router.push('/student');
      else if (matchedUser.role === 'guide') router.push('/guide');
      else router.push('/coordinator');
    } else {
      setLoginError(
        `No account found matching "${emailInput}". Use one of the 1-click Demo Logins below or check your email.`
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      {/* College Header & Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold tracking-wide uppercase">
          <Building2 className="w-3.5 h-3.5" />
          <span>Don Bosco College of Engineering • Dept of ETC</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Sign In to InternTrack Portal
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Course ET740 • BE Semester VII Internship Management System. Choose your role below or enter your credentials.
        </p>
      </div>

      {/* Main Login Box: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 1-Click Interactive Demo Login (Hero Feature) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  1-Click Demo Persona Login
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Instant access without passwords. Perfect for evaluation and role testing.
              </p>
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Demo Active
            </span>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold">
            <button
              onClick={() => setActiveTab('student')}
              className={`py-2 px-1 rounded-lg transition text-center flex flex-col sm:flex-row items-center justify-center gap-1 ${
                activeTab === 'student'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`py-2 px-1 rounded-lg transition text-center flex flex-col sm:flex-row items-center justify-center gap-1 ${
                activeTab === 'guide'
                  ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Faculty Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('coordinator')}
              className={`py-2 px-1 rounded-lg transition text-center flex flex-col sm:flex-row items-center justify-center gap-1 ${
                activeTab === 'coordinator'
                  ? 'bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-200 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Internship Coordinator</span>
            </button>

            <button
              onClick={() => setActiveTab('supervisor')}
              className={`py-2 px-1 rounded-lg transition text-center flex flex-col sm:flex-row items-center justify-center gap-1 ${
                activeTab === 'supervisor'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Supervisor</span>
            </button>
          </div>

          {/* Tab 1: Students */}
          {activeTab === 'student' && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Featured Student Archetypes:
              </span>
              <div className="space-y-2">
                {featuredStudents.map((feat) => {
                  const s = students.find((st) => st.roll_no === feat.roll);
                  if (!s) return null;
                  const isCurrent = currentUser?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleDemoLogin(s, '/student')}
                      className={`w-full p-3.5 rounded-xl border text-left transition hover:shadow-md flex items-center justify-between ${
                        isCurrent
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</span>
                          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">({s.roll_no})</span>
                          {isCurrent && (
                            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-extrabold uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <span className={`inline-block text-[11px] px-2 py-0.5 rounded border font-medium ${feat.color}`}>
                          {feat.tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold text-xs flex-shrink-0">
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* All 30 Students Dropdown */}
              <div className="pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                  Or Sign In As Any Of The 30 Students:
                </label>
                <select
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                  onChange={(e) => {
                    const s = students.find((st) => st.id === e.target.value);
                    if (s) handleDemoLogin(s, '/student');
                  }}
                >
                  <option value="" disabled>
                    -- Select student by roll no / name --
                  </option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.roll_no}: {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Tab 2: Faculty Guides */}
          {activeTab === 'guide' && (
            <div className="space-y-3 animate-in fade-in-50 duration-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Assigned Faculty Guides (10 Students Each):
              </span>
              <div className="space-y-2.5">
                {guides.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleDemoLogin(g, '/guide')}
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-300 transition text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{g.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {g.department} • 10 Assigned Mentees
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-bold text-xs">
                      <span>Open Matrix</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Coordinator */}
          {activeTab === 'coordinator' && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Department Internship Coordinator:
              </span>
              {coordinator && (
                <button
                  onClick={() => handleDemoLogin(coordinator, '/coordinator')}
                  className="w-full p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50 dark:from-blue-950/60 to-slate-50 dark:to-slate-900 hover:shadow-lg transition text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold">
                      <Shield className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{coordinator.name}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Internship Coordinator & Head of Department
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
                        Full Administrative Control • Batch 2021–2025
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold text-xs">
                    <span>Enter Internship Coordinator Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Tab 4: Supervisor */}
          {activeTab === 'supervisor' && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Industry Supervisor Zero-Account Token Access:
              </span>
              {supervisorLink ? (
                <div className="p-5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                        Cdr. K. V. Rao (Chief Engineer, Goa Shipyard Limited)
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        Industry Supervisor for Aarav Vernekar (21ETC01)
                      </p>
                    </div>
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                      OTP: 482915
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Industry supervisors do not hold college passwords. They confirm weekly progress tables through a time-limited token link protected by a 6-digit email OTP.
                  </p>
                  <Link
                    href={`/supervisor/verify/${supervisorLink.raw_token}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow transition"
                  >
                    <span>Open Supervisor Verification Screen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No active supervisor links generated.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Standard Credentials Login & Registration CTA */}
        <div className="lg:col-span-5 space-y-6">
          {/* Credentials Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Standard Sign In</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sign in with college institutional email or Roll No.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs">
                {loginError}
              </div>
            )}

            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Institutional Email or Roll No
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. aarav.21etc01@dbce.edu or 21ETC01"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Demo mode enabled</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="Enter password or leave blank for demo"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Registration Prompt Box */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 dark:from-blue-950 dark:to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-300" />
              <h4 className="font-bold text-sm">New BE Semester VII Student?</h4>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Haven&apos;t enrolled your internship details yet? Register your company, industry supervisor, and dates to generate your 8-week progress logs.
            </p>
            <div className="pt-1">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-950 font-bold text-xs shadow hover:bg-blue-50 transition"
              >
                <span>Register Internship (ET740)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
