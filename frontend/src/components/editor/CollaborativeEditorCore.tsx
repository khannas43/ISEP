'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import type { Editor as TiptapEditor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Collaboration from '@tiptap/extension-collaboration'
import { YjsCollaborationCursor } from './extensions/YjsCollaborationCursor'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { TrackInsert } from './extensions/TrackInsert'
import { TrackDelete } from './extensions/TrackDelete'
import { EditorToolbar } from './EditorToolbar'
import { PresenceBar, type ConnectedUser } from './PresenceBar'

/** Deterministic peer list for awareness → JSON comparison (order-independent). */
function remotePeersFromAwareness(
  awareness: WebsocketProvider['awareness'],
  selfClientId: number
): ConnectedUser[] {
  const next: ConnectedUser[] = []
  awareness.getStates().forEach((state, clientId) => {
    if (clientId === selfClientId) return
    const u = state.user as { name?: string; color?: string } | undefined
    if (u?.name) {
      next.push({
        clientId: String(clientId),
        name: u.name,
        color: u.color ?? '#64748b',
      })
    }
  })
  next.sort((a, b) => a.clientId.localeCompare(b.clientId, undefined, { numeric: true }))
  return next
}

function connectedPeersJson(peers: ConnectedUser[]): string {
  return JSON.stringify(
    peers.map((u) => ({ clientId: u.clientId, name: u.name, color: u.color }))
  )
}
import { colourForUser } from './cursorColours'
import { useTranslation } from '@/i18n/client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getApiUrl } from '@/lib/api'

function uint8ToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

interface Props {
  documentId: string
  initialContent: string
  initialVersion: number
  /** Base64 Y.js state from GET /editor, if any */
  initialYdocState?: string | null
  isLocked: boolean
  currentUser: { userId: string; fullName: string }
  onSaveStatusChange?: (status: 'saved' | 'saving' | 'unsaved' | 'conflict') => void
}

const AUTOSAVE_MS = 30_000

/** Delay before tearing down WS after last subscriber — absorbs Fast Refresh unmount/remount. */
const CACHE_DISPOSE_MS = 250

type CacheEntry = {
  ydoc: Y.Doc
  provider: WebsocketProvider
  refCount: number
  disposeTimer: ReturnType<typeof setTimeout> | null
}

const collabProviderCache = new Map<string, CacheEntry>()

function collabCacheKey(wsUrl: string, documentId: string) {
  return `${wsUrl}\0${documentId}`
}

function applyInitialYdocState(ydoc: Y.Doc, initialYdocState: string | null | undefined) {
  if (!initialYdocState || initialYdocState.length === 0) return
  try {
    const binary = atob(initialYdocState)
    const len = binary.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
    Y.applyUpdate(ydoc, bytes)
  } catch {
    // ignore invalid snapshot
  }
}

function getOrCreateCollabSession(
  wsUrl: string,
  documentId: string,
  isLocked: boolean,
  initialYdocState: string | null | undefined
): { ydoc: Y.Doc; provider: WebsocketProvider } {
  const key = collabCacheKey(wsUrl, documentId)
  let entry = collabProviderCache.get(key)
  if (process.env.NODE_ENV === 'development') {
    console.log('[CollabEditor] getOrCreateCollabSession', {
      documentId,
      wsUrl,
      isLocked,
      cacheHit: Boolean(entry),
      websocketShouldConnect: !isLocked,
    })
  }
  if (entry) {
    if (entry.disposeTimer !== null) {
      clearTimeout(entry.disposeTimer)
      entry.disposeTimer = null
    }
    entry.refCount += 1
    if (isLocked) {
      entry.provider.disconnect()
    } else {
      entry.provider.connect()
    }
    return { ydoc: entry.ydoc, provider: entry.provider }
  }

  const ydoc = new Y.Doc()
  applyInitialYdocState(ydoc, initialYdocState)
  const provider = new WebsocketProvider(wsUrl, documentId, ydoc, {
    connect: !isLocked,
  })
  entry = { ydoc, provider, refCount: 1, disposeTimer: null }
  collabProviderCache.set(key, entry)
  return { ydoc, provider }
}

function releaseCollabSession(wsUrl: string, documentId: string) {
  const key = collabCacheKey(wsUrl, documentId)
  const entry = collabProviderCache.get(key)
  if (!entry) return
  entry.refCount -= 1
  if (entry.refCount > 0) return
  entry.disposeTimer = setTimeout(() => {
    const current = collabProviderCache.get(key)
    if (!current || current.refCount > 0) return
    current.provider.destroy()
    current.ydoc.destroy()
    collabProviderCache.delete(key)
  }, CACHE_DISPOSE_MS)
}

