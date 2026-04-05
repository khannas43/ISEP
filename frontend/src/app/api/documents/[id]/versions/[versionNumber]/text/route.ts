import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getApiUrl } from '@/lib/api';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; versionNumber: string }> }
) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, versionNumber } = await params;
  if (!id || !versionNumber) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  const v = parseInt(versionNumber, 10);
  if (Number.isNaN(v) || v < 1) return NextResponse.json({ error: 'Invalid version' }, { status: 400 });

  const backendUrl = `${getApiUrl()}/api/v1/documents/${id}/versions/${v}/text`;
  const res = await fetch(backendUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    if (res.status === 404) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Failed to get version text' }, { status: res.status });
  }
  const text = await res.text();
  return new NextResponse(text, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
