interface CreateMetadataOptions {
    title: string;
    description: string;
    url: string;
    /** Site name shown in og:site_name */
    siteName?: string;
    /** Absolute URL to OG image */
    image?: string;
    /** "website" | "article" — default: "website" */
    type?: "website" | "article";
    /** Article-specific fields */
    article?: {
        publishedTime?: string;
        modifiedTime?: string;
        authors?: string[];
        tags?: string[];
    };
    /** Canonical URL override (defaults to url) */
    canonical?: string;
    /** Prevent indexing */
    noIndex?: boolean;
    /** Twitter card type — default: "summary_large_image" */
    twitterCard?: "summary" | "summary_large_image";
    /** Twitter handle e.g. "@m1kapp" */
    twitterSite?: string;
    keywords?: string[];
}
/**
 * Generates a Next.js-compatible Metadata object with full SEO coverage.
 *
 * @example
 * // app/layout.tsx
 * export const metadata = createMetadata({
 *   title: "My App",
 *   description: "앱 설명",
 *   url: "https://myapp.com",
 *   siteName: "My App",
 *   image: "https://myapp.com/og.png",
 * });
 */
declare function createMetadata({ title, description, url, siteName, image, type, article, canonical, noIndex, twitterCard, twitterSite, keywords, }: CreateMetadataOptions): {
    metadataBase: URL;
    alternates: {
        canonical: string;
    };
    robots: {
        index: boolean;
        follow: boolean;
        googleBot?: undefined;
    } | {
        index: boolean;
        follow: boolean;
        googleBot: {
            index: boolean;
            follow: boolean;
        };
    };
    openGraph: {
        publishedTime?: string | undefined;
        modifiedTime?: string | undefined;
        authors?: string[] | undefined;
        tags?: string[] | undefined;
        images?: {
            url: string;
            width: number;
            height: number;
        }[] | undefined;
        type: "website" | "article";
        siteName?: string | undefined;
        title: string;
        description: string;
        url: string;
    };
    twitter: {
        site?: string | undefined;
        images?: string[] | undefined;
        card: "summary" | "summary_large_image";
        title: string;
        description: string;
    };
    keywords?: string[] | undefined;
    title: string;
    description: string;
};
/**
 * Generates a title template for use with Next.js metadata.
 *
 * @example
 * export const metadata = { title: titleTemplate("My App") };
 * // child pages: export const metadata = { title: "Page Name" };
 * // renders as: "Page Name | My App"
 */
declare function titleTemplate(siteName: string, separator?: string): {
    default: string;
    template: string;
};

/**
 * JSON-LD structured data helpers.
 * Use with Next.js script tag:
 *
 * @example
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: jsonLd.website({ name: "My App", url: "https://myapp.com" }) }}
 * />
 */
declare const jsonLd: {
    /** WebSite — site name + sitelinks searchbox */
    website({ name, url, description, searchUrl, }: {
        name: string;
        url: string;
        description?: string;
        /** URL template for sitelinks searchbox e.g. "https://myapp.com/search?q={search_term_string}" */
        searchUrl?: string;
    }): string;
    /** Article / BlogPosting */
    article({ title, description, url, image, datePublished, dateModified, authorName, authorUrl, publisherName, publisherLogo, }: {
        title: string;
        description?: string;
        url: string;
        image?: string;
        datePublished: string;
        dateModified?: string;
        authorName: string;
        authorUrl?: string;
        publisherName: string;
        publisherLogo?: string;
    }): string;
    /** BreadcrumbList */
    breadcrumb(items: {
        name: string;
        url: string;
    }[]): string;
    /** Product */
    product({ name, description, image, url, price, currency, availability, ratingValue, reviewCount, }: {
        name: string;
        description?: string;
        image?: string;
        url: string;
        price: number;
        currency?: string;
        availability?: "InStock" | "OutOfStock" | "PreOrder";
        ratingValue?: number;
        reviewCount?: number;
    }): string;
    /** Organization */
    organization({ name, url, logo, sameAs, }: {
        name: string;
        url: string;
        logo?: string;
        /** Social profile URLs */
        sameAs?: string[];
    }): string;
    /** FAQPage */
    faq(items: {
        question: string;
        answer: string;
    }[]): string;
};

type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
interface SitemapEntry {
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
declare function createSitemap(entries: SitemapEntry[]): string;
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
declare function nextSitemap(baseUrl: string, pages: {
    path: string;
    lastModified?: string | Date;
    changeFrequency?: ChangeFreq;
    priority?: number;
}[]): {
    lastModified?: string | Date;
    changeFrequency?: ChangeFreq;
    priority?: number;
    url: string;
}[];

interface RobotsOptions {
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
declare function createRobots({ allow, disallow, sitemap, agents, }?: RobotsOptions): string;
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
declare function nextRobots({ allow, disallow, sitemap, }: {
    allow?: string[];
    disallow?: string[];
    sitemap?: string | string[];
}): {
    sitemap?: string | string[] | undefined;
    rules: {
        userAgent: string;
        allow: string[];
        disallow: string[];
    };
};

export { type ChangeFreq, type CreateMetadataOptions, type RobotsOptions, type SitemapEntry, createMetadata, createRobots, createSitemap, jsonLd, nextRobots, nextSitemap, titleTemplate };
