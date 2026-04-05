'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RoleGuard } from '@/components/rbac/RoleGuard';
import { getApiUrl } from '@/lib/api';

export type LivePostClient = {
  postId: string;
  content: string;
  postedByName: string;
  postType: string;
  postedAt: string;
};

type AgendaRow = { agendaItemId: string; itemNumber?: string; title: string; discussionLocked?: boolean };

const POST_TYPE_COLOURS: Record<string, string> = {
  INTERVENTION: '#1a3a6b',
  COMMENT: '#64748b',
  POINT_OF_ORDER: '#dc2626',
  INFORMATION: '#16a34a',
};

async function consumeSseStream(
  url: string,
  token: string,
  signal: AbortSignal,
  onEvent: (eventName: string, data: string) => void,
  onOpen?: () => void
) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
    signal,
  });
  if (!res.ok || !res.body) return;
  onOpen?.();
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let eventName = 'message';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) >= 0) {
      const block = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      let data = '';
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) eventName = line.slice(6).trim();
        else if (line.startsWith('data:')) data += line.slice(5).trim();
      }
      if (data) onEvent(eventName, data);
      eventName = 'message';
    }
  }
}

function apiPostToClient(p: Record<string, unknown>): LivePostClient {
  return {
    postId: String(p.postId ?? ''),
    content: String(p.content ?? ''),
    postedByName: String(p.postedByName ?? 'Delegate'),
    postType: String(p.postType ?? 'COMMENT'),
    postedAt: String(p.postedAt ?? ''),
  };
}

type Props = {
  meetingId: string;
  meetingTitle: string;
  committeeName: string;
  startDate: string;
  endDate: string;
  status: string;
  agendaItems: AgendaRow[];
  initialLiveSessionActive: boolean;
};

