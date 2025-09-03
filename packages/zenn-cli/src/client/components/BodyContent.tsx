import styled from 'styled-components';
import { PrintDetailsOpener } from './PrintDetailsOpener';
import { EditorContent, useZennEditor } from 'zenn-wysiwyg-editor';
import { useState } from 'react';

type Props =
  | {
      children: React.ReactNode;
    }
  | { rawHtml: string };

export const BodyContent: React.VFC<Props> = (props) => {
  const [content, setContent] = useState('');
  const editor = useZennEditor({
    initialContent: content,
    onChange: (newContent) => {
      setContent(newContent);
    },
  });

  if ('rawHtml' in props) {
    if (!props.rawHtml?.length) {
      return <StyledMessage>本文を入力してください</StyledMessage>;
    }
    return (
      <PrintDetailsOpener bodyHtml={props.rawHtml}>
        <EditorContent editor={editor} />
      </PrintDetailsOpener>
    );
  }
  return <div className="znc">{props.children}</div>;
};

const StyledMessage = styled.div`
  text-align: center;
  font-size: 1.1rem;
  color: var(--c-gray);
`;
