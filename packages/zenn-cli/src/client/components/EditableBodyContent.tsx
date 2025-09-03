import {
  convertMarkdownToEditable,
  EditorContent,
  renderMarkdown,
  useZennEditor,
} from 'zenn-wysiwyg-editor';
import { useMemo } from 'react';

import 'zenn-wysiwyg-editor/dist/style.css';

type Props = {
  markdown: string;
  onChange?: (markdown: string) => void;
};

export const EditableBodyContent: React.FC<Props> = (props) => {
  const initialContent = useMemo(
    () => convertMarkdownToEditable(props.markdown),
    [props.markdown]
  );

  const editor = useZennEditor({
    initialContent: initialContent,
    onChange: (_, markdown) => {
      props.onChange?.(markdown);
    },
  });

  return <EditorContent editor={editor} />;
};
