import { Table as TiptapTable } from "@tiptap/extension-table";
import { InputRule } from "@tiptap/react";

export const Table = TiptapTable.extend({
  addInputRules() {
    return [
      new InputRule({
        find: /^:::table(\d{1,2})-(\d{1,2})\s$/,
        handler: ({ match, range, chain, state }) => {
          const rows = parseInt(match[1], 10);
          const cols = parseInt(match[2], 10);

          if (rows === 0 || cols === 0 || rows > 20 || cols > 20) {
            return;
          }

          const isReplaceable = state.selection.$from.parent.canReplaceWith(
            state.selection.$from.index(),
            state.selection.$to.index() + 1,
            this.type,
          );

          if (!isReplaceable) {
            return null;
          }

          chain()
            .deleteRange({ from: range.from, to: range.to })
            .insertTable({
              rows,
              cols,
              withHeaderRow: true,
            })
            .run();
        },
      }),
    ];
  },
});
