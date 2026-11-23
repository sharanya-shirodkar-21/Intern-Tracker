'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AtlasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard allowedRoles={['student', 'coordinator', 'guide']}>{children}</AuthGuard>;
}
