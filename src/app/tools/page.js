import { Suspense } from "react";
import Container from "@/components/layout/Container";
import ToolSearch from "@/components/tools/ToolSearch";
import { TOOLS } from "@/data/tools";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "All Tools — 40+ Free Online Tools",
  description: "Browse every ToolSlay tool: PDF, image, text, calculators, developer tools and more. All free, all in your browser.",
  path: "/tools",
});

export default function AllToolsPage() {
  return (
    <Container className="py-10">
      <h1 className="font-display text-3xl font-bold text-ink">Explore all tools</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        {TOOLS.length}+ free tools that run entirely in your browser — search or filter by
        category to find what you need.
      </p>
      <div className="mt-8">
        <Suspense fallback={null}>
          <ToolSearch tools={TOOLS} />
        </Suspense>
      </div>
    </Container>
  );
}
