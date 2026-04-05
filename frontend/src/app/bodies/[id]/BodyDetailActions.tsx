'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deactivateBody } from '../actions';

type Props = { bodyId: string; isActive: boolean };

export function BodyDetailActions({ bodyId, isActive }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeactivate() {
    if (!confirm('Deactivate this body? It will no longer be available for new meetings.')) return;
    setError(null);
    setLoading(true);
    try {
      const result = await deactivateBody(bodyId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={`/bodies/${bodyId}/edit`} className="btn-primary">
        Edit
      </Link>
      {isActive && (
        <button
          type="button"
          onClick={handleDeactivate}
          disabled={loading}
          className="btn-secondary border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
        >
          {loading ? 'Deactivating…' : 'Deactivate'}
        </button>
      )}
      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}
    </div>
  );
}
