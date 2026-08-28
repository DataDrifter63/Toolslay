import Link from "next/link";
import ToolCard from "./ToolCard";
import { getCategory } from "@/data/categories";

export default function RelatedTools({ tools, category }) {
  if (!tools.length) return null;
  const cat = getCategory(category);

  return (
    <section className="mt-16 pb-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">Related tools</h2>
        {cat && (
          <Link href={`/category/${cat.slug}`} className="text-sm font-medium text-brand">
            View all {cat.shortName.toLowerCase()} tools →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
}
