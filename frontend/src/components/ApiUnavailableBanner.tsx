/**
 * Shown when the backend API is unreachable (e.g. connection refused).
 * Set NEXT_PUBLIC_HIDE_API_UNAVAILABLE_BANNER=true in .env to hide in development.
 */
export function ApiUnavailableBanner() {
  if (process.env.NEXT_PUBLIC_HIDE_API_UNAVAILABLE_BANNER === 'true') {
    return null;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
      <strong>Backend API is unavailable.</strong> Showing sample data. Start the backend (e.g. meeting-service at{' '}
      <code className="rounded bg-amber-100 px-1">{apiUrl}</code>) for live data.
    </div>
  );
}
