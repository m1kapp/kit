export type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: ChangeFreq;
  /** 0.0 ~ 1.0 */
  priority?: number;
}

/**
 * Generates a sitemap.xml string.
 *
 * @example
 * // app/sitemap.xml/route.ts  (Next.js Route Handler)
 * export function GET() {
 *   const xml = createSitemap([
 *     { url: "https://myapp.com", priority: 1.0 },
 *     { url: "https://myapp.com/about", changeFrequency: "monthly" },
 *   ]);
 *   return new Response(xml, { headers: { "Content-Type": "application/xml" } });
 * }
 */
export function createSitemap(entries: SitemapEntry[]): string {
  const urls = entries.map(({ url, lastModified, changeFrequency, priority }) => {
    const mod = lastModified
      ? typeof lastModified === "string"
        ? lastModified
        : lastModified.toISOString().split("T")[0]
      : null;

    return [
      "  <url>",
      `    <loc>${url}</loc>`,
      mod ? `    <lastmod>${mod}</lastmod>` : null,
      changeFrequency ? `    <changefreq>${changeFrequency}</changefreq>` : null,
      priority != null ? `    <priority>${priority.toFixed(1)}</priority>` : null,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
  ].join("\n");
}

/**
 * Next.js App Router 방식 — MetadataRoute.Sitemap 형태로 반환.
 *
 * @example
 * // app/sitemap.ts
 * export default function sitemap() {
 *   return nextSitemap("https://myapp.com", [
 *     { path: "/", priority: 1 },
 *     { path: "/about", changeFrequency: "monthly" },
 *   ]);
 * }
 */
export function nextSitemap(
  baseUrl: string,
  pages: {
    path: string;
    lastModified?: string | Date;
    changeFrequency?: ChangeFreq;
    priority?: number;
  }[]
) {
  return pages.map(({ path, ...rest }) => ({
    url: `${baseUrl.replace(/\/$/, "")}${path}`,
    ...rest,
  }));
}
