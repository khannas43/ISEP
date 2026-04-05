'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslation } from '@/i18n/client'
import { RoleGuard } from '@/components/rbac/RoleGuard'
import { getApiUrl } from '@/lib/api'
import { formatDateTime } from '@/lib/format'

interface DiffChunk {
  changeIndex: number
  type: 'UNCHANGED' | 'INSERTED' | 'DELETED'
  text: string
  authorName: string | null
  timestamp: string | null
  decision: 'ACCEPTED' | 'REJECTED' | null
}

interface DiffResponse {
  documentId: string
  fromVersion: number
  toVersion: number
  fromSavedAt: string
  toSavedAt: string
  changes: DiffChunk[]
}

interface Props {
  documentId: string
  fromVersion: number
  toVersion: number
}

export function VersionDiffViewer({ documentId, fromVersion, toVersion }: Props) {
  const { t } = useTranslation('common')
  const { data: session, status } = useSession()
  const [diff, setDiff] = useState<DiffResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [generating, setGenerating] = useState(false)

  const accessToken = (session as { accessToken?: string } | null)?.accessToken

  const loadDiff = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(
        `${getApiUrl()}/api/v1/documents/${documentId}/diff?fromVersion=${fromVersion}&toVersion=${toVersion}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
        }
      )
      if (!res.ok) throw new Error('Failed to load diff')
      setDiff((await res.json()) as DiffResponse)
    } catch {
      setDiff(null)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [accessToken, documentId, fromVersion, toVersion])

  useEffect(() => {
    if (status === 'loading') return
    if (!accessToken) {
      setLoading(false)
      return
    }
    void loadDiff()
  }, [accessToken, status, loadDiff])

  const recordDecision = async (changeIndex: number, decision: 'ACCEPTED' | 'REJECTED') => {
    if (!accessToken) return
    await fetch(`${getApiUrl()}/api/v1/documents/${documentId}/diff/decisions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ fromVersion, toVersion, changeIndex, decision }),
    })
    await loadDiff()
  }

  const generateCleanCopy = async (strategy: string) => {
    if (!accessToken) return
    setGenerating(true)
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/documents/${documentId}/clean-copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ fromVersion, toVersion, strategy }),
      })
      if (!res.ok) throw new Error('Failed to generate clean copy')
      window.location.href = `/documents/${documentId}/editor`
    } finally {
      setGenerating(false)
    }
  }

  if (status === 'loading' || loading) {
    return <p className="text-sm text-slate-500">{t('common.loading')}</p>
  }
  if (!accessToken) {
    return <p className="text-sm text-amber-700">{t('common.error')}</p>
  }
  if (error || !diff) {
    return <p className="text-sm text-red-600">{t('common.error')}</p>
  }

  const pendingChanges = diff.changes.filter(
    (c) => c.type !== 'UNCHANGED' && c.decision === null
  ).length

  const hasNonTrivialChanges = diff.changes.some((c) => c.type !== 'UNCHANGED')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-medium text-slate-900">{t('diff.title')}</h2>
          <p className="text-xs text-slate-500">
            {t('diff.comparing', {
              from: fromVersion,
              fromDate: formatDateTime(diff.fromSavedAt),
              to: toVersion,
              toDate: formatDateTime(diff.toSavedAt),
            })}
          </p>
        </div>
        <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER']}>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void generateCleanCopy('REJECT_ALL')}
              disabled={generating}
              className="rounded border-2 border-red-400 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {t('diff.rejectAll')}
            </button>
            <button
              type="button"
              onClick={() => void generateCleanCopy('ACCEPT_ALL')}
              disabled={generating}
              className="rounded bg-[var(--navy-600)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--navy-700)] disabled:opacity-50"
            >
              {t('diff.acceptAll')}
            </button>
            {hasNonTrivialChanges && pendingChanges === 0 && (
              <button
                type="button"
                onClick={() => void generateCleanCopy('USE_DECISIONS')}
                disabled={generating}
                className="rounded bg-[var(--navy-600)] px-3 py-1.5 text-xs font-semibold text-white ring-2 ring-[var(--gold-400)] ring-offset-1 hover:bg-[var(--navy-700)] disabled:opacity-50"
              >
                {generating ? t('common.saving') : t('diff.generateCleanCopy')}
              </button>
            )}
          </div>
        </RoleGuard>
      </div>

      {pendingChanges > 0 && (
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {t('diff.pendingDecisions', { count: pendingChanges })}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-[var(--slate-200)] font-mono text-sm shadow-sm">
        {diff.changes.map((chunk) => (
          <div
            key={chunk.changeIndex}
            className={`flex items-start gap-3 border-b border-[var(--slate-100)] px-4 py-2 last:border-b-0 ${
              chunk.type === 'INSERTED'
                ? 'border-l-4 border-l-green-500 bg-[#f0fdf4]'
                : chunk.type === 'DELETED'
                  ? 'border-l-4 border-l-red-500 bg-[#fef2f2] text-red-800 line-through'
                  : 'border-l-4 border-l-transparent bg-white'
            } ${chunk.decision === 'REJECTED' ? 'opacity-40' : ''}`}
          >
            <span
              className={`mt-0.5 w-4 shrink-0 text-xs font-bold ${
                chunk.type === 'INSERTED'
                  ? 'text-green-600'
                  : chunk.type === 'DELETED'
                    ? 'text-red-600'
                    : 'text-slate-300'
              }`}
            >
              {chunk.type === 'INSERTED' ? '+' : chunk.type === 'DELETED' ? '−' : ' '}
            </span>
            <span className="flex-1 whitespace-pre-wrap">{chunk.text}</span>
            {chunk.authorName && (
              <span className="shrink-0 text-right text-xs text-slate-400">{chunk.authorName}</span>
            )}
            {chunk.type !== 'UNCHANGED' && (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER']}>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => void recordDecision(chunk.changeIndex, 'ACCEPTED')}
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      chunk.decision === 'ACCEPTED'
                        ? 'bg-[var(--navy-600)] text-white'
                        : 'bg-[var(--navy-600)] text-white hover:bg-[var(--navy-700)]'
                    }`}
                    title={t('diff.accept')}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => void recordDecision(chunk.changeIndex, 'REJECTED')}
                    className={`rounded border-2 px-2 py-0.5 text-xs font-medium ${
                      chunk.decision === 'REJECTED'
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-red-400 bg-white text-red-700 hover:bg-red-50'
                    }`}
                    title={t('diff.reject')}
                  >
                    ✗
                  </button>
                </div>
              </RoleGuard>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
