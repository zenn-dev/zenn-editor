import { mergeAttributes, Node } from '@tiptap/react';

export const MessageContent = Node.create({
  name: 'messageContent',
  content: 'block+',

  parseHTML() {
    return [
      {
        tag: 'div.msg-content',
        priority: 100, // paragraph よりも先に評価する
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'msg-content',
      }),
      0,
    ];
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { selection } = this.editor.state;
        const { $from } = selection;
        if ($from.depth === 0 || $from.node(-1).type.name !== this.name)
          return false;

        if (!selection.empty) return false;
        // メッセージコンテンツ全体での先頭。+1 は一番上にあるノードの先頭にするため（paragraphの中に入るなど）
        if ($from.start(-1) + 1 !== $from.pos) return false;

        return this.editor.commands.unsetMessage();
      },
    };
  },
});
