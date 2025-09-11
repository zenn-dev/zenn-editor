import { computePosition, flip, shift } from '@floating-ui/dom';
import type { Mark, MarkType } from '@tiptap/pm/model';
import type { EditorView } from '@tiptap/pm/view';
import { ReactRenderer } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import LinkEdit from '../../../components/editor/link-edit';

export interface LinkRange {
  from: number;
  to: number;
  type: string;
}

export const updatePosition = (
  targetElement: HTMLElement,
  popOverElement: HTMLElement
) => {
  computePosition(targetElement, popOverElement, {
    placement: 'bottom',
    strategy: 'absolute',
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    popOverElement.style.width = 'max-content';
    popOverElement.style.position = strategy;
    popOverElement.style.left = `${x}px`;
    popOverElement.style.top = `${y}px`;
  });
};

export const createLinkElement = (mark: Mark): HTMLAnchorElement => {
  const a = document.createElement('a');
  a.setAttribute('href', mark.attrs.href);
  a.setAttribute('target', mark.attrs.target);
  a.setAttribute('rel', mark.attrs.rel);
  return a;
};

export const getCurrentLinkRange = (
  view: EditorView,
  linkElement: HTMLAnchorElement
): LinkRange | null => {
  const pos = view.posAtDOM(linkElement, 0);
  if (pos === -1) return null;
  const node = view.state.doc.nodeAt(pos);
  if (!node) return null;
  return { from: pos, to: pos + node.nodeSize, type: node.type.name };
};

export const handleLinkDelete = (
  editor: Editor,
  markType: MarkType,
  range: LinkRange
) => {
  if (range.type === 'image') {
    editor
      .chain()
      .command(({ tr }) => {
        tr.removeNodeMark(range.from, markType);
        return true;
      })
      .setNodeSelection(range.from - 1)
      .focus()
      .run();
  } else if (range.type === 'text') {
    editor
      .chain()
      .command(({ tr }) => {
        tr.removeMark(range.from, range.to, markType);
        return true;
      })
      .setTextSelection(range.from)
      .focus()
      .run();
  } else {
    throw new Error('unsupported node type');
  }
};

export const handleLinkSave = (
  editor: Editor,
  markType: MarkType,
  range: LinkRange,
  href: string
) => {
  if (range.type === 'image') {
    editor
      .chain()
      .command(({ tr }) => {
        tr.addNodeMark(range.from, markType.create({ href }));
        return true;
      })
      .setNodeSelection(range.from - 1)
      .focus()
      .run();
  } else if (range.type === 'text') {
    editor
      .chain()
      .command(({ tr }) => {
        tr.addMark(range.from, range.to, markType.create({ href }));
        return true;
      })
      .setTextSelection(range.from)
      .focus()
      .run();
  } else {
    throw new Error('unsupported node type');
  }
};

export const createLinkEditComponent = (
  editor: Editor,
  mark: Mark,
  linkElement: HTMLAnchorElement,
  destroyComponent: () => void
): ReactRenderer => {
  return new ReactRenderer(LinkEdit, {
    props: {
      href: mark.attrs.href,
      handleMouseLeave: (e: MouseEvent) => {
        e.stopPropagation();
        destroyComponent();
      },
      handleSave: (href: string) => {
        const range = getCurrentLinkRange(editor.view, linkElement);
        if (!range) return;

        if (href) {
          handleLinkSave(editor, mark.type, range, href);
        } else {
          handleLinkDelete(editor, mark.type, range);
        }

        destroyComponent();
      },
      handleDelete: () => {
        const range = getCurrentLinkRange(editor.view, linkElement);
        if (!range) return;

        handleLinkDelete(editor, mark.type, range);
        destroyComponent();
      },
    },
    editor,
  });
};
