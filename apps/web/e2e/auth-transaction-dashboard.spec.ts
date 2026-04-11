import { expect, test, type APIRequestContext } from "@playwright/test";

const API_BASE_URL =
  process.env.E2E_API_BASE_URL ??
  `http://127.0.0.1:${process.env.E2E_API_PORT ?? 4000}/v1`;
const TEST_PASSWORD = "E2E-password-123";

type E2EUser = {
  email: string;
  password: string;
  username: string;
};

function createE2EUser(): E2EUser {
  const randomId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    email: `e2e-${randomId}@example.com`,
    password: TEST_PASSWORD,
    username: `e2e-${randomId}`,
  };
}

async function signUpUser(request: APIRequestContext, user: E2EUser) {
  const response = await request.post(`${API_BASE_URL}/auth/sign-up`, {
    data: user,
  });

  if (response.ok()) return;

  const body = await response.text();
  throw new Error(
    `Failed to create e2e user (status ${response.status()}): ${body}`,
  );
}

test("sign in, add transaction, dashboard updates, and sign out", async ({
  page,
  request,
}) => {
  const user = createE2EUser();
  const transactionNote = `E2E top up ${Date.now()}`;

  await signUpUser(request, user);

  await page.goto("/auth/login");
  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill(user.password);
  await page.getByRole("button", { name: /^Sign In$/ }).click();
  await expect(page).toHaveURL(/\/dashboard\/?$/);

  await page.goto("/transaction/add");
  const smartInput = page.locator("#smart-input input");
  await smartInput.fill(`+11.25 ${transactionNote}`);
  await smartInput.press("Enter");
  await expect(page.getByLabel("Note")).toHaveValue(transactionNote);
  await page.getByRole("button", { name: "Yesterday" }).click();
  await page.getByRole("button", { name: /^Save$/ }).click();
  await expect(page.getByText("Transaction added")).toBeVisible();

  await page.goto("/transaction?time_frame=yesterday");
  await expect(page.getByText(transactionNote)).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Recent" })).toBeVisible();
  await expect(page.getByText(transactionNote)).toBeVisible();

  await page.goto("/profile");
  await page.getByRole("button", { name: /Sign out/i }).click();
  await expect(page).toHaveURL(/\/auth\/login(?:\?.*)?$/);
  await expect(page.getByRole("button", { name: /^Sign In$/ })).toBeVisible();
});
