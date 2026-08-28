import Link from "next/link";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ToolCard from "@/components/tools/ToolCard";
import { getPopularTools } from "@/data/tools";

export default function PopularTools() {
  const tools = getPopularTools(8);

  return (
    <section className="border-t border-line bg-paper py-16">
      <Container>
        <SectionHeading
          eyebrow="Popular"
          title="Most-used tools right now"
          description="Start with the tools people reach for most, or browse the full library."
          action={
            <Link href="/tools" className="text-sm font-medium text-brand hover:text-brand-dark">
              Browse all 40 tools →
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </Container>
    </section>
  );
}
