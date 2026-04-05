'use client';

import { useEffect, useRef } from 'react';

type Props = {
  from: string | null;
  roleLabel: string;
  userName: string;
  userEmail: string | null;
};

/**
 * Client component that logs the unauthorized access attempt to the audit API on mount.
 * SCR-AUTH-05: Logs the attempt to the audit trail.
 */
export function UnauthorizedContent({ from, roleLabel, userName, userEmail }: Props) {
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    const emailPart = userEmail ? ' (' + userEmail + ')' : '';
    const details = 'User: ' + userName + emailPart + ', role(s): ' + roleLabel;
    fetch('/api/audit/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'UNAUTHORIZED_ACCESS',
        path: from ?? undefined,
        details,
      }),
    }).catch(() => {});
  }, [from, roleLabel, userName, userEmail]);

  return null;
}
