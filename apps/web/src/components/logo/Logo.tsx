import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

type LogoProps = ComponentPropsWithoutRef<"span"> & {
  imgClassName?: string;
  alt?: string;
};

export function Logo({
  className,
  imgClassName,
  alt = "Z3 Wallet logo",
  ...props
}: LogoProps) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      {...props}
    >
      <img
        src="/wallet-logo.svg"
        alt={alt}
        className={cn("h-full w-full object-contain", imgClassName)}
      />
    </span>
  );
}
