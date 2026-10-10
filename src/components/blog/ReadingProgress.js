"use client";

import { useEffect, useRef } from "react";

// Thin bar at the top of the page showing how far through the article you are.
export default function ReadingProgress({ targetId = "post-body" }) {
  const bar = useRef(null);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(targetId);
      if (!el || !bar.current) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const done = Math.min(Math.max(-rect.top + window.innerHeight * 0.3, 0), Math.max(total, 1));
      bar.current.style.transform = `scaleX(${Math.min(done / Math.max(total, 1), 1)})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent" aria-hidden="true">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-brand transition-transform duration-100" />
    </div>
  );
}
