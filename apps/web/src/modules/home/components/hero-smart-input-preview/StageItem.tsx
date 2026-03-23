import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StageItemProps = {
  eyebrow: string;
  title: string;
  side: "left" | "right";
  delayMs: number;
  children: ReactNode;
};

export function StageItem({
  eyebrow,
  title,
  side,
  delayMs,
  children,
}: StageItemProps) {
  return (
    <div
      className={cn(
        "smart-stage-cluster pointer-events-none absolute flex flex-col gap-3",
        side === "left"
          ? "top-10 left-0 max-w-44 items-start sm:top-12 sm:left-0"
          : "top-16 right-0 max-w-48 items-end text-right sm:top-20 sm:right-0",
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="px-1">
        <p className="text-[11px] font-medium tracking-[0.18em] text-zinc-500 uppercase">
          {eyebrow}
        </p>
        <p className="mt-1 text-lg font-medium tracking-[-0.02em] text-zinc-300 sm:text-xl">
          {title}
        </p>
      </div>

      <div
        className={cn(
          "smart-stage-card relative h-28 w-28 sm:h-32 sm:w-32",
          side === "left" ? "is-left" : "is-right",
        )}
        style={{ animationDelay: `${delayMs + 620}ms` }}
      >
        <div className="border-input/20 bg-card/35 absolute inset-0 translate-x-3 translate-y-3 rounded-[1.65rem] border" />
        <div className="absolute inset-0">{children}</div>
      </div>
    </div>
  );
}
