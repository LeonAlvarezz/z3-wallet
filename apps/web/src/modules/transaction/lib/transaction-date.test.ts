import { describe, expect, it } from "vitest";
import {
  extractRelativeDayOffset,
  extractTimeOfDay,
  formatTransactionDateLabel,
  getCreatedAtForDateKey,
  getLocalDateKey,
  getPresetDateKey,
  getRelativeIsoDateTime,
  parseRelativeDayOffset,
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

  it("can preserve selected time for past dates", () => {
    const timeSource = new Date(2026, 3, 11, 8, 45, 0, 0);
    const createdAt = getCreatedAtForDateKey("2026-03-15", referenceDate, {
      timeSource,
    });
    const createdAtDate = new Date(createdAt);

    expect(createdAtDate.getFullYear()).toBe(2026);
    expect(createdAtDate.getMonth()).toBe(2);
    expect(createdAtDate.getDate()).toBe(15);
    expect(createdAtDate.getHours()).toBe(8);
    expect(createdAtDate.getMinutes()).toBe(45);
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

  it("preserves selected submit time", () => {
    const selectedCreatedAt = new Date(2026, 3, 10, 8, 45).toISOString();
    const prepared = prepareTransactionCreatedAt(selectedCreatedAt, {
      now: referenceDate,
    });
    const preparedDate = new Date(prepared);

    expect(preparedDate.getFullYear()).toBe(2026);
    expect(preparedDate.getMonth()).toBe(3);
    expect(preparedDate.getDate()).toBe(10);
    expect(preparedDate.getHours()).toBe(8);
    expect(preparedDate.getMinutes()).toBe(45);
  });

  it("formats preset and custom date labels", () => {
    expect(
      formatTransactionDateLabel(referenceDate.toISOString(), referenceDate),
    ).toBe("Today, 10:30 AM");

    const customDate = new Date(2026, 2, 15, 12).toISOString();
    expect(formatTransactionDateLabel(customDate, referenceDate)).toBe(
      "Mar 15, 2026, 12:00 PM",
    );
  });
});
