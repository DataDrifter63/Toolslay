import { Info } from "lucide-react";
import Icon from "./Icon";

const DEFAULT_HIGHLIGHTS = [
  { icon: "ShieldCheck", label: "100% private — runs in your browser" },
  { icon: "Zap", label: "Instant, no server round-trip" },
  { icon: "Gift", label: "Free, no sign-up" },
];

/**
 * Shared "About this tool / category" card. Used on tool pages, category pages
 * and the all-tools page so this piece of content looks and behaves the same
 * everywhere: eyebrow + heading, a lead paragraph, a row of trust badges, then
 * supporting paragraphs in two columns.
 */
export default function AboutSection({
  eyebrow = "About",
  title,
  lead,
  paragraphs = [],
  highlights = DEFAULT_HIGHLIGHTS,
  accent,
}) {
  return (
    <section className="mt-12 overflow-hidden rounded-card border border-line bg-surface">
      {accent && (
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        />
      )}

      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
            <Info size={16} aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">{eyebrow}</p>
        </div>

        <h2 className="mt-3 font-display text-lg font-bold text-ink sm:text-xl">{title}</h2>

        {lead && (
          <p className="mt-4 max-w-3xl text-[15px] font-medium leading-relaxed text-ink">{lead}</p>
        )}

        {highlights?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2.5">
            {highlights.map((h, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-muted"
              >
                <Icon name={h.icon} size={13} className="text-brand" />
                {h.label}
              </span>
            ))}
          </div>
        )}

        {paragraphs.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-4 border-t border-line pt-6 text-sm leading-relaxed text-muted lg:grid-cols-2">
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
