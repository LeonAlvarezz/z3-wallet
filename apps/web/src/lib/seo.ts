import type {
  DetailedHTMLProps,
  LinkHTMLAttributes,
  MetaHTMLAttributes,
} from "react";

export const SITE_NAME = "My Wallet";
export const SITE_DESCRIPTION =
  "Track spending, monitor cash flow, and manage your personal finances with My Wallet.";

type HeadLink = DetailedHTMLProps<
  LinkHTMLAttributes<HTMLLinkElement>,
  HTMLLinkElement
>;
type HeadMeta = DetailedHTMLProps<
  MetaHTMLAttributes<HTMLMetaElement>,
  HTMLMetaElement
>;

interface BuildSeoOptions {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

function normalizePath(path: string): string {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function getSiteOrigin(): string | undefined {
  const configuredOrigin = import.meta.env.VITE_SITE_URL?.trim();

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return undefined;
}

export function buildCanonicalUrl(path: string): string {
  const normalizedPath = normalizePath(path);
  const origin = getSiteOrigin();

  if (!origin) {
    return normalizedPath;
  }

  return new URL(normalizedPath, `${origin}/`).toString();
}

export function buildSeo({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  noIndex = false,
}: BuildSeoOptions): {
  meta: Array<HeadMeta>;
  links: Array<HeadLink>;
} {
  const canonicalUrl = buildCanonicalUrl(path);
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const meta: Array<HeadMeta> = [
    { title: fullTitle } as HeadMeta,
    { name: "application-name", content: SITE_NAME },
    { name: "description", content: description },
    {
      name: "robots",
      content: noIndex ? "noindex, nofollow" : "index, follow",
    },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonicalUrl },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
  ];
  const links: Array<HeadLink> = [{ rel: "canonical", href: canonicalUrl }];

  return {
    meta,
    links,
  };
}
