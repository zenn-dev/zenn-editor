import { Fragment, Slice } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Node } from '@tiptap/react';
import { isProseMirrorPaste } from '../../../../lib/clipboard';

export const DiffCodeLine = Node.create({
  name: 'diffCodeLine',
  content: 'text*',
  marks: '',

  parseHTML() {
    return [
      {
        tag: '.diff-highlight > span',
      },
    ];
  },

  renderHTML() {
    return ['span', 0];
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { selection } = this.editor.state;
        const { $from } = selection;

        if ($from.node().type.name !== this.name) return false;
        if (!selection.empty) return false;

        if (!($from.index(-1) === 0 && $from.start() === $from.pos))
          return false;

        return this.editor.commands.unsetCodeBlockContainer();
      },

      // exit node on triple enter
      Enter: ({ editor }) => {
        return editor.commands.first(({ chain }) => [
          () => {
            const { state } = editor;
            const { selection } = state;
            const { $from, empty } = selection;

            if (!empty || $from.parent.type !== this.type) {
              return false;
            }

            const codeBlock = $from.node(-1);
            const isAtLineEnd =
              $from.parentOffset === $from.parent.nodeSize - 2;
            const isAtRowEnd = $from.index(-1) === codeBlock.childCount - 1;
            const endsWithDoubleNewline =
              codeBlock.childCount >= 2 &&
              codeBlock.child(codeBlock.childCount - 1).childCount === 0 &&
              codeBlock.child(codeBlock.childCount - 2).childCount === 0;

            if (!isAtLineEnd || !isAtRowEnd || !endsWithDoubleNewline) {
              return false;
            }

            return chain()
              .insertContentAt($from.pos + 3, {
                type: 'paragraph',
              })
              .setTextSelection($from.pos + 3)
              .command(({ tr }) => {
                tr.delete($from.pos - 3, $from.pos);

                return true;
              })
              .run();
          },
          ({ commands }) => {
            const { state } = editor;
            const { selection } = state;
            const { $from } = selection;

            if ($from.parent.type !== this.type) {
              return false;
            }

            // コードブロックだと<br/>が挿入されるので、先に改行で分割する
            return commands.splitBlock();
          },
        ]);
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('diffCodeLine'),
        props: {
          handlePaste: (view, event) => {
            const { $from, $to } = view.state.selection;

            // ProseMirrorのペーストはビルトインの処理に流す
            if (isProseMirrorPaste(event)) {
              return false;
            }

            if (
              $from.node().type.name !== this.name &&
              $to.node().type.name !== this.name
            ) {
              return false;
            }

            // それ以外はテキストとして扱う
            const text = event.clipboardData?.getData('text/plain');
            if (!text) return false;

            const tr = view.state.tr;
            const nodes = text
              .split('\n')
              .map((line) =>
                this.type.create(
                  null,
                  line ? [view.state.schema.text(line)] : []
                )
              );

            const fragment = Fragment.fromArray(nodes);
            const slice = new Slice(fragment, 1, 1);

            tr.replace($from.pos, $to.pos, slice);
            view.dispatch(tr);

            return true;
          },
        },
      }),
    ];
  },
});
