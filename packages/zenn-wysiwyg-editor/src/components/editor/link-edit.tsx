import { Trash2 } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useId, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

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
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg"
    >
      <div>
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-500 mb-1"
        >
          リンク
        </label>
        <Input
          id={inputId}
          type="text"
          name="href"
          placeholder="https://example.com"
          className="w-[300px] text-xs"
          defaultValue={href}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>
      <div className="flex justify-between mt-4">
        <Button variant="ghost" size="icon" onClick={() => handleDelete?.()}>
          <Trash2 className="text-red-500" />
        </Button>

        <Button size="sm" onClick={() => handleSave?.(link)}>
          保存
        </Button>
      </div>
    </div>
  );
};
