import { useEffect, useEffectEvent } from "react";

type ShortcutCallback = (event: KeyboardEvent) => void | Promise<void>;

type UseShortcutOptions = {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  allowInEditable?: boolean;
};

function normalizeKey(key: string) {
  return key.trim().toLowerCase();
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}

function matchesShortcut(event: KeyboardEvent, shortcut: string) {
  const parts = shortcut.split("+").map(normalizeKey).filter(Boolean);

  if (parts.length === 0) {
    return false;
  }

  const expectsMeta = parts.includes("meta") || parts.includes("cmd");
  const expectsCtrl = parts.includes("ctrl") || parts.includes("control");
  const expectsAlt = parts.includes("alt") || parts.includes("option");
  const expectsShift = parts.includes("shift");
  const primaryKey =
    parts.find(
      (part) =>
        !["meta", "cmd", "ctrl", "control", "alt", "option", "shift"].includes(
          part,
        ),
    ) ?? "";

  if (event.metaKey !== expectsMeta) {
    return false;
  }

  if (event.ctrlKey !== expectsCtrl) {
    return false;
  }

  if (event.altKey !== expectsAlt) {
    return false;
  }

  if (event.shiftKey !== expectsShift) {
    return false;
  }

  return normalizeKey(event.key) === primaryKey;
}

export function useShortcut(
  shortcut: string,
  callback: ShortcutCallback,
  {
    enabled = true,
    preventDefault = false,
    stopPropagation = false,
    allowInEditable = false,
  }: UseShortcutOptions = {},
) {
  const onShortcut = useEffectEvent(async (event: KeyboardEvent) => {
    if (!allowInEditable && isEditableTarget(event.target)) {
      return;
    }

    if (!matchesShortcut(event, shortcut)) {
      return;
    }

    if (preventDefault) {
      event.preventDefault();
    }

    if (stopPropagation) {
      event.stopPropagation();
    }

    await callback(event);
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      void onShortcut(event);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);
}
