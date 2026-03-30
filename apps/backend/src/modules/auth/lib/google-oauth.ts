import env from "@/lib/env";
import { AuthModel } from "@z3-wallet/types";
export type GoogleAuthResponse = {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
};

function getGoogleHeader(token: string) {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "z3-wallet-oauth",
  };
}

export const buildGoogleAuthorizeUrl = ({
  state,
}: {
  state: string;
}): string => {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  return url.toString();
};

export async function exchangeGoogleAccessToken(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "z3-wallet-oauth",
    },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: env.GOOGLE_REDIRECT_URI,
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as AuthModel.OAuthTokenResponseDto;
  if (!data.access_token) return null;
  return data.access_token;
}

export async function getGoogleUser(token: string) {
  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: getGoogleHeader(token),
    },
  );
  if (!response.ok) return null;
  return (await response.json()) as GoogleAuthResponse;
}
