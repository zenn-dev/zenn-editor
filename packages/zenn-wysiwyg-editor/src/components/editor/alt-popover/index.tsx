import { PopoverClose } from '@radix-ui/react-popover';
import { useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';

import './index.css';

type Props = {
  initialAlt?: string;
  setAlt?: (alt: string) => void;
};

export default function AltPopover({ initialAlt, setAlt }: Props) {
  const altRef = useRef<HTMLInputElement>(null);
  const handleApply = () => {
    if (!altRef.current) return;

    setAlt?.(altRef.current.value);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="altPopoverTrigger">Alt</button>
      </PopoverTrigger>
      <PopoverContent className="altPopoverContent" sideOffset={10}>
        <input defaultValue={initialAlt} placeholder="alt" ref={altRef} />
        <PopoverClose asChild>
          <button onClick={handleApply}>適用</button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}
