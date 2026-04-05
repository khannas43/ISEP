'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PaperEditor } from '@/components/editor/PaperEditor';
import type { Content } from '@tiptap/core';
import { savePaperDraft } from '../../actions';
import { PaperStatusBadge } from '@/components/papers/PaperStatusBadge';
import { SubmitForApprovalButton } from '@/components/papers/SubmitForApprovalButton';

type Props = {
  paperId: string;
  paperTitle: string;
  meetingTitle: string;
  agendaItemTitle: string;
  status: string;
  initialContentJson?: string | null;
  initialVersion?: number | null;
  draftSource?: 'api' | 'mock' | 'empty';
};

/** TipTap JSON for mock paper content (with one insertion-style paragraph). */
const MOCK_PAPER_CONTENT: Content = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'India’s position' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'India supports the proposed timeline for implementation of the Strategic Plan and wishes to highlight the importance of capacity-building for developing countries.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'We suggest adding a reference to regional workshops in paragraph 3.',
          marks: [{ type: 'insertion' }],
        },
      ],
    },
  ],
};

function parseContent(json: string | null | undefined): Content | null {
  if (!json?.trim()) return null;
  try {
    return JSON.parse(json) as Content;
  } catch {
    return null;
  }
}

export function PaperDraftView({
  paperId,
  paperTitle,
  meetingTitle,
  agendaItemTitle,
  status,
  initialContentJson,
  initialVersion = null,
  draftSource = 'mock',
}: Props) {
  const router = useRouter();
  const [version, setVersion] = useState<number | null>(initialVersion);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const initialContent = parseContent(initialContentJson) ?? MOCK_PAPER_CONTENT;

  const handleSave = useCallback(
    async (content: Content) => {
      setSaveError(null);
      setSaving(true);
      try {
        const result = await savePaperDraft(
          paperId,
          JSON.stringify(content),
          version ?? undefined
        );
        if (result.error) {
          setSaveError(result.error);
          return;
        }
        if (result.version != null) setVersion(result.version);
      } finally {
        setSaving(false);
      }
    },
    [paperId, version]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">{paperTitle}</h1>
          <p className="mt-1 text-slate-600">
            {meetingTitle} · {agendaItemTitle}
          </p>
          <span className="mt-2 inline-block">
            <PaperStatusBadge status={status} />
          </span>
          {draftSource === 'mock' && (
            <span className="ml-2 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              Offline draft (backend not connected)
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <SubmitForApprovalButton
            paperId={paperId}
            currentStatus={status}
            onSubmitted={() => router.refresh()}
          />
          <Link href={`/papers/${paperId}/consultation`} className="btn-secondary text-sm">
            External consultation
          </Link>
          <Link href={`/papers/${paperId}/approval`} className="btn-secondary text-sm">
            Approval workflow
          </Link>
          <Link href="/papers" className="btn-secondary text-sm">
            Papers list
          </Link>
        </div>
      </div>

      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {saveError}
        </div>
      )}

      <p className="text-sm text-slate-600">
        Use the toolbar for bold, italic, lists, and track changes: <strong>+Ins</strong> marks new text (green),{' '}
        <strong>Del</strong> marks deleted text (red strikethrough). Content auto-saves every 60 seconds.
        {draftSource === 'api' && ' Draft is synced with the server so all reviewers see the same content.'}
      </p>

      <PaperEditor
        paperId={paperId}
        initialContent={initialContent}
        onSave={handleSave}
        readOnly={false}
      />

      {saving && (
        <p className="text-xs text-slate-500">Saving…</p>
      )}
    </div>
  );
}
