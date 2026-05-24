'use client';

import { useSession } from 'next-auth/react';
import { useRef } from 'react';

/**
 * Dev-only: counts client renders for the document editor route shell to trace flicker (role-specific issues).
 */
export function EditorRouteRenderLogger({ label }: { label: string }) {
  const count = useRef(0);
  const { data: session, status } = useSession();
  count.current += 1;

  if (process.env.NODE_ENV === 'development') {
    const roles = ((session as { roles?: string[] } | null)?.roles ?? []).join(',') || '(none)';
    console.log(`[ISEP editor render] ${label} #${count.current} session=${status} roles=${roles}`);
  }

  return null;
}
