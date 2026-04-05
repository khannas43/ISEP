import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl } from '@/lib/api';
import { sanitizeCallbackUrl } from '@/lib/callbackUrl';
import { getServerTranslations } from '@/i18n';
import { CollaborativeEditor } from '@/components/editor/CollaborativeEditor';

type EditorApiDoc = {
  documentId: string;
  title: string;
  contentHtml: string | null;
  /** Base64 Y.js snapshot from DB, if any */
  ydocState: string | null;
  version: number;
  status: string;
  isLocked: boolean;
  editable: boolean;
};

type Props = { params: Promise<{ id: string }> };

function EditorFetchFailed({ reason }: { reason: 'network' | 'server' }) {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-4">
      <h1 className="page-title">Editor unavailable</h1>
      <p className="text-sm text-slate-600">
        {reason === 'network'
          ? 'The document service could not be reached. Check that the API is running and NEXT_PUBLIC_API_URL is correct.'
          : 'The document service returned an error. Try again later.'}
      </p>
      <Link href="/documents/" className="text-sm font-medium text-blue-600 hover:text-blue-800">
        Back to documents
      </Link>
    </div>
  );
}

/**
 * TipTap collaborative editor (TASK-S2-01 Layer 2). Loads state from GET /api/v1/documents/{id}/editor.
 */
export default async function DocumentEditorPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  const userId = (session.user as { id?: string }).id ?? '';
  const userName = session.user?.name ?? session.user?.email ?? '';
  const editorCallbackPath = `/documents/${id}/editor/`;

  if (!accessToken) {
    redirect(`/login/?callbackUrl=${encodeURIComponent(sanitizeCallbackUrl(editorCallbackPath))}`);
  }

  // redirect() and notFound() throw — keep them outside try/catch so they are not mistaken for fetch failures.
  let res: Response;
  try {
    res = await fetch(`${getApiUrl()}/api/v1/documents/${id}/editor`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
  } catch {
    return <EditorFetchFailed reason="network" />;
  }

  if (res.status === 401) {
    redirect(`/login/?callbackUrl=${encodeURIComponent(sanitizeCallbackUrl(editorCallbackPath))}`);
  }
  if (res.status === 404 || res.status === 403) {
    notFound();
  }

  let doc: EditorApiDoc | null = null;
  let loadError: 'network' | 'server' | null = null;
  if (res.ok) {
    try {
      doc = (await res.json()) as EditorApiDoc;
    } catch {
      loadError = 'network';
    }
  } else {
    loadError = 'server';
  }
  if (!doc) {
    if (loadError) {
      return <EditorFetchFailed reason={loadError} />;
    }
    notFound();
  }

  const { t } = await getServerTranslations();

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <Link href={`/documents/${id}`} className="text-sm font-medium text-slate-500 hover:text-slate-700">
          ← Document
        </Link>
        <Link href={`/documents/${id}/compare`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
          {t('diff.pageTitle')}
        </Link>
      </div>
      <header>
        <h1 className="page-title">{doc.title}</h1>
        <p className="page-subtitle text-slate-600">
          Version {doc.version}
          {doc.isLocked ? ` · Locked` : ''} · {doc.status}
        </p>
      </header>
      <div className="min-h-0 flex-1">
        <CollaborativeEditor
          key={id}
          documentId={id}
          initialContent={doc.contentHtml ?? ''}
          initialVersion={doc.version}
          initialYdocState={doc.ydocState}
          isLocked={doc.isLocked}
          currentUser={{ userId, fullName: userName }}
        />
      </div>
    </div>
  );
}
