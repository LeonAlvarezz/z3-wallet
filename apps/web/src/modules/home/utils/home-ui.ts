import type { CSSProperties } from "react";
import type { FeatureCardColor } from "../constants/home-content";

export const HOME_DISPLAY_FONT_FAMILY = "'Bricolage Grotesque', sans-serif";

export const homeDisplayFontStyle = {
  fontFamily: HOME_DISPLAY_FONT_FAMILY,
} satisfies CSSProperties;

export function createAnimationDelayStyle(delayMs: number): CSSProperties {
  return { animationDelay: `${delayMs}ms` };
}

export function createTransitionDelayStyle(delayMs: number): CSSProperties {
  return { transitionDelay: `${delayMs}ms` };
}

export function getFeatureAccentClasses(color: FeatureCardColor) {
  switch (color) {
    case "emerald":
      return "bg-emerald-500/10 text-emerald-400";
    case "sky":
      return "bg-sky-500/10 text-sky-400";
    case "rose":
      return "bg-rose-500/10 text-rose-400";
  }
}
