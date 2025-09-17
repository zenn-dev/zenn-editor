import { ChevronDown } from 'lucide-react';
import type * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
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
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const valueNoDuplicateLabel = aliasItems?.[value] ?? value;

  const selectedItem = items.find(
    (item) => item.value === valueNoDuplicateLabel
  );

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Always highlight the first item when items change
  useEffect(() => {
    setHighlightedIndex(filteredItems.length > 0 ? 0 : -1);
  }, [filteredItems.length]);

  // Focus input when popover opens and highlight first item
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      setHighlightedIndex(filteredItems.length > 0 ? 0 : -1);
    }
  }, [open, filteredItems.length]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [highlightedIndex]);

  const handleSelect = useCallback(
    (selectedValue: string) => {
      onSelect(selectedValue);
      setOpen(false);
      setSearchValue('');
      setHighlightedIndex(-1);
      triggerRef.current?.focus();
    },
    [onSelect]
  );

  const handleNavigateUp = useCallback(() => {
    setHighlightedIndex((prev) => {
      if (prev <= 0) return filteredItems.length - 1;
      return prev - 1;
    });
  }, [filteredItems.length]);

  const handleNavigateDown = useCallback(() => {
    setHighlightedIndex((prev) => {
      if (prev >= filteredItems.length - 1) return 0;
      return prev + 1;
    });
  }, [filteredItems.length]);

  const handleEnter = useCallback(() => {
    if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
      handleSelect(filteredItems[highlightedIndex].value);
    }
  }, [highlightedIndex, filteredItems, handleSelect]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        handleNavigateDown();
        break;
      case 'ArrowUp':
        e.preventDefault();
        handleNavigateUp();
        break;
      case 'Enter':
        e.preventDefault();
        handleEnter();
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        setSearchValue('');
        setHighlightedIndex(-1);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        if (highlightedIndex >= 0) {
          e.preventDefault();
          handleEnter();
        } else {
          setOpen(false);
          setSearchValue('');
          setHighlightedIndex(-1);
        }
        break;
      default:
        break;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          className={cn(styles.trigger, className)}
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="combobox-options"
        >
          <span className={styles.triggerText}>
            {selectedItem ? selectedItem.label : value}
          </span>
          <ChevronDown className={cn(styles.icon, open && styles.iconOpen)} />
        </button>
      </PopoverTrigger>
      <PopoverContent className={styles.content} align="end">
        <div className={styles.searchContainer}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={styles.searchInput}
            onKeyDown={handleInputKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-controls="combobox-options"
            aria-activedescendant={
              highlightedIndex >= 0
                ? `combobox-option-${highlightedIndex}`
                : undefined
            }
          />
        </div>
        <div className={styles.itemList} role="listbox" id="combobox-options">
          {filteredItems.length === 0 ? (
            <div className={styles.emptyState}>No items found</div>
          ) : (
            filteredItems.map((item, index) => (
              <button
                key={item.value}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                type="button"
                className={cn(
                  styles.item,
                  item.value === valueNoDuplicateLabel && styles.itemSelected,
                  index === highlightedIndex && styles.itemHighlighted
                )}
                onClick={() => handleSelect(item.value)}
                role="option"
                id={`combobox-option-${index}`}
                aria-selected={item.value === valueNoDuplicateLabel}
                onMouseEnter={() => setHighlightedIndex(index)}
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
