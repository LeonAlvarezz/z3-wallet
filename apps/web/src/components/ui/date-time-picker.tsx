import { format } from "date-fns";
import { CalendarIcon, Clock3 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DateTimePickerProps = {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  disabledDates?: React.ComponentProps<typeof Calendar>["disabled"];
  maxDate?: Date;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  className?: string;
  triggerClassName?: string;
};

function padTimePart(value: number) {
  return String(value).padStart(2, "0");
}

function getTimeValue(date?: Date) {
  if (!date || Number.isNaN(date.getTime())) return "";

  return [padTimePart(date.getHours()), padTimePart(date.getMinutes())].join(
    ":",
  );
}

function mergeDateAndTime(date: Date, timeValue: string) {
  const [hours = "0", minutes = "0"] = timeValue.split(":");
  const nextDate = new Date(date);

  nextDate.setHours(
    Number.parseInt(hours, 10),
    Number.parseInt(minutes, 10),
    0,
    0,
  );

  return nextDate;
}

function clampDate(date: Date, maxDate?: Date) {
  if (maxDate && date.getTime() > maxDate.getTime()) {
    return new Date(maxDate);
  }

  return date;
}

export function DateTimePicker({
  value,
  onChange,
  onBlur,
  placeholder = "Pick date and time",
  disabled,
  disabledDates,
  maxDate,
  open,
  onOpenChange,
  id,
  className,
  triggerClassName,
}: DateTimePickerProps) {
  const reactId = React.useId();
  const inputId = `${id ?? reactId}-time`;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange],
  );
  const selectedDate =
    value && !Number.isNaN(value.getTime()) ? value : undefined;
  const timeValue = getTimeValue(selectedDate);

  const emitChange = React.useCallback(
    (date: Date | undefined) => {
      onChange?.(date ? clampDate(date, maxDate) : undefined);
    },
    [maxDate, onChange],
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      emitChange(undefined);
      return;
    }

    const timeSource = selectedDate ?? new Date();
    const nextDate = new Date(date);
    nextDate.setHours(timeSource.getHours(), timeSource.getMinutes(), 0, 0);

    emitChange(nextDate);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTimeValue = event.target.value;
    const dateSource = selectedDate ?? new Date();

    emitChange(mergeDateAndTime(dateSource, nextTimeValue));
  };

  const setNow = () => {
    emitChange(new Date());
  };

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          className={cn(
            "w-full justify-between px-3 font-normal",
            !selectedDate && "text-muted-foreground",
            triggerClassName,
          )}
          disabled={disabled}
          onBlur={onBlur}
          variant="outline"
        >
          <span className="truncate text-left">
            {selectedDate ? format(selectedDate, "PPP p") : placeholder}
          </span>
          <CalendarIcon className="text-muted-foreground size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-auto p-0", className)}>
        <div className="bg-background divide-y overflow-hidden rounded-md">
          <Calendar
            mode="single"
            selected={selectedDate}
            defaultMonth={selectedDate}
            disabled={disabledDates}
            onSelect={handleDateSelect}
          />
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={inputId}>Time</Label>
              <Button type="button" size="xs" variant="ghost" onClick={setNow}>
                <Clock3 className="size-3" />
                Now
              </Button>
            </div>
            <Input
              className="w-full"
              id={inputId}
              onChange={handleTimeChange}
              type="time"
              value={timeValue}
            />
            <Button
              type="button"
              className="w-full"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DateTimePicker;
