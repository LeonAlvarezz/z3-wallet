export type TransactionDatePreset =
  | "today"
  | "yesterday"
  | "two-days-ago"
  | "custom";

export const transactionDatePresetOptions = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "two-days-ago", label: "2 days ago" },
  { value: "custom", label: "Custom" },
] as const satisfies {
  value: TransactionDatePreset;
  label: string;
}[];

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function parseLocalDateKey(dateKey: string) {
  if (!DATE_KEY_PATTERN.test(dateKey)) return null;

  const [year, month, day] = dateKey.split("-").map(Number);
  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

export function getLocalDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

export function addLocalDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function getRelativeLocalDateKey(
  daysFromToday: number,
  referenceDate = new Date(),
) {
  return getLocalDateKey(addLocalDays(referenceDate, daysFromToday));
}

export function getPresetDateKey(
  preset: Exclude<TransactionDatePreset, "custom">,
  referenceDate = new Date(),
) {
  switch (preset) {
    case "yesterday":
      return getRelativeLocalDateKey(-1, referenceDate);
    case "two-days-ago":
      return getRelativeLocalDateKey(-2, referenceDate);
    default:
      return getLocalDateKey(referenceDate);
  }
}

export function isFutureDateKey(dateKey: string, referenceDate = new Date()) {
  if (!parseLocalDateKey(dateKey)) return false;
  return dateKey > getLocalDateKey(referenceDate);
}

export function getSafeTransactionDateKey(
  dateKey: string,
  referenceDate = new Date(),
) {
  if (!parseLocalDateKey(dateKey)) return getLocalDateKey(referenceDate);
  if (isFutureDateKey(dateKey, referenceDate)) {
    return getLocalDateKey(referenceDate);
  }
  return dateKey;
}

export function getCreatedAtForDateKey(
  dateKey: string,
  referenceDate = new Date(),
) {
  const safeDateKey = getSafeTransactionDateKey(dateKey, referenceDate);

  if (safeDateKey === getLocalDateKey(referenceDate)) {
    return referenceDate.toISOString();
  }

  const parsed = parseLocalDateKey(safeDateKey);
  if (!parsed) return referenceDate.toISOString();

  return new Date(parsed.year, parsed.month - 1, parsed.day, 12).toISOString();
}

export function getTransactionDatePreset(
  isoDate?: string,
  referenceDate = new Date(),
): TransactionDatePreset {
  if (!isoDate) return "today";

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "today";

  const dateKey = getLocalDateKey(date);

  if (dateKey === getPresetDateKey("today", referenceDate)) return "today";
  if (dateKey === getPresetDateKey("yesterday", referenceDate)) {
    return "yesterday";
  }
  if (dateKey === getPresetDateKey("two-days-ago", referenceDate)) {
    return "two-days-ago";
  }
  return "custom";
}

export function formatTransactionDateLabel(
  isoDate?: string,
  referenceDate = new Date(),
) {
  const preset = getTransactionDatePreset(isoDate, referenceDate);
  const presetOption = transactionDatePresetOptions.find(
    (option) => option.value === preset,
  );

  if (preset !== "custom") return presetOption?.label ?? "Today";

  const date = isoDate ? new Date(isoDate) : referenceDate;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function prepareTransactionCreatedAt(
  selectedCreatedAt: string | undefined,
  options?: {
    now?: Date;
    originalCreatedAt?: string;
  },
) {
  if (
    selectedCreatedAt &&
    options?.originalCreatedAt &&
    selectedCreatedAt === options.originalCreatedAt
  ) {
    return options.originalCreatedAt;
  }

  const now = options?.now ?? new Date();
  if (!selectedCreatedAt) return now.toISOString();

  const selectedDate = new Date(selectedCreatedAt);
  if (Number.isNaN(selectedDate.getTime())) return now.toISOString();

  return getCreatedAtForDateKey(getLocalDateKey(selectedDate), now);
}
