import { notFound } from "next/navigation";
import { TOOLS, getToolBySlug } from "@/data/tools";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ToolRenderer from "@/components/tools/ToolRenderer";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return buildMetadata({ title: "Tool not found", path: `/tools/${slug}` });
  return buildMetadata({
    title: tool.name,
    description: tool.description,
    path: `/tools/${tool.slug}`,
  });
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  // NOTE: the tool itself is rendered by <ToolRenderer />, a client component that
  // owns the registry of next/dynamic imports. Keeping the registry out of this
  // server file is what makes each tool load ONLY its own code chunk, instead of
  // every page shipping the code of all 200 tools.
  return (
    <ToolPageShell tool={tool}>
      <ToolRenderer slug={tool.slug} toolName={tool.name} />
    </ToolPageShell>
  );
}
