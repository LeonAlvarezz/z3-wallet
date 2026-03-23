import Elysia from "elysia";
import { authGuard } from "../auth/guard";
import { OpenApiKey } from "../app/openapi";
import { SuccessSchema, WalletModel } from "@z3-wallet/types";
import { WalletService } from "./wallet.service";
import { Success } from "@/core/response";

export const wallet = new Elysia().use(authGuard).group("/wallets", (app) => {
  app.get(
    "/",
    async ({ user }) => {
      const data = await WalletService.findByUserId(user.id);
      return Success(data);
    },
    {
      authenticated: true,
      detail: {
        summary: "Get user wallet",
        tags: [OpenApiKey.Wallet],
      },
      response: SuccessSchema(WalletModel.WalletPublicSchema),
    },
  );

  app.get(
    "/account-balance",
    async ({ user }) => {
      const data = await WalletService.findUserAccountBalance(user.id);
      return Success(data);
    },
    {
      authenticated: true,
      detail: {
        summary: "Get user account balance",
        tags: [OpenApiKey.Wallet],
      },
      response: SuccessSchema(WalletModel.AccountBalanceSchema),
    },
  );
  return app;
});
