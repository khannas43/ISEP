import { Mark, mergeAttributes } from '@tiptap/core';

export const TrackInsert = Mark.create({
  name: 'trackInsert',
  addAttributes() {
    return {
      author: { default: null },
      authorName: { default: null },
      timestamp: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'mark[data-type="insertion"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const name = (HTMLAttributes.authorName as string) || 'Unknown';
    return [
      'mark',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'insertion',
        class: 'bg-green-100 text-green-800 underline decoration-green-500',
        title: `Inserted by ${name}`,
      }),
      0,
    ];
  },
});
