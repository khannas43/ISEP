'use client';

import { useEffect, useRef, useState } from 'react';
import type { MpiDetail, MpiStatus } from '../_types/dashboard.types';

const statusColor: Record<MpiStatus, string> = {
  GREEN: '#639922',
  AMBER: '#EF9F27',
  RED: '#E24B4A',
};

const CIRC = 289;

interface Props {
  mpi: MpiDetail | null;
  loading: boolean;
}

export function MpiRing({ mpi, loading }: Props) {
  const [displayScore, setDisplayScore] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const target = mpi?.score ?? 0;
    const start = performance.now();
    const dur = 600;
    setDisplayScore(0);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - t) * (1 - t);
      setDisplayScore(Math.round(target * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [mpi?.score]);

  if (loading && !mpi) {
    return (
      <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 text-base dark:border-gray-700 dark:bg-gray-900 md:flex-row md:items-center">
        <div className="flex justify-center">
          <div className="h-[120px] w-[120px] animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  if (!mpi) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-base text-gray-500 dark:border-gray-700 dark:bg-gray-900">
        Select a meeting to view preparedness.
      </div>
    );
  }

  const dashLen = (displayScore / 100) * CIRC;
  const stroke = statusColor[mpi.status];
  const label = mpi.status === 'GREEN' ? 'On track' : mpi.status === 'AMBER' ? 'In progress' : 'At risk';

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 text-base dark:border-gray-700 dark:bg-gray-900 md:flex-row md:items-center">
      <div className="flex justify-center md:justify-start">
        <svg
          width="120"
          height="120"
          viewBox="0 0 110 110"
          className="shrink-0"
          role="img"
          aria-label={`Meeting Preparedness Index: ${mpi.score} out of 100, status ${mpi.status}`}
        >
          <circle
            cx="55"
            cy="55"
            r="46"
            fill="none"
            className="stroke-gray-200 dark:stroke-gray-600"
            strokeWidth="9"
          />
          <circle
            cx="55"
            cy="55"
            r="46"
            fill="none"
            stroke={stroke}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${dashLen} ${CIRC}`}
            strokeDashoffset="72.25"
            transform="rotate(-90 55 55)"
          />
          <text x="55" y="52" textAnchor="middle" className="fill-gray-900 text-[26px] font-mono font-semibold dark:fill-white">
            {displayScore}
          </text>
          <text x="55" y="70" textAnchor="middle" className="fill-gray-400 text-xs font-mono">
            /100
          </text>
        </svg>
        <div className="sr-only">
          Meeting Preparedness Index {mpi.score} out of 100, {label}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">Critical actions</p>
        <span
          className="mb-4 inline-block rounded-full px-2.5 py-1 text-sm font-medium text-white"
          style={{ backgroundColor: stroke }}
        >
          {label}
        </span>
        <ul className="space-y-3">
          {mpi.criticalActions.map((a, i) => (
            <li key={i} className="flex gap-3 text-base leading-relaxed text-gray-700 dark:text-gray-200">
              <span
                className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: a.severity === 'RED' ? '#ef4444' : a.severity === 'AMBER' ? '#fbbf24' : '#16a34a',
                }}
              />
              <span>{a.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
