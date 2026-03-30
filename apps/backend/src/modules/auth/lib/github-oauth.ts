import env from "@/lib/env";
import { AuthModel } from "@z3-wallet/types";

type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
};

type GitHubEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
};

function getGitHubApiHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "z3-wallet-oauth",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export function buildGitHubAuthorizeUrl({ state }: { state: string }) {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.GITHUB_REDIRECT_URI);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeGitHubAccessToken(code: string) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "z3-wallet-oauth",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.GITHUB_REDIRECT_URI,
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as AuthModel.OAuthTokenResponseDto;
  if (!data.access_token) return null;
  return data.access_token;
}

export async function getGitHubUser(token: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: getGitHubApiHeaders(token),
  });

  if (!response.ok) return null;
  return (await response.json()) as GitHubUser;
}

export async function getGitHubVerifiedEmail(token: string) {
  const response = await fetch("https://api.github.com/user/emails", {
    headers: getGitHubApiHeaders(token),
  });

  if (!response.ok) return null;
  const emails = (await response.json()) as GitHubEmail[];
  const primaryVerifiedEmail = emails.find(
    (item) => item.primary && item.verified,
  );
  if (primaryVerifiedEmail) return primaryVerifiedEmail.email;

  const firstVerifiedEmail = emails.find((item) => item.verified);
  return firstVerifiedEmail?.email ?? null;
}
