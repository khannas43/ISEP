import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { CustomReportBuilder } from './CustomReportBuilder';

export default async function CustomReportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  return (
    <div>
      <div className="mb-6">
        <Link href="/reports" className="text-sm font-medium text-slate-500 hover:text-slate-700">← Reports</Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Custom report builder</h1>
          <p className="page-subtitle">Select entities, columns, filters, sort. Preview and download Excel/PDF/XML. Saved templates in production.</p>
          <CustomReportBuilder />
        </div>
      </div>
    </div>
  );
}
