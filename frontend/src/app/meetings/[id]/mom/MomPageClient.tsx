'use client';

import Link from 'next/link';
import { getSession, useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '@/i18n/client';
import { ErrorBanner } from '@/components/ErrorBanner';
import { getApiUrl } from '@/lib/api';

type MomDto = {
  id: string;
  meetingId: string;
  meetingTitle: string;
  generatedAt: string;
  attendeeCount: number;
  agendaItemsCovered: number;
  contentHtml: string;
  actionItems: unknown;
  status: string;
};

type Props = { meetingId: string };

/** Same accessToken source as dashboard hooks: session from NextAuth (via getSession for fresh token on each request). */
function accessTokenFromSession(session: unknown): string | null {
  const raw = (session as { accessToken?: string } | null)?.accessToken;
  if (typeof raw !== 'string') return null;
  const t = raw.trim();
  return t || null;
}

export default function MomPageClient({ meetingId }: Props) {
  const id = meetingId.trim();
  const { status: sessionStatus } = useSession();
  const { t } = useTranslation('common');

  const [mom, setMom] = useState<MomDto | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMom = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError('Missing meeting id. Use the Minutes of Meeting link from the meeting page.');
      return;
    }
    const session = await getSession();
    const accessToken = accessTokenFromSession(session);
    if (!accessToken) {
      setLoading(false);
      setError('No API access token in session. Sign out and sign in again.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/meetings/${encodeURIComponent(id)}/mom`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });
      if (res.status === 404) {
        setMom(null);
        setError(null);
      } else if (res.ok) {
        const data = (await res.json()) as MomDto;
        setMom(data);
        setError(null);
      } else {
        setMom(null);
        setError(`Error: ${res.status} ${res.statusText}`);
      }
    } catch {
      setMom(null);
      setError('Could not load Minutes of Meeting. Check that the API is running and NEXT_PUBLIC_API_URL is correct.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadMom();
  }, [loadMom]);

  const generate = useCallback(async () => {
    if (!id) {
      setError('Missing meeting id. Open this page from Meeting → Minutes of Meeting.');
      return;
    }
    const session = await getSession();
    const accessToken = accessTokenFromSession(session);
    if (!accessToken) {
      setError('No API access token in session. Sign out and sign in again.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/meetings/${encodeURIComponent(id)}/mom/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        let data: MomDto;
        try {
          data = (await res.json()) as MomDto;
        } catch {
          setError('Error: 200 OK — invalid JSON body from server.');
          return;
        }
        setMom(data);
        return;
      }
      setError(`Error: ${res.status} ${res.statusText}`);
    } catch {
      setError(
        'Network error while generating MoM. Confirm NEXT_PUBLIC_API_URL matches your API (e.g. http://localhost:8081).'
      );
    } finally {
      setGenerating(false);
    }
  }, [id]);

  const exportPdf = useCallback(async () => {
    if (!id) {
      setError('Missing meeting id.');
      return;
    }
    const session = await getSession();
    const accessToken = accessTokenFromSession(session);
    if (!accessToken) {
      setError('No API access token in session. Sign out and sign in again.');
      return;
    }
    setError(null);
    const url = `${getApiUrl()}/api/v1/meetings/${encodeURIComponent(id)}/mom/export`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        setError(`Error: ${res.status} ${res.statusText}`);
        return;
      }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `MoM-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setError('Could not download PDF. Check your network and API URL.');
    }
  }, [id]);

  const actionCount = Array.isArray(mom?.actionItems) ? mom.actionItems.length : 0;

  if (sessionStatus === 'loading') {
    return (
      <div className="p-8">
        <p className="text-slate-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="p-8">
        <p className="text-slate-600">Sign in to view Minutes of Meeting.</p>
        <Link href="/login" className="mt-2 inline-block text-base text-blue-600">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/meetings/${id}`} className="text-base font-medium text-slate-500 hover:text-slate-700">
          ← {t('nav.meetings')}
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title">{t('mom.title')}</h1>
        <div className="flex flex-wrap gap-3">
          {mom && (
            <button
              type="button"
              onClick={() => void exportPdf()}
              className="rounded-lg bg-slate-800 px-4 py-2 text-base font-medium text-white hover:bg-slate-900"
            >
              {t('mom.exportPdf')}
            </button>
          )}
          <button
            type="button"
            onClick={() => void generate()}
            disabled={generating}
            aria-busy={generating}
            className="rounded-lg bg-amber-500 px-4 py-2 text-base font-semibold text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? t('common.loading') : t('mom.generate')}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-4">
          <ErrorBanner message={error} onRetry={() => void loadMom()} />
        </div>
      ) : null}

      {loading && <p className="text-slate-500">{t('common.loading')}</p>}

      {!loading && !mom && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-8 py-16 text-center">
          <p className="mb-4 text-slate-600">{t('mom.notGenerated')}</p>
          <button
            type="button"
            onClick={() => void generate()}
            disabled={generating}
            className="rounded-lg bg-slate-800 px-6 py-2.5 text-base font-semibold text-white hover:bg-slate-900 disabled:opacity-60"
          >
            {t('mom.generateNow')}
          </button>
        </div>
      )}

      {mom && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 grid grid-cols-2 gap-6 border-b border-slate-100 pb-8 sm:grid-cols-4">
            {[
              { label: t('mom.attendees'), value: mom.attendeeCount },
              { label: t('mom.agendaItems'), value: mom.agendaItemsCovered },
              { label: t('mom.actionItems'), value: actionCount },
              { label: 'Status', value: mom.status },
            ].map((m) => (
              <div key={m.label}>
                <div className="font-display text-2xl font-bold text-slate-800">{m.value}</div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{m.label}</div>
              </div>
            ))}
          </div>
          <div
            className="prose prose-slate max-w-none text-base leading-relaxed text-slate-700"
            dangerouslySetInnerHTML={{ __html: mom.contentHtml }}
          />
        </div>
      )}
    </div>
  );
}
