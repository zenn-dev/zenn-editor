import { Node } from "@tiptap/react";

export const FootnotesList = Node.create({
  name: "footnotesList",
  content: "footnoteItem+",
  isolating: true,
  draggable: false,
  priority: 1000, // ol よりも優先度を高くする

  parseHTML() {
    return [
      {
        tag: "ol.footnotes-list",
      },
    ];
  },

  renderHTML() {
    return ["ol", { class: "footnotes-list" }, 0];
  },
});
