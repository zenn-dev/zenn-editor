import styled from 'styled-components';
import {
  convertMarkdownToEditable,
  EditorContent,
  useZennEditor,
} from 'zenn-wysiwyg-editor';
import { useMemo, useState } from 'react';

import 'zenn-wysiwyg-editor/dist/style.css';

type Props = { markdown: string };

export const EditableBodyContent: React.FC<Props> = (props) => {
  const initialContent = useMemo(
    () => convertMarkdownToEditable(props.markdown),
    [props.markdown]
  );
  const [content, setContent] = useState(initialContent);

  const editor = useZennEditor({
    initialContent: content,
    onChange: (newContent) => {
      setContent(newContent);
    },
  });

  return <EditorContent editor={editor} />;
};
