'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard allowedRoles={['coordinator']}>{children}</AuthGuard>;
}
