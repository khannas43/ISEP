import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

type Props = { params: Promise<{ id: string }> };

/** Stub destination for “View feedback” from consultation wireframe. */
export default async function ConsultationFeedbackStubPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const { id } = await params;

  return (
    <div className="card max-w-lg">
      <div className="card-body">
        <h1 className="text-lg font-semibold text-slate-900">Consultation feedback</h1>
        <p className="mt-2 text-sm text-slate-600">
          Stub page for demo navigation. Agency feedback detail will load from the API in Sprint 3.
        </p>
        <Link href={`/papers/${id}/consultation`} className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
          ← Back to consultation
        </Link>
      </div>
    </div>
  );
}
