const API_PREFIX = "/api";

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith(API_PREFIX)) {
      if (!env.API_BASE_URL) {
        return new Response("Missing API_BASE_URL worker variable", {
          status: 500,
        });
      }

      const targetUrl = buildApiUrl(request.url, env.API_BASE_URL);
      return fetch(new Request(targetUrl, request));
    }

    return env.ASSETS.fetch(request);
  },
};
