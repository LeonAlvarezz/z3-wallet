import { WalletModel } from "@z3-wallet/types";
import { WalletRepository } from "./wallet.repository";
import { TransactionRepository } from "../transaction/transaction.repository";

export class WalletService {
  static async findByUserId(user_id: number) {
    const result = await WalletRepository.findByUserId(user_id);
    return WalletModel.WalletPublicSchema.parse(result);
  }

  static async findUserAccountBalance(user_id: number) {
    const summary = await TransactionRepository.getBalanceSummaryByUserId(
      user_id,
    );

    return WalletModel.AccountBalanceSchema.parse({
      balance: summary.top_up ?? 0,
      expenses: summary.expense ?? 0,
      remaining: summary.total_remaining_balance ?? 0,
    });
  }
}
