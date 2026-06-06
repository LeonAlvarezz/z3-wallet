import { Suspense, lazy, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { Skeleton } from "@/components/ui/skeleton";
import { DialogContent } from "@/components/ui/dialog";
import DailyGroup from "../components/daily-group/DailyGroup";
import { BaseModel, TransactionModel } from "@z3-wallet/types";
import InfiniteScroll from "@/components/infinite-scroll/InfiniteScroll";
import { Spinner } from "@/components/ui/spinner";
import { useInfiniteTransactions } from "../hooks/use-infinite-transactions";
import { useSearchDebounce } from "@/hooks/use-search-debounce";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { groupTransactionsByDate } from "@/utils/transaction";
import { StatsCard } from "../components/stats-card";
import { useCashflowOverview } from "../hooks/use-get-cashflow";
const UpdateTransactionDialog = lazy(
  () =>
    import("../components/update-transaction-dialog/UpdateTransactionDialog"),
);

export default function TransactionPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_homeLayout/transaction/" });
  const [open, setOpen] = useState(false);
  const { debouncedValue, setSearchQuery, searchQuery } =
    useSearchDebounce(500);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionModel.TransactionWithCategoryDto | null>(null);

  const timeFrame = search.time_frame ?? BaseModel.TimeFrameEnum.TODAY;

  const infinite = useInfiniteTransactions({
    page_size: 10,
    query: debouncedValue.trim() || undefined,
    time_frame: timeFrame,
  });
  const overview = useCashflowOverview({ time_frame: timeFrame });

  const transactions = infinite.data?.pages.flatMap((p) => p.data) || [];
  const extras =
    infinite.data?.pages
      .flatMap((p) => p.extra)
      .filter((data) => data !== undefined) || [];

  const hasMore = !!infinite.hasNextPage;

  const next = () => {
    if (infinite.isFetchingNextPage) return;
    if (!infinite.hasNextPage) return;
    void infinite.fetchNextPage();
  };

  // Group transactions by date
  const groupedTransactions = groupTransactionsByDate(transactions, extras);

  const totalSpent = overview.data?.expense ?? 0;
  const totalTopUp = overview.data?.top_up ?? 0;

  useEffect(() => {
    const nextQuery = debouncedValue.trim();
    if ((search.query ?? "") === nextQuery) return;

    navigate({
      to: "/transaction",
      search: (prev) => ({
        query: nextQuery.length ? nextQuery : undefined,
        time_frame: prev.time_frame,
      }),
      replace: true,
    });
  }, [debouncedValue, navigate, search.query]);

  return (
    <>
      <div className="flex h-full w-full flex-col gap-6 overflow-y-auto p-4 pb-[calc(var(--bottom-nav-total-h))]">
        <div className="relative">
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Icon
            icon="solar:magnifer-bold"
            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
        </div>

        {!debouncedValue && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Transaction</h2>
              <Select
                value={timeFrame}
                onValueChange={(value) => {
                  navigate({
                    to: "/transaction",
                    search: (prev) => ({
                      query: prev.query,
                      time_frame: value as BaseModel.TimeFrameEnum,
                    }),
                    replace: true,
                  });
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {overview.isLoading ? (
              <TransactionOverviewSkeleton />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                <StatsCard
                  title="Top Up"
                  amount={totalTopUp.toFixed(2)}
                  icon="solar:arrow-up-bold-duotone"
                  trend="up"
                />
                <StatsCard
                  title="Spent"
                  amount={-totalSpent.toFixed(2)}
                  icon="solar:arrow-down-bold-duotone"
                  trend="down"
                />
              </div>
            )}
          </section>
        )}

        <InfiniteScroll
          isLoading={infinite.isFetchingNextPage}
          hasMore={hasMore}
          next={next}
          rootMargin="200px"
        >
          <section className="flex flex-col gap-6">
            {infinite.isLoading ? (
              <TransactionListSkeleton />
            ) : groupedTransactions.length > 0 ? (
              <div className="flex flex-col gap-6">
                {groupedTransactions.map((dailyGroup) => (
                  <DailyGroup
                    key={dailyGroup.day}
                    day={dailyGroup.day}
                    date={dailyGroup.date}
                    label={dailyGroup.label}
                    total={dailyGroup.total}
                    transactions={dailyGroup.transactions}
                    onTransactionClick={(t) => {
                      setSelectedTransaction(t);
                      setOpen(true);
                    }}
                  />
                ))}
                {infinite.isFetchingNextPage && (
                  <div className="flex w-full justify-center">
                    <Spinner />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card/50 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12">
                <Icon
                  icon="solar:inbox-bold"
                  className="text-muted-foreground size-8"
                />
                <p className="text-muted-foreground text-sm">
                  No transactions found
                </p>
              </div>
            )}
          </section>
        </InfiniteScroll>
      </div>

      <Suspense
        fallback={
          open ? (
            <DialogContent>
              <div className="flex min-h-48 items-center justify-center">
                <Spinner className="size-5" />
              </div>
            </DialogContent>
          ) : null
        }
      >
        <UpdateTransactionDialog
          key={selectedTransaction?.id ?? "empty"}
          open={open}
          onOpenChange={setOpen}
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      </Suspense>
    </>
  );
}

function TransactionOverviewSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="bg-card flex min-w-0 flex-col gap-4 rounded-xl border px-4 py-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="size-8 rounded-md" />
          </div>
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>
  );
}

function TransactionListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 2 }).map((_, groupIndex) => (
        <div key={groupIndex} className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, itemIndex) => (
              <div
                key={itemIndex}
                className="bg-card flex items-center gap-3 rounded-lg border p-3"
              >
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 max-w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-18 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
