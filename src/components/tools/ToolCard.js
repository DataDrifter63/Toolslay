import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Icon from "@/components/ui/Icon";
import { getCategory } from "@/data/categories";

export default function ToolCard({ tool }) {
  const category = getCategory(tool.category);

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col rounded-card border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
    >
      <div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: category?.accentLight, color: category?.accent }}
      >
        <Icon name={tool.icon} size={20} />
      </div>
      <h3 className="font-display text-base font-semibold text-ink">{tool.name}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{tool.description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
        Open tool
        <ArrowRight size={14} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
