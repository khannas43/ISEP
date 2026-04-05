/**
 * In-memory store for document comments (dev only).
 * Replace with GET /api/v1/documents/:id/comments when backend collaboration-service exists.
 */

export type StoredDocumentComment = {
  commentId: string;
  authorId: string | null;
  authorName: string;
  content: string;
  createdAt: string;
  editedAt: null;
  parentId: null;
  visibility: 'INTERNAL' | 'DELEGATION';
};

const store = new Map<string, StoredDocumentComment[]>();

export function getStoredDocumentComments(documentId: string): StoredDocumentComment[] {
  return store.get(documentId) ?? [];
}

export function addDocumentComment(
  documentId: string,
  comment: Omit<StoredDocumentComment, 'commentId' | 'createdAt' | 'editedAt' | 'parentId'>
): StoredDocumentComment {
  const full: StoredDocumentComment = {
    ...comment,
    commentId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    editedAt: null,
    parentId: null,
  };
  const list = store.get(documentId) ?? [];
  list.push(full);
  store.set(documentId, list);
  return full;
}
