import styled from 'styled-components';
import { EditorContent, useZennEditor } from 'zenn-wysiwyg-editor';
import { useState } from 'react';

import 'zenn-wysiwyg-editor/dist/style.css';

type Props = { editableHtml: string };

export const EditableBodyContent: React.FC<Props> = (props) => {
  const [content, setContent] = useState(props.editableHtml);
  const editor = useZennEditor({
    initialContent: content,
    onChange: (newContent) => {
      setContent(newContent);
    },
  });

  return <EditorContent editor={editor} />;
};

const StyledMessage = styled.div`
  text-align: center;
  font-size: 1.1rem;
  color: var(--c-gray);
`;
