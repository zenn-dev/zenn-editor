import {
  type Editor,
  EditorContent as TiptapEditorContent,
} from '@tiptap/react';
import type { ComponentType } from 'react';
import DragHandle from 'src/extensions/functionality/drag-handle';
import BubbleMenu from './bubble-menu';
import ImageBubbleMenu from './image-bubble-menu';

type Props = {
  editor: Editor;
};

// 型アサーションでJSXコンポーネントとして使用できるようにする
const EditorContentComponent = TiptapEditorContent as ComponentType<{
  editor: Editor;
  className?: string;
}>;

export default function EditorContent({ editor }: Props) {
  return (
    <>
      <BubbleMenu editor={editor} />
      <ImageBubbleMenu editor={editor} />
      <DragHandle editor={editor} />
      <EditorContentComponent editor={editor} className="znc" />
    </>
  );
}
