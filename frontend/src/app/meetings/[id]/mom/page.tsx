'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '@/i18n/client';
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

export default function MomPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  const { t } = useTranslation('common');

  const [mom, setMom] = useState<MomDto | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMom = useCallback(async () => {
    if (!accessToken || !id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/meetings/${id}/mom`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });
      if (res.status === 404) {
        setMom(null);
      } else if (res.ok) {
        setMom(await res.json());
      } else {
        setError(t('common.error'));
        setMom(null);
      }
    } catch {
      setError(t('common.error'));
      setMom(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, id, t]);

  useEffect(() => {
    void loadMom();
  }, [loadMom]);

  const generate = async () => {
    if (!accessToken || !id) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/meetings/${id}/mom/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        setMom(await res.json());
      } else if (res.status === 403) {
        setError('You do not have permission to generate Minutes of Meeting.');
      } else {
        setError(t('common.error'));
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setGenerating(false);
    }
  };

  const exportPdf = () => {
    if (!accessToken || !id) return;
    const url = `${getApiUrl()}/api/v1/meetings/${id}/mom/export`;
    void fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(async (res) => {
        if (!res.ok) return;
        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `MoM-${id}.pdf`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => setError(t('common.error')));
  };

  const actionCount = Array.isArray(mom?.actionItems) ? mom.actionItems.length : 0;

  if (sessionStatus === 'loading') {
    return (
      <div className="p-8">
        <p className="text-slate-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="p-8">
        <p className="text-slate-600">Sign in to view Minutes of Meeting.</p>
        <Link href="/login" className="mt-2 inline-block text-sm text-blue-600">
          Login
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/meetings/${id}`} className="text-sm font-medium text-slate-500 hover:text-slate-700">
          ← {t('nav.meetings')}
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-slate-900">{t('mom.title')}</h1>
        <div className="flex flex-wrap gap-3">
          {mom && (
            <button
              type="button"
              onClick={exportPdf}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
            >
              {t('mom.exportPdf')}
            </button>
          )}
          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? t('common.loading') : t('mom.generate')}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {loading && <p className="text-slate-500">{t('common.loading')}</p>}

      {!loading && !mom && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-8 py-16 text-center">
          <p className="mb-4 text-slate-600">{t('mom.notGenerated')}</p>
          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className="rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60"
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
            className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700"
            dangerouslySetInnerHTML={{ __html: mom.contentHtml }}
          />
        </div>
      )}
    </main>
  );
}
