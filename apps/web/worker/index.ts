const API_PREFIX = "/api";
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join("; ");

interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  API_BASE_URL?: string;
  ASSETS: AssetsBinding;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function buildApiUrl(requestUrl: string, apiBaseUrl: string): URL {
  const url = new URL(requestUrl);
  const normalizedPath = url.pathname.replace(/^\/api/, "") || "/";
  return new URL(
    `${normalizedPath.replace(/^\//, "")}${url.search}`,
    ensureTrailingSlash(apiBaseUrl)
  );
}

function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  const contentType = headers.get("content-type") ?? "";

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (contentType.includes("text/html")) {
    headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
    headers.set("X-Frame-Options", "DENY");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith(API_PREFIX)) {
      if (!env.API_BASE_URL) {
        return applySecurityHeaders(
          new Response("Missing API_BASE_URL worker variable", {
            status: 500,
          })
        );
      }

      const targetUrl = buildApiUrl(request.url, env.API_BASE_URL);
      const response = await fetch(new Request(targetUrl, request));
      return applySecurityHeaders(response);
    }

    const response = await env.ASSETS.fetch(request);
    return applySecurityHeaders(response);
  },
};
