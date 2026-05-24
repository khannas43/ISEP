'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Content } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { Insertion } from './InsertionMark';
import { Deletion } from './DeletionMark';

const DEFAULT_CONTENT: Content = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'India supports the proposed timeline for implementation of the Strategic Plan and wishes to highlight the importance of capacity-building for developing countries.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'We suggest adding a reference to regional workshops in paragraph 3.' },
      ],
    },
  ],
};

type Props = {
  paperId: string;
  initialContent?: Content | null;
  onSave?: (content: Content) => void;
  readOnly?: boolean;
};

export function PaperEditor({ paperId, initialContent, onSave, readOnly = false }: Props) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder: 'Start drafting the paper…' }),
      Highlight.configure({ multicolor: false }),
      Insertion,
      Deletion,
    ],
    content: initialContent ?? DEFAULT_CONTENT,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class:
          'min-h-[280px] w-full px-4 py-3 text-slate-800 prose prose-slate max-w-none focus:outline-none',
      },
    },
  });

  const save = useCallback(() => {
    if (!editor || !onSave) return;
    const json = editor.getJSON();
    onSave(json);
    setLastSaved(new Date());
  }, [editor, onSave]);

  // Auto-save every 60 seconds
  useEffect(() => {
    if (readOnly || !editor || !onSave) return;
    autoSaveTimerRef.current = setInterval(() => {
      const json = editor.getJSON();
      onSave(json);
      setLastSaved(new Date());
    }, 60_000);
    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [readOnly, editor, onSave]);

  const handleSubmit = useCallback(() => {
    if (editor && onSave) {
      onSave(editor.getJSON());
      setLastSaved(new Date());
    }
    setSubmitted(true);
  }, [editor, onSave]);

  if (!mounted || !editor) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-500">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded p-2 text-base font-medium transition ${editor.isActive('bold') ? 'bg-slate-200' : 'hover:bg-slate-200'}`}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded p-2 text-base italic transition ${editor.isActive('italic') ? 'bg-slate-200' : 'hover:bg-slate-200'}`}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`rounded p-2 text-base transition ${editor.isActive('strike') ? 'bg-slate-200' : 'hover:bg-slate-200'}`}
            title="Strikethrough (deletion)"
          >
            S
          </button>
          <span className="mx-1 text-slate-300">|</span>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`rounded p-2 text-base transition ${editor.isActive('highlight') ? 'bg-emerald-200' : 'hover:bg-slate-200'}`}
            title="Highlight (insertion)"
          >
            Ins
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleMark('insertion').run()}
            className={`rounded p-2 text-base transition ${editor.isActive('insertion') ? 'bg-emerald-200' : 'hover:bg-slate-200'}`}
            title="Mark as insertion (track change)"
          >
            +Ins
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleMark('deletion').run()}
            className={`rounded p-2 text-base transition ${editor.isActive('deletion') ? 'bg-red-200' : 'hover:bg-slate-200'}`}
            title="Mark as deletion (track change)"
          >
            Del
          </button>
          <span className="mx-1 text-slate-300">|</span>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`rounded p-2 text-base transition ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : 'hover:bg-slate-200'}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`rounded p-2 text-base transition ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200' : 'hover:bg-slate-200'}`}
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`rounded p-2 text-base transition ${editor.isActive('bulletList') ? 'bg-slate-200' : 'hover:bg-slate-200'}`}
            title="Bullet list"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`rounded p-2 text-base transition ${editor.isActive('orderedList') ? 'bg-slate-200' : 'hover:bg-slate-200'}`}
            title="Numbered list"
          >
            1.
          </button>
        </div>
      )}

      <EditorContent editor={editor} />

      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-sm text-slate-500">
            {lastSaved ? <>Last saved {lastSaved.toLocaleTimeString()}</> : 'Unsaved'}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={save} className="btn-secondary text-base">
              Save draft
            </button>
            <button type="button" onClick={handleSubmit} className="btn-primary text-base">
              Submit for review
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="border-t border-emerald-200 bg-emerald-50 px-4 py-3 text-base text-emerald-800">
          Submitted for review (demo). In production this would start the approval workflow.
        </div>
      )}
    </div>
  );
}
