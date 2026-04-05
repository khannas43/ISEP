const DEFAULT_CALLBACK = '/dashboard';

/**
 * Sanitize callback URL from query params. Prevents redirect to "#", "", or invalid paths
 * which would cause a 404 (e.g. router.replace("#") navigates to a non-existent route).
 */
export function sanitizeCallbackUrl(value: string | null | undefined): string {
  if (value == null || value === '' || value === '#') return DEFAULT_CALLBACK;
  const trimmed = value.trim();
  if (!trimmed.startsWith('/')) return DEFAULT_CALLBACK;
  return trimmed;
}
