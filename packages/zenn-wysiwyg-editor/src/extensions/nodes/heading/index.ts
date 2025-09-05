import { Heading as TiptapHeading } from '@tiptap/extension-heading';
import { splitBlockAs } from '@tiptap/pm/commands';
import { TocPlugin } from './toc-plugin';

const Heading = TiptapHeading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }
          return { id: attributes.id };
        },
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),

      Backspace: () => {
        const { selection } = this.editor.state;
        const { $from } = selection;
        if ($from.node().type.name !== this.name) return false;

        if (!selection.empty || $from.start() !== $from.pos) return false;

        return this.editor.commands.setParagraph();
      },
      Enter: () => {
        const { selection } = this.editor.state;
        const { $from } = selection;
        if ($from.node().type.name !== this.name) return false;
        if ($from.start() === $from.pos) return false;

        return splitBlockAs(() => ({
          type: this.editor.schema.nodes.paragraph,
        }))(this.editor.state, this.editor.view.dispatch);
      },
    };
  },

  addProseMirrorPlugins() {
    return [TocPlugin(this.name)];
  },
});

export default Heading;
