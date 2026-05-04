import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";

type ImportPreviewEditableCellProps = {
  value: string;
  type?: "text" | "number";
  ariaLabel: string;
  emptyLabel?: string;
  className?: string;
};

export function ImportPreviewEditableCell({
  value,
  type = "text",
  ariaLabel,
  emptyLabel = "Click to edit",
  className,
}: ImportPreviewEditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [committedValue, setCommittedValue] = useState(value);
  const [draftValue, setDraftValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  function startEditing() {
    setDraftValue(committedValue);
    setEditing(true);
  }

  function commitValue() {
    setCommittedValue(draftValue.trim());
    setEditing(false);
  }

  function cancelEditing() {
    setDraftValue(committedValue);
    setEditing(false);
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        aria-label={ariaLabel}
        value={draftValue}
        step={type === "number" ? "0.01" : undefined}
        min={type === "number" ? "0" : undefined}
        onChange={(event) => setDraftValue(event.target.value)}
        onBlur={commitValue}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitValue();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            cancelEditing();
          }
        }}
        className="h-8"
      />
    );
  }

  return (
    <Button
      type="button"
      aria-label={ariaLabel}
      onClick={startEditing}
      className={`hover:bg-accent focus-visible:border-ring focus-visible:ring-ring/50 min-h-8 w-full rounded-md px-2 text-left transition-colors outline-none focus-visible:ring-[3px] ${className ?? ""}`}
    >
      {committedValue || (
        <span className="text-muted-foreground">{emptyLabel}</span>
      )}
    </Button>
  );
}
