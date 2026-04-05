import Link from 'next/link';

type Props = { title: string };

export function ComingSoon({ title }: Props) {
  return (
    <div className="card p-8 text-center">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      <p className="mt-2 text-slate-500">This section is planned and will be available in a future release.</p>
      <Link href="/dashboard" className="mt-4 inline-block font-medium text-blue-600 hover:underline">
        ← Back to Dashboard
      </Link>
    </div>
  );
}
