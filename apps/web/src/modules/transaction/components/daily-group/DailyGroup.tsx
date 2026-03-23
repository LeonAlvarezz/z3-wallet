import { TransactionModel } from "@z3-wallet/types";
import type { DailyGroupData } from "@/utils/transaction";
import { TransactionCard } from "../transaction-card";
import { AmountDisplay } from "@/components/amount/AmountDisplay";

interface DailyGroupProps extends DailyGroupData {
  onTransactionClick?: (
    transaction: TransactionModel.TransactionWithCategoryDto,
  ) => void;
}

export default function DailyGroup({
  date,
  label,
  total,
  transactions,
  onTransactionClick,
}: DailyGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Date Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-muted-foreground text-xs">{date}</p>
        </div>
        <AmountDisplay
          value={total}
          colorize={false}
          showSign={false}
          className="font-semibold"
        />
      </div>

      {/* Transactions */}
      <div className="flex flex-col gap-2">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onClick={() => onTransactionClick?.(transaction)}
          />
        ))}
      </div>
    </div>
  );
}
