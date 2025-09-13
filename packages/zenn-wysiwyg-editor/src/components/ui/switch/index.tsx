import type * as React from 'react';
import { cn } from '../../../lib/utils';

import styles from './index.module.css';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
};

export default function Switch({
  checked,
  onChange,
  className,
  disabled = false,
}: Props) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      className={cn(styles.switch, className)}
      aria-checked={checked}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
    />
  );
}
