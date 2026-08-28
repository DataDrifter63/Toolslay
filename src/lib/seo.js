import { SITE } from "./constants";

/**
 * Build a Next.js Metadata object for a page.
 * Usage: export const metadata = buildMetadata({ title, description, path })
 */
export function buildMetadata({ title, description, path = "/", noIndex = false }) {
  const fullTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
  const url = `${SITE.url}${path}`;

  return {
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
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: description || SITE.description,
      site: SITE.twitter,
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
