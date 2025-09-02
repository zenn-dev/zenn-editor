import { Plugin, PluginKey } from "@tiptap/pm/state";
import { findParentNode, Node } from "@tiptap/react";

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    footnote: {
      focusFootnote: (id: string) => ReturnType;
    };
  }
}

const FootnoteItem = Node.create({
  name: "footnoteItem",
  content: "text*", // footnoteReferenceを含めないようにする
  isolating: true,
  defining: true,
  draggable: false,
  priority: 1000, // list item よりも優先度を高くする

  addAttributes() {
    return {
      id: {
        isRequired: true,
      },
      referenceId: {
        isRequired: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "li.footnote-item",
        getAttrs: (element) => {
          const id = element.getAttribute("id");
          const referenceId = element.getAttribute(
            "data-footnote-reference-id",
          );
          if (!id || !referenceId) {
            return false;
          }

          return { id, referenceId };
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      "li",
      {
        id: node.attrs.id,
        class: "footnote-item",
        "data-footnote-reference-id": node.attrs.referenceId,
      },
      ["p", 0],
    ];
  },

  addCommands() {
    return {
      focusFootnote:
        (id: string) =>
        ({ editor, chain }) => {
          const matchedFootnote = editor.$node("footnoteItem", {
            id: id,
          });

          if (matchedFootnote) {
            chain()
              .focus()
              .setTextSelection(
                matchedFootnote.from + matchedFootnote.content.size,
              )
              .scrollIntoView()
              .run();

            return true;
          }
          return false;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      // footnoteItemに貼り付けることで分割される現象を防ぐ
      // Link貼り付けの後に実行する
      new Plugin({
        key: new PluginKey("footnoteItemPaste"),
        props: {
          handlePaste: (view, event) => {
            const { state } = view;
            const { selection } = state;
            const text = event.clipboardData?.getData("text/plain") || "";
            if (!text) return false;

            if (
              !findParentNode(
                (node) => node.type === state.schema.nodes.footnotes,
              )(selection)
            )
              return false;

            const tr = state.tr;
            tr.insertText(text, selection.from, selection.to);
            view.dispatch(tr);
            return true;
          },
        },
      }),
    ];
  },
});

export default FootnoteItem;
