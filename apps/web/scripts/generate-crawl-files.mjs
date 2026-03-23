import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

const PUBLIC_SITEMAP_ROUTES = ["/auth/login/", "/auth/register/"];
const PRIVATE_ROUTE_PREFIXES = ["/profile", "/settings", "/transaction"];

function getSiteOrigin() {
  const siteUrl = process.env.VITE_SITE_URL?.trim() || process.env.SITE_URL?.trim();

  if (!siteUrl) {
    return undefined;
  }

  return siteUrl.replace(/\/+$/, "");
}

function buildRobotsTxt(origin) {
  const lines = [
    "User-agent: *",
    "Allow: /auth/login/",
    "Allow: /auth/register/",
    "Disallow: /api/",
    ...PRIVATE_ROUTE_PREFIXES.map((prefix) => `Disallow: ${prefix}`),
  ];

  if (origin) {
    lines.push(`Sitemap: ${origin}/sitemap.xml`);
  }

  return `${lines.join("\n")}\n`;
}

function buildSitemapXml(origin) {
  const now = new Date().toISOString();
  const urls = origin
    ? PUBLIC_SITEMAP_ROUTES.map((routePath) => {
        return [
          "  <url>",
          `    <loc>${origin}${routePath}</loc>`,
          `    <lastmod>${now}</lastmod>`,
          "  </url>",
        ].join("\n");
      }).join("\n")
    : "";

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

async function main() {
  const origin = getSiteOrigin();

  await mkdir(distDir, { recursive: true });
  await writeFile(path.join(distDir, "robots.txt"), buildRobotsTxt(origin), "utf8");
  await writeFile(path.join(distDir, "sitemap.xml"), buildSitemapXml(origin), "utf8");
}

await main();
