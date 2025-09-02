import { PopoverClose } from "@radix-ui/react-popover";
import { useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "..//ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

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
      <PopoverTrigger className="size-6 flex items-center justify-center bg-white cursor-pointer hover:bg-gray-100">
        Alt
      </PopoverTrigger>
      <PopoverContent className="w-80" sideOffset={10}>
        <div className="flex w-full max-w-sm items-center gap-2">
          <Input defaultValue={initialAlt} placeholder="alt" ref={altRef} />
          <PopoverClose asChild>
            <Button onClick={handleApply}>適用</Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