export function LiveMeetingDiscussionClient({
  meetingId,
  meetingTitle,
  committeeName,
  startDate,
  endDate,
  status,
  agendaItems,
  initialLiveSessionActive,
}: Props) {
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const [selectedItem, setSelectedItem] = useState<string | null>(() => agendaItems[0]?.agendaItemId ?? null);
  const [posts, setPosts] = useState<LivePostClient[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('COMMENT');
  const [submitting, setSubmitting] = useState(false);
  const [isLive, setIsLive] = useState(initialLiveSessionActive);
  const [sseConnected, setSseConnected] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const selectedAgenda = useMemo(
    () => agendaItems.find((a) => a.agendaItemId === selectedItem),
    [agendaItems, selectedItem]
  );

  const loadPosts = useCallback(async () => {
    if (!accessToken || !selectedItem) return;
    setLoadError(null);
    try {
      const res = await fetch(
        `${getApiUrl()}/api/v1/meetings/${meetingId}/live/agenda/${selectedItem}/posts`,
        { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
      );
      if (!res.ok) {
        setPosts([]);
        if (res.status === 404) setLoadError('Agenda item not found.');
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setPosts(list.map((p: Record<string, unknown>) => apiPostToClient(p)));
    } catch {
      setLoadError('Could not load discussion.');
      setPosts([]);
    }
  }, [accessToken, meetingId, selectedItem]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (!accessToken || !meetingId) return;
    const ac = new AbortController();
    setSseConnected(false);
    void (async () => {
      try {
        await consumeSseStream(
          `${getApiUrl()}/api/v1/meetings/${meetingId}/live/stream`,
          accessToken,
          ac.signal,
          (eventName, data) => {
            if (eventName !== 'new-post') return;
            try {
              const raw = JSON.parse(data) as Record<string, unknown>;
              const incoming = apiPostToClient(raw);
              setPosts((prev) => {
                if (prev.some((p) => p.postId === incoming.postId)) return prev;
                if (selectedItem && String(raw.agendaItemId ?? '') !== selectedItem) return prev;
                return [...prev, incoming];
              });
              setTimeout(() => {
                feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
              }, 80);
            } catch {
              /* ignore malformed */
            }
          },
          () => setSseConnected(true)
        );
      } catch {
        if (!ac.signal.aborted) setSseConnected(false);
      }
    })();
    return () => ac.abort();
  }, [accessToken, meetingId, selectedItem]);

  const submit = async () => {
    if (!accessToken || !selectedItem || !newPost.trim()) return;
    setSubmitting(true);
    setPostError(null);
    try {
      const res = await fetch(
        `${getApiUrl()}/api/v1/meetings/${meetingId}/live/agenda/${selectedItem}/posts`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newPost.trim(), postType }),
        }
      );
      if (res.status === 403) {
        setPostError('Live session is not active. Ask a Delegation Leader to activate.');
        return;
      }
      if (res.status === 423) {
        setPostError('Discussion is locked for this agenda item.');
        return;
      }
      if (!res.ok) {
        setPostError('Could not post. Try again.');
        return;
      }
      const created = apiPostToClient((await res.json()) as Record<string, unknown>);
      setPosts((prev) => (prev.some((p) => p.postId === created.postId) ? prev : [...prev, created]));
      setNewPost('');
    } catch {
      setPostError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const activate = async () => {
    if (!accessToken) return;
    const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/live/activate`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) setIsLive(true);
  };

  const lockDiscussion = async () => {
    if (!accessToken || !selectedItem) return;
    await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/live/agenda/${selectedItem}/lock`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  };

  if (!accessToken) {
    return <p className="text-slate-600">Sign in to use the live discussion.</p>;
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full max-w-[1600px] flex-col border border-slate-200 bg-white lg:flex-row">
      <div className="flex min-h-[50vh] flex-1 flex-col border-slate-200 lg:border-r">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--navy-800)] px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-white">Live discussion</h2>
            <p className="mt-0.5 truncate text-xs text-white/60">
              {meetingTitle} · {committeeName}
            </p>
            <p className="mt-1 text-[11px] text-white/50">
              {startDate} – {endDate} · {status}
            </p>
          </div>
          <div
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-white ${
              isLive ? 'bg-emerald-600' : 'bg-slate-500'
            }`}
          >
            {isLive ? '● LIVE' : '○ STANDBY'}
          </div>
        </div>

        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 sm:px-6">
          <label htmlFor="live-agenda-select" className="sr-only">
            Agenda item
          </label>
          <select
            id="live-agenda-select"
            className="w-full max-w-xl rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            value={selectedItem ?? ''}
            onChange={(e) => setSelectedItem(e.target.value || null)}
          >
            {agendaItems.length === 0 && <option value="">No agenda items</option>}
            {agendaItems.map((a) => (
              <option key={a.agendaItemId} value={a.agendaItemId}>
                {a.itemNumber ? `${a.itemNumber} — ` : ''}
                {a.title}
                {a.discussionLocked ? ' (locked)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div
          ref={feedRef}
          className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50 px-4 py-4 sm:px-6"
        >
          {loadError && <p className="text-center text-sm text-amber-700">{loadError}</p>}
          {posts.length === 0 && !loadError && (
            <p className="py-12 text-center text-sm text-slate-400">No posts yet. Be the first to contribute.</p>
          )}
          {posts.map((post, i) => (
            <div
              key={post.postId || `p-${i}`}
              className="rounded-r-lg border border-slate-200 border-l-4 bg-white py-3 pl-4 pr-4 shadow-sm"
              style={{ borderLeftColor: POST_TYPE_COLOURS[post.postType] ?? '#64748b' }}
            >
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[var(--navy-700)]">{post.postedByName}</span>
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{
                      background: `${POST_TYPE_COLOURS[post.postType] ?? '#64748b'}18`,
                      color: POST_TYPE_COLOURS[post.postType] ?? '#64748b',
                    }}
                  >
                    {post.postType.replaceAll('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {post.postedAt
                      ? new Date(post.postedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                </div>
              </div>
              <p className="m-0 text-sm leading-relaxed text-slate-700">{post.content}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          {postError && <p className="mb-2 text-sm text-red-600">{postError}</p>}
          <div className="mb-2 flex flex-wrap gap-2">
            {(['COMMENT', 'INTERVENTION', 'INFORMATION', 'POINT_OF_ORDER'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPostType(type)}
                className={`rounded border px-2.5 py-1 text-[11px] font-medium ${
                  postType === type ? 'border-[var(--navy-600)] bg-slate-100' : 'border-slate-200 text-slate-500'
                }`}
              >
                {type.replaceAll('_', ' ')}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Type your intervention or comment…"
              rows={2}
              className="min-h-[3rem] flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--navy-400)]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) void submit();
              }}
            />
            <button
              type="button"
              onClick={() => void submit()}
              disabled={submitting || !newPost.trim() || !selectedItem}
              className="self-stretch rounded-lg bg-[var(--navy-600)] px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Post
            </button>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">⌘+Enter to post quickly</p>
        </div>
      </div>

      <aside className="w-full shrink-0 border-t border-slate-200 bg-white p-5 lg:w-[280px] lg:border-t-0">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Session controls</h3>
        <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'DELEGATION_LEADER']}>
          <button
            type="button"
            onClick={() => void activate()}
            disabled={isLive}
            className="mb-2.5 w-full rounded-lg bg-[var(--navy-600)] py-2.5 text-sm font-semibold text-white disabled:cursor-default disabled:bg-slate-200 disabled:text-slate-500"
          >
            {isLive ? '● Session active' : 'Activate live session'}
          </button>
          <button
            type="button"
            onClick={() => void lockDiscussion()}
            className="w-full rounded-lg border border-red-300 py-2.5 text-sm font-semibold text-red-700"
          >
            Lock discussion
          </button>
        </RoleGuard>
        <div className="mt-6 border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-500">
            {posts.length} posts · SSE {sseConnected ? 'connected' : 'connecting…'}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {selectedAgenda?.discussionLocked ? 'This agenda item is locked.' : ''}
          </p>
        </div>
        <Link href={`/meetings/${meetingId}?tab=live`} className="mt-6 inline-block text-sm text-slate-600 hover:text-slate-900">
          ← Meeting overview
        </Link>
      </aside>
    </div>
  );
}
