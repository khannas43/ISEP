'use client'

import { Extension } from '@tiptap/core'
import {
  defaultCursorBuilder,
  defaultSelectionBuilder,
  yCursorPlugin,
} from '@tiptap/y-tiptap'
import type { Awareness } from 'y-protocols/awareness'

/** Provider must expose Yjs {@link Awareness} (e.g. y-websocket WebsocketProvider). */
export type YjsAwarenessProvider = { awareness: Awareness }

export interface YjsCollaborationCursorOptions {
  provider: YjsAwarenessProvider | null
  user: { name: string; color: string }
}

/**
 * Remote carets/selections using the same y-tiptap sync key as {@link @tiptap/extension-collaboration}.
 * The published `@tiptap/extension-collaboration-cursor@3.0.0` uses `y-prosemirror` and breaks with Collaboration v3.22.
 */
export const YjsCollaborationCursor = Extension.create<YjsCollaborationCursorOptions>({
  name: 'yjsCollaborationCursor',

  addOptions() {
    return {
      provider: null,
      user: { name: '', color: '#64748b' },
    }
  },

  addProseMirrorPlugins() {
    const p = this.options.provider
    if (!p?.awareness) {
      return []
    }
    p.awareness.setLocalStateField('user', {
      name: this.options.user.name,
      color: this.options.user.color,
    })
    return [
      yCursorPlugin(p.awareness, {
        cursorBuilder: defaultCursorBuilder,
        selectionBuilder: defaultSelectionBuilder,
      }),
    ]
  },
})
