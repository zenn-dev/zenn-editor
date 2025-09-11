import { Node } from '@tiptap/react';
import { captionLinkPlugin } from './caption-link-plugin';

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
    return [captionLinkPlugin];
  },
});
