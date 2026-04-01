import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
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

export type HeroSmartInputSignalAccent = "primary" | "emerald" | "sky";

export type HeroSmartInputSignal = {
  label: string;
  value: string;
  accent: HeroSmartInputSignalAccent;
};

export const HERO_HEADLINE_LINES = [
  ["Type", "it", "like", "you", "think."],
  ["Let", "rules", "sort", "the", "rest."],
] as const;

export const HERO_STATS: HeroStat[] = [
  { icon: ReceiptText, label: "Input", value: "Natural language" },
  { icon: ShieldCheck, label: "Rules", value: "Auto-match" },
  { icon: Clock3, label: "Workflow", value: "Less tapping" },
];

export const HERO_SMART_INPUT_SIGNALS: HeroSmartInputSignal[] = [
  { label: "Amount found", value: "$12.00", accent: "primary" },
  { label: "Category match", value: "Food & Drinks", accent: "emerald" },
  { label: "Entry type", value: "Expense", accent: "sky" },
];

export const HERO_SMART_INPUT_RULE = {
  keyword: "coffee",
  category: "Food & Drinks",
};

export const HERO_SMART_INPUT_EXAMPLES = [
  "12 Starbucks coffee",
  "18 Grab ride",
  "+ 500 cash top up",
];

export const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: ReceiptText,
    title: "Smart input first",
    description:
      "Write transactions in natural language so amount, type, and category context are easier to capture with less tapping.",
    color: "emerald",
  },
  {
    icon: ShieldCheck,
    title: "Rules that remember",
    description:
      "Save category keywords like coffee or ride so repeated spending lands in the right place more consistently.",
    color: "sky",
  },
  {
    icon: TrendingUp,
    title: "Stats you can understand",
    description:
      "See clean, easy-to-read statistics that help you understand your money quickly, take action faster, and stay in control with a user-friendly flow.",
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
