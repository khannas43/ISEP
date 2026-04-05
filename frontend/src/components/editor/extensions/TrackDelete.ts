import { Mark, mergeAttributes } from '@tiptap/core';

export const TrackDelete = Mark.create({
  name: 'trackDelete',
  addAttributes() {
    return {
      author: { default: null },
      authorName: { default: null },
      timestamp: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 's[data-type="deletion"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const name = (HTMLAttributes.authorName as string) || 'Unknown';
    return [
      's',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'deletion',
        class: 'line-through text-red-600 bg-red-50',
        title: `Deleted by ${name}`,
      }),
      0,
    ];
  },
});
