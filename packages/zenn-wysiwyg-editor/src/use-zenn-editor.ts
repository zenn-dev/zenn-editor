import { Editor, useEditor } from '@tiptap/react';
import { extensions } from './extensions';
import { renderMarkdown } from './lib/to-markdown';
import { FileHandler } from './extensions/functionality/file-handler';

type Props = {
  initialContent?: string;
  onChange?: (html: string, markdown: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
};

export function useZennEditor({
  initialContent,
  onChange,
  onImageUpload,
}: Props): Editor {
  const editor = useEditor({
    extensions: [
      ...extensions,
      FileHandler.configure({
        onUpload: onImageUpload,
      }),
    ],
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = renderMarkdown(editor.state.doc);
      onChange?.(html, markdown);
    },
    editorProps: {
      attributes: {
        class: 'znc',
      },
    },
  });

  return editor;
}
