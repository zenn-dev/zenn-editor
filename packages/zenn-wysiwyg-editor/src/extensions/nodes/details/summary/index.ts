import { Selection } from '@tiptap/pm/state';
import { defaultBlockAt, Node } from '@tiptap/react';
import { isNodeVisible } from '../../../../lib/node';

export const DetailsSummary = Node.create({
  name: 'detailsSummary',

  content: 'text*',
  defining: true,
  selectable: false,
  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'summary',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['summary', HTMLAttributes, 0];
  },

  addNodeView() {
    return ({ getPos }) => {
      const dom = document.createElement('summary');

      const toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.contentEditable = 'false';
      const triangle = document.createElement('span');
      triangle.className = 'triangle';
      toggleButton.appendChild(triangle);

      const content = document.createElement('div');
      dom.appendChild(toggleButton);
      dom.appendChild(content);

      toggleButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        this.editor.commands.command(({ tr }) => {
          const summaryPos = getPos(); // summaryノードのbefore位置を取得
          if (!summaryPos) {
            return false;
          }

          const $detailsPos = tr.doc.resolve(summaryPos); // detailsノードが指定される
          const open = !$detailsPos.node().attrs.open;
          tr.setNodeMarkup($detailsPos.before(), undefined, {
            ...$detailsPos.parent.attrs,
            open,
          });
          return true;
        });
      });

      return {
        dom,
        contentDOM: content,
      };
    };
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { selection } = editor.state;
        const { $from } = selection;

        if (
          !selection.empty ||
          $from.node().type.name !== this.name ||
          $from.start() !== $from.pos
        ) {
          return false;
        }

        return editor.commands.unsetDetails();
      },

      // 閉じていたら次のブロックに移動、開いていたらコンテンツに移動
      Enter: ({ editor }) => {
        const { state, view } = editor;
        const { selection } = state;
        const { $head } = selection;

        if ($head.parent.type !== this.type) {
          return false;
        }

        const isVisible = isNodeVisible($head.after() + 1, editor);
        const above = isVisible
          ? state.doc.nodeAt($head.after())
          : $head.node(-2);

        if (!above) {
          return false;
        }

        const after = isVisible ? 0 : $head.indexAfter(-1);
        const type = defaultBlockAt(above.contentMatchAt(after));

        if (!type || !above.canReplaceWith(after, after, type)) {
          return false;
        }

        const node = type.createAndFill();

        if (!node) {
          return false;
        }

        const pos = isVisible ? $head.after() + 1 : $head.after(-1);
        const tr = state.tr.replaceWith(pos, pos, node);
        const $pos = tr.doc.resolve(pos);
        const newSelection = Selection.near($pos, 1);

        tr.setSelection(newSelection);
        tr.scrollIntoView();
        view.dispatch(tr);

        return true;
      },
    };
  },
});
