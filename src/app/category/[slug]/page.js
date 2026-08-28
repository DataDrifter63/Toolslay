import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Container from "@/components/layout/Container";
import ToolCard from "@/components/tools/ToolCard";
import Icon from "@/components/ui/Icon";
import AdSlot from "@/components/ui/AdSlot";
import FaqAccordion from "@/components/ui/FaqAccordion";
import SectionHeading from "@/components/ui/SectionHeading";
import AboutSection from "@/components/ui/AboutSection";
import { CATEGORIES, getCategory } from "@/data/categories";
import { getToolsByCategory } from "@/data/tools";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { getCategoryContent } from "@/lib/toolContent";

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return buildMetadata({ title: "Category not found", path: `/category/${slug}` });
  return buildMetadata({
    title: `${category.name} — Free Online Tools`,
    description: category.description,
    path: `/category/${category.slug}`,
  });
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const tools = getToolsByCategory(category.slug);
  const { intro, faq } = getCategoryContent(category, tools.length);

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: category.name, path: `/category/${category.slug}` },
    ]),
    faqJsonLd(faq),
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

      <div className="border-b border-line bg-paper py-10">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted">
            <Link href="/" className="hover:text-brand">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-ink">{category.name}</span>
          </nav>
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: category.accentLight, color: category.accent }}
            >
              <Icon name={category.icon} size={24} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{category.name}</h1>
              <p className="mt-1 text-sm text-muted">{category.description}</p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-10">
        <p className="mb-6 text-sm text-muted">
          <span className="font-semibold text-ink">{tools.length}</span> tool
          {tools.length !== 1 ? "s" : ""} in this category
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
        <AdSlot className="mt-10" />

        <AboutSection
          title={`About ${category.name}`}
          lead={intro[0]}
          paragraphs={intro.slice(1)}
          accent={category.accent}
        />

        {faq.length > 0 && (
          <section className="mt-8">
            <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
            <FaqAccordion items={faq} columns />
          </section>
        )}
      </Container>
    </>
  );
}
