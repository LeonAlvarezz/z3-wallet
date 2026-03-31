import { describe, expect, it } from "bun:test";
import {
  decodeCursor,
  encodeCursor,
  getCursorMeta,
  processCursorResult,
} from "@/util/cursor-pagination";

describe("cursor-pagination util", () => {
  it("should encode/decode cursor roundtrip", () => {
    const input = {
      id: 123,
      created_at: "2026-01-01T10:20:30.000Z",
    };

    const encoded = encodeCursor(input);
    const decoded = decodeCursor(encoded);

    expect(decoded).toEqual(input);
  });

  it("should throw on malformed cursor", () => {
    expect(() => decodeCursor("not-a-base64-cursor")).toThrow("Invalid cursor");
  });

  it("should throw when decoded cursor does not match schema", () => {
    const invalidSchemaCursor = btoa(JSON.stringify({ id: "x" }));
    expect(() => decodeCursor(invalidSchemaCursor)).toThrow("Invalid cursor");
  });

  it("should build cursor meta with next_cursor when id and created_at are present", () => {
    const meta = getCursorMeta({
      id: 99,
      created_at: "2026-01-01T10:20:30.000Z",
      page_size: 10,
      total: 11,
    });

    expect(meta.has_more).toBe(true);
    expect(meta.page_size).toBe(10);
    expect(meta.next_cursor).toBeTruthy();

    const decoded = decodeCursor(meta.next_cursor!);
    expect(decoded).toEqual({
      id: 99,
      created_at: "2026-01-01T10:20:30.000Z",
    });
  });

  it("should return null next_cursor when id/created_at are missing", () => {
    const meta = getCursorMeta({
      page_size: 10,
      total: 5,
    });

    expect(meta.has_more).toBe(false);
    expect(meta.next_cursor).toBeNull();
  });

  it("should set has_more and next_cursor from last item when page is full", () => {
    const rows = [
      { id: 1, created_at: "2026-01-01T00:00:00.000Z" },
      { id: 2, created_at: "2026-01-01T01:00:00.000Z" },
      { id: 3, created_at: "2026-01-01T02:00:00.000Z" },
    ];
    const extra = [{ day: "2026-01-01", total: 12 }];

    const result = processCursorResult(rows, 3, extra);

    expect(result.data).toEqual(rows);
    expect(result.meta.has_more).toBe(true);
    expect(result.meta.page_size).toBe(3);
    expect(result.extra).toEqual(extra);

    const decoded = decodeCursor(result.meta.next_cursor!);
    expect(decoded).toEqual({
      id: 3,
      created_at: "2026-01-01T02:00:00.000Z",
    });
  });

  it("should return has_more false for short pages and null next_cursor", () => {
    const rows = [{ id: 1, created_at: "2026-01-01T00:00:00.000Z" }];
    const result = processCursorResult(rows, 10);

    expect(result.meta.has_more).toBe(false);
    expect(result.meta.next_cursor).toBeNull();
  });

  it("should return empty data safely", () => {
    const result = processCursorResult([], 10);

    expect(result.data).toEqual([]);
    expect(result.meta.has_more).toBe(false);
    expect(result.meta.next_cursor).toBeNull();
  });
});
