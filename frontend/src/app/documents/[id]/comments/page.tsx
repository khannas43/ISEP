import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, filterCommentsByVisibility, type DocumentCommentDto } from '@/lib/api';
import { getStoredDocumentComments } from '@/lib/documentCommentsStore';
import { mockComments } from '@/lib/mock/data';
import { AddCommentForm } from '@/components/AddCommentForm';

async function getDocument(documentId: string, accessToken: string) {
  const res = await fetch(`${getApiUrl()}/api/v1/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * SCR-COL-04 — Comments & discussion (document). Threaded comments; reply; visibility internal vs delegation.
 * Comment list is filtered by RBAC: INTERNAL visible only to SA, IH, CO, DL; DELEGATION visible to all.
 */
type Props = { params: Promise<{ id: string }> };

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default async function DocumentCommentsPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id: documentId } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  const userRoles: string[] = (session as { roles?: string[] }).roles ?? [];

  let doc = null;
  if (accessToken) {
    try {
      doc = await getDocument(documentId, accessToken);
    } catch {
      doc = null;
    }
  }
  if (!doc) notFound();

  // Merge mock comments with comments stored via Add comment form (in-memory store for dev)
  const storedComments: DocumentCommentDto[] = getStoredDocumentComments(documentId).map((c) => ({
    commentId: c.commentId,
    authorId: c.authorId,
    authorName: c.authorName,
    content: c.content,
    createdAt: c.createdAt,
    editedAt: null,
    parentId: null,
    visibility: c.visibility,
  }));
  const mockList: DocumentCommentDto[] = mockComments.map((c) => ({
    commentId: c.commentId,
    authorId: c.authorId,
    authorName: c.authorName,
    content: c.content,
    createdAt: c.createdAt,
    editedAt: c.editedAt ?? null,
    parentId: c.parentId ?? null,
    visibility: c.visibility,
  }));
  const allComments: DocumentCommentDto[] = [...mockList, ...storedComments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const comments = filterCommentsByVisibility(allComments, userRoles);

  return (
    <div>
      <div className="mb-6">
        <Link href={`/documents/${documentId}`} className="text-sm font-medium text-slate-500 hover:text-slate-700">
          ← Document detail
        </Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Comments & discussion</h1>
          <p className="page-subtitle mt-1">{doc.title} — threaded comments; visibility: internal vs delegation.</p>

          <section className="mt-6" aria-label="Existing comments">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Existing comments</h2>
            {comments.length === 0 ? (
              <p className="text-slate-500 text-sm">No comments yet. Add one below.</p>
            ) : (
              <ul className="space-y-4">
                {comments.map((c) => (
                  <li key={c.commentId} className="border-l-2 border-slate-200 pl-4 py-1">
                    <p className="text-sm text-slate-800">{c.content}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>{c.authorName}</span>
                      <span>{formatDate(c.createdAt)}</span>
                      <span
                        className={`badge ${c.visibility === 'INTERNAL' ? 'badge-info' : 'badge-neutral'}`}
                        title={c.visibility === 'INTERNAL' ? 'Visible to DGS internal (SA, IH, CO, DL only)' : 'Visible to delegation members'}
                      >
                        {c.visibility}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <AddCommentForm contextLabel="document" documentId={documentId} />
        </div>
      </div>
    </div>
  );
}
