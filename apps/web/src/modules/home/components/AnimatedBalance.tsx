import { cn } from "@/lib/utils";
import { useCountUp } from "../hooks/use-count-up";

type AnimatedBalanceProps = {
  active: boolean;
};

export function AnimatedBalance({ active }: AnimatedBalanceProps) {
  const value = useCountUp(1284, active);

  return (
    <span className={cn("text-3xl font-bold", active && "stat-val")}>
      ${value.toLocaleString()}.00
    </span>
  );
}
