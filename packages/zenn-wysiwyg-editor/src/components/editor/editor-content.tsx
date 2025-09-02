import {
  type Editor,
  EditorContent as TiptapEditorContent,
} from "@tiptap/react";
import DragHandle from "src/extensions/functionality/drag-handle";
import BubbleMenu from "./bubble-menu";
import ImageBubbleMenu from "./image-bubble-menu";

type Props = {
  editor: Editor;
};

export default function EditorContent({ editor }: Props) {
  return (
    <>
      <BubbleMenu editor={editor} />
      <ImageBubbleMenu editor={editor} />
      <DragHandle editor={editor} />
      <TiptapEditorContent editor={editor} className="znc" />
    </>
  );
}
