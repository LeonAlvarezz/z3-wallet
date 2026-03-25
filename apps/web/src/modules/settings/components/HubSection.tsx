import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { useRouter } from "@tanstack/react-router";

type HubSectionItem = {
  title: string;
  description: string;
  icon: string;
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
  switch?: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  };

  inputNumber?: {
    value: number;
    onValueChange: (value: number) => void;
    max?: number;
  };
};

export function HubSection({
  title,
  items,
}: {
  title: string;
  items: HubSectionItem[];
}) {
  const router = useRouter();

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-muted-foreground text-sm font-semibold uppercase">
        {title}
      </h2>

      <div className="flex flex-col gap-2">
        {items.map((item) => {
          if (item.switch) {
            return (
              <div
                key={item.title}
                className={cn(
                  "bg-card flex h-14 w-full items-center justify-between rounded-lg border px-3",
                  item.disabled && "opacity-60",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-secondary flex size-10 items-center justify-center rounded-lg">
                    <Icon icon={item.icon} className="size-6" />
                  </div>
                  <div className="flex flex-col gap-0.5 text-left">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-muted-foreground max-w-52 overflow-hidden text-xs text-nowrap text-ellipsis">
                      {item.description}
                    </p>
                  </div>
                </div>

                <Switch
                  disabled={item.disabled}
                  checked={item.switch.checked}
                  onCheckedChange={item.switch.onCheckedChange}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full border transition-colors",
                    item.switch.checked ? "bg-primary" : "bg-secondary",
                  )}
                />
              </div>
            );
          }

          if (item.inputNumber) {
            return (
              <div
                key={item.title}
                className={cn(
                  "bg-card flex h-14 w-full items-center justify-between rounded-lg border px-3",
                  item.disabled && "opacity-60",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-secondary flex size-10 items-center justify-center rounded-lg">
                    <Icon icon={item.icon} className="size-6" />
                  </div>
                  <div className="flex flex-col gap-0.5 text-left">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-muted-foreground max-w-52 overflow-hidden text-xs text-nowrap text-ellipsis">
                      {item.description}
                    </p>
                  </div>
                </div>

                <Input
                  value={item.inputNumber.value}
                  onChange={(e) => {
                    const nextValue = Number(e.target.value);

                    if (Number.isNaN(nextValue)) {
                      item.inputNumber?.onValueChange(0);
                      return;
                    }

                    if (
                      item.inputNumber?.max !== undefined &&
                      nextValue >= item.inputNumber.max
                    ) {
                      item.inputNumber.onValueChange(item.inputNumber.max);
                      return;
                    }

                    item.inputNumber?.onValueChange(nextValue);
                  }}
                  className="w-10 text-center text-sm"
                  maxLength={10}
                  max={10}
                />
              </div>
            );
          }

          return (
            <Button
              key={item.title}
              type="button"
              variant="outline"
              disabled={item.disabled}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                  return;
                }

                if (item.to) {
                  router.history.push(item.to);
                }
              }}
              className="h-14 w-full"
            >
              <div className="flex w-full gap-3">
                <div className="bg-secondary flex size-10 items-center justify-center rounded-lg">
                  <Icon icon={item.icon} className="size-6" />
                </div>
                <div className="flex flex-col gap-0.5 text-left">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-muted-foreground max-w-52 overflow-hidden text-xs text-ellipsis">
                    {item.description}
                  </p>
                </div>
              </div>

              <Icon
                icon="solar:alt-arrow-right-linear"
                className="text-muted-foreground size-5"
              />
            </Button>
          );
        })}
      </div>
    </section>
  );
}
