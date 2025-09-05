import {
  type Editor,
  EditorContent as TiptapEditorContent,
} from '@tiptap/react';
import type { ComponentType } from 'react';
import DragHandle from 'src/extensions/functionality/drag-handle';

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
      <DragHandle editor={editor} />
      <EditorContentComponent editor={editor} />
    </>
  );
}
