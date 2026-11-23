'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types/database';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { currentUser, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;

    // 1. Not logged in -> redirect to /login
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    // 2. Role mismatch -> redirect to appropriate role portal
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      if (currentUser.role === 'student') {
        router.replace('/student');
      } else if (currentUser.role === 'coordinator') {
        router.replace('/coordinator');
      } else if (currentUser.role === 'guide') {
        router.replace('/guide');
      } else {
        router.replace('/');
      }
    }
  }, [isHydrated, currentUser, allowedRoles, router]);

  // Loading state while checking authentication
  if (!isHydrated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verifying session credentials...</p>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Authentication Required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Redirecting to InternTrack portal sign in...</p>
        </div>
      </div>
    );
  }

  // Role not permitted
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Access Restricted</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This section is restricted to {allowedRoles.join(', ')} roles. Redirecting to your authorized dashboard...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
