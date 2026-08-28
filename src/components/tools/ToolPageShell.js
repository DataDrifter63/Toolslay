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
import { getRelatedTools as relatedToolsFn } from "@/data/tools";
import { toolJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { getToolContent } from "@/lib/toolContent";

// `about` and `faq` are optional overrides — pass them in from a specific tool page
// once you've written real, hand-crafted copy for it. Until then, every tool page
// auto-fills with generated content from getToolContent() so no page ships thin.
export default function ToolPageShell({ tool, children, about, faq }) {
  const category = getCategory(tool.category);
  const related = relatedToolsFn(tool, 4);
  const generated = getToolContent(tool, category);
  const aboutParagraphs = about || generated.about;
  const faqItems = faq && faq.length > 0 ? faq : generated.faq;
  const [leadParagraph, ...restParagraphs] = aboutParagraphs;

  const jsonLd = [
    toolJsonLd(tool),
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
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{tool.name}</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted">{tool.description}</p>
          </div>
        </div>

        <div className="rounded-card border border-line bg-surface p-5 sm:p-8">{children}</div>

        <AdSlot className="mt-10" />

        <AboutSection
          title={`About ${tool.name}`}
          lead={leadParagraph}
          paragraphs={restParagraphs}
          accent={category.accent}
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
