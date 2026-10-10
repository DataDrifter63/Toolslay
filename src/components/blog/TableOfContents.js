"use client";

import { useEffect, useState } from "react";
import { ListTree } from "lucide-react";

export default function TableOfContents({ headings, variant = "sidebar" }) {
  const [active, setActive] = useState(headings[0]?.id || "");

  useEffect(() => {
    if (!headings.length) return;
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean);
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px", threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  const list = (
    <ul className="space-y-0.5">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            className={`block rounded-md border-l-2 py-1.5 pr-2 text-[13px] leading-snug transition ${
              h.level === 3 ? "pl-6" : "pl-3"
            } ${
              active === h.id
                ? "border-brand bg-brand-light font-medium text-brand"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );

  if (variant === "mobile") {
    return (
      <details className="group rounded-card border border-line bg-surface xl:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-ink">
          <ListTree size={16} className="text-brand" aria-hidden="true" />
          In this article
          <span className="ml-auto text-xs font-normal text-muted group-open:hidden">Tap to open</span>
        </summary>
        <nav aria-label="Table of contents" className="border-t border-line px-2 py-2">
          {list}
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="Table of contents" className="rounded-card border border-line bg-surface p-3 shadow-card">
      <p className="mb-2 flex items-center gap-2 px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
        <ListTree size={13} aria-hidden="true" /> In this article
      </p>
      {list}
    </nav>
  );
}
