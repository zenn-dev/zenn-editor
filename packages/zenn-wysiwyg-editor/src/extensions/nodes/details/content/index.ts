import { mergeAttributes, Node } from '@tiptap/react';

export const DetailsContent = Node.create({
  name: 'detailsContent',

  content: 'block+',
  defining: true,
  selectable: false,

  parseHTML() {
    return [
      {
        tag: `div.details-content`,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'details-content',
      }),
      0,
    ];
  },
});
