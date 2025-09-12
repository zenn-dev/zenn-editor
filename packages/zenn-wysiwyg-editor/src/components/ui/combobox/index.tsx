import { ChevronDown } from 'lucide-react';
import type * as React from 'react';
import { useState } from 'react';
import { cn } from '../../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';

import styles from './index.module.css';

type ComboboxItem = {
  value: string;
  label: string;
};

type ComboboxItemAlias = {
  [key: string]: string;
};

type ComboboxProps = {
  items: ComboboxItem[];
  aliasItems?: ComboboxItemAlias;
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export default function Combobox({
  items,
  value,
  aliasItems,
  onSelect,
  placeholder = 'Select an item...',
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const valueNoDuplicateLabel = aliasItems?.[value] ?? value;

  const selectedItem = items.find(
    (item) => item.value === valueNoDuplicateLabel
  );

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setOpen(false);
    setSearchValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setSearchValue('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(styles.trigger, className)}
          disabled={disabled}
          onKeyDown={handleKeyDown}
        >
          <span className={styles.triggerText}>
            {selectedItem ? selectedItem.label : placeholder}
          </span>
          <ChevronDown className={cn(styles.icon, open && styles.iconOpen)} />
        </button>
      </PopoverTrigger>
      <PopoverContent className={styles.content} align="end">
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={styles.searchInput}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className={styles.itemList}>
          {filteredItems.length === 0 ? (
            <div className={styles.emptyState}>No items found</div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.value}
                type="button"
                className={cn(
                  styles.item,
                  item.value === valueNoDuplicateLabel && styles.itemSelected
                )}
                onClick={() => handleSelect(item.value)}
              >
                {item.label}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export type { ComboboxItem, ComboboxProps };
