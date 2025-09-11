import { Trash2 } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useId, useState } from 'react';

import './index.css';

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
      className="linkEditPopoverContent"
    >
      <div>
        <label htmlFor={inputId} className="">
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
        />
      </div>
      <div className="linkEditPopoverContent_buttons">
        <button
          type="button"
          className="linkEditPopoverContent_buttons_delete"
          onClick={() => handleDelete?.()}
        >
          <Trash2 />
        </button>

        <button
          type="button"
          className="linkEditPopoverContent_buttons_save"
          onClick={() => handleSave?.(link)}
        >
          保存
        </button>
      </div>
    </div>
  );
};
