import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl } from '@/lib/api';
import { NewVersionUploadForm } from './NewVersionUploadForm';

async function getDocument(documentId: string, accessToken: string) {
  const res = await fetch(`${getApiUrl()}/api/v1/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

type Props = { params: Promise<{ id: string }> };

/**
 * SCR-DOC-04 — Upload new version. Change summary required; version auto-increment.
 */
export default async function DocumentNewVersionPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let doc = null;
  if (accessToken) {
    try {
      doc = await getDocument(id, accessToken);
    } catch {
      doc = null;
    }
  }
  if (!doc) notFound();

  const currentVersion = doc.currentVersion ?? 1;

  return (
    <div>
      <div className="mb-6">
        <Link href={`/documents/${id}`} className="text-base font-medium text-slate-500 hover:text-slate-700">← Document detail</Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Upload new version</h1>
          <p className="page-subtitle">{doc.title} (v{currentVersion})</p>
          <p className="mt-2 text-base text-slate-600">
            Provide a change summary and upload the new file. The new version will become the current version; you can compare versions after upload.
          </p>
          <div className="mt-6">
            <NewVersionUploadForm
              documentId={id}
              currentVersion={currentVersion}
              title={doc.title ?? 'Document'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
