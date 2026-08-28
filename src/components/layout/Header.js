"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import Container from "./Container";
import NavSearch from "./NavSearch";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { CATEGORIES } from "@/data/categories";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <Container className="flex h-16 items-center gap-4">
        <Link href="/" className="shrink-0 font-display text-lg font-bold text-ink">
          Tool<span className="text-brand">Slay</span>
        </Link>

        <div className="hidden flex-1 max-w-md md:block">
          <NavSearch />
        </div>

        <nav className="ml-auto hidden items-center gap-6 md:flex">
          <div className="group relative">
            <button className="flex items-center gap-1 text-sm font-medium text-ink hover:text-brand">
              Categories <ChevronDown size={14} aria-hidden="true" />
            </button>
            <div className="invisible absolute right-0 top-full w-64 rounded-xl border border-line bg-surface p-2 opacity-0 shadow-hover transition group-hover:visible group-hover:opacity-100">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-ink hover:bg-paper"
                >
                  {cat.name}
                  <span className="text-xs text-muted">{cat.shortName}</span>
                </Link>
              ))}
            </div>
          </div>
          <Link href="/tools" className="text-sm font-medium text-ink hover:text-brand">
            All Tools
          </Link>
          <Link href="/blog" className="text-sm font-medium text-ink hover:text-brand">
            Blog
          </Link>
          <Link href="/about" className="text-sm font-medium text-ink hover:text-brand">
            About
          </Link>
          <ThemeToggle />
        </nav>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center text-ink"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {menuOpen && (
        <div className="border-t border-line bg-surface md:hidden">
          <Container className="flex flex-col gap-4 py-4">
            <NavSearch compact onNavigate={() => setMenuOpen(false)} />
            <Link href="/tools" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-ink">
              All Tools
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-muted"
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/blog" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-ink">
              Blog
            </Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-ink">
              About
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
