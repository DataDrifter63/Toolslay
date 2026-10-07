import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Container from "@/components/layout/Container";
import Icon from "@/components/ui/Icon";
import AdSlot from "@/components/ui/AdSlot";
import FaqAccordion from "@/components/ui/FaqAccordion";
import SectionHeading from "@/components/ui/SectionHeading";
import AboutSection from "@/components/ui/AboutSection";
import RelatedTools from "./RelatedTools";
import { getCategory } from "@/data/categories";
import { getRelated as relatedToolsFn } from "@/data/related";
import { toolJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { getToolContent } from "@/lib/toolContent";
import { getToolSeo } from "@/data/toolSeo";

// Shown on tool pages that have hand-written SEO copy and no `highlights` of their own.
// Kept to claims that are true for every tool (no "100% private" / "no server" claims,
// because a few tools call outside services or save data in localStorage).
const SAFE_HIGHLIGHTS = [{ icon: "Check", label: "Free, no sign-up" }];

// `about` and `faq` are optional overrides — pass them in from a specific tool page
// once you've written real, hand-crafted copy for it. Until then, every tool page
// auto-fills with generated content from getToolContent() so no page ships thin.
export default function ToolPageShell({ tool, children, about, faq }) {
  const category = getCategory(tool.category);
  const related = relatedToolsFn(tool, 4);
  const generated = getToolContent(tool, category);
  // Priority: props passed in > entry in src/data/toolSeo.js > auto-generated fallback.
  const seo = getToolSeo(tool.slug);
  const aboutParagraphs = about || (seo?.about?.length ? seo.about : generated.about);
  const faqItems = faq && faq.length > 0 ? faq : seo?.faq?.length ? seo.faq : generated.faq;
  const pageH1 = seo?.h1 || tool.name;
  const pageIntro = seo?.shortDescription || tool.description;
  const aboutHighlights = seo ? (seo.highlights?.length ? seo.highlights : SAFE_HIGHLIGHTS) : undefined;
  const [leadParagraph, ...restParagraphs] = aboutParagraphs;

  const jsonLd = [
    toolJsonLd({ ...tool, description: pageIntro }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: category.name, path: `/category/${category.slug}` },
      { name: tool.name, path: `/tools/${tool.slug}` },
    ]),
    faqJsonLd(faqItems),
  ].filter(Boolean);

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <Container className="py-10">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted">
          <Link href="/" className="hover:text-brand">Home</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <Link href={`/category/${category.slug}`} className="hover:text-brand">{category.name}</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span className="text-ink">{tool.name}</span>
        </nav>

        <div className="mb-8 flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: category.accentLight, color: category.accent }}
          >
            <Icon name={tool.icon} size={24} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{pageH1}</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted">{pageIntro}</p>
          </div>
        </div>

        <div className="tool-content min-h-[320px] rounded-card border border-line bg-surface p-5 sm:p-8">{children}</div>

        <AdSlot className="mt-10" />

        <AboutSection
          title={`About ${tool.name}`}
          lead={leadParagraph}
          paragraphs={restParagraphs}
          accent={category.accent}
          highlights={aboutHighlights}
        />

        {faqItems.length > 0 && (
          <section className="mt-8">
            <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
            <FaqAccordion items={faqItems} columns />
          </section>
        )}

        <RelatedTools tools={related} category={tool.category} />
      </Container>
    </>
  );
}
