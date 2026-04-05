export default function HealthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <p className="text-lg font-medium text-slate-800">Health check OK</p>
        <p className="mt-1 text-sm text-slate-500">ISEP frontend is running.</p>
      </div>
    </div>
  );
}
