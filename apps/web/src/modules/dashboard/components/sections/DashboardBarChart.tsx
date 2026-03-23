import { BaseModel, type TransactionModel } from "@z3-wallet/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CartesianGrid, XAxis, Bar, BarChart } from "recharts";
import { formatAmount } from "@/utils/currency";

const chartConfig = {
  amount: {
    label: "Amount",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type DashboardBarChartProps = {
  chartData: TransactionModel.StatisticDto[];
  timeFrame: BaseModel.TimeFrameEnum;
};

export default function DashboardBarChart({
  chartData,
  timeFrame,
}: DashboardBarChartProps) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-52 w-full">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value);
            if (timeFrame === BaseModel.TimeFrameEnum.TODAY) {
              return date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });
            }
            return date.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
            });
          }}
        />
        <ChartTooltip
          cursor={true}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                const date = new Date(value);
                if (timeFrame === BaseModel.TimeFrameEnum.TODAY) {
                  return date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                }
                return date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
              }}
              formatter={(value) => {
                return `$${formatAmount(value.toString())}`;
              }}
              indicator="dot"
            />
          }
        />
        <Bar
          dataKey="amount"
          fill="var(--color-amount)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