export function CollaborativeEditor({
  documentId,
  initialContent,
  initialVersion,
  initialYdocState = null,
  isLocked,
  currentUser,
  onSaveStatusChange,
}: Props) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[CollabEditor] CollaborativeEditor (core) render', {
      documentId,
      isLocked,
    })
  }
  const { t, i18n } = useTranslation('common')
  const { data: session } = useSession()
  const accessTokenRef = useRef<string | undefined>(undefined)
  accessTokenRef.current = (session as { accessToken?: string } | null)?.accessToken
  const [trackChanges, setTrackChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'conflict'>('saved')
  const [displayVersion, setDisplayVersion] = useState(initialVersion)
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([])
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'connecting' | 'disconnected'
  >(() => (isLocked ? 'connected' : 'connecting'))

  const versionRef = useRef(initialVersion)

  const wsUrl = useMemo(
    () => process.env.NEXT_PUBLIC_YJS_WS_URL ?? 'ws://localhost:8000/collab',
    []
  )

  const userColor = useMemo(() => colourForUser(currentUser.userId), [currentUser.userId])

  // Only documentId + wsUrl define the shared session. Omit isLocked (would double refCount via
  // getOrCreate) and initialYdocState (seed snapshot only on cold cache miss).
  const { ydoc, provider } = useMemo(
    () => getOrCreateCollabSession(wsUrl, documentId, isLocked, initialYdocState),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- collab cache key; see comment above
    [documentId, wsUrl]
  )

  useEffect(() => {
    return () => {
      releaseCollabSession(wsUrl, documentId)
    }
  }, [documentId, wsUrl])

  useEffect(() => {
    if (isLocked) {
      provider.disconnect()
      setConnectionStatus('connected')
    } else {
      provider.connect()
    }
  }, [isLocked, provider])

  const onSaveStatusChangeRef = useRef(onSaveStatusChange)
  onSaveStatusChangeRef.current = onSaveStatusChange

  const persistToBackend = useCallback(
    async (html: string, json: object, ydocState?: Uint8Array) => {
      const accessToken = accessTokenRef.current
      if (!accessToken || isLocked) return

      setSaveStatus('saving')
      onSaveStatusChangeRef.current?.('saving')

      try {
        const res = await fetch(`${getApiUrl()}/api/v1/documents/${documentId}/content`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            contentHtml: html,
            contentJson: json,
            ydocState: ydocState && ydocState.length > 0 ? uint8ToBase64(ydocState) : undefined,
            version: versionRef.current,
          }),
        })

        if (res.status === 409) {
          const body = await res.json().catch(() => ({}))
          if (body?.error === 'VERSION_CONFLICT') {
            setSaveStatus('conflict')
            onSaveStatusChangeRef.current?.('conflict')
            if (typeof body.currentVersion === 'number') {
              versionRef.current = body.currentVersion
            }
            return
          }
        }

        if (!res.ok) throw new Error('Save failed')

        const saved = (await res.json()) as { version?: number }
        if (typeof saved.version === 'number') {
          versionRef.current = saved.version
          setDisplayVersion(saved.version)
        }
        setSaveStatus('saved')
        onSaveStatusChangeRef.current?.('saved')
      } catch {
        setSaveStatus('unsaved')
        onSaveStatusChangeRef.current?.('unsaved')
      }
    },
    [documentId, isLocked]
  )

  // Must not depend on connectedUsers / awareness UI state — only ydoc, provider, locale, local user.
  const extensions = useMemo(
    () => [
      StarterKit.configure({ undoRedo: false }),
      Placeholder.configure({
        placeholder: i18n.t('editor.placeholder'),
      }),
      Highlight,
      TrackInsert,
      TrackDelete,
      Collaboration.configure({
        document: ydoc,
        provider,
      }),
      YjsCollaborationCursor.configure({
        provider,
        user: {
          name: currentUser.fullName,
          color: userColor,
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- i18n singleton; locale changes tracked via i18n.language
    [currentUser.fullName, provider, userColor, ydoc, i18n.language]
  )

  const editorProps = useMemo(
    () => ({
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[240px] p-6',
      },
    }),
    []
  )

  const onCreate = useCallback(
    ({ editor: ed }: { editor: TiptapEditor }) => {
      const fragment = ydoc.getXmlFragment('default')
      const hasYjsBody = fragment.length > 0
      const hasYdocFromServer = Boolean(initialYdocState && initialYdocState.length > 0)
      if (!hasYjsBody && !hasYdocFromServer) {
        const html = initialContent?.trim() ? initialContent : '<p></p>'
        ed.commands.setContent(html)
      }
    },
    [ydoc, initialContent, initialYdocState]
  )

  const onUpdate = useCallback(() => {
    if (isLocked) return
    setSaveStatus((prev) => {
      if (prev === 'unsaved') return prev
      return 'unsaved'
    })
    onSaveStatusChangeRef.current?.('unsaved')
  }, [isLocked])

  const editor = useEditor(
    {
      extensions,
      editable: !isLocked,
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      onCreate,
      onUpdate,
      editorProps,
    },
    // Recreate only when extensions / editorProps identity changes — not on isLocked (use setEditable).
    [extensions, editorProps]
  )

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    editor.setEditable(!isLocked)
  }, [editor, isLocked])

  useEffect(() => {
    versionRef.current = initialVersion
    setDisplayVersion(initialVersion)
  }, [initialVersion])

  useEffect(() => {
    if (isLocked) {
      setConnectionStatus('connected')
      return
    }
    const handler = ({ status }: { status: string }) => {
      if (status === 'connected') setConnectionStatus('connected')
      else if (status === 'connecting') setConnectionStatus('connecting')
      else setConnectionStatus('disconnected')
    }
    provider.on('status', handler)
    return () => {
      provider.off('status', handler)
    }
  }, [isLocked, provider])

  /** Last serialized remote peer set — deep equality so cursor/field churn does not re-render. */
  const lastConnectedPeersJsonRef = useRef<string>('[]')

  useEffect(() => {
    lastConnectedPeersJsonRef.current = '[]'
    const selfId = provider.awareness.clientID
    let rafId = 0

    const flushPeers = () => {
      rafId = 0
      const next = remotePeersFromAwareness(provider.awareness, selfId)
      const json = connectedPeersJson(next)
      if (json === lastConnectedPeersJsonRef.current) return
      lastConnectedPeersJsonRef.current = json
      setConnectedUsers(next)
    }

    const scheduleFlush = () => {
      if (rafId !== 0) return
      rafId = requestAnimationFrame(flushPeers)
    }

    provider.awareness.setLocalStateField('user', {
      name: currentUser.fullName,
      color: userColor,
    })
    provider.awareness.on('update', scheduleFlush)
    flushPeers()

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId)
      provider.awareness.off('update', scheduleFlush)
    }
    // provider is stable per (documentId, wsUrl) cache entry; do not depend on awareness-driven state.
  }, [currentUser.fullName, provider, userColor])

  useEffect(() => {
    if (!editor || isLocked) return
    const id = window.setInterval(() => {
      const state = Y.encodeStateAsUpdate(ydoc)
      void persistToBackend(editor.getHTML(), editor.getJSON(), state)
    }, AUTOSAVE_MS)
    return () => window.clearInterval(id)
  }, [editor, isLocked, persistToBackend, ydoc])

  if (!editor) return null

  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-lg border border-[var(--slate-200)] bg-white shadow-sm">
      <PresenceBar users={connectedUsers} />
      {!isLocked && (
        <EditorToolbar
          editor={editor}
          trackChanges={trackChanges}
          onToggleTrackChanges={() => setTrackChanges((x) => !x)}
          onManualSave={() => {
            const state = Y.encodeStateAsUpdate(ydoc)
            void persistToBackend(editor.getHTML(), editor.getJSON(), state)
          }}
          saveStatus={saveStatus}
          connectionStatus={connectionStatus}
        />
      )}
      {isLocked && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-base text-amber-900">
          {t('editor.locked')}
        </div>
      )}
      {saveStatus === 'conflict' && (
        <div
          role="alert"
          className="border-b border-red-200 bg-red-50 px-4 py-2 text-base text-red-900"
        >
          {t('editor.versionConflict')}
        </div>
      )}
      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
      {!isLocked && (
        <p className="border-t border-slate-100 px-4 py-2 text-sm text-slate-500">
          {t('editor.version', { version: displayVersion })} ·{' '}
          {currentUser.fullName || currentUser.userId}
        </p>
      )}
    </div>
  )
}
