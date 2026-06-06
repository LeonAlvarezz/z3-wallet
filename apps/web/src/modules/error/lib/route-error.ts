import { isNotFound } from "@tanstack/react-router";

type RouteErrorLike = {
  cause?: unknown;
  code?: string;
  error?: unknown;
  message?: string;
  status?: number;
  statusCode?: number;
};

export type RouteErrorVariant = "error" | "forbidden" | "not-found";

function asErrorLike(error: unknown): RouteErrorLike | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  return error as RouteErrorLike;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function extractErrorFields(error: unknown): {
  code?: string;
  message?: string;
  status?: number;
} {
  const current = asErrorLike(error);
  const nestedError = asErrorLike(current?.error);
  const cause = asErrorLike(current?.cause);

  return {
    status:
      readNumber(current?.status) ??
      readNumber(current?.statusCode) ??
      readNumber(nestedError?.status) ??
      readNumber(nestedError?.statusCode) ??
      readNumber(cause?.status) ??
      readNumber(cause?.statusCode),
    code:
      readString(current?.code) ??
      readString(nestedError?.code) ??
      readString(cause?.code),
    message:
      readString(current?.message) ??
      readString(nestedError?.message) ??
      readString(cause?.message),
  };
}

export function parseRouteError(error: unknown): {
  code?: string;
  message?: string;
  status?: number;
  variant: RouteErrorVariant;
} {
  if (isNotFound(error)) {
    return {
      status: 404,
      message: "Not Found",
      variant: "not-found",
    };
  }

  const { status, code, message } = extractErrorFields(error);

  if (status === 404 || code === "NOT_FOUND" || code === "ENDPOINT_NOT_FOUND") {
    return { status: 404, code, message, variant: "not-found" };
  }

  if (status === 403 || code === "FORBIDDEN") {
    return { status: 403, code, message, variant: "forbidden" };
  }

  return { status, code, message, variant: "error" };
}
