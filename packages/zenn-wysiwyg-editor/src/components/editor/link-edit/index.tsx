import { Trash2 } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useId, useState } from 'react';

import styles from './index.module.css';

type Props = {
  href: string;
  handleDelete?: () => void;
  handleSave?: (href: string) => void;
  handleMouseLeave?: (e: MouseEvent) => void;
};

export default ({
  href,
  handleDelete,
  handleSave,
  handleMouseLeave,
}: Props) => {
  const inputId = useId();
  const [link, setLink] = useState(href);

  return (
    <div
      role="dialog"
      aria-label="リンクの編集"
      onMouseLeave={handleMouseLeave}
      className={styles.linkEditPopoverContent}
    >
      <div>
        <label htmlFor={inputId} className={styles.label}>
          リンク
        </label>
        <input
          id={inputId}
          type="text"
          autoComplete="off"
          name="href"
          placeholder="https://example.com"
          defaultValue={href}
          onChange={(e) => setLink(e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={() => handleDelete?.()}
        >
          <Trash2 />
        </button>

        <button
          type="button"
          className={styles.saveButton}
          onClick={() => handleSave?.(link)}
        >
          保存
        </button>
      </div>
    </div>
  );
};
