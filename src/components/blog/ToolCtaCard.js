import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Icon from "@/components/ui/Icon";
import { getCategory } from "@/data/categories";

/**
 * "Try it now" card that sends blog readers to a tool.
 *   variant="end"    big card shown at the bottom of a post (primary tool)
 *   variant="inline" medium card used inside the article via :::tool slug
 *   variant="mini"   compact card for the sticky sidebar
 */
export default function ToolCtaCard({ tool, variant = "end", label = "Try it now" }) {
  if (!tool) return null;
  const category = getCategory(tool.category);
  const href = `/tools/${tool.slug}`;
  const tile = (size) => (
    <div
      className={`flex flex-none items-center justify-center rounded-2xl ${size}`}
      style={{ backgroundColor: category?.accentLight, color: category?.accent }}
    >
      <Icon name={tool.icon} size={variant === "end" ? 30 : 22} />
    </div>
  );

  if (variant === "mini") {
    return (
      <Link
        href={href}
        className="group block rounded-card border border-line bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
      >
        <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
          <Sparkles size={12} aria-hidden="true" /> Related tool
        </p>
        <div className="flex items-center gap-3">
          {tile("h-11 w-11")}
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-ink">{tool.name}</p>
            <p className="text-xs text-muted">Free, no sign-up</p>
          </div>
        </div>
        <span className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition group-hover:bg-brand-dark">
          {label}
          <ArrowRight size={14} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Link>
    );
  }

  if (variant === "inline") {
    return (
      <Link
        href={href}
        className="not-prose group my-8 flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-hover sm:flex-row sm:items-center"
      >
        {tile("h-14 w-14")}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">Free tool</p>
          <p className="mt-0.5 font-display text-lg font-bold text-ink">{tool.name}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{tool.description}</p>
        </div>
        <span className="inline-flex flex-none items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition group-hover:bg-brand-dark">
          {label}
          <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Link>
    );
  }

  // variant "end"
  return (
    <section
      aria-label={`Try ${tool.name}`}
      className="tool-cta-glow relative overflow-hidden rounded-[22px] border border-line bg-surface p-6 shadow-card sm:p-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {tile("h-16 w-16")}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
            <Sparkles size={13} aria-hidden="true" /> {label}
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold text-ink">{tool.name}</h3>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{tool.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
            <span
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: category?.accentLight, color: category?.accent }}
            >
              {category?.name}
            </span>
            <span className="rounded-full bg-paper px-2.5 py-1 text-muted">Free</span>
            <span className="rounded-full bg-paper px-2.5 py-1 text-muted">No sign-up</span>
          </div>
        </div>
        <Link
          href={href}
          className="group inline-flex flex-none items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-base font-semibold text-white shadow-card transition hover:bg-brand-dark hover:shadow-hover"
        >
          {label}
          <ArrowRight size={17} className="transition group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
