import { BulletList as TiptapBulletList } from '@tiptap/extension-list';
import { wrappingInputRule } from '@tiptap/react';

const TextStyleName = 'textStyle';

/**
 * Matches a bullet list to a dash or asterisk.
 */
const bulletListInputRegex = /^\s*([-+*])\s$/;

export const BulletList = TiptapBulletList.extend({
  // undoable を false にする
  addInputRules() {
    let inputRule = wrappingInputRule({
      find: bulletListInputRegex,
      type: this.type,
      undoable: false,
    });

    if (this.options.keepMarks || this.options.keepAttributes) {
      inputRule = wrappingInputRule({
        find: bulletListInputRegex,
        type: this.type,
        keepMarks: this.options.keepMarks,
        keepAttributes: this.options.keepAttributes,
        getAttributes: () => {
          return this.editor.getAttributes(TextStyleName);
        },
        editor: this.editor,
        undoable: false,
      });
    }
    return [inputRule];
  },
});
