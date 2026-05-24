'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type {
  UserAssignmentsDto,
  BodyAssignmentItemDto,
  CgAssignmentItemDto,
} from '@/lib/api';
import { setUserAssignments } from '../../actions';

type Props = {
  userId: string;
  initialData: UserAssignmentsDto | null;
};

export function UserAssignmentsClient({ userId, initialData }: Props) {
  const router = useRouter();
  const [bodies, setBodies] = useState<BodyAssignmentItemDto[]>(initialData?.bodies ?? []);
  const [cgs, setCgs] = useState<CgAssignmentItemDto[]>(initialData?.correspondenceGroups ?? []);
  const [selectedBodyIds, setSelectedBodyIds] = useState<Set<string>>(() => new Set(
    (initialData?.bodies ?? []).filter((b) => b.assigned).map((b) => b.bodyId)
  ));
  const [selectedCgIds, setSelectedCgIds] = useState<Set<string>>(() => new Set(
    (initialData?.correspondenceGroups ?? []).filter((c) => c.assigned).map((c) => c.cgId)
  ));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBodies(initialData?.bodies ?? []);
    setCgs(initialData?.correspondenceGroups ?? []);
    setSelectedBodyIds(new Set((initialData?.bodies ?? []).filter((b) => b.assigned).map((b) => b.bodyId)));
    setSelectedCgIds(new Set((initialData?.correspondenceGroups ?? []).filter((c) => c.assigned).map((c) => c.cgId)));
  }, [initialData]);

  const toggleBody = (bodyId: string) => {
    setSelectedBodyIds((prev) => {
      const next = new Set(prev);
      if (next.has(bodyId)) next.delete(bodyId);
      else next.add(bodyId);
      return next;
    });
  };

  const toggleCg = (cgId: string) => {
    setSelectedCgIds((prev) => {
      const next = new Set(prev);
      if (next.has(cgId)) next.delete(cgId);
      else next.add(cgId);
      return next;
    });
  };

  const hasChanges =
    selectedBodyIds.size !== bodies.filter((b) => b.assigned).length ||
    selectedCgIds.size !== cgs.filter((c) => c.assigned).length ||
    bodies.some((b) => b.assigned !== selectedBodyIds.has(b.bodyId)) ||
    cgs.some((c) => c.assigned !== selectedCgIds.has(c.cgId));

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const result = await setUserAssignments(userId, {
        bodyIds: Array.from(selectedBodyIds),
        cgIds: Array.from(selectedCgIds),
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  if (!initialData) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-base text-slate-700">
        Could not load assignments. The user may not exist or you may not have permission.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded bg-red-50 px-4 py-2 text-base text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-base text-slate-600">
          Select committees and correspondence groups to assign this user to. Click Save to apply.
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save assignments'}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-base font-semibold text-slate-700">Committees (international bodies)</h2>
        </div>
        <div className="card-body">
          {bodies.length === 0 ? (
            <p className="text-slate-500 text-base">No committees in the system. Add bodies first.</p>
          ) : (
            <ul className="space-y-2">
              {bodies.map((b) => (
                <li key={b.bodyId} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`body-${b.bodyId}`}
                    checked={selectedBodyIds.has(b.bodyId)}
                    onChange={() => toggleBody(b.bodyId)}
                    className="h-4 w-4 rounded border-slate-300"
                    aria-label={`Assign to ${b.name}`}
                  />
                  <label htmlFor={`body-${b.bodyId}`} className="text-base font-medium text-slate-900 cursor-pointer">
                    {b.name}
                    {b.abbreviation && (
                      <span className="ml-2 text-slate-500 font-normal">({b.abbreviation})</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-base font-semibold text-slate-700">Correspondence groups</h2>
        </div>
        <div className="card-body">
          {cgs.length === 0 ? (
            <p className="text-slate-500 text-base">No correspondence groups. Create CGs under Correspondence Groups.</p>
          ) : (
            <ul className="space-y-2">
              {cgs.map((c) => (
                <li key={c.cgId} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`cg-${c.cgId}`}
                    checked={selectedCgIds.has(c.cgId)}
                    onChange={() => toggleCg(c.cgId)}
                    className="h-4 w-4 rounded border-slate-300"
                    aria-label={`Assign to ${c.name}`}
                  />
                  <label htmlFor={`cg-${c.cgId}`} className="text-base font-medium text-slate-900 cursor-pointer">
                    {c.name}
                    {c.parentBodyName && (
                      <span className="ml-2 text-slate-500 font-normal">— {c.parentBodyName}</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
