import Link from "next/link";
import { CalendarDays, ChevronRight, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import BlogContent from "@/components/blog/BlogContent";
import ToolCtaCard from "@/components/blog/ToolCtaCard";
import TableOfContents from "@/components/blog/TableOfContents";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ShareButtons from "@/components/blog/ShareButtons";
import ToolCard from "@/components/tools/ToolCard";
import Icon from "@/components/ui/Icon";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { renderMarkdown, extractPostSlugs } from "@/lib/markdown";
import { getPostsBySlugs } from "@/lib/posts";
import { getToolBySlug } from "@/data/tools";
import { getCategory } from "@/data/categories";

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// The whole blog post layout. Data fetching stays in app/blog/[slug]/page.js.
export default async function PostView({ post, related = [], linkedPosts }) {
  const { html, headings, faqs, wordCount, readingMinutes } = renderMarkdown(post.content);
  // Cards for ":::post slug" blocks (tests can pass `linkedPosts` directly)
  const postCards = linkedPosts || (await getPostsBySlugs(extractPostSlugs(html)));

  // Tools attached to this post in the admin editor (comma separated slugs, max 3)
  const tools = (post.related_tool || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => getToolBySlug(s))
    .filter(Boolean)
    .slice(0, 3);
  const primaryTool = tools[0];
  const otherTools = tools.slice(1);
  const heroCategory = primaryTool ? getCategory(primaryTool.category) : null;

  const url = `${SITE.url}/blog/${post.slug}`;
  const modified = post.updated_at || post.published_at;
  const showUpdated =
    post.updated_at &&
    post.published_at &&
    new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() > 24 * 60 * 60 * 1000;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.meta_description,
      image: post.cover_image ? [post.cover_image] : undefined,
      datePublished: post.published_at,
      dateModified: modified,
      wordCount,
      articleSection: post.category || undefined,
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: SITE.name, url: SITE.url },
      publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    },
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
    faqJsonLd(faqs),
  ].filter(Boolean);

  return (
    <>
      <ReadingProgress targetId="post-body" />
      <Container className="py-8 sm:py-12">
        {jsonLd.map((data, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
        ))}

        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" className="mx-auto mb-6 flex max-w-[720px] items-center gap-1.5 text-xs text-muted xl:max-w-[1036px] xl:pr-[316px]">
          <Link href="/" className="hover:text-brand">Home</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <Link href="/blog" className="hover:text-brand">Blog</Link>
          {post.category && (
            <>
              <ChevronRight size={12} aria-hidden="true" />
              <span className="truncate">{post.category}</span>
            </>
          )}
        </nav>

        {/* title block */}
        <header className="mx-auto max-w-[720px] xl:max-w-[1036px] xl:pr-[316px]">
          {post.category && (
            <span className="inline-block rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
              {post.category}
            </span>
          )}
          <h1 className="mt-4 font-display text-3xl font-bold leading-[1.15] tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            {post.title}
          </h1>
          {post.meta_description && (
            <p className="mt-4 text-lg leading-relaxed text-muted">{post.meta_description}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-line py-3 text-sm text-muted">
            {post.published_at && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={15} aria-hidden="true" /> {formatDate(post.published_at)}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock size={15} aria-hidden="true" /> {readingMinutes} min read
            </span>
            {showUpdated && <span>Updated {formatDate(post.updated_at)}</span>}
            <div className="sm:ml-auto">
              <ShareButtons url={url} title={post.title} compact />
            </div>
          </div>
        </header>

        {/* featured image */}
        {post.cover_image ? (
          <figure className="mx-auto mt-8 max-w-5xl">
            <img
              src={post.cover_image}
              alt={post.title}
              width={1600}
              height={900}
              fetchPriority="high"
              className="aspect-[16/9] w-full rounded-[22px] border border-line object-cover shadow-hover"
            />
          </figure>
        ) : primaryTool ? (
          <div
            className="tool-cta-glow mx-auto mt-8 flex aspect-[21/8] max-w-5xl items-center justify-center rounded-[22px] border border-line bg-surface"
            aria-hidden="true"
          >
            <div
              className="flex h-20 w-20 items-center justify-center rounded-3xl sm:h-24 sm:w-24"
              style={{ backgroundColor: heroCategory?.accentLight, color: heroCategory?.accent }}
            >
              <Icon name={primaryTool.icon} size={44} />
            </div>
          </div>
        ) : null}

        {/* body + sidebar */}
        <div className="mx-auto mt-10 max-w-[1040px] xl:grid xl:grid-cols-[minmax(0,720px)_260px] xl:justify-center xl:gap-14">
          <article id="post-body" className="mx-auto w-full max-w-[720px] xl:max-w-none">
            <TableOfContents headings={headings} variant="mobile" />
            <div className="mt-6 xl:mt-0">
              <BlogContent html={html} posts={postCards} />
            </div>

            {/* end-of-post call to action */}
            {primaryTool && (
              <div className="mt-14">
                <ToolCtaCard tool={primaryTool} variant="end" />
                {otherTools.length > 0 && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {otherTools.map((t) => (
                      <ToolCard key={t.slug} tool={t} />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark">
                <ArrowLeft size={15} aria-hidden="true" /> All articles
              </Link>
              <ShareButtons url={url} title={post.title} />
            </div>
          </article>

          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-4">
              <TableOfContents headings={headings} />
              {primaryTool && <ToolCtaCard tool={primaryTool} variant="mini" />}
            </div>
          </aside>
        </div>

        {/* more articles */}
        {related.length > 0 && (
          <section className="mx-auto mt-16 max-w-5xl border-t border-line pt-10">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="font-display text-xl font-bold text-ink">Keep reading</h2>
              <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark">
                View all <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group overflow-hidden rounded-card border border-line bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
                >
                  {p.cover_image ? (
                    <img src={p.cover_image} alt={p.title} loading="lazy" className="aspect-[16/9] w-full object-cover" />
                  ) : (
                    <div className="aspect-[16/9] w-full bg-brand-light" aria-hidden="true" />
                  )}
                  <div className="p-4">
                    {p.category && <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">{p.category}</p>}
                    <h3 className="mt-1 font-display text-sm font-semibold leading-snug text-ink group-hover:text-brand">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
