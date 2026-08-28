import { ChevronDown } from "lucide-react";

/**
 * Shared FAQ accordion. Each item is its own card (not a tight divided list),
 * with a rotating chevron and hover state — used on tool pages, category pages
 * and the homepage so FAQ styling stays consistent across the site.
 */
export default function FaqAccordion({ items = [], columns = false }) {
  if (!items.length) return null;

  return (
    <div className={columns ? "grid grid-cols-1 gap-3 lg:grid-cols-2" : "space-y-3"}>
      {items.map((item, i) => (
        <details
          key={i}
          className="group rounded-xl border border-line bg-surface transition hover:border-brand/40 open:border-brand/40 open:bg-brand-light/30"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
            <span className="text-sm font-medium text-ink">{item.q}</span>
            <ChevronDown
              size={16}
              className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180 group-open:text-brand"
              aria-hidden="true"
            />
          </summary>
          <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
