import { Extension, textInputRule } from '@tiptap/react';

export const Typography = Extension.create({
  name: 'typography',

  addInputRules() {
    return [
      textInputRule({
        find: /<-$/,
        replace: '←',
      }),
      textInputRule({
        find: /<=$/,
        replace: '⇐',
      }),
      textInputRule({
        find: /->$/,
        replace: '→',
      }),
      textInputRule({
        find: /=>$/,
        replace: '⇒',
      }),
    ];
  },
});
