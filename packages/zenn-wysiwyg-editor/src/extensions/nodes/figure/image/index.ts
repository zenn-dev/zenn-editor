import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";
import { mergeAttributes, Node } from "@tiptap/react";

export interface SetImageOptions {
  src: string;
  alt?: string;
  width?: number;
}

export const Image = Node.create({
  name: "image",

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
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(HTMLAttributes, {
        class: "md-img",
      }),
    ];
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
        key: new PluginKey("imageClickHandler"),
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
