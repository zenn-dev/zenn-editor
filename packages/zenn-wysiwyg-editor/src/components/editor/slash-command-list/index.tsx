import type { SuggestionProps } from '@tiptap/suggestion';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { cn } from '../../../lib/utils';
import styles from './index.module.css';
import type { SuggestionItem } from 'src/extensions/functionality/slash-command/items';

export default forwardRef<any, SuggestionProps>((props, ref) => {
  const items = props.items as SuggestionItem[];
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectItem = (index: number) => {
    const item = items[index];

    if (item) {
      props.command({ key: item.value });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useEffect(() => {
    const selectedElement = itemRefs.current[selectedIndex];
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className={styles.container}>
      {items.length ? (
        items.map((item, index) => (
          <button
            ref={(el) => (itemRefs.current[index] = el)}
            className={cn(
              styles.item,
              index === selectedIndex && styles.selected
            )}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item.label}
          </button>
        ))
      ) : (
        <div className={styles.noResult}>No result</div>
      )}
    </div>
  );
});
