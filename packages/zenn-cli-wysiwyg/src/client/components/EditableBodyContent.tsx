import {
  convertMarkdownToEditable,
  EditorContent,
  useZennEditor,
  type Message,
} from 'zenn-wysiwyg-editor';
import { useMemo, useState } from 'react';
import { parseToc } from 'zenn-markdown-html';

import 'zenn-wysiwyg-editor/dist/style.css';
import { Toc } from './Toc';
import { TocNode } from 'zenn-model/lib/types';

type Props = {
  markdown: string;
  onImageUpload?: (file: File) => Promise<string>;
  onChange?: (markdown: string) => void;
  onMessage?: (message: Message) => void;
};

export const EditableBodyContent: React.FC<Props> = (props) => {
  const initialContent = useMemo(
    () => convertMarkdownToEditable(props.markdown),
    [props.markdown]
  );

  const [tocByEditor, setTocByEditor] = useState<TocNode[]>(() => {
    return parseToc(initialContent);
  });

  const editor = useZennEditor({
    initialContent: initialContent,
    onChange: (_, markdown) => {
      props.onChange?.(markdown);
      setTocByEditor(parseToc(editor.getHTML()));
    },
    onImageUpload: props.onImageUpload,
    onMessage: props.onMessage,
  });

  return (
    <>
      <Toc maxDepth={2} toc={tocByEditor} />
      <EditorContent editor={editor} />
    </>
  );
};
