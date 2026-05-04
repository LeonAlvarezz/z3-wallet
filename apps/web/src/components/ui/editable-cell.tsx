import { type ReactNode, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Button } from "./button";

export type EditableCellRenderProps<TValue> = {
  value: TValue;
  commit: (value?: TValue) => void;
  cancel: () => void;
  setDraftValue: (value: TValue) => void;
};

export type EditableCellProps<TValue> = {
  value: TValue;
  ariaLabel: string;
  ariaInvalid?: boolean;
  emptyLabel?: string;
  className?: string;
  disabled?: boolean;
  displayClassName?: string;
  onValueChange?: (value: TValue) => void;
  isEmpty?: (value: TValue) => boolean;
  renderValue?: (value: TValue) => ReactNode;
  renderEditor: (props: EditableCellRenderProps<TValue>) => ReactNode;
};

export function EditableCell<TValue>({
  value,
  ariaLabel,
  ariaInvalid,
  disabled,
  emptyLabel = "Click to edit",
  className,
  displayClassName,
  onValueChange,
  isEmpty = (currentValue) => currentValue == null || currentValue === "",
  renderValue = (currentValue) => String(currentValue ?? ""),
  renderEditor,
}: EditableCellProps<TValue>) {
  const isControlled = onValueChange !== undefined;
  const [editing, setEditing] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const committedValue = isControlled ? value : internalValue;
  const [draftValue, setDraftValue] = useState(committedValue);

  useEffect(() => {
    if (isControlled || editing) return;
    setInternalValue(value);
  }, [editing, isControlled, value]);

  useEffect(() => {
    if (editing) return;
    setDraftValue(committedValue);
  }, [committedValue, editing]);

  function startEditing() {
    setDraftValue(committedValue);
    setEditing(true);
  }

  function commit(nextValue = draftValue) {
    if (onValueChange) {
      onValueChange(nextValue);
    } else {
      setInternalValue(nextValue);
    }

    setDraftValue(nextValue);
    setEditing(false);
  }

  function cancel() {
    setDraftValue(committedValue);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className={cn("w-full", className)}>
        {renderEditor({
          value: draftValue,
          commit,
          cancel,
          setDraftValue,
        })}
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="barebone"
      aria-label={ariaLabel}
      aria-invalid={ariaInvalid || undefined}
      onClick={startEditing}
      disabled={disabled}
      className={cn(
        "hover:bg-accent focus-visible:border-ring focus-visible:ring-ring/50 min-h-8 w-full justify-start rounded-md px-2! text-left font-normal transition-colors outline-none focus-visible:ring-[3px]",
        className,
        displayClassName,
      )}
    >
      {isEmpty(committedValue) ? (
        <span className="text-muted-foreground">
          {emptyLabel}
          {disabled}
        </span>
      ) : (
        renderValue(committedValue)
      )}
    </Button>
  );
}

export type EditableInputCellProps = Omit<
  EditableCellProps<string>,
  "renderEditor"
> & {
  type?: "text" | "number";
  inputClassName?: string;
  step?: string;
  min?: string;
  trimOnCommit?: boolean;
};

export function EditableInputCell({
  type = "text",
  inputClassName,
  step,
  min,
  trimOnCommit = true,
  ...props
}: EditableInputCellProps) {
  return (
    <EditableCell
      {...props}
      renderEditor={({ value, setDraftValue, commit, cancel }) => (
        <EditableInputCellEditor
          value={value}
          type={type}
          ariaLabel={props.ariaLabel}
          ariaInvalid={props.ariaInvalid}
          inputClassName={inputClassName}
          step={step ?? (type === "number" ? "0.01" : undefined)}
          min={min ?? (type === "number" ? "0" : undefined)}
          onValueChange={setDraftValue}
          onCommit={() => commit(trimOnCommit ? value.trim() : value)}
          onCancel={cancel}
        />
      )}
    />
  );
}

type EditableInputCellEditorProps = {
  value: string;
  type: "text" | "number";
  ariaLabel: string;
  ariaInvalid?: boolean;
  inputClassName?: string;
  step?: string;
  min?: string;
  onValueChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
};

function EditableInputCellEditor({
  value,
  type,
  ariaLabel,
  ariaInvalid,
  inputClassName,
  step,
  min,
  onValueChange,
  onCommit,
  onCancel,
}: EditableInputCellEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <Input
      ref={inputRef}
      type={type}
      aria-label={ariaLabel}
      aria-invalid={ariaInvalid || undefined}
      value={value}
      step={step}
      min={min}
      onChange={(event) => onValueChange(event.target.value)}
      onBlur={onCommit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onCommit();
        }

        if (event.key === "Escape") {
          event.preventDefault();
          onCancel();
        }
      }}
      className={cn("h-8", inputClassName)}
    />
  );
}

export type EditableSelectCellOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export type EditableSelectCellProps = Omit<
  EditableCellProps<string>,
  "renderEditor" | "renderValue"
> & {
  options: EditableSelectCellOption[];
  placeholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  renderValue?: (
    value: string,
    option: EditableSelectCellOption | undefined,
  ) => ReactNode;
};

export function EditableSelectCell({
  options,
  placeholder = "Select an option",
  triggerClassName,
  contentClassName,
  renderValue,
  disabled,
  ...props
}: EditableSelectCellProps) {
  function getOption(value: string) {
    return options.find((option) => option.value === value);
  }

  return (
    <EditableCell
      {...props}
      renderValue={(value) => {
        const selectedOption = getOption(value);
        return renderValue?.(value, selectedOption) ?? selectedOption?.label;
      }}
      disabled={disabled}
      renderEditor={({ value, commit }) => (
        <EditableSelectCellEditor
          value={value}
          ariaLabel={props.ariaLabel}
          ariaInvalid={props.ariaInvalid}
          options={options}
          disabled={disabled}
          placeholder={placeholder}
          triggerClassName={triggerClassName}
          contentClassName={contentClassName}
          onCommit={commit}
        />
      )}
    />
  );
}

type EditableSelectCellEditorProps = {
  value: string;
  ariaLabel: string;
  ariaInvalid?: boolean;
  options: EditableSelectCellOption[];
  placeholder: string;
  disabled?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
  onCommit: (value: string) => void;
};

function EditableSelectCellEditor({
  value,
  ariaLabel,
  ariaInvalid,
  options,
  placeholder,
  triggerClassName,
  disabled,
  contentClassName,
  onCommit,
}: EditableSelectCellEditorProps) {
  const [open, setOpen] = useState(true);
  const selectedValueRef = useRef(value);

  return (
    <Select
      value={value}
      open={open}
      disabled={disabled}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          queueMicrotask(() => onCommit(selectedValueRef.current));
        }
      }}
      onValueChange={(nextValue) => {
        selectedValueRef.current = nextValue;
        onCommit(nextValue);
      }}
    >
      <SelectTrigger
        autoFocus
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid || undefined}
        size="sm"
        disabled={disabled}
        className={cn("h-8 w-full", triggerClassName)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
