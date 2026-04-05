import { Mark, mergeAttributes } from '@tiptap/core';

/**
 * Track changes: insertion (new text). Renders with green background.
 */
export const Insertion = Mark.create({
  name: 'insertion',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      { tag: 'span[data-insertion]' },
      { tag: 'ins' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-insertion': '',
        class: 'bg-emerald-100 text-emerald-900 rounded px-0.5',
      }),
      0,
    ];
  },
});
