import { api } from "@/api";
import { queryKey } from "@/api/keys";
import type { RouterContext } from "@/router-context";
import { redirect } from "@tanstack/react-router";

function getRedirectTarget(location: { pathname: string; searchStr?: string }) {
  return `${location.pathname}${location.searchStr ?? ""}`;
}

export async function guard({
  context,
  location,
}: {
  context: RouterContext;
  location: { pathname: string; searchStr?: string };
}) {
  try {
    await context.queryClient.ensureQueryData({
      queryKey: queryKey.auth.me,
      queryFn: () => api.auth.getMe(),
      retry: false,
      staleTime: 60_000,
    });
  } catch (error: unknown) {
    const maybeApiError = error as { status?: number };
    if (maybeApiError?.status === 401) {
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: getRedirectTarget(location),
        },
      });
    }
    if (maybeApiError?.status === 403) {
      throw redirect({
        to: "/forbidden",
      });
    }
    throw error;
  }
}
