import { Heading as TiptapHeading } from "@tiptap/extension-heading";
import { splitBlockAs } from "@tiptap/pm/commands";

const Heading = TiptapHeading.extend({
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
});

export default Heading;
