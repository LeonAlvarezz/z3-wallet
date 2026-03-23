import { cn } from "@/lib/utils";
import { useCountUp } from "../hooks/use-count-up";

type MetricCountCardProps = {
  label: string;
  target: number;
  prefix?: string;
  suffix?: string;
  active: boolean;
  accent: "emerald" | "rose" | "primary";
};

const ACCENT_CLASSES = {
  emerald: "text-emerald-300 bg-emerald-500/8",
  rose: "text-rose-300 bg-rose-500/8",
  primary: "text-primary bg-primary/8",
} as const;

export function MetricCountCard({
  label,
  target,
  prefix = "",
  suffix = "",
  active,
  accent,
}: MetricCountCardProps) {
  const value = useCountUp(target, active, 1000);

  return (
    <div className={cn("rounded-lg p-3", ACCENT_CLASSES[accent])}>
      <p className="text-[11px] opacity-75">{label}</p>
      <p className={cn("mt-2 text-sm font-semibold", active && "stat-val")}>
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </p>
    </div>
  );
}
