"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, CornerDownLeft } from "lucide-react";
import Icon from "@/components/ui/Icon";
import { TOOLS } from "@/data/tools";
import { getCategory } from "@/data/categories";

const MAX_SUGGESTIONS = 6;

export default function NavSearch({ compact = false, onNavigate }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const router = useRouter();

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scored = TOOLS.map((tool) => {
      const name = tool.name.toLowerCase();
      let score = -1;
      if (name === q) score = 100;
      else if (name.startsWith(q)) score = 80;
      else if (name.includes(q)) score = 50;
      else if (tool.description.toLowerCase().includes(q)) score = 20;
      return { tool, score };
    })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SUGGESTIONS)
      .map((r) => r.tool);
    return scored;
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  function goToTool(tool) {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(`/tools/${tool.slug}`);
  }

  function goToSearchResults() {
    setOpen(false);
    onNavigate?.();
    router.push(query.trim() ? `/tools?q=${encodeURIComponent(query.trim())}` : "/tools");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goToTool(suggestions[activeIndex]);
    } else {
      goToSearchResults();
    }
  }

  function handleKeyDown(e) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 transition focus-within:border-brand">
          <Search size={16} className="shrink-0 text-muted" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => query && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={compact ? "Search tools..." : "Search ToolSlay's 40+ tools..."}
            aria-label="Search tools"
            role="combobox"
            aria-expanded={open && suggestions.length > 0}
            aria-controls="nav-search-suggestions"
            autoComplete="off"
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
      </form>

      {open && query.trim() && (
        <div
          id="nav-search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-line bg-surface p-2 shadow-hover animate-fade-in-up"
        >
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((tool, i) => {
                const category = getCategory(tool.category);
                return (
                  <button
                    type="button"
                    key={tool.slug}
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => goToTool(tool)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${
                      i === activeIndex ? "bg-paper" : "hover:bg-paper"
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: category?.accentLight, color: category?.accent }}
                    >
                      <Icon name={tool.icon} size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{tool.name}</span>
                      <span className="block truncate text-xs text-muted">{category?.shortName}</span>
                    </span>
                    <ArrowRight size={14} className="shrink-0 text-muted" aria-hidden="true" />
                  </button>
                );
              })}
              <button
                type="button"
                onClick={goToSearchResults}
                className="mt-1 flex w-full items-center justify-between rounded-lg border-t border-line px-2.5 pt-3 text-xs font-medium text-brand"
              >
                See all results for &quot;{query.trim()}&quot;
                <CornerDownLeft size={12} aria-hidden="true" />
              </button>
            </>
          ) : (
            <div className="px-2.5 py-6 text-center text-sm text-muted">
              No tools match &quot;{query.trim()}&quot;.
              <button
                type="button"
                onClick={goToSearchResults}
                className="mt-1 block w-full text-brand"
              >
                Search all tools anyway →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
