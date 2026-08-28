"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import ToolCard from "./ToolCard";
import AdSlot from "@/components/ui/AdSlot";
import AboutSection from "@/components/ui/AboutSection";
import FaqAccordion from "@/components/ui/FaqAccordion";
import SectionHeading from "@/components/ui/SectionHeading";
import { CATEGORIES } from "@/data/categories";
import { getCategoryContent, getAllToolsContent } from "@/lib/toolContent";

export default function ToolSearch({ tools }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return tools.filter((tool) => {
      const matchesQuery =
        !query.trim() ||
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = activeCategory === "all" || tool.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [tools, query, activeCategory]);

  // Content below the grid is driven only by the active category tab (not the
  // search text), so switching categories always shows fresh, relevant copy.
  const activeCategoryObj = useMemo(
    () => (activeCategory === "all" ? null : CATEGORIES.find((c) => c.slug === activeCategory)),
    [activeCategory]
  );
  const categoryToolCount = useMemo(
    () =>
      activeCategoryObj
        ? tools.filter((t) => t.category === activeCategoryObj.slug).length
        : tools.length,
    [tools, activeCategoryObj]
  );
  const content = useMemo(
    () =>
      activeCategoryObj
        ? getCategoryContent(activeCategoryObj, categoryToolCount)
        : getAllToolsContent(categoryToolCount),
    [activeCategoryObj, categoryToolCount]
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-4 py-3">
          <Search size={18} className="text-muted" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 40+ tools..."
            aria-label="Search tools"
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
            activeCategory === "all"
              ? "border-brand bg-brand text-white"
              : "border-line bg-surface text-muted hover:border-brand hover:text-brand"
          }`}
        >
          All tools
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              activeCategory === cat.slug
                ? "text-white"
                : "border-line bg-surface text-muted hover:text-ink"
            }`}
            style={
              activeCategory === cat.slug
                ? { backgroundColor: cat.accent, borderColor: cat.accent }
                : undefined
            }
          >
            {cat.shortName}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted">
        Found <span className="font-semibold text-ink">{filtered.length}</span> tool
        {filtered.length !== 1 ? "s" : ""} for you
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-card border border-dashed border-line py-16 text-center">
          <p className="text-sm text-muted">No tools match &quot;{query}&quot;. Try a different search term.</p>
        </div>
      )}

      <AdSlot className="mt-10" />

      <AboutSection
        title={activeCategoryObj ? `About ${activeCategoryObj.name}` : "About ToolSlay's tools"}
        lead={content.intro[0]}
        paragraphs={content.intro.slice(1)}
        accent={activeCategoryObj?.accent}
      />

      {content.faq?.length > 0 && (
        <section className="mt-8">
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
          <FaqAccordion items={content.faq} columns />
        </section>
      )}
    </div>
  );
}
