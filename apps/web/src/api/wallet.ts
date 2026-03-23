import { requestClient } from "@/lib/request";
import type { WalletModel } from "@z3-wallet/types";

const key = "/wallets";

const wallet = {
  get: () => requestClient.get<WalletModel.WalletPublicDto>(`${key}`),
  getAccountBalance: () =>
    requestClient.get<WalletModel.AccountBalanceDto>(`${key}/account-balance`),
};

export default wallet;
