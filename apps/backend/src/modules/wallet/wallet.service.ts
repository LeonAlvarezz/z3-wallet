import { BaseModel, WalletEventModel, WalletModel } from "@z3-wallet/types";
import { WalletRepository } from "./wallet.repository";
import { NotFoundException } from "@z3-wallet/exception";
import { TransactionRepository } from "../transaction/transaction.repository";

export class WalletService {
  static async findByUserId(user_id: number) {
    const result = await WalletRepository.findByUserId(user_id);
    return WalletModel.WalletPublicSchema.parse(result);
  }

  // static async findUserAccountBalance(user_id: number) {
  //   const result = await WalletRepository.findUserBalance(user_id);
  //   return WalletModel.AccountBalanceSchema.parse(result);
  // }
}
