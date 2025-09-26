import { OrderedList as TiptapOrderedList } from '@tiptap/extension-list';
import { wrappingInputRule } from '@tiptap/react';

const TextStyleName = 'textStyle';

/**
 * Matches an ordered list to a 1. on input (or any number followed by a dot).
 */
const orderedListInputRegex = /^(\d+)\.\s$/;

export const OrderedList = TiptapOrderedList.extend({
  addInputRules() {
    let inputRule = wrappingInputRule({
      find: orderedListInputRegex,
      type: this.type,
      getAttributes: (match) => ({ start: +match[1] }),
      joinPredicate: (match, node) =>
        node.childCount + node.attrs.start === +match[1],
      undoable: false,
    });

    if (this.options.keepMarks || this.options.keepAttributes) {
      inputRule = wrappingInputRule({
        find: orderedListInputRegex,
        type: this.type,
        keepMarks: this.options.keepMarks,
        keepAttributes: this.options.keepAttributes,
        getAttributes: (match) => ({
          start: +match[1],
          ...this.editor.getAttributes(TextStyleName),
        }),
        joinPredicate: (match, node) =>
          node.childCount + node.attrs.start === +match[1],
        editor: this.editor,
        undoable: false,
      });
    }
    return [inputRule];
  },
});
