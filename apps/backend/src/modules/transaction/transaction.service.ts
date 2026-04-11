import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@z3-wallet/exception";
import { TransactionRepository } from "./transaction.repository";
import { TransactionModel } from "@z3-wallet/types";
import { processCursorResult } from "@/util/cursor-pagination";
import { CategoryRepository } from "../category/category.repository";
import { WalletRepository } from "../wallet/wallet.repository";

export class TransactionService {
  static async cPaginate(
    query: TransactionModel.TransactionFilterDto,
    user_id: number,
  ) {
    const data = await TransactionRepository.cPaginate(query, user_id);
    const dates = Array.from(
      new Set(data.map((row) => row.created_at.split("T")[0])),
    );
    const extra =
      dates.length > 0
        ? await TransactionRepository.findDailyNetTotalsByDates(
            dates,
            user_id,
            query.query,
          )
        : [];
    return processCursorResult(data, query.page_size, extra);
  }

  static async findAll() {
    return await TransactionRepository.findMany();
  }

  static async findById(id: number) {
    const data = await TransactionRepository.findById(id);
    if (!data) throw new NotFoundException();
    return data;
  }

  static async findByIdForUser(id: number, user_id: number) {
    const transaction = await TransactionRepository.findById(id);
    if (!transaction) throw new NotFoundException();

    const wallet = await WalletRepository.findByUserId(user_id);
    if (!wallet || transaction.wallet_id !== wallet.id) {
      throw new NotFoundException();
    }

    return transaction;
  }

  static async findByUserId(user_id: number) {
    return await TransactionRepository.getTransactionsByUserId(user_id);
  }

  static findCashflowTotalsByUserId(
    query: TransactionModel.TransactionBaseQuery,
    user_id: number,
  ) {
    return TransactionRepository.findCashflowTotalsByUserId(query, user_id);
  }

  static getBalanceSummaryByUserId(user_id: number) {
    return TransactionRepository.getBalanceSummaryByUserId(user_id);
  }

  //Statistic
  static findStatistic(
    query: TransactionModel.StatisticFilterDto,
    user_id: number,
  ) {
    return TransactionRepository.findStatistic(query, user_id);
  }

  static getTotalAmountByCategory(
    query: TransactionModel.StatisticFilterDto,
    user_id: number,
  ) {
    return TransactionRepository.getTotalAmountByCategory(query, user_id);
  }

  static async create(
    payload: TransactionModel.CreateTransactionDto,
    user_id: number,
  ) {
    switch (payload.type) {
      case TransactionModel.TransactionTypeEnum.TOP_UP: {
        const wallet = await WalletRepository.findByUserId(user_id);
        if (!wallet) {
          throw new NotFoundException({ message: "Wallet not found" });
        }
        return TransactionRepository.create(payload, wallet.id);
      }
      default: {
        if (!payload.category_id) {
          throw new BadRequestException({ message: "Invalid category_id" });
        }
        const category = await CategoryRepository.findById(payload.category_id);
        if (!category) {
          throw new BadRequestException({ message: "Invalid category_id" });
        }
        const wallet = await WalletRepository.findByUserId(user_id);
        if (!wallet) {
          throw new NotFoundException({ message: "Wallet not found" });
        }
        return TransactionRepository.create(payload, wallet.id);
      }
    }
  }

  static async update(
    id: number,
    user_id: number,
    payload: TransactionModel.UpdateTransactionDto,
  ) {
    const transaction = await TransactionRepository.findById(id);
    if (!transaction) throw new NotFoundException();
    const wallet = await WalletRepository.findByUserId(user_id);
    if (!wallet) throw new NotFoundException({ message: "Wallet not found" });
    if (transaction.wallet_id !== wallet.id) {
      throw new ForbiddenException({
        message: "You can no permission to edit this transaction",
      });
    }

    return TransactionRepository.update(id, payload);
  }

  static async delete(id: number, user_id: number) {
    const transaction = await TransactionRepository.findById(id);
    if (!transaction) throw new NotFoundException();
    const wallet = await WalletRepository.findByUserId(user_id);
    if (!wallet) throw new NotFoundException({ message: "Wallet not found" });
    if (transaction.wallet_id !== wallet.id) {
      throw new ForbiddenException({
        message: "You can no permission to delete this transaction",
      });
    }
    return TransactionRepository.delete(id);
  }
}
