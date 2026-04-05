import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl } from '@/lib/api';
import { getServerTranslations } from '@/i18n';
import { CompareDocumentsShell } from './CompareDocumentsShell';
import type { CompareVersionOption } from '@/components/editor/VersionSelector';

type EditorVersionRow = {
  id: string;
  version: number;
  savedBy?: { userId?: string; fullName?: string | null } | null;
  savedAt: string;
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string; to?: string }>;
};

/**
 * TASK-S2-02 — Version comparison + clean copy (HTML word diff via meeting-service).
 */
export default async function DocumentComparePage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const accessToken = (session as { accessToken?: string }).accessToken;

  const { t } = await getServerTranslations();

  let rows: EditorVersionRow[] = [];
  if (accessToken) {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/documents/${id}/versions?view=editor`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        rows = Array.isArray(data) ? data : [];
      }
    } catch {
      rows = [];
    }
  }

  const sorted = [...rows].sort((a, b) => a.version - b.version);
  const versions: CompareVersionOption[] = sorted.map((v) => ({
    id: String(v.id),
    version: v.version,
    savedByName: v.savedBy?.fullName?.trim() || '—',
    savedAt: v.savedAt,
  }));

  if (versions.length < 2) {
    return (
      <div className="page-container">
        <p className="text-slate-600">{t('diff.notEnoughVersions')}</p>
        <Link href={`/documents/${id}`} className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          ← {t('diff.backToEditor')}
        </Link>
      </div>
    );
  }

  const defaultFrom = versions[versions.length - 2]!.version;
  const defaultTo = versions[versions.length - 1]!.version;

  const fromVersion = sp.from ? Number(sp.from) : defaultFrom;
  const toVersion = sp.to ? Number(sp.to) : defaultTo;

  const validFrom = versions.some((v) => v.version === fromVersion) ? fromVersion : defaultFrom;
  const validTo = versions.some((v) => v.version === toVersion && v.version > validFrom)
    ? toVersion
    : versions.filter((v) => v.version > validFrom).map((v) => v.version).sort((a, b) => a - b)[0] ?? defaultTo;

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h1 className="page-title">{t('diff.pageTitle')}</h1>
        <Link href={`/documents/${id}/editor`} className="text-sm text-blue-600 hover:underline">
          ← {t('diff.backToEditor')}
        </Link>
      </div>

      <CompareDocumentsShell
        documentId={id}
        versions={versions}
        fromVersion={validFrom}
        toVersion={validTo}
      />
    </div>
  );
}
