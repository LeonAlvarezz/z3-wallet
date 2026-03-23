import { Suspense, lazy } from "react";
import { BaseModel, type TransactionModel } from "@z3-wallet/types";
import Empty from "@/components/empty/Empty";
import TimeframeButtonGroups from "@/components/time-frame-button-groups/TimeframeButtonGroups";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetStatistic } from "../../hooks/use-get-statistic";
const DashboardBarChart = lazy(() => import("./DashboardBarChart"));

type DashboardChartSectionProps = {
  timeFrame: BaseModel.TimeFrameEnum;
  onTimeFrameChange: (value: BaseModel.TimeFrameEnum) => void;
};

export default function DashboardChartSection({
  timeFrame,
  onTimeFrameChange,
}: DashboardChartSectionProps) {
  const { data: statisticData } = useGetStatistic({ time_frame: timeFrame });
  const chartData = (statisticData ?? []) as TransactionModel.StatisticDto[];

  return (
    <section className="space-y-4">
      <div className="flex justify-between">
        <h1>Chart</h1>
        <div className="flex items-center gap-2">
          <TimeframeButtonGroups
            value={timeFrame}
            onChange={onTimeFrameChange}
          />
        </div>
      </div>
      {chartData.length === 0 ? (
        <div className="flex h-52 w-full">
          <Empty
            title="No chart data"
            description="No spending data for selected timeframe"
            className="w-full"
          />
        </div>
      ) : (
        <Suspense fallback={<Skeleton className="h-52 w-full rounded-2xl" />}>
          <DashboardBarChart chartData={chartData} timeFrame={timeFrame} />
        </Suspense>
      )}
    </section>
  );
}
