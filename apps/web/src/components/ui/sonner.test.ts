import { describe, expect, it } from "vitest";
import { getViewportToastOffset } from "./sonner.utils";

describe("getViewportToastOffset", () => {
  it("falls back to the default edge gap when no visual viewport is available", () => {
    expect(getViewportToastOffset(null)).toEqual({
      top: 16,
      right: 16,
      bottom: 16,
      left: 16,
    });
  });

  it("keeps top toasts inside the visible viewport when the page is shifted", () => {
    expect(
      getViewportToastOffset(
        {
          width: 390,
          height: 420,
          offsetTop: 184,
          offsetLeft: 0,
        },
        {
          width: 390,
          height: 844,
        },
      ),
    ).toEqual({
      top: 200,
      right: 16,
      bottom: 256,
      left: 16,
    });
  });

  it("clamps negative inset values before applying the toast gap", () => {
    expect(
      getViewportToastOffset(
        {
          width: 412,
          height: 915,
          offsetTop: -24,
          offsetLeft: -8,
        },
        {
          width: 390,
          height: 844,
        },
      ),
    ).toEqual({
      top: 16,
      right: 16,
      bottom: 16,
      left: 16,
    });
  });
});
