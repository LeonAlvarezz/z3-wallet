import { Suspense, lazy, useState } from "react";
import { BaseModel } from "@z3-wallet/types";
import CashflowSummary from "./components/cashflow/CashflowSummary";
import { useGetCashflowSummary } from "./hooks/use-get-cashflow-summary";
import { useGetMe } from "../auth/hooks/use-get-me";
import { CategorySectionSkeleton } from "./components/sections/skeletons/CategorySectionSkeleton";
import { ChartSectionSkeleton } from "./components/sections/skeletons/ChartSectionSkeleton";
import { RecentSectionSkeleton } from "./components/sections/skeletons/RecentSectionSkeleton";
const DashboardChartSection = lazy(
  () => import("./components/sections/DashboardChartSection"),
);
const DashboardCategorySection = lazy(
  () => import("./components/sections/DashboardCategorySection"),
);
const DashboardRecentSection = lazy(
  () => import("./components/sections/DashboardRecentSection"),
);

export default function Dashboard() {
  const [timeFrame, setTimeFrame] = useState<BaseModel.TimeFrameEnum>(
    BaseModel.TimeFrameEnum.MONTH,
  );

  const { data: me } = useGetMe();
  const { data: summary } = useGetCashflowSummary();

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-y-auto p-4 pb-[calc(var(--bottom-nav-total-h))]">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-white/50">Good morning</p>
          <p className="text-primary text-xl font-bold">{me?.username} 👋</p>
        </div>
      </div>
      <CashflowSummary
        expense={summary?.expense}
        top_up={summary?.top_up}
        total={summary?.total_remaining_balance}
      />
      <Suspense fallback={<ChartSectionSkeleton />}>
        <DashboardChartSection
          timeFrame={timeFrame}
          onTimeFrameChange={setTimeFrame}
        />
      </Suspense>
      <Suspense fallback={<CategorySectionSkeleton />}>
        <DashboardCategorySection timeFrame={timeFrame} />
      </Suspense>
      <Suspense fallback={<RecentSectionSkeleton />}>
        <DashboardRecentSection />
      </Suspense>
    </div>
  );
}
