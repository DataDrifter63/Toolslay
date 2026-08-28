"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "toolslay-theme";

// Site defaults to light. This only ever flips to dark when the person clicks
// it — no prefers-color-scheme auto-detection — and remembers the choice.
export default function ThemeToggle({ className = "" }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch (e) {
      // localStorage unavailable — theme just won't persist, no big deal
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={mounted ? isDark : undefined}
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-muted transition hover:border-brand hover:text-brand ${className}`}
    >
      <Sun
        size={16}
        aria-hidden="true"
        className={`absolute transition-all duration-300 ${
          mounted && isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        size={16}
        aria-hidden="true"
        className={`absolute transition-all duration-300 ${
          mounted && isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </button>
  );
}
