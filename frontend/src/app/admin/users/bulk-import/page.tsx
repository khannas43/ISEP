import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { BulkImportClient } from './BulkImportClient';

export default async function BulkImportUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.includes('SYSTEM_ADMIN')) redirect('/unauthorized');

  const accessToken = (session as { accessToken?: string }).accessToken ?? '';

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/users" className="text-sm font-medium text-slate-500 hover:text-slate-700">
          ← Back to User list
        </Link>
      </div>
      <div className="page-header">
        <h1 className="page-title">Bulk user import</h1>
        <p className="page-subtitle">
          Upload a CSV to onboard multiple users (SCR-USR-04). Columns: email, fullName, designation, organization, systemRole. First row may be a header.
        </p>
      </div>
      <BulkImportClient accessToken={accessToken} />
    </div>
  );
}
