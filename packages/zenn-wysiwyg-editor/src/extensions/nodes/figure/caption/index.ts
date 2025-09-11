import { Node } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const Caption = Node.create({
  name: 'caption',
  group: 'block',
  content: 'text*',
  defining: true,
  marks: '',

  addAttributes() {
    return {
      hidden: {
        default: false,
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img + em',
      },
      // マークダウン入力経由だと、間にbrを持つ
      {
        tag: 'img + br + em',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['em', HTMLAttributes, 0];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('em');

      if (node.attrs.hidden) {
        dom.style.display = 'none';
      }

      return {
        dom,
        contentDOM: dom,
      };
    };
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { selection } = editor.state;
        const { $from } = selection;

        if ($from.node().type.name !== this.name) return false;
        if (!selection.empty) return false;
        if ($from.start() !== $from.pos) return false;

        return editor.commands.clearFigure();
      },
      // 下に段落を生成して移動
      Enter: ({ editor }) => {
        const { $from } = editor.state.selection;

        if ($from.node().type.name !== this.name) {
          return false;
        }

        return editor.commands.insertContentAt($from.after(-1), {
          type: 'paragraph',
        });
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('caption-link'),
        appendTransaction(_, __, newState) {
          const tr = newState.tr;
          let modified = false;

          newState.doc.descendants((node, pos) => {
            if (node.type.name !== 'caption') {
              return true;
            }

            // キャプションの前の要素（画像）を取得
            const imgNode = newState.doc.nodeAt(pos - 1);
            if (!imgNode || imgNode.type.name !== 'image') {
              return true;
            }

            const hasLinkMark = imgNode.marks.some(
              (mark) => mark.type.name === 'link'
            );

            // リンク画像ならキャプションを隠す
            const currentHidden = node.attrs.hidden;
            if (currentHidden !== hasLinkMark) {
              tr.setNodeAttribute(pos, 'hidden', hasLinkMark);
              modified = true;
            }

            return true;
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});
