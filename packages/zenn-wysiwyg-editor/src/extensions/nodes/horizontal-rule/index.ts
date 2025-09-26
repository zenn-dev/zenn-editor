import HorizontalRuleTiptap from '@tiptap/extension-horizontal-rule';
import { InputRule } from '@tiptap/react';

export const HorizontalRule = HorizontalRuleTiptap.extend({
  addCommands() {
    return {
      setHorizontalRule:
        () =>
        ({ chain, state }) => {
          const { selection } = state;
          const range = selection.$from.blockRange(selection.$to);

          if (!range) {
            return false;
          }

          const isParentMatch = range.parent.type.contentMatch.matchType(
            this.type
          );

          if (!isParentMatch) {
            return false;
          }

          return chain()
            .insertContentAt(
              {
                from: range.start,
                to: range.end,
              },
              [{ type: this.name }]
            )
            .setTextSelection(range.start + 2)
            .run();
        },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: /^(?:---\s|___\s|\*\*\*\s)$/,
        handler: ({ range, chain, can }) => {
          if (!can().setHorizontalRule()) {
            return;
          }

          chain().deleteRange(range).setHorizontalRule().run();
        },
        undoable: false,
      }),
    ];
  },
});
