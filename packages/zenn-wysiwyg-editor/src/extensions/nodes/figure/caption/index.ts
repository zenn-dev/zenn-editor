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
        priority: 100,
      },
      // マークダウン入力経由だと、間にbrを持つ
      {
        tag: 'img + br + em',
        priority: 100,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['em', HTMLAttributes, 0];
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
