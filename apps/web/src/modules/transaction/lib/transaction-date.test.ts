import { describe, expect, it } from "vitest";
import {
  formatTransactionDateLabel,
  getCreatedAtForDateKey,
  getLocalDateKey,
  getPresetDateKey,
  getSafeTransactionDateKey,
  prepareTransactionCreatedAt,
} from "./transaction-date";

const referenceDate = new Date(2026, 3, 11, 10, 30, 0, 0);

describe("transaction date helpers", () => {
  it("returns local date keys for today and recent presets", () => {
    expect(getLocalDateKey(referenceDate)).toBe("2026-04-11");
    expect(getPresetDateKey("today", referenceDate)).toBe("2026-04-11");
    expect(getPresetDateKey("yesterday", referenceDate)).toBe("2026-04-10");
    expect(getPresetDateKey("two-days-ago", referenceDate)).toBe("2026-04-09");
  });

  it("uses submit time for today", () => {
    expect(getCreatedAtForDateKey("2026-04-11", referenceDate)).toBe(
      referenceDate.toISOString(),
    );
  });

  it("uses local noon for past dates", () => {
    const createdAt = getCreatedAtForDateKey("2026-03-15", referenceDate);
    const createdAtDate = new Date(createdAt);

    expect(createdAtDate.getFullYear()).toBe(2026);
    expect(createdAtDate.getMonth()).toBe(2);
    expect(createdAtDate.getDate()).toBe(15);
    expect(createdAtDate.getHours()).toBe(12);
  });

  it("blocks future date keys by clamping to today", () => {
    expect(getSafeTransactionDateKey("2026-04-12", referenceDate)).toBe(
      "2026-04-11",
    );
  });

  it("preserves unchanged edit timestamps", () => {
    const originalCreatedAt = new Date(2026, 3, 10, 8).toISOString();

    expect(
      prepareTransactionCreatedAt(originalCreatedAt, {
        now: referenceDate,
        originalCreatedAt,
      }),
    ).toBe(originalCreatedAt);
  });

  it("formats preset and custom date labels", () => {
    expect(
      formatTransactionDateLabel(referenceDate.toISOString(), referenceDate),
    ).toBe("Today");

    const customDate = new Date(2026, 2, 15, 12).toISOString();
    expect(formatTransactionDateLabel(customDate, referenceDate)).toBe(
      "Mar 15, 2026",
    );
  });
});
