import { notFound } from "next/navigation";
import { TOOLS, getToolBySlug } from "@/data/tools";
import { TOOL_COMPONENTS } from "@/tools-impl/registry";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ToolComingSoon from "@/components/tools/ToolComingSoon";
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

  const ToolComponent = TOOL_COMPONENTS[tool.slug];

  return (
    <ToolPageShell tool={tool}>
      {ToolComponent ? <ToolComponent /> : <ToolComingSoon toolName={tool.name} />}
    </ToolPageShell>
  );
}
