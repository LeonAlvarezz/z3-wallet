import type { Cookie } from "elysia";
import env from "@/lib/env";

const SESSION_COOKIE_PATH = "/";
const SESSION_COOKIE_SAME_SITE = "lax";

type SessionCookie = Cookie<string | undefined>;

function getMaxAgeSeconds(expiresAt: string) {
  const expiresAtTime = new Date(expiresAt).getTime();
  return Math.max(0, Math.floor((expiresAtTime - Date.now()) / 1000));
}

export function setSessionCookie(
  sessionCookie: SessionCookie,
  sessionToken: string,
  expiresAt: string,
) {
  sessionCookie.set({
    value: sessionToken,
    expires: new Date(expiresAt),
    maxAge: getMaxAgeSeconds(expiresAt),
    path: SESSION_COOKIE_PATH,
    httpOnly: true,
    sameSite: SESSION_COOKIE_SAME_SITE,
    secure: env.NODE_ENV === "production",
  });
}

export function clearSessionCookie(sessionCookie: SessionCookie) {
  sessionCookie.set({
    value: "",
    expires: new Date(0),
    maxAge: 0,
    path: SESSION_COOKIE_PATH,
    httpOnly: true,
    sameSite: SESSION_COOKIE_SAME_SITE,
    secure: env.NODE_ENV === "production",
  });
}
