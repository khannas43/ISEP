'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { useTranslation } from '@/i18n/client';
import {
  getFeedbackArchive,
  getReferenceData,
  type AgendaItemDto,
  type FeedbackArchiveRow,
  type ReferenceItem,
} from '@/lib/api';

type Props = {
  meetingId: string;
  accessToken: string;
  agendaItems: AgendaItemDto[];
};

export function FeedbackArchiveClient({ meetingId, accessToken, agendaItems }: Props) {
  const { t } = useTranslation('common');
  const [rows, setRows] = useState<FeedbackArchiveRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [agendaItemId, setAgendaItemId] = useState('');
  const [position, setPosition] = useState('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [positionOptions, setPositionOptions] = useState<ReferenceItem[]>([]);

  const size = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const pos = position !== 'ALL' ? position : undefined;
      const res = await getFeedbackArchive(accessToken, meetingId, {
        agendaItemId: agendaItemId || undefined,
        position: pos,
        page,
        size,
      });
      if (res) {
        setRows(res.data);
        setTotal(res.pagination.totalElements);
      } else {
        setRows([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, meetingId, agendaItemId, position, page]);

  useEffect(() => {
    void getReferenceData(accessToken, 'feedback_position').then(setPositionOptions);
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  function preview(text: string | null, max = 120): string {
    if (!text) return '—';
    const s = text.replace(/\s+/g, ' ').trim();
    return s.length <= max ? s : `${s.slice(0, max)}…`;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">{t('feedback.archive.agendaItem')}</span>
          <select
            value={agendaItemId}
            onChange={(e) => {
              setPage(0);
              setAgendaItemId(e.target.value);
            }}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All items</option>
            {agendaItems.map((a) => (
              <option key={a.agendaItemId} value={a.agendaItemId}>
                {a.itemNumber ? `${a.itemNumber} — ` : ''}
                {a.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">{t('feedback.archive.filterPosition')}</span>
          <select
            value={position}
            onChange={(e) => {
              setPage(0);
              setPosition(e.target.value);
            }}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="ALL">All</option>
            {positionOptions.map((p) => (
              <option key={p.code} value={p.code}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex-1" />
        <span title={t('feedback.archive.exportDisabled')}>
          <button type="button" disabled className="btn-secondary cursor-not-allowed opacity-60">
            {t('common.export')}
          </button>
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">{t('common.loading')}</p>
      ) : rows.length === 0 ? (
        <p className="text-slate-600">{t('feedback.archive.noFeedback')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-700">{t('feedback.archive.agendaItem')}</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">{t('feedback.archive.member')}</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">{t('feedback.archive.position')}</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">{t('feedback.archive.preview')}</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">{t('feedback.archive.status')}</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">{t('feedback.archive.submittedAt')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((r) => (
                <Fragment key={r.feedbackId}>
                  <tr
                    className="cursor-pointer hover:bg-slate-50/80"
                    onClick={() =>
                      setExpanded((e) => (e === r.feedbackId ? null : r.feedbackId))
                    }
                  >
                    <td className="px-3 py-2 align-top">
                      <span className="font-medium text-slate-900">
                        {r.agendaItemNumber ? `${r.agendaItemNumber} ` : ''}
                        {r.agendaItemTitle ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top">{r.submittedBy.fullName ?? r.submittedBy.userId}</td>
                    <td className="px-3 py-2 align-top">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
                        {r.position ?? '—'}
                      </span>
                    </td>
                    <td className="max-w-xs px-3 py-2 align-top text-slate-600">{preview(r.comments)}</td>
                    <td className="px-3 py-2 align-top">{r.status}</td>
                    <td className="px-3 py-2 align-top text-slate-600">
                      {r.submittedAt
                        ? new Date(r.submittedAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                  </tr>
                  {expanded === r.feedbackId && (
                    <tr className="bg-slate-50/90">
                      <td colSpan={6} className="px-4 py-3 text-slate-700">
                        <p className="whitespace-pre-wrap text-sm">{r.comments || '—'}</p>
                        {r.consolidation && (
                          <p className="mt-2 text-xs text-slate-500">
                            Consolidation: {r.consolidation.status ?? '—'}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > size && (
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            className="btn-secondary text-sm"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <span className="text-slate-600">
            Page {page + 1} — {total} total
          </span>
          <button
            type="button"
            className="btn-secondary text-sm"
            disabled={(page + 1) * size >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
