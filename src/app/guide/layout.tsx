'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard allowedRoles={['guide']}>{children}</AuthGuard>;
}
