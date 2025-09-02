import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Extension } from "@tiptap/react";

export const FileHandler = Extension.create({
  name: "fileHandler",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("fileHandler"),
        props: {
          handlePaste(_, event) {
            if (!event.clipboardData?.files.length) {
              return false;
            }

            event.preventDefault();
            event.stopPropagation();

            console.warn("ファイル貼り付けは現在サポートされていません");
            return true;
          },
        },
      }),
    ];
  },
});
