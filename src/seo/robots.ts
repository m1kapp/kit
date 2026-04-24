export interface RobotsOptions {
  /** Default rules applied to all bots (User-agent: *) */
  allow?: string[];
  disallow?: string[];
  /** Absolute URL to sitemap */
  sitemap?: string | string[];
  /** Per-bot overrides */
  agents?: {
    userAgent: string;
    allow?: string[];
    disallow?: string[];
  }[];
}

/**
 * Generates a robots.txt string.
 *
 * @example
 * // app/robots.txt/route.ts
 * export function GET() {
 *   const txt = createRobots({
 *     disallow: ["/admin", "/api"],
 *     sitemap: "https://myapp.com/sitemap.xml",
 *   });
 *   return new Response(txt, { headers: { "Content-Type": "text/plain" } });
 * }
 */
export function createRobots({
  allow = ["/"],
  disallow = [],
  sitemap,
  agents = [],
}: RobotsOptions = {}): string {
  const lines: string[] = [];

  // Default user-agent block
  lines.push("User-agent: *");
  for (const path of allow) lines.push(`Allow: ${path}`);
  for (const path of disallow) lines.push(`Disallow: ${path}`);

  // Per-bot overrides
  for (const agent of agents) {
    lines.push("");
    lines.push(`User-agent: ${agent.userAgent}`);
    for (const path of agent.allow ?? []) lines.push(`Allow: ${path}`);
    for (const path of agent.disallow ?? []) lines.push(`Disallow: ${path}`);
  }

  // Sitemap
  const sitemaps = sitemap
    ? Array.isArray(sitemap)
      ? sitemap
      : [sitemap]
    : [];
  for (const s of sitemaps) {
    lines.push("");
    lines.push(`Sitemap: ${s}`);
  }

  return lines.join("\n");
}

/**
 * Next.js App Router 방식 — MetadataRoute.Robots 형태로 반환.
 *
 * @example
 * // app/robots.ts
 * export default function robots() {
 *   return nextRobots({
 *     sitemap: "https://myapp.com/sitemap.xml",
 *     disallow: ["/admin"],
 *   });
 * }
 */
export function nextRobots({
  allow = ["/"],
  disallow = [],
  sitemap,
}: {
  allow?: string[];
  disallow?: string[];
  sitemap?: string | string[];
}) {
  return {
    rules: { userAgent: "*", allow, disallow },
    ...(sitemap ? { sitemap } : {}),
  };
}
