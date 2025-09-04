import {
  Fragment,
  type Node as ProseMirrorNode,
  type ResolvedPos,
  Slice,
} from '@tiptap/pm/model';
import type { Editor, Predicate } from '@tiptap/react';

export function getSliceText(slice: Slice): string {
  let textContent = '';
  slice.content.forEach((node) => {
    textContent += node.textContent;
  });
  return textContent;
}

export const isNodeVisible = (position: number, editor: Editor): boolean => {
  const node = editor.view.domAtPos(position).node as HTMLElement;
  const isOpen = node.offsetParent !== null;

  return isOpen;
};

export const findClosestVisibleNode = (
  $pos: ResolvedPos,
  predicate: Predicate,
  editor: Editor
):
  | {
      pos: number;
      start: number;
      depth: number;
      node: ProseMirrorNode;
    }
  | undefined => {
  for (let i = $pos.depth; i > 0; i -= 1) {
    const node = $pos.node(i);
    const match = predicate(node);
    const isVisible = isNodeVisible($pos.start(i), editor);

    if (match && isVisible) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node,
      };
    }
  }
};

export function replaceNewlines(node: ProseMirrorNode) {
  let result: ProseMirrorNode = node;
  if (!node.type.schema.linebreakReplacement) {
    throw new Error('linebreakReplacement is not defined in the schema');
  }
  const lineBreakNode = node.type.schema.linebreakReplacement.create();
  const lineBreakSlice = new Slice(Fragment.from(lineBreakNode), 0, 0);

  node.forEach((child, offset) => {
    if (child.isText && child.text) {
      const newline = /\r?\n|\r/g;
      let m = newline.exec(child.text);

      while (m) {
        const start = offset + m.index;
        result = result.replace(start, start + 1, lineBreakSlice);
        m = newline.exec(child.text);
      }
    }
  });

  return result;
}
