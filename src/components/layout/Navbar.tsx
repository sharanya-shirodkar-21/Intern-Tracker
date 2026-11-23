'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { 
  GraduationCap, 
  Bell, 
  Mail, 
  Compass, 
  User, 
  FileSpreadsheet, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  BarChart3, 
  Layers,
  LogIn,
  UserPlus,
  LogOut,
  Shield,
  UserCheck
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, currentRole, storeState, logout, isHydrated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const notifications = (mounted && currentUser)
    ? storeState.notifications.filter((n) => n.user_id === currentUser.id)
    : [];
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  // Filter outbox count strictly by user role so students and guides only see their own mail count
  const outboxCount = useMemo(() => {
    if (!mounted || !currentUser) return 0;
    if (currentRole === 'coordinator') {
      return storeState.outbox.length;
    }
    if (currentRole === 'student') {
      return storeState.outbox.filter(
        (m) => m.to.toLowerCase() === currentUser.email.toLowerCase()
      ).length;
    }
    if (currentRole === 'guide') {
      const myAssignments = storeState.guideAssignments.filter((a) => a.guide_id === currentUser.id);
      const menteeIds = myAssignments.map((a) => a.student_id);
      const menteeEmails = storeState.profiles
        .filter((p) => menteeIds.includes(p.id))
        .map((p) => p.email.toLowerCase());

      return storeState.outbox.filter(
        (m) =>
          m.to.toLowerCase() === currentUser.email.toLowerCase() ||
          menteeEmails.includes(m.to.toLowerCase())
      ).length;
    }
    return 0;
  }, [mounted, currentUser, currentRole, storeState.outbox, storeState.guideAssignments, storeState.profiles]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getNavLinks = () => {
    if (!mounted || !currentUser) return [];

    switch (currentRole) {
      case 'coordinator':
        return [
          { href: '/coordinator', label: 'Dashboard', icon: BarChart3 },
          { href: '/coordinator/batch-upload', label: 'Batch Upload', icon: Layers },
          { href: '/coordinator/guide-mapping', label: 'Guide Mapping', icon: User },
          { href: '/coordinator/export-b1', label: 'Export Group List (B1)', icon: FileSpreadsheet },
          { href: '/coordinator/skills-radar', label: 'Skills & Risk Radar', icon: ShieldCheck },
          { href: '/atlas', label: 'Internship Atlas', icon: Compass },
        ];
      case 'guide':
        return [
          { href: '/guide', label: 'My Students Matrix', icon: BarChart3 },
          { href: '/guide/contacts', label: 'Industry Contact Log', icon: Calendar },
          { href: '/atlas', label: 'Internship Atlas', icon: Compass },
        ];
      case 'student':
        return [
          { href: '/student', label: 'My Internship', icon: GraduationCap },
          { href: '/student/weekly-logs', label: 'Weekly Logs (B2)', icon: Calendar },
          { href: '/student/documents', label: 'Documents & Proofer', icon: ShieldCheck },
          { href: '/student/showcase', label: 'My Portfolio', icon: CheckCircle2 },
          { href: '/atlas', label: 'Internship Atlas', icon: Compass },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const getRoleBadgeLabel = () => {
    if (!currentUser) return '';
    if (currentRole === 'coordinator') return 'Internship Coordinator';
    if (currentRole === 'guide') return 'Faculty Guide';
    return `Student ${currentUser.roll_no ? `• ${currentUser.roll_no}` : ''}`;
  };

  const getRoleIcon = () => {
    if (currentRole === 'coordinator') return Shield;
    if (currentRole === 'guide') return UserCheck;
    return GraduationCap;
  };

  const RoleIcon = getRoleIcon();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand & College Tag */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-900 dark:bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition">
              IT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">InternTrack</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  ET740
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Don Bosco College of Engineering</p>
            </div>
          </Link>
        </div>

        {/* Dynamic Navigation Tabs (Desktop view) */}
        {mounted && currentUser && (
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200/50 dark:border-blue-800/50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Actions: Theme Toggle, Notifications, Outbox & User Pill / Sign In */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle Button */}
          <ThemeToggle />

          {/* Outbox Mailer Inspector */}
          <Link
            href="/outbox"
            title="In-App Outbox (Email simulator for testing)"
            className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <Mail className="w-4 h-4" />
            {outboxCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">
                {outboxCount}
              </span>
            )}
          </Link>

          {/* In-App Notifications Bell (Only when logged in) */}
          {mounted && currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Notifications</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{notifications.length} total</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">No notifications yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition border border-slate-200/60 dark:border-slate-700/60 text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{n.body}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Authenticated State: User Pill & Sign Out */}
          {mounted && currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">{currentUser.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  {getRoleBadgeLabel()}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 flex items-center justify-center font-black text-xs border border-blue-200 dark:border-blue-800">
                <RoleIcon className="w-4 h-4" />
              </div>
              <button
                onClick={handleLogout}
                title="Sign out of InternTrack"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            /* Unauthenticated State: Sign In & Register Buttons */
            <div className="flex items-center gap-1.5 pl-1">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 shadow-sm transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Role Navigation Bar (Mobile only, hidden on desktop to avoid duplicate stacked panels) */}
      {mounted && currentUser && navLinks.length > 0 && (
        <div className="lg:hidden bg-slate-50/95 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-inner">
          <div className="flex items-center gap-1.5 min-w-max mx-auto lg:mx-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
