import { NodeSelection, Plugin, PluginKey } from '@tiptap/pm/state';
import { mergeAttributes, Node } from '@tiptap/react';

export interface SetImageOptions {
  src: string;
  alt?: string;
  width?: number;
}

export const Image = Node.create({
  name: 'image',

  draggable: false,
  selectable: false,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      width: {
        default: null,
      },
      isLoadingError: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(HTMLAttributes, {
        class: 'md-img',
      }),
    ];
  },

  addNodeView() {
    return ({ node, getPos }) => {
      const img = document.createElement('img');
      img.className = 'md-img';
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.onerror = () => {
        this.editor.commands.command(({ tr }) => {
          const pos = getPos();
          if (typeof pos !== 'number') return false;

          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            isLoadingError: true,
          });

          return true;
        });
      };

      const p = document.createElement('p');
      const code = document.createElement('code');
      code.textContent = node.attrs.src || '画像';
      p.appendChild(code);
      p.appendChild(document.createTextNode('の読み込みに失敗しました'));
      p.className = 'md-img text-center py-8 text-red-600 rounded';

      return {
        dom: node.attrs.isLoadingError ? p : img,
      };
    };
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { selection } = editor.state;

        if (
          !(selection instanceof NodeSelection) ||
          selection.node.type.name !== this.name
        ) {
          return false;
        }

        return editor.commands.clearFigure();
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageClickHandler'),
        props: {
          handleClickOn: (_, __, node, nodePos) => {
            if (node.type.name !== this.name) return false;

            // Figureノードを選択
            return this.editor.commands.setNodeSelection(nodePos - 1);
          },
        },
      }),
    ];
  },
});
