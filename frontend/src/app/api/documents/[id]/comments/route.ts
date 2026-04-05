import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getStoredDocumentComments, addDocumentComment } from '@/lib/documentCommentsStore';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params;
  const comments = getStoredDocumentComments(documentId);
  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: documentId } = await params;
  let body: { content?: string; visibility?: 'INTERNAL' | 'DELEGATION' };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!content) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }
  const visibility = body.visibility === 'INTERNAL' ? 'INTERNAL' : 'DELEGATION';

  const user = session.user as { id?: string; name?: string; email?: string };
  const authorId = user.id ?? null;
  const authorName = user.name ?? user.email ?? 'Unknown';

  const comment = addDocumentComment(documentId, {
    authorId,
    authorName,
    content,
    visibility,
  });

  return NextResponse.json(comment, { status: 201 });
}
