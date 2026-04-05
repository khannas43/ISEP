import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DocumentUploadForm } from '../DocumentUploadForm';
import type { AgendaItemDto } from '@/lib/api';
import { getApiUrl } from '@/lib/api';

async function getMeetingAgendaItems(meetingId: string, accessToken: string): Promise<AgendaItemDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.content ?? [];
}

const DOCUMENT_TYPES = [
  { code: 'AGENDA_PAPER', label: 'Agenda Paper' },
  { code: 'WORKING_DOCUMENT', label: 'Working Document' },
  { code: 'SUBMISSION', label: 'Submission' },
  { code: 'REFERENCE', label: 'Reference' },
  { code: 'INTERVENTION', label: 'Intervention' },
  { code: 'MINUTES', label: 'Minutes' },
  { code: 'COUNTRY_POSITION', label: 'Country Position' },
  { code: 'OTHER', label: 'Other' },
];

const SOURCES = [
  { code: 'INDIA', label: 'India' },
  { code: 'IMO_SECRETARIAT', label: 'IMO Secretariat' },
  { code: 'OTHER_MEMBER_STATE', label: 'Other Member State' },
  { code: 'OTHER', label: 'Other' },
];

type Props = { params: Promise<{ id: string }> };

export default async function DocumentUploadPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  const canUpload = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR') || roles.includes('DELEGATION_LEADER') || roles.includes('MEMBER');
  if (!canUpload) redirect('/unauthorized');

  const { id: meetingId } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  const agendaItems = accessToken ? await getMeetingAgendaItems(meetingId, accessToken) : [];

  return (
    <div className="card">
      <div className="card-body">
        <div className="mb-4">
          <Link href={`/meetings/${meetingId}?tab=documents`} className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to Documents
          </Link>
        </div>
        <h1 className="page-title">Upload Document</h1>
        <p className="page-subtitle mt-1">
          Upload a document for this meeting. Maximum file size: 20 MB. Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX.
        </p>
        <div className="mt-6">
          <DocumentUploadForm
            meetingId={meetingId}
            agendaItems={agendaItems}
            documentTypeOptions={DOCUMENT_TYPES}
            sourceOptions={SOURCES}
          />
        </div>
      </div>
    </div>
  );
}
