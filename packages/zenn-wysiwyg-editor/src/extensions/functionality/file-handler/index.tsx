import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Extension } from '@tiptap/react';
import type { Editor } from '@tiptap/react';

export type FileHandlePluginOptions = {
  editor: Editor;
  onUpload?: (file: File) => Promise<string>;
};
export type FileHandlerOptions = Omit<FileHandlePluginOptions, 'editor'>;

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
];

export const FileHandler = Extension.create<FileHandlerOptions>({
  name: 'fileHandler',

  addOptions() {
    return {
      onUpload: undefined,
    };
  },

  addProseMirrorPlugins() {
    return [
      FileHandlePlugin({
        editor: this.editor,
        onUpload: this.options.onUpload,
      }),
    ];
  },
});

export const FileHandlePlugin = ({
  editor,
  onUpload,
}: FileHandlePluginOptions) => {
  return new Plugin({
    key: new PluginKey('fileHandler'),

    props: {
      handleDrop(_view, event) {
        if (!event.dataTransfer?.files.length) {
          return false;
        }

        if (!onUpload) {
          console.warn(
            'FileHandler: onUpload callback is not provided. File upload is disabled.'
          );
          return true;
        }

        const dropPos = _view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        const file = event.dataTransfer.files[0];

        if (!file || !ALLOWED_MIME_TYPES.includes(file.type)) {
          return false;
        }

        event.preventDefault();
        event.stopPropagation();

        // 画像アップロード処理
        if (dropPos?.pos) {
          createImageNode(editor, file, dropPos.pos, onUpload);
        }

        return true;
      },

      handlePaste(_view, event) {
        if (!event.clipboardData?.files.length) {
          return false;
        }

        if (!onUpload) {
          console.warn(
            'FileHandler: onUpload callback is not provided. File upload is disabled.'
          );
          return true;
        }

        let filesArray = Array.from(event.clipboardData.files);
        const htmlContent = event.clipboardData.getData('text/html');

        filesArray = filesArray.filter((file) =>
          ALLOWED_MIME_TYPES.includes(file.type)
        );

        if (filesArray.length === 0) {
          return false;
        }

        event.preventDefault();
        event.stopPropagation();

        // if there is also file data inside the clipboard html,
        // we won't use the files array and instead get the file url from the html
        // this mostly happens for gifs or webms as they are not copied correctly as a file
        // and will always be transformed into a PNG
        // in this case we will let other extensions handle the incoming html via their inputRules
        if (htmlContent.length > 0) {
          return false;
        }

        return true;
      },
    },
  });
};

function createImageNode(
  editor: Editor,
  file: File,
  pos: number,
  onUpload: (file: File) => Promise<string>
) {
  const tempId = `temp-image-${Math.random().toString(36)}`;

  // 一時的なローディング状態のImageノードを挿入
  const loadingNode = editor.state.schema.nodes.loading.create({
    id: tempId,
  });

  editor.view.dispatch(
    editor.state.tr.insert(pos, loadingNode).setMeta('addToHistory', false)
  );

  // 画像アップロード処理
  onUpload(file)
    .then((uploadedUrl: string) => {
      // アップロード完了後、一時ノードを正式なImageノードに置き換え
      editor.state.doc.descendants((node, nodePos) => {
        if (node.type.name === 'loading' && node.attrs.id === tempId) {
          const finalNode = editor.schema.nodeFromJSON({
            type: 'figure',
            content: [
              {
                type: 'image',
                attrs: {
                  src: uploadedUrl,
                  alt: file.name,
                },
              },
              {
                type: 'caption',
                content: [],
              },
            ],
          });
          editor.view.dispatch(
            editor.state.tr
              .replaceRangeWith(nodePos, nodePos + node.nodeSize, finalNode)
              .setMeta('addToHistory', false)
          );
          return true;
        }
      });
    })
    .catch((error: unknown) => {
      // エラー時は一時ノードを削除
      editor.state.doc.descendants((node, nodePos) => {
        if (node.type.name === 'loading' && node.attrs.id === tempId) {
          editor.view.dispatch(
            editor.state.tr
              .delete(nodePos, nodePos + node.nodeSize)
              .setMeta('addToHistory', false)
          );
          return true;
        }
      });
      console.error('zenn-wysiwyg-editor(fileUpload):', error);
    });
}
