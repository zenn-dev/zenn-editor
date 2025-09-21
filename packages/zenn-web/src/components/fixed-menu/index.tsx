import type { Editor } from '@tiptap/react';
import clsx from 'clsx';
import { MdContentCopy } from 'react-icons/md';
import { renderMarkdown } from 'zenn-wysiwyg-editor';
import styles from './index.module.css';

type Props = {
  editor: Editor;
  className?: string;
};

export default function FixedMenu({ editor, className }: Props) {
  if (!editor) return null;

  const handleTextCopy = () => {
    const markdown = renderMarkdown(editor.state.doc);
    navigator.clipboard.writeText(markdown).catch((err) => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.spacer} />
      <div className={styles.actions}>
        <button
          className={styles.copyButton}
          onClick={handleTextCopy}
          title="マークダウンをコピー"
        >
          <MdContentCopy />
        </button>
      </div>
    </div>
  );
}
