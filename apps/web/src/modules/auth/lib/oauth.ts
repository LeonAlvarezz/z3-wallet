import { AuthModel } from "@z3-wallet/types/auth";

function safeRedirectTarget(raw: null | string) {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("/auth/")) return null;
  return raw;
}

function buildApiUrl(path: string) {
  const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();
  const baseUrl = configuredBaseUrl?.length ? configuredBaseUrl : "/api";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, "")}${normalizedPath}`;
}

export function buildOAuthStartUrl({
  provider,
  source,
  searchStr,
}: {
  provider: AuthModel.OAuthProvider;
  source: AuthModel.OAuthSourceDto;
  searchStr?: string;
}) {
  const searchParams = new URLSearchParams(searchStr);
  const redirect = safeRedirectTarget(searchParams.get("redirect"));

  const params = new URLSearchParams();
  params.set("source", source);
  if (redirect) {
    params.set("redirect", redirect);
  }
  return buildApiUrl(`/auth/${provider}/start?${params.toString()}`);
}

const OAUTH_ERROR_MESSAGES: Record<AuthModel.OAuthErrorDto, string> = {
  cancelled: "Sign-in was cancelled. Please try again.",
  expired: "Sign-in session expired. Please start again.",
  no_verified_email:
    "Your provider account needs a verified email before you can sign in.",
  failed: "Sign-in failed. Please try again.",
};

export function getOAuthErrorMessage(searchStr?: string) {
  const searchParams = new URLSearchParams(searchStr);
  const parsed = AuthModel.OAuthErrorSchema.safeParse(
    searchParams.get("oauth_error"),
  );

  if (!parsed.success) return null;
  return OAUTH_ERROR_MESSAGES[parsed.data];
}
