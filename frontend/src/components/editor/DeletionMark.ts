import { Mark, mergeAttributes } from '@tiptap/core';

/**
 * Track changes: deletion (removed text). Renders with strikethrough and red.
 */
export const Deletion = Mark.create({
  name: 'deletion',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      { tag: 'span[data-deletion]' },
      { tag: 'del' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-deletion': '',
        class: 'line-through text-red-600 bg-red-50 rounded px-0.5',
      }),
      0,
    ];
  },
});
