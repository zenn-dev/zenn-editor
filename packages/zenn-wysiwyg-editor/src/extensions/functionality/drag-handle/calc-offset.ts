import type { Editor } from '@tiptap/react';
import type { DragTarget } from './use-drag-handle';

const DRAG_HANDLE_X_OFFSET = 25;

export function calcOffset(dragTarget: DragTarget, editor: Editor) {
  const rect = dragTarget.dom.getBoundingClientRect();
  let top = rect?.top + window.scrollY;
  const left = rect?.left + window.scrollX - DRAG_HANDLE_X_OFFSET;

  if (dragTarget.node.type === editor.schema.nodes.heading) {
    if (dragTarget.node.attrs.level === 1) {
      top += 5;
    } else if (dragTarget.node.attrs.level === 2) {
      top += 4;
    } else if (dragTarget.node.attrs.level === 3) {
      top += 3;
    }
  }

  if (dragTarget.node.type === editor.schema.nodes.codeBlockContainer) {
    top += 35;
  }

  if (dragTarget.node.type === editor.schema.nodes.bulletList) {
    top += 4;
  }

  if (dragTarget.node.type === editor.schema.nodes.orderedList) {
    top += 1;
  }

  if (dragTarget.node.type === editor.schema.nodes.paragraph) {
    top += 3;
  }

  if (dragTarget.node.type === editor.schema.nodes.horizontalRule) {
    top -= 12;
  }

  if (dragTarget.node.type === editor.schema.nodes.details) {
    top += 4;
  }

  return { top, left };
}
