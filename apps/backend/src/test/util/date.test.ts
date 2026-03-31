import { describe, expect, it } from "bun:test";
import { BaseModel } from "@z3-wallet/types";
import { getMonth, getTimeFrameRange } from "@/util/date";

function startOfDayUtc(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

describe("date util", () => {
  it("getMonth should return current month start and next month start in UTC", () => {
    const { now, monthStart, nextMonthStart } = getMonth();

    expect(monthStart.getUTCDate()).toBe(1);
    expect(monthStart.getUTCHours()).toBe(0);
    expect(monthStart.getUTCMinutes()).toBe(0);
    expect(monthStart.getUTCSeconds()).toBe(0);
    expect(monthStart.getUTCMilliseconds()).toBe(0);

    expect(nextMonthStart.getUTCDate()).toBe(1);
    expect(nextMonthStart.getUTCHours()).toBe(0);
    expect(nextMonthStart.getUTCMinutes()).toBe(0);
    expect(nextMonthStart.getUTCSeconds()).toBe(0);
    expect(nextMonthStart.getUTCMilliseconds()).toBe(0);

    expect(now.getTime()).toBeGreaterThanOrEqual(monthStart.getTime());
    expect(now.getTime()).toBeLessThan(nextMonthStart.getTime());
  });

  it("getTimeFrameRange should return undefined bounds for empty and all-time", () => {
    const empty = getTimeFrameRange();
    expect(empty.start).toBeUndefined();
    expect(empty.endExclusive).toBeUndefined();

    const all = getTimeFrameRange(BaseModel.TimeFrameEnum.ALL_TIME);
    expect(all.start).toBeUndefined();
    expect(all.endExclusive).toBeUndefined();
  });

  it("getTimeFrameRange(today) should span exactly one UTC day", () => {
    const now = new Date();
    const expectedStart = startOfDayUtc(now);
    const expectedEnd = addUtcDays(expectedStart, 1);

    const range = getTimeFrameRange(BaseModel.TimeFrameEnum.TODAY);
    expect(range.start?.toISOString()).toBe(expectedStart.toISOString());
    expect(range.endExclusive?.toISOString()).toBe(expectedEnd.toISOString());
  });

  it("getTimeFrameRange(yesterday) should return previous UTC day", () => {
    const todayStart = startOfDayUtc(new Date());
    const yesterdayStart = addUtcDays(todayStart, -1);

    const range = getTimeFrameRange(BaseModel.TimeFrameEnum.YESTERDAY);
    expect(range.start?.toISOString()).toBe(yesterdayStart.toISOString());
    expect(range.endExclusive?.toISOString()).toBe(todayStart.toISOString());
  });

  it("getTimeFrameRange(week) should start Monday UTC and end tomorrow UTC", () => {
    const now = new Date();
    const todayStart = startOfDayUtc(now);
    const day = now.getUTCDay();
    const diffFromMonday = (day + 6) % 7;

    const mondayStart = addUtcDays(todayStart, -diffFromMonday);
    const tomorrowStart = addUtcDays(todayStart, 1);

    const range = getTimeFrameRange(BaseModel.TimeFrameEnum.WEEK);
    expect(range.start?.toISOString()).toBe(mondayStart.toISOString());
    expect(range.endExclusive?.toISOString()).toBe(tomorrowStart.toISOString());
  });

  it("getTimeFrameRange(month) should start at first UTC day and end tomorrow UTC", () => {
    const now = new Date();
    const todayStart = startOfDayUtc(now);
    const tomorrowStart = addUtcDays(todayStart, 1);
    const firstDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const range = getTimeFrameRange(BaseModel.TimeFrameEnum.MONTH);
    expect(range.start?.toISOString()).toBe(firstDay.toISOString());
    expect(range.endExclusive?.toISOString()).toBe(tomorrowStart.toISOString());
  });

  it("getTimeFrameRange(year) should start Jan 1 UTC and end tomorrow UTC", () => {
    const now = new Date();
    const todayStart = startOfDayUtc(now);
    const tomorrowStart = addUtcDays(todayStart, 1);
    const firstDayOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

    const range = getTimeFrameRange(BaseModel.TimeFrameEnum.YEAR);
    expect(range.start?.toISOString()).toBe(firstDayOfYear.toISOString());
    expect(range.endExclusive?.toISOString()).toBe(tomorrowStart.toISOString());
  });
});
