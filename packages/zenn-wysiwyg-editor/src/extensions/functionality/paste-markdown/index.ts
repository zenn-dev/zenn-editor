import { DOMParser, Slice } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Extension } from "@tiptap/react";
import { isProseMirrorPaste } from "../../../lib/clipboard";
import { fromMarkdown } from "../../../lib/from-markdown";

export const PasteMarkdown = Extension.create({
  name: "paste-markdown",
  priority: 1, // ペースト処理の一番最後に呼び出す

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("paste-markdown"),
        props: {
          handlePaste: (view, event) => {
            const clipboardData = event.clipboardData;
            if (!clipboardData || isProseMirrorPaste(event)) {
              return false;
            }

            event.preventDefault();
            event.stopPropagation();

            const text = clipboardData.getData("text/plain");
            if (!text) {
              return true;
            }

            const html = fromMarkdown(text);
            const parser = DOMParser.fromSchema(view.state.schema);
            const dom = document.createElement("div");
            dom.innerHTML = html;
            const node = parser.parse(dom);
            const slice = new Slice(node.content, 0, 0);

            const tr = view.state.tr.replaceSelection(slice);
            view.dispatch(tr);
            return true;
          },
        },
      }),
    ];
  },
});
