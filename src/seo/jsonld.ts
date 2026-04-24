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

function serialize(data: object): string {
  return JSON.stringify(data);
}

export const jsonLd = {
  /** WebSite — site name + sitelinks searchbox */
  website({
    name,
    url,
    description,
    searchUrl,
  }: {
    name: string;
    url: string;
    description?: string;
    /** URL template for sitelinks searchbox e.g. "https://myapp.com/search?q={search_term_string}" */
    searchUrl?: string;
  }) {
    return serialize({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name,
      url,
      ...(description ? { description } : {}),
      ...(searchUrl
        ? {
            potentialAction: {
              "@type": "SearchAction",
              target: { "@type": "EntryPoint", urlTemplate: searchUrl },
              "query-input": "required name=search_term_string",
            },
          }
        : {}),
    });
  },

  /** Article / BlogPosting */
  article({
    title,
    description,
    url,
    image,
    datePublished,
    dateModified,
    authorName,
    authorUrl,
    publisherName,
    publisherLogo,
  }: {
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
  }) {
    return serialize({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      ...(description ? { description } : {}),
      url,
      ...(image ? { image } : {}),
      datePublished,
      dateModified: dateModified ?? datePublished,
      author: {
        "@type": "Person",
        name: authorName,
        ...(authorUrl ? { url: authorUrl } : {}),
      },
      publisher: {
        "@type": "Organization",
        name: publisherName,
        ...(publisherLogo
          ? { logo: { "@type": "ImageObject", url: publisherLogo } }
          : {}),
      },
    });
  },

  /** BreadcrumbList */
  breadcrumb(items: { name: string; url: string }[]) {
    return serialize({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    });
  },

  /** Product */
  product({
    name,
    description,
    image,
    url,
    price,
    currency = "KRW",
    availability = "InStock",
    ratingValue,
    reviewCount,
  }: {
    name: string;
    description?: string;
    image?: string;
    url: string;
    price: number;
    currency?: string;
    availability?: "InStock" | "OutOfStock" | "PreOrder";
    ratingValue?: number;
    reviewCount?: number;
  }) {
    return serialize({
      "@context": "https://schema.org",
      "@type": "Product",
      name,
      ...(description ? { description } : {}),
      ...(image ? { image } : {}),
      url,
      offers: {
        "@type": "Offer",
        price,
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`,
        url,
      },
      ...(ratingValue != null
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue,
              reviewCount: reviewCount ?? 1,
            },
          }
        : {}),
    });
  },

  /** Organization */
  organization({
    name,
    url,
    logo,
    sameAs,
  }: {
    name: string;
    url: string;
    logo?: string;
    /** Social profile URLs */
    sameAs?: string[];
  }) {
    return serialize({
      "@context": "https://schema.org",
      "@type": "Organization",
      name,
      url,
      ...(logo ? { logo } : {}),
      ...(sameAs?.length ? { sameAs } : {}),
    });
  },

  /** FAQPage */
  faq(items: { question: string; answer: string }[]) {
    return serialize({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  },
};
