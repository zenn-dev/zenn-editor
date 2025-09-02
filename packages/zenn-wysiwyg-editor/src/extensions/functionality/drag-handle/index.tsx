import type { Editor } from "@tiptap/react";
import { calcOffset } from "./calc-offset";
import { DragIcon } from "./drag-icon";
import { useDragHandle } from "./use-drag-handle";

interface DragHandleProps {
  editor: Editor | null;
}

export default function DragHandle({ editor }: DragHandleProps) {
  const { dragTarget, handleDragStart, handleDragEnd, handleClick } =
    useDragHandle(editor);

  if (dragTarget === null || !editor) return null;

  const offsetStyles = calcOffset(dragTarget, editor);

  return (
    <button
      type="button"
      draggable="true"
      className="absolute size-6 cursor-grab text-gray-300"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      style={{
        ...offsetStyles,
      }}
    >
      <DragIcon />
    </button>
  );
}
