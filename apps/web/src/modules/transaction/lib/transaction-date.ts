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

function parseTimeSource(timeSource: Date | string | undefined) {
  if (!timeSource) return null;

  const date =
    timeSource instanceof Date ? new Date(timeSource) : new Date(timeSource);

  if (Number.isNaN(date.getTime())) return null;

  return date;
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

export function getRelativeIsoDateTime(
  daysFromReference: number,
  referenceDate = new Date(),
) {
  const shiftedDate = new Date(referenceDate);
  shiftedDate.setDate(shiftedDate.getDate() + daysFromReference);
  return shiftedDate.toISOString();
}

function collapseWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function extractRelativeDayOffset(text?: string) {
  if (!text) {
    return {
      cleanedText: "",
      offset: null,
    };
  }

  const todayMatch = text.match(/\btoday\b/i);
  if (todayMatch) {
    return {
      cleanedText: collapseWhitespace(text.replace(todayMatch[0], " ")),
      offset: 0,
    };
  }

  const yesterdayMatch = text.match(/\byesterday\b/i);
  if (yesterdayMatch) {
    return {
      cleanedText: collapseWhitespace(text.replace(yesterdayMatch[0], " ")),
      offset: -1,
    };
  }

  const daysAgoMatch = text.match(/\b(\d+)\s*(?:d|day|days)\s+ago\b/i);
  if (!daysAgoMatch) {
    return {
      cleanedText: collapseWhitespace(text),
      offset: null,
    };
  }

  return {
    cleanedText: collapseWhitespace(text.replace(daysAgoMatch[0], " ")),
    offset: -Number(daysAgoMatch[1]),
  };
}

export function parseRelativeDayOffset(text?: string) {
  return extractRelativeDayOffset(text).offset;
}

export function extractTimeOfDay(text?: string) {
  if (!text) {
    return {
      cleanedText: "",
      time: null,
    };
  }

  const twelveHourMatch = text.match(
    /\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*([ap]m)\b/i,
  );
  if (twelveHourMatch) {
    const hours = Number(twelveHourMatch[1]);
    const minutes = twelveHourMatch[2] ? Number(twelveHourMatch[2]) : 0;
    const meridiem = twelveHourMatch[3].toLowerCase();

    return {
      cleanedText: collapseWhitespace(text.replace(twelveHourMatch[0], " ")),
      time: {
        hours: meridiem === "am" ? hours % 12 : (hours % 12) + 12,
        minutes,
      },
    };
  }

  const twentyFourHourMatch = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (twentyFourHourMatch) {
    return {
      cleanedText: collapseWhitespace(
        text.replace(twentyFourHourMatch[0], " "),
      ),
      time: {
        hours: Number(twentyFourHourMatch[1]),
        minutes: Number(twentyFourHourMatch[2]),
      },
    };
  }

  return {
    cleanedText: collapseWhitespace(text),
    time: null,
  };
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
  options?: {
    timeSource?: Date | string;
  },
) {
  const safeDateKey = getSafeTransactionDateKey(dateKey, referenceDate);
  const timeSource = parseTimeSource(options?.timeSource);

  if (safeDateKey === getLocalDateKey(referenceDate) && !timeSource) {
    return referenceDate.toISOString();
  }

  const parsed = parseLocalDateKey(safeDateKey);
  if (!parsed) return referenceDate.toISOString();

  const dateWithTime = new Date(
    parsed.year,
    parsed.month - 1,
    parsed.day,
    timeSource?.getHours() ?? 12,
    timeSource?.getMinutes() ?? 0,
    timeSource?.getSeconds() ?? 0,
    timeSource?.getMilliseconds() ?? 0,
  );

  if (
    safeDateKey === getLocalDateKey(referenceDate) &&
    dateWithTime.getTime() > referenceDate.getTime()
  ) {
    return referenceDate.toISOString();
  }

  return dateWithTime.toISOString();
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
  const date = isoDate ? new Date(isoDate) : referenceDate;
  const safeDate = Number.isNaN(date.getTime()) ? referenceDate : date;
  const timeLabel = safeDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (preset !== "custom") {
    return `${presetOption?.label ?? "Today"}, ${timeLabel}`;
  }

  return `${safeDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}, ${timeLabel}`;
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

  return getCreatedAtForDateKey(getLocalDateKey(selectedDate), now, {
    timeSource: selectedDate,
  });
}
