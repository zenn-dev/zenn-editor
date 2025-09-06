import { Editor, useEditor } from '@tiptap/react';
import { extensions } from './extensions';
import { renderMarkdown } from './lib/to-markdown';

type Props = {
  initialContent?: string;
  onChange?: (html: string, markdown: string) => void;
};

export function useZennEditor({ initialContent, onChange }: Props): Editor {
  const editor = useEditor({
    extensions,
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
