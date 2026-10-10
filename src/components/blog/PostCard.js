import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

/**
 * "Read next" card for internal linking, used inside an article via ":::post slug".
 * `post` needs: slug, title, meta_description, cover_image, category.
 */
export default function PostCard({ post }) {
  if (!post) return null;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="not-prose group my-8 flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-hover sm:flex-row"
    >
      <div className="relative aspect-[16/9] w-full flex-none overflow-hidden bg-brand-light sm:aspect-auto sm:w-48">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="tool-cta-glow flex h-full min-h-[96px] w-full items-center justify-center text-brand" aria-hidden="true">
            <BookOpen size={30} />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center p-5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
          <BookOpen size={12} aria-hidden="true" /> Read next{post.category ? ` · ${post.category}` : ""}
        </p>
        <p className="mt-1 font-display text-lg font-bold leading-snug text-ink group-hover:text-brand">{post.title}</p>
        {post.meta_description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{post.meta_description}</p>
        )}
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand">
          Read article
          <ArrowRight size={14} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
