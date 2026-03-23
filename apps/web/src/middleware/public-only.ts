import { api } from "@/api";
import { queryKey } from "@/api/keys";
import type { RouterContext } from "@/router-context";
import { redirect } from "@tanstack/react-router";

function safeRedirectTarget(raw: null | string) {
  if (!raw) return null;
  // Only allow internal redirects
  if (!raw.startsWith("/")) return null;
  // Avoid redirecting back into auth pages
  if (raw.startsWith("/auth/")) return null;
  return raw;
}

export async function publicOnly({
  context,
  location,
}: {
  context: RouterContext;
  location: { searchStr?: string };
}) {
  try {
    await context.queryClient.ensureQueryData({
      queryKey: queryKey.auth.me,
      queryFn: () => api.auth.getMe(),
      retry: false,
      staleTime: 0,
    });

    const redirectParam = new URLSearchParams(location.searchStr).get(
      "redirect",
    );

    throw redirect({
      to: safeRedirectTarget(redirectParam) || "/dashboard",
    });
  } catch (error: unknown) {
    const maybeApiError = error as { status?: number };
    if (maybeApiError?.status === 401) {
      return;
    }
    throw error;
  }
}
