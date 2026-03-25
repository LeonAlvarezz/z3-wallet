import * as React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";

type Props = {
  value: string;
  onSubmit: () => void;
  onChange: (value: string) => void;
};

const SmartInput = React.forwardRef<HTMLInputElement, Props>(
  ({ onSubmit, value, onChange }, ref) => {
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
          className="w-full"
        />
        {(!value || value.length < 0) && (
          <div className="absolute inset-y-1/2 right-10 flex h-fit -translate-y-1/2 gap-2 rounded-sm border px-2 py-1">
            <kbd className="text-foreground font-mono text-[10px]">⌘</kbd>
            <kbd className="text-foreground font-mono text-[10px]">/</kbd>
          </div>
        )}
        <Button
          type="button"
          variant="simple"
          className="absolute inset-y-1/2 right-1 z-20 h-fit w-fit -translate-y-1/2 p-2"
          onClick={onSubmit}
        >
          <Icon icon="solar:arrow-right-up-bold" className="size-5" />
        </Button>
      </div>
    );
  },
);

SmartInput.displayName = "SmartInput";

export default SmartInput;
