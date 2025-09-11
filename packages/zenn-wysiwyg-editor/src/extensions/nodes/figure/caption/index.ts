import { Node } from '@tiptap/react';

export const Caption = Node.create({
  name: 'caption',
  group: 'block',
  content: 'text*',
  defining: true,
  marks: '',

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
    return ({ getPos, editor }) => {
      const dom = document.createElement('em');
      const pos = getPos();
      if (typeof pos !== 'number') {
        throw new Error('getPos is not number');
      }

      const $img = editor.state.doc.nodeAt(pos - 1);
      if (!$img) {
        throw new Error('No image node found before caption');
      }

      // 画像にLinkマークがついている場合、キャプションを非表示にする
      const hasLinkMark = $img.marks.some((mark) => mark.type.name === 'link');
      if (hasLinkMark) {
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
});
