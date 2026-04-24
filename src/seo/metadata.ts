export interface CreateMetadataOptions {
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
export function createMetadata({
  title,
  description,
  url,
  siteName,
  image,
  type = "website",
  article,
  canonical,
  noIndex = false,
  twitterCard = "summary_large_image",
  twitterSite,
  keywords,
}: CreateMetadataOptions) {
  const canonicalUrl = canonical ?? url;

  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    metadataBase: new URL(url),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title,
      description,
      url,
      ...(siteName ? { siteName } : {}),
      type,
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
      ...(type === "article" && article
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            authors: article.authors,
            tags: article.tags,
          }
        : {}),
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      ...(image ? { images: [image] } : {}),
      ...(twitterSite ? { site: twitterSite } : {}),
    },
  };
}

/**
 * Generates a title template for use with Next.js metadata.
 *
 * @example
 * export const metadata = { title: titleTemplate("My App") };
 * // child pages: export const metadata = { title: "Page Name" };
 * // renders as: "Page Name | My App"
 */
export function titleTemplate(siteName: string, separator = "|") {
  return {
    default: siteName,
    template: `%s ${separator} ${siteName}`,
  };
}
