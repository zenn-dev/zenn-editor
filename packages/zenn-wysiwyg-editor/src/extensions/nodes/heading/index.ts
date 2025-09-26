import { Heading as TiptapHeading } from '@tiptap/extension-heading';
import { splitBlockAs } from '@tiptap/pm/commands';
import { TocPlugin } from './toc-plugin';
import { textblockTypeInputRule } from '@tiptap/react';

const Heading = TiptapHeading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
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

  addInputRules() {
    return this.options.levels.map((level) => {
      return textblockTypeInputRule({
        find: new RegExp(
          `^(#{${Math.min(...this.options.levels)},${level}})\\s$`
        ),
        type: this.type,
        getAttributes: {
          level,
        },
        undoable: false,
      });
    });
  },

  addProseMirrorPlugins() {
    return [TocPlugin(this.name)];
  },
});

export default Heading;
