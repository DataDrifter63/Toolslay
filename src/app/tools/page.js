import Container from "@/components/layout/Container";
import ToolSearch from "@/components/tools/ToolSearch";
import { TOOLS } from "@/data/tools";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { getAllToolsContent } from "@/lib/toolContent";

export const metadata = buildMetadata({
  title: "Free Online Tools: PDF, Image, Calculators & More",
  description: `Browse ${TOOLS.length}+ free online tools: compress images, convert PDFs, count words, format JSON, run calculators and more. No sign-up, works on any device.`,
  path: "/tools",
});

export default function AllToolsPage() {
  const faqSchema = faqJsonLd(getAllToolsContent(TOOLS.length).faq);

  return (
    <Container className="py-10">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <h1 className="font-display text-3xl font-bold text-ink">All free online tools</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        {TOOLS.length}+ free tools for PDFs, images, text, code, money and everyday planning.
        Search by task or pick a category to find the right one fast.
      </p>
      <div className="mt-8">
        <ToolSearch tools={TOOLS} />
      </div>
    </Container>
  );
}
