import { SITE } from "./constants";

/**
 * Build a Next.js Metadata object for a page.
 * Usage: export const metadata = buildMetadata({ title, description, path })
 */
export function buildMetadata({ title, description, path = "/", noIndex = false, image }) {
  const fullTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
  const url = `${SITE.url}${path}`;
  // Pages like blog posts can pass their own cover image (e.g. from Cloudinary)
  // so link previews on WhatsApp/Twitter/etc. show the actual post image instead
  // of the generic site-wide one.
  const ogImage = image || "/opengraph-image";

  return {
    metadataBase: new URL(SITE.url),
    title: fullTitle,
    description: description || SITE.description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description: description || SITE.description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: description || SITE.description,
      images: [ogImage],
    },
  };
}

/** JSON-LD for an individual tool page (SoftwareApplication schema). */
export function toolJsonLd(tool) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (runs in browser)",
    url: `${SITE.url}/tools/${tool.slug}`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/** JSON-LD breadcrumb list. */
export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  };
}

/** JSON-LD WebSite schema with a SearchAction — lets Google show a sitelinks
 *  search box directly in search results for brand-name searches. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: { "@id": `${SITE.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/tools?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** JSON-LD Organization schema — ties the brand to its social profiles
 *  (sameAs) so Google can connect them into one entity. Profile URLs live in
 *  SITE.social (constants.js). The logo is a square PNG (public/logo.png) as
 *  Google's logo guidelines ask — not the wide 1200x630 share image. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}/logo.png`,
      width: 512,
      height: 512,
    },
    sameAs: Object.values(SITE.social),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SITE.email,
      availableLanguage: "English",
    },
  };
}

/** JSON-LD ContactPage schema for /contact. */
export function contactPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${SITE.name}`,
    url: `${SITE.url}/contact`,
    mainEntity: { "@id": `${SITE.url}/#organization` },
  };
}

/** JSON-LD FAQPage schema — enables FAQ rich results in Google search. */
export function faqJsonLd(faqItems = []) {
  if (!faqItems || faqItems.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
