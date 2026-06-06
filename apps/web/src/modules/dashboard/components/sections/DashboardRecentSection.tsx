import { Skeleton } from "@/components/ui/skeleton";
import Empty from "@/components/empty/Empty";
import { TransactionCard } from "@/modules/transaction/components/transaction-card";
import { useGetRecentTransactions } from "../../hooks/use-get-recent-transactions";
import { Link } from "@tanstack/react-router";

export default function DashboardRecentSection() {
  const { data: recentTransactionResult, isLoading: isRecentLoading } =
    useGetRecentTransactions();
  const recentTransactions = recentTransactionResult?.data ?? [];

  return (
    <section className="space-y-4">
      <div className="flex justify-between">
        <h1 className="font-bold">Recent</h1>
        <Link
          to="/transaction"
          search={{ query: undefined, time_frame: undefined }}
          className="text-primary text-sm"
          preload={false}
        >
          See all
        </Link>
      </div>
      {isRecentLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : recentTransactions.length === 0 ? (
        <Empty
          title="No recent transactions"
          description="Your latest transactions will appear here"
        />
      ) : (
        <div className="space-y-2">
          {recentTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </section>
  );
}
