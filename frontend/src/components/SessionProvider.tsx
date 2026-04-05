'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { getAppBasePath } from '@/lib/appBasePath';

/** NextAuth client: SessionProvider basePath = app prefix + /api/auth (e.g. /api/auth or /isep/api/auth). */
const authBasePath = `${getAppBasePath()}/api/auth`;

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider basePath={authBasePath} refetchOnWindowFocus={false}>
      {children}
    </NextAuthSessionProvider>
  );
}
