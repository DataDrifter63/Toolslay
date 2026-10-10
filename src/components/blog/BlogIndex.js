"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import clsx from "clsx";
import Icon from "@/components/ui/Icon";
import { CATEGORIES } from "@/data/categories";

const ALL = "All";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// If a post category matches a tool category name (e.g. "Developer Tools"), borrow its color and icon.
function styleFor(label) {
  const key = (label || "").trim().toLowerCase();
  const match = CATEGORIES.find(
    (c) => c.name.toLowerCase() === key || c.shortName.toLowerCase() === key
  );
  return match
    ? { accent: match.accent, light: match.accentLight, icon: match.icon }
    : { accent: null, light: null, icon: null };
}

function Cover({ post, className }) {
  const s = styleFor(post.category);
  if (post.cover_image) {
    return (
      <img
        src={post.cover_image}
        alt={post.title}
        loading="lazy"
        className={clsx("w-full object-cover transition duration-300 group-hover:scale-[1.03]", className)}
      />
    );
  }
  return (
    <div
      className={clsx("flex w-full items-center justify-center bg-brand-light text-brand", className)}
      style={s.light ? { background: `linear-gradient(135deg, ${s.light}, ${s.accent}22)`, color: s.accent } : undefined}
      aria-hidden="true"
    >
      {s.icon ? <Icon name={s.icon} size={40} /> : <BookOpen size={40} />}
    </div>
  );
}

function CategoryChip({ label }) {
  if (!label) return null;
  const s = styleFor(label);
  return (
    <span
      className="inline-block rounded-full bg-brand-light px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand"
      style={s.light ? { backgroundColor: s.light, color: s.accent } : undefined}
    >
      {label}
    </span>
  );
}

function FeaturedCard({ post }) {
  const s = styleFor(post.category);
  const accent = s.accent || "#4F46E5";
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative grid overflow-hidden rounded-card border border-line bg-surface shadow-card transition hover:shadow-hover md:grid-cols-12"
    >
      <div className="relative min-h-[240px] overflow-hidden md:col-span-6 lg:col-span-7">
        {post.cover_image ? (
          <>
            <img
              src={post.cover_image}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" aria-hidden="true" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}CC 45%, #111827 130%)` }}
            aria-hidden="true"
          >
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-8 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute inset-0 flex items-center justify-center text-white/90">
              {s.icon ? <Icon name={s.icon} size={72} /> : <BookOpen size={72} />}
            </div>
          </div>
        )}
        <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" /> Featured
        </span>
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-8 md:col-span-6 lg:col-span-5">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryChip label={post.category} />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <CalendarDays size={13} aria-hidden="true" /> {formatDate(post.published_at)}
          </span>
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-ink group-hover:text-brand sm:text-3xl">
          {post.title}
        </h2>
        {post.meta_description && (
          <p className="mt-3 line-clamp-4 text-[15px] leading-relaxed text-muted">{post.meta_description}</p>
        )}
        <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-brand-dark">
          Read the guide
          <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function PostCardItem({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
    >
      <div className="overflow-hidden">
        <Cover post={post} className="aspect-[16/9]" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <CategoryChip label={post.category} />
        <h3 className="mt-2 font-display text-base font-semibold leading-snug text-ink group-hover:text-brand">
          {post.title}
        </h3>
        {post.meta_description && (
          <p className="mt-2 line-clamp-3 text-sm text-muted">{post.meta_description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} aria-hidden="true" /> {formatDate(post.published_at)}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-brand">
            Read
            <ArrowRight size={13} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogIndex({ posts }) {
  const [active, setActive] = useState(ALL);

  const tabs = useMemo(() => {
    const counts = new Map();
    for (const p of posts) {
      const c = (p.category || "").trim();
      if (c) counts.set(c, (counts.get(c) || 0) + 1);
    }
    const names = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a) || a.localeCompare(b));
    return [{ name: ALL, count: posts.length }, ...names.map((n) => ({ name: n, count: counts.get(n) }))];
  }, [posts]);

  const visible = useMemo(
    () => (active === ALL ? posts : posts.filter((p) => (p.category || "").trim() === active)),
    [posts, active]
  );

  const showFeatured = active === ALL && visible.length > 1;
  const featured = showFeatured ? visible[0] : null;
  const rest = showFeatured ? visible.slice(1) : visible;

  if (posts.length === 0) {
    return (
      <div className="mt-10 rounded-card border border-dashed border-line py-16 text-center">
        <p className="text-sm text-muted">No posts yet. Check back soon.</p>
      </div>
    );
  }

  return (
    <div>
      {tabs.length > 1 && (
        <div
          role="tablist"
          aria-label="Blog categories"
          className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          {tabs.map((t) => {
            const on = t.name === active;
            return (
              <button
                key={t.name}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(t.name)}
                className={clsx(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                  on
                    ? "border-brand bg-brand text-white shadow-card"
                    : "border-line bg-surface text-ink hover:border-brand/50 hover:text-brand"
                )}
              >
                {t.name}
                <span
                  className={clsx(
                    "rounded-full px-1.5 text-[11px] font-semibold",
                    on ? "bg-white/20 text-white" : "bg-paper text-muted"
                  )}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {featured && <FeaturedCard post={featured} />}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <PostCardItem key={post.slug} post={post} />
            ))}
          </div>
        )}
        {visible.length === 0 && (
          <div className="rounded-card border border-dashed border-line py-12 text-center text-sm text-muted">
            No posts in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
