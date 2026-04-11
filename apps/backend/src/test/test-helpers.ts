import app from "@/app";
import {
  BaseModel,
  CategoryRuleModel,
  TransactionModel,
} from "@z3-wallet/types";
import { afterEach, expect } from "bun:test";

const trackedSessionCookies = new Set<string>();

function parseSessionCookie(response: Response) {
  const cookieHeader = response.headers.get("set-cookie");
  return cookieHeader ? cookieHeader.split(";")[0] : "";
}

function trackSessionCookie(sessionCookie: string) {
  if (!sessionCookie) return;
  trackedSessionCookies.add(sessionCookie);
}

function untrackSessionCookie(sessionCookie: string) {
  if (!sessionCookie) return;
  trackedSessionCookies.delete(sessionCookie);
}

async function signOutSilently(sessionCookie: string) {
  if (!sessionCookie) return;
  try {
    await app.handle(
      new Request("http://localhost/v1/auth/sign-out", {
        method: "POST",
        headers: {
          Cookie: sessionCookie,
          "Content-Type": "application/json",
        },
      }),
    );
  } finally {
    untrackSessionCookie(sessionCookie);
  }
}

afterEach(async () => {
  if (trackedSessionCookies.size === 0) return;

  const cookies = Array.from(trackedSessionCookies);
  for (const sessionCookie of cookies) {
    await signOutSilently(sessionCookie);
  }
});

export const authHelpers = {
  async signUp(email: string, username: string, password: string) {
    const response = await app.handle(
      new Request("http://localhost/v1/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      }),
    );
    return response;
  },

  async signIn(email: string, password: string) {
    const response = await app.handle(
      new Request("http://localhost/v1/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }),
    );

    const sessionCookie = parseSessionCookie(response);
    trackSessionCookie(sessionCookie);
    return response;
  },

  async signOut(sessionCookie: string) {
    const response = await app.handle(
      new Request("http://localhost/v1/auth/sign-out", {
        method: "POST",
        headers: {
          Cookie: sessionCookie,
          "Content-Type": "application/json",
        },
      }),
    );

    untrackSessionCookie(sessionCookie);
    return response;
  },

  extractCookie(response: Response) {
    const sessionCookie = parseSessionCookie(response);
    trackSessionCookie(sessionCookie);
    return sessionCookie;
  },

  getMe(sessionCookie: string) {
    return app.handle(
      new Request("http://localhost/v1/auth/me", {
        headers: { Cookie: sessionCookie },
      }),
    );
  },
};

export const userHelpers = {
  async getUsers(sessionCookie: string) {
    return await app.handle(
      new Request("http://localhost/v1/users/", {
        headers: { Cookie: sessionCookie },
      }),
    );
  },
};

export const categoryHelpers = {
  getCategories() {
    return app.handle(new Request("http://localhost/v1/categories"));
  },

  getCategoryById(id: number) {
    return app.handle(new Request(`http://localhost/v1/categories/${id}`));
  },
};

function buildTransactionListUrl(query?: {
  cursor?: string | null;
  page_size?: number;
  query?: string;
  time_frame?: BaseModel.TimeFrameEnum;
}) {
  const params = new URLSearchParams();

  if (query?.cursor) params.set("cursor", query.cursor);
  if (query?.page_size !== undefined) {
    params.set("page_size", String(query.page_size));
  }
  if (query?.query) params.set("query", query.query);
  if (query?.time_frame) params.set("time_frame", query.time_frame);

  const qs = params.toString();
  return `http://localhost/v1/transactions${qs ? `?${qs}` : ""}`;
}

export const transactionHelpers = {
  getTransactions(
    sessionCookie: string,
    query?: {
      cursor?: string | null;
      page_size?: number;
      query?: string;
      time_frame?: BaseModel.TimeFrameEnum;
    },
  ) {
    return app.handle(
      new Request(buildTransactionListUrl(query), {
        headers: { Cookie: sessionCookie },
      }),
    );
  },

  createTransaction(
    sessionCookie: string,
    payload: TransactionModel.CreateTransactionDto,
  ) {
    return app.handle(
      new Request("http://localhost/v1/transactions", {
        method: "POST",
        headers: {
          Cookie: sessionCookie,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }),
    );
  },

  updateTransaction(
    id: number,
    sessionCookie: string,
    payload: TransactionModel.UpdateTransactionDto,
  ) {
    return app.handle(
      new Request(`http://localhost/v1/transactions/${id}`, {
        method: "PUT",
        headers: {
          Cookie: sessionCookie,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }),
    );
  },

  deleteTransaction(id: number, sessionCookie: string) {
    return app.handle(
      new Request(`http://localhost/v1/transactions/${id}`, {
        method: "DELETE",
        headers: { Cookie: sessionCookie },
      }),
    );
  },
};

export const categoryRuleHelpers = {
  getRules(sessionCookie: string) {
    return app.handle(
      new Request("http://localhost/v1/category-rules", {
        headers: { Cookie: sessionCookie },
      }),
    );
  },

  getRulesByCategoryId(categoryId: number, sessionCookie: string) {
    return app.handle(
      new Request(`http://localhost/v1/category-rules/category/${categoryId}`, {
        headers: { Cookie: sessionCookie },
      }),
    );
  },

  getRuleCount(sessionCookie: string) {
    return app.handle(
      new Request("http://localhost/v1/category-rules/count", {
        headers: { Cookie: sessionCookie },
      }),
    );
  },

  createRule(
    sessionCookie: string,
    payload: CategoryRuleModel.CreateCategoryRuleDto,
  ) {
    return app.handle(
      new Request("http://localhost/v1/category-rules", {
        method: "POST",
        headers: {
          Cookie: sessionCookie,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }),
    );
  },

  updateRule(
    id: number,
    sessionCookie: string,
    payload: CategoryRuleModel.UpdateCategoryRuleDto,
  ) {
    return app.handle(
      new Request(`http://localhost/v1/category-rules/${id}`, {
        method: "PUT",
        headers: {
          Cookie: sessionCookie,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }),
    );
  },

  deleteRule(id: number, sessionCookie: string) {
    return app.handle(
      new Request(`http://localhost/v1/category-rules/${id}`, {
        method: "DELETE",
        headers: { Cookie: sessionCookie },
      }),
    );
  },
};

export const walletHelpers = {
  getWallet(sessionCookie: string) {
    return app.handle(
      new Request("http://localhost/v1/wallets", {
        headers: { Cookie: sessionCookie },
      }),
    );
  },

  getAccountBalance(sessionCookie: string) {
    return app.handle(
      new Request("http://localhost/v1/wallets/account-balance", {
        headers: { Cookie: sessionCookie },
      }),
    );
  },
};

export async function signInDefaultUser() {
  const signInResponse = await authHelpers.signIn(
    "test@example.com",
    "Password123!",
  );
  expect(signInResponse.status).toBe(200);
  return authHelpers.extractCookie(signInResponse);
}

export async function signUpAndSignInNewUser() {
  const nonce = crypto.randomUUID().slice(0, 8);
  const email = `tx-user-${nonce}@example.com`;
  const username = `tx-user-${nonce}`;
  const password = "Password123!";

  const signUpResponse = await authHelpers.signUp(email, username, password);
  expect(signUpResponse.status).toBe(200);

  const signInResponse = await authHelpers.signIn(email, password);
  expect(signInResponse.status).toBe(200);

  return authHelpers.extractCookie(signInResponse);
}
