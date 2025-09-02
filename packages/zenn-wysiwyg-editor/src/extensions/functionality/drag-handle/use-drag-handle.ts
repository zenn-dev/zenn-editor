import type { Node, Slice } from "@tiptap/pm/model";
import { NodeSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

// ProseMirrorの内部実装がエクスポートされてないので、自前定義
class Dragging {
  constructor(
    // @ts-expect-error
    public slice: Slice,
    // @ts-expect-error
    public move: boolean,
    // @ts-expect-error
    public node?: NodeSelection,
  ) {}
}

export interface DragTarget {
  dom: HTMLElement;
  node: Node;
  nodeSelection: NodeSelection;
}

export function useDragHandle(editor: Editor | null) {
  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null);

  const setTopBlockDragTarget = useCallback(
    (pos: number, forbidNodes: string[]) => {
      if (!editor) return;

      const $pos = editor.state.doc.resolve(pos);
      const beforePos = $pos.before(1);
      const dom = editor.view.nodeDOM(beforePos) as HTMLElement | null;
      const node = editor.state.doc.nodeAt(beforePos);

      if (!node || !dom) return;
      if (forbidNodes.includes(node.type.name)) return;

      setDragTarget({
        dom,
        node,
        nodeSelection: NodeSelection.create(editor.state.doc, beforePos),
      });
    },
    [editor],
  );

  const handleDragStart = useCallback(
    (ev: React.DragEvent) => {
      // ProseMirrorのDragStart参考に実装すれば良さそう。view.draggingに対象のNodeSelectionを入れる
      // https://github.com/ProseMirror/prosemirror-view/blob/b2e782ae7c8013505ba05683b185886585ef5939/src/input.ts

      if (!editor || dragTarget === null || !ev.dataTransfer) return;

      ev.dataTransfer.setDragImage(dragTarget.dom, 0, 0);
      ev.dataTransfer.effectAllowed = "copyMove";

      editor.view.dragging = new Dragging(
        dragTarget.nodeSelection.content(),
        true,
        dragTarget.nodeSelection,
      );
    },
    [editor, dragTarget],
  );

  const handleMouseMove = useCallback(
    (ev: MouseEvent) => {
      if (!editor) return;

      const posWithInside = editor.view.posAtCoords({
        left: ev.clientX,
        top: ev.clientY,
      });
      if (!posWithInside) return;

      // カーソルが乗った位置で、深さ１ノードのbefore位置を取得
      setTopBlockDragTarget(posWithInside.pos, ["footnotes"]);
    },
    [editor, setTopBlockDragTarget],
  );

  const handleClick = useCallback(() => {
    if (!editor || dragTarget === null) return;

    editor
      ?.chain()
      .focus()
      .setNodeSelection(dragTarget.nodeSelection.from)
      .run();
  }, [editor, dragTarget]);

  const handleDragEnd = useCallback(() => {
    if (!editor) return;

    editor.view.dragging = null;
    setDragTarget(null);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const element = editor.$doc.element;
    element.addEventListener("mousemove", handleMouseMove);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
    };
  }, [editor, handleMouseMove]);

  return {
    dragTarget,
    handleDragStart,
    handleClick,
    handleDragEnd,
  };
}
