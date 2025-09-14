import { cn } from '../../../lib/utils';
import Switch from '../../ui/switch';

import styles from './index.module.css';

type DiffSwitchProps = {
  checked: boolean;
  onChange: (isDiff: boolean) => void;
  className?: string;
};

export default function DiffSwitch({
  checked,
  onChange,
  className,
}: DiffSwitchProps) {
  return (
    <div className={cn(styles.container, className)}>
      <label className={styles.label}>差分モード</label>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

export type { DiffSwitchProps };
