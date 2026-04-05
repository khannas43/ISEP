import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="card max-w-md p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you are looking for does not exist.
        </p>
        <div className="mt-6">
          <Link href="/" className="btn-primary">
            Go to home
          </Link>
        </div>
      </div>
    </main>
  );
}
