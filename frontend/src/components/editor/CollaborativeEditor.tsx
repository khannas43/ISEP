'use client'

import dynamic from 'next/dynamic'

/**
 * Loaded only on the client so y-websocket is never instantiated during SSR.
 * CollaborativeEditorCore uses a module-level provider cache for the same document room.
 */
export const CollaborativeEditor = dynamic(
  () =>
    import('./CollaborativeEditorCore').then((mod) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[CollabEditor] dynamic import resolved → CollaborativeEditorCore')
      }
      return { default: mod.CollaborativeEditor }
    }),
  { ssr: false, loading: () => null }
)
