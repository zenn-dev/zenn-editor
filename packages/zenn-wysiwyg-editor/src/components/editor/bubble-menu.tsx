import { type Editor, useEditorState } from '@tiptap/react';
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus';
import { Bold, Code, Italic, Strikethrough } from 'lucide-react';
import { cn } from '../..//lib/utils';

import './bubble-menu.css';

type Props = {
  editor: Editor;
};

export default function BubbleMenu({ editor }: Props) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive('bold'),
      isItalic: editor.isActive('italic'),
      isStrike: editor.isActive('strike'),
      isCode: editor.isActive('code'),
    }),
  });
  return (
    <TiptapBubbleMenu
      editor={editor}
      options={{ placement: 'top', offset: 12 }}
      shouldShow={({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, $to } = selection;

        if (selection.empty) {
          return false;
        }

        let isShow = true;
        state.doc.nodesBetween($from.pos, $to.pos, (node, _, parent) => {
          if (!node.isLeaf || !parent) return;

          const allowedMarkSet = parent.type.markSet;
          if (
            allowedMarkSet !== null &&
            !allowedMarkSet.includes(editor.schema.marks.bold)
          ) {
            isShow = false;
            return false;
          }

          // 脚注参照を含む場合は非表示
          if (node.type === state.schema.nodes.footnoteReference) {
            isShow = false;
            return false;
          }
        });

        return isShow;
      }}
    >
      <div className="bubbleMenu">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn('', state.isBold && 'isActive')}
          type="button"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(state.isItalic && 'isActive')}
          type="button"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(state.isStrike && 'isActive')}
          type="button"
        >
          <Strikethrough size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn(state.isCode && 'isActive')}
          type="button"
        >
          <Code size={18} />
        </button>
      </div>
    </TiptapBubbleMenu>
  );
}
