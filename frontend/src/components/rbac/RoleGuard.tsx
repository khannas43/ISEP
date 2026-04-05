'use client';

import { useSession } from 'next-auth/react';
import type { ReactNode } from 'react';

type Props = {
  allowedRoles: string[];
  children: ReactNode;
};

/** Renders children only if the signed-in user has one of the allowed Keycloak realm roles. */
export function RoleGuard({ allowedRoles, children }: Props) {
  const { data: session, status } = useSession();
  if (status !== 'authenticated' || !session) return null;
  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.some((r) => allowedRoles.includes(r))) return null;
  return <>{children}</>;
}
