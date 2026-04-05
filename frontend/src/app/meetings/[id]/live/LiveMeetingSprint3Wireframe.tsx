'use client';

import { useState } from 'react';
import Link from 'next/link';

type AgendaItem = { agendaItemId: string; itemNumber?: string; title: string };
type Participant = { participantId: string; name: string; meetingRole?: string };

const MOCK_COMMENTS: { author: string; at: string; text: string }[] = [
  { author: 'J. Sharma', at: '10:02', text: 'Support the proposed wording with minor edits to paragraph 2.' },
  { author: 'R. Patel (DL)', at: '10:05', text: 'Please align with the position sent to MoPSW last week.' },
  { author: 'Coordination', at: '10:08', text: 'Noted. We will reflect this in the clean copy after the break.' },
  { author: 'A. Singh', at: '10:11', text: 'Request one more day for MoEFCC comments before finalising.' },
];

type TabId = 'boards' | 'interventions' | 'participants';

export function LiveMeetingSprint3Wireframe({
  meetingId,
  meetingTitle,
  committeeName,
  startDate,
  endDate,
  status,
  agendaItems,
  participants,
}: {
  meetingId: string;
  meetingTitle: string;
  committeeName: string;
  startDate: string;
  endDate: string;
  status: string;
  agendaItems: AgendaItem[];
  participants: Participant[];
}) {
  const [tab, setTab] = useState<TabId>('boards');
  const [expandedId, setExpandedId] = useState<string | null>(
    agendaItems[0]?.agendaItemId ?? null
  );

  const tabs: { id: TabId; label: string }[] = [
    { id: 'boards', label: 'Discussion boards' },
    { id: 'interventions', label: 'Interventions' },
    { id: 'participants', label: 'Participants' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        <strong>Sprint 3 feature:</strong> Real-time discussion boards and live co-editing will be available once OI-008 is
        confirmed with DGS.
      </div>

      <div className="card overflow-hidden">
        <div className="card-body border-b border-slate-100">
          <h1 className="page-title">Live meeting</h1>
          <p className="page-subtitle">{meetingTitle}</p>
          <p className="mt-2 text-sm text-slate-600">
            {committeeName} · {startDate} – {endDate} · Status: {status}
          </p>
        </div>
        <div className="flex flex-wrap gap-0 border-b border-slate-200 bg-slate-50/80">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'border-b-2 border-blue-600 text-blue-700 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="card-body">
          {tab === 'boards' && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900">Agenda items</h2>
              {agendaItems.length === 0 ? (
                <p className="text-sm text-slate-500">No agenda items.</p>
              ) : (
                <ul className="space-y-2">
                  {agendaItems.map((a) => {
                    const open = expandedId === a.agendaItemId;
                    return (
                      <li key={a.agendaItemId} className="rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId((cur) => (cur === a.agendaItemId ? null : a.agendaItemId))
                          }
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-50"
                        >
                          <span>
                            Item {a.itemNumber ?? '—'}: {a.title}
                          </span>
                          <span className="text-slate-400">{open ? '▼' : '▶'}</span>
                        </button>
                        {open && (
                          <div className="border-t border-slate-100 bg-slate-50/50 px-3 py-3">
                            <ul className="space-y-2 text-sm text-slate-700">
                              {MOCK_COMMENTS.map((c, i) => (
                                <li key={i} className="rounded border border-slate-100 bg-white px-3 py-2">
                                  <span className="font-medium text-slate-900">{c.author}</span>
                                  <span className="ml-2 text-xs text-slate-400">{c.at}</span>
                                  <p className="mt-1 text-slate-600">{c.text}</p>
                                </li>
                              ))}
                            </ul>
                            <textarea
                              disabled
                              placeholder="Live collaboration — Sprint 3 delivery"
                              className="mt-3 w-full resize-none rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                              rows={2}
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {tab === 'interventions' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Record formal interventions for the record. Full workflow links to the existing intervention form.
              </p>
              <Link href={`/meetings/${meetingId}/live/interventions/new`} className="btn-primary inline-block text-sm">
                Record intervention
              </Link>
            </div>
          )}

          {tab === 'participants' && (
            <ul className="space-y-2 text-sm text-slate-700">
              {participants.length === 0 ? (
                <li className="text-slate-500">No participants loaded.</li>
              ) : (
                participants.map((p) => (
                  <li key={p.participantId} className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    {p.name} · {p.meetingRole ?? '—'}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={`/meetings/${meetingId}/live/interventions/new`} className="btn-primary">
          Record intervention
        </Link>
        <Link href={`/meetings/${meetingId}/outcomes`} className="btn-secondary">
          Meeting outcomes
        </Link>
      </div>
    </div>
  );
}
