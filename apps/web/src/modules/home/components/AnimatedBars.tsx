import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { PREVIEW_BARS } from "../constants/home-content";

type AnimatedBarsProps = {
  active: boolean;
};

export function AnimatedBars({ active }: AnimatedBarsProps) {
  return (
    <div className="mt-4 flex items-end gap-2">
      {PREVIEW_BARS.map(({ h, day }, index) => (
        <div
          key={`${day}-${index}`}
          className="flex flex-1 flex-col items-center gap-2"
        >
          <div
            className={cn(
              "bar-animated bg-primary/18 w-full rounded-lg",
              index === 5 && "bg-primary",
            )}
            style={
              {
                height: active ? h : 0,
                transitionDelay: active ? `${index * 60}ms` : "0ms",
              } satisfies CSSProperties
            }
          />
          <span className="text-muted-foreground text-[10px]">{day}</span>
        </div>
      ))}
    </div>
  );
}
