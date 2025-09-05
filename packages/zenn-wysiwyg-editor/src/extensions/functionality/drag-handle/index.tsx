import type { Editor } from '@tiptap/react';
import { calcOffset } from './calc-offset';
import { DragIcon } from './drag-icon';
import { useDragHandle } from './use-drag-handle';

import './index.css';

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
      className="dragHandle"
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
