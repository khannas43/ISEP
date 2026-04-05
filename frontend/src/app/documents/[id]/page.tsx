import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type MeetingDto } from '@/lib/api';
import { formatDisplayDate } from '@/lib/format';

async function getDocument(documentId: string, accessToken: string) {
  const res = await fetch(`${getApiUrl()}/api/v1/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

async function getMeeting(meetingId: string, accessToken: string): Promise<MeetingDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

async function getAgendaItemTitle(meetingId: string, agendaItemId: string, accessToken: string): Promise<string | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const items = await res.json();
  const item = Array.isArray(items) ? items.find((a: { agendaItemId: string }) => a.agendaItemId === agendaItemId) : null;
  return item?.title ?? null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = { params: Promise<{ id: string }> };

export default async function DocumentDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id: documentId } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;

  let doc = null;
  if (accessToken) {
    try {
      doc = await getDocument(documentId, accessToken);
    } catch {
      doc = null;
    }
  }
  if (!doc) notFound();

  let linkedMeeting: MeetingDto | null = null;
  let agendaItemTitle: string | null = null;
  if (accessToken && doc.meetingId) {
    try {
      linkedMeeting = await getMeeting(doc.meetingId, accessToken);
      if (doc.agendaItemId) {
        agendaItemTitle = await getAgendaItemTitle(doc.meetingId, doc.agendaItemId, accessToken);
      }
    } catch {
      // keep null
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="mb-4">
          {doc.meetingId ? (
            <Link href={`/meetings/${doc.meetingId}?tab=documents`} className="text-sm font-medium text-blue-600 hover:underline">
              ← Back to Meeting Documents
            </Link>
          ) : (
            <Link href="/documents" className="text-sm font-medium text-blue-600 hover:underline">
              ← Back to Document Library
            </Link>
          )}
        </div>
        <h1 className="page-title">{doc.title}</h1>
        <p className="mt-1 text-slate-600">
          {doc.documentType?.replace(/_/g, ' ')} · {doc.source?.replace(/_/g, ' ')} · Version {doc.currentVersion ?? 1}
        </p>
        <dl className="mt-6 grid gap-3 text-sm">
          <div>
            <dt className="text-slate-500">File name</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{doc.fileName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Size</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{doc.fileSizeBytes != null ? formatBytes(doc.fileSizeBytes) : '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Uploaded</dt>
            <dd className="mt-0.5 font-medium text-slate-900">
              {doc.uploadedAt ? formatDisplayDate(doc.uploadedAt) : '—'}
              {doc.uploadedByName && ` by ${doc.uploadedByName}`}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="mt-0.5">
              <span className="badge badge-neutral">{doc.status ?? 'ACTIVE'}</span>
            </dd>
          </div>
        </dl>

        {doc.meetingId && (
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Linked meeting</h2>
            <p className="text-slate-600 text-sm mb-2">
              This document is used in the following meeting{linkedMeeting ? '' : ' (details unavailable)'}.
            </p>
            {linkedMeeting ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/meetings/${doc.meetingId}?tab=documents`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {linkedMeeting.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {linkedMeeting.bodyName}
                      {linkedMeeting.startDate && ` · ${formatDisplayDate(linkedMeeting.startDate)}`}
                    </p>
                    {doc.agendaItemId && (
                      <p className="mt-1 text-sm">
                        {agendaItemTitle ? (
                          <Link
                            href={`/meetings/${doc.meetingId}/agenda/${doc.agendaItemId}`}
                            className="text-blue-600 hover:underline"
                          >
                            Agenda item: {agendaItemTitle}
                          </Link>
                        ) : (
                          <Link
                            href={`/meetings/${doc.meetingId}/agenda/${doc.agendaItemId}`}
                            className="text-blue-600 hover:underline"
                          >
                            View agenda item →
                          </Link>
                        )}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/meetings/${doc.meetingId}?tab=documents`}
                    className="btn-secondary text-sm shrink-0"
                  >
                    Open meeting
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <Link
                  href={`/meetings/${doc.meetingId}?tab=documents`}
                  className="text-blue-600 hover:underline"
                >
                  Go to meeting documents →
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/documents/${documentId}/editor`} className="btn-primary text-sm">
            Open in editor
          </Link>
          <a
            href={`/api/documents/${documentId}/download`}
            className="btn-secondary text-sm"
            download
          >
            Download
          </a>
          <Link href={`/documents/${documentId}/new-version`} className="btn-secondary text-sm">Upload new version</Link>
          <Link href={`/documents/${documentId}/compare`} className="btn-secondary text-sm">Compare versions</Link>
          <Link href={`/documents/${documentId}/comments`} className="btn-secondary text-sm">Comments</Link>
        </div>
      </div>
    </div>
  );
}
