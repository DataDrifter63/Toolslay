import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return buildMetadata({ title: "Post not found", path: `/blog/${slug}` });
  return buildMetadata({
    title: post.title,
    description: post.meta_description,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description,
    datePublished: post.published_at,
    url: `${SITE.url}/blog/${post.slug}`,
  };

  return (
    <Container className="py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-ink">{post.title}</h1>
        {post.published_at && (
          <p className="mt-2 text-xs text-muted">
            {new Date(post.published_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        {/* Content is authored as sanitized HTML from the /admin dashboard editor. */}
        <div
          className="prose prose-sm mt-8 max-w-none text-ink"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </Container>
  );
}
