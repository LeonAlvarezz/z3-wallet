import * as React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import { KbdGroup, Kbd } from "../ui/kbd";
import { cn } from "@/lib/utils";
import useDevice from "@/hooks/use-device";

type Props = {
  value: string;
  onSubmit: () => void;
  onChange: (value: string) => void;
};

const SmartInput = React.forwardRef<HTMLInputElement, Props>(
  ({ onSubmit, value, onChange }, ref) => {
    const hasValue = value.trim().length > 0;
    const { isMobile, normalizeShortcut } = useDevice();

    return (
      <div className="relative w-full" id="smart-input">
        <Input
          ref={ref}
          placeholder="5 Starbucks #coffee"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            onSubmit();
          }}
          className={cn("absolute z-20 w-full pr-12")}
        />
        {!hasValue && !isMobile && (
          <div className="absolute inset-y-1/2 right-8 z-20 flex h-fit -translate-y-1/2">
            <KbdGroup className="bg-muted rounded-sm border p-1">
              <Kbd className="h-fit px-0 text-[10px]">
                {normalizeShortcut("meta")}
              </Kbd>
              <Kbd className="h-fit px-0 text-[10px]">/</Kbd>
            </KbdGroup>
          </div>
        )}
        <Button
          type="button"
          variant="simple"
          className="absolute inset-y-1/2 right-1 z-20 h-fit w-fit -translate-y-1/2 p-2"
          onClick={onSubmit}
        >
          <Icon icon="solar:arrow-right-up-bold" className="size-4" />
        </Button>
      </div>
    );
  },
);

SmartInput.displayName = "SmartInput";

export default SmartInput;
