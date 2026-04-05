'use client';

import type { Editor } from '@tiptap/react';
import { useTranslation } from '@/i18n/client';

interface Props {
  editor: Editor;
  trackChanges: boolean;
  onToggleTrackChanges: () => void;
  onManualSave: () => void;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'conflict';
  connectionStatus?: 'connected' | 'connecting' | 'disconnected';
}

export function EditorToolbar({
  editor,
  trackChanges,
  onToggleTrackChanges,
  onManualSave,
  saveStatus,
  connectionStatus = 'connected',
}: Props) {
  const { t } = useTranslation('common');

  const saveLabel = {
    saved: t('editor.saved'),
    saving: t('editor.saving'),
    unsaved: t('editor.unsaved'),
    conflict: t('editor.conflict'),
  }[saveStatus];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'rounded bg-slate-200 px-2 py-1 font-bold' : 'rounded px-2 py-1'}
        title={t('editor.bold')}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'rounded bg-slate-200 px-2 py-1 italic' : 'rounded px-2 py-1'}
        title={t('editor.italic')}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'rounded bg-slate-200 px-2 py-1 underline' : 'rounded px-2 py-1'}
        title={t('editor.underline')}
      >
        U
      </button>
      <div className="mx-1 h-5 w-px bg-slate-300" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'rounded bg-slate-200 px-2 py-1' : 'rounded px-2 py-1'}
      >
        •
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'rounded bg-slate-200 px-2 py-1' : 'rounded px-2 py-1'}
      >
        1.
      </button>
      <div className="mx-1 h-5 w-px bg-slate-300" />
      <button
        type="button"
        onClick={onToggleTrackChanges}
        className={`rounded border px-2 py-1 text-xs font-medium ${
          trackChanges ? 'border-green-400 bg-green-100 text-green-800' : 'border-slate-300 bg-white text-slate-600'
        }`}
        title={t('editor.trackChanges')}
      >
        {trackChanges ? t('editor.trackChangesOn') : t('editor.trackChangesOff')}
      </button>
      <div className="flex-1" />
      <span
        className={`text-xs px-2 ${
          saveStatus === 'conflict'
            ? 'text-red-600'
            : saveStatus === 'unsaved'
              ? 'text-amber-600'
              : saveStatus === 'saving'
                ? 'text-blue-600'
                : 'text-slate-400'
        }`}
      >
        {saveLabel}
      </span>
      {connectionStatus !== 'connected' && (
        <span
          className={`text-xs px-2 ${
            connectionStatus === 'connecting' ? 'text-blue-400' : 'text-red-500'
          }`}
        >
          {connectionStatus === 'connecting'
            ? t('editor.connecting')
            : t('editor.disconnected')}
        </span>
      )}
      <button
        type="button"
        onClick={onManualSave}
        className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
      >
        {t('editor.save')}
      </button>
    </div>
  );
}
