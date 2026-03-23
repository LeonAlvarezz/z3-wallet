import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "../hooks/use-in-view";

type StaggerSectionProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function StaggerSection({
  children,
  delay = 0,
  className,
}: StaggerSectionProps) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className={cn("stagger-reveal", inView && "revealed", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
