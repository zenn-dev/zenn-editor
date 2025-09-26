import { Blockquote as TiptapBlockquote } from '@tiptap/extension-blockquote';
import { wrappingInputRule } from '@tiptap/react';

/**
 * Matches a blockquote to a `>` as input.
 */
const inputRegex = /^\s*>\s$/;

export const Blockquote = TiptapBlockquote.extend({
  addInputRules() {
    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
        undoable: false,
      }),
    ];
  },
});
