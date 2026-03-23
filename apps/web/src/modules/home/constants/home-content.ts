import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  Focus,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Target,
  TrendingUp,
  Waves,
  Wallet,
} from "lucide-react";

export type FeatureCardColor = "emerald" | "sky" | "rose";

export type HeroStat = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export type FeatureCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  color: FeatureCardColor;
};

export type Benefit = {
  icon: LucideIcon;
  title: string;
};

export type PreviewBar = {
  h: number;
  day: string;
};

export const HERO_HEADLINE_LINES = [
  ["Track", "spending."],
  ["Stay", "calm."],
] as const;

export const HERO_STATS: HeroStat[] = [
  { icon: Clock3, label: "Setup time", value: "2 min" },
  { icon: Focus, label: "Focus", value: "Daily" },
  { icon: Waves, label: "View", value: "Cash flow" },
];

export const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: ReceiptText,
    title: "Track fast",
    description:
      "Capture transactions quickly so everyday spending stays visible while it still matters.",
    color: "emerald",
  },
  {
    icon: TrendingUp,
    title: "Read patterns",
    description:
      "See how money moves through the month with simple category and cash flow context.",
    color: "sky",
  },
  {
    icon: Target,
    title: "Adjust early",
    description:
      "Notice drift before it becomes a surprise and make smaller, smarter decisions sooner.",
    color: "rose",
  },
];

export const BENEFITS: Benefit[] = [
  {
    icon: Wallet,
    title: "One clear home for balances, transactions, and categories",
  },
  {
    icon: PiggyBank,
    title: "A rhythm you can keep without spreadsheet fatigue",
  },
  {
    icon: ShieldCheck,
    title: "Focused design without noisy dashboards or clutter",
  },
];

export const TICKER_ITEMS = [
  "Cash flow",
  "Net savings",
  "Spending rhythm",
  "Budget clarity",
  "Daily habits",
  "Category tracking",
  "Trend analysis",
  "Smart decisions",
  "Money confidence",
  "Zero clutter",
  "Real insights",
  "Calm finances",
];

export const PREVIEW_BARS: PreviewBar[] = [
  { h: 42, day: "M" },
  { h: 70, day: "T" },
  { h: 54, day: "W" },
  { h: 86, day: "T" },
  { h: 64, day: "F" },
  { h: 92, day: "S" },
  { h: 58, day: "S" },
];
