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
    <div className="flex flex-wrap items-center gap-1 border-b border-[var(--slate-200)] bg-white px-3 py-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={
          editor.isActive('bold')
            ? 'rounded bg-[var(--navy-50)] px-2 py-1 font-bold text-[var(--navy-700)]'
            : 'rounded px-2 py-1'
        }
        title={t('editor.bold')}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={
          editor.isActive('italic')
            ? 'rounded bg-[var(--navy-50)] px-2 py-1 italic text-[var(--navy-700)]'
            : 'rounded px-2 py-1'
        }
        title={t('editor.italic')}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={
          editor.isActive('underline')
            ? 'rounded bg-[var(--navy-50)] px-2 py-1 text-[var(--navy-700)] underline'
            : 'rounded px-2 py-1'
        }
        title={t('editor.underline')}
      >
        U
      </button>
      <div className="mx-1 h-5 w-px bg-slate-300" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive('bulletList') ? 'rounded bg-[var(--navy-50)] px-2 py-1 text-[var(--navy-700)]' : 'rounded px-2 py-1'
        }
      >
        •
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editor.isActive('orderedList') ? 'rounded bg-[var(--navy-50)] px-2 py-1 text-[var(--navy-700)]' : 'rounded px-2 py-1'
        }
      >
        1.
      </button>
      <div className="mx-1 h-5 w-px bg-slate-300" />
      <button
        type="button"
        onClick={onToggleTrackChanges}
        className={`rounded border px-2 py-1 text-sm font-medium ${
          trackChanges
            ? 'border-[var(--navy-500)] bg-[var(--navy-600)] text-white'
            : 'border-[var(--slate-300)] bg-white text-[var(--slate-600)]'
        }`}
        title={t('editor.trackChanges')}
      >
        {trackChanges ? t('editor.trackChangesOn') : t('editor.trackChangesOff')}
      </button>
      <div className="flex-1" />
      <span
        className={`text-sm px-2 ${
          saveStatus === 'conflict'
            ? 'text-red-600'
            : saveStatus === 'unsaved'
              ? 'text-[var(--warning)]'
              : saveStatus === 'saving'
                ? 'text-[var(--navy-500)]'
                : saveStatus === 'saved'
                  ? 'text-[var(--success)]'
                  : 'text-slate-400'
        }`}
      >
        {saveLabel}
      </span>
      {connectionStatus !== 'connected' && (
        <span
          className={`text-sm px-2 ${
            connectionStatus === 'connecting' ? 'text-[var(--slate-400)]' : 'text-red-500'
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
        className="rounded bg-[var(--navy-600)] px-3 py-1 text-sm text-white hover:bg-[var(--navy-700)]"
      >
        {t('editor.save')}
      </button>
    </div>
  );
}
