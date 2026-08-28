import Link from "next/link";
import Container from "@/components/layout/Container";
import { getAllPosts } from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Blog — Guides & Tips",
  description: "How-to guides and tips for getting more out of ToolSlay's free online tools.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <Container className="py-10">
      <h1 className="font-display text-3xl font-bold text-ink">Blog</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Guides and tips for getting more out of our free tools.
      </p>

      {posts.length === 0 ? (
        <div className="mt-10 rounded-card border border-dashed border-line py-16 text-center">
          <p className="text-sm text-muted">No posts yet — check back soon.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-card border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
            >
              <h2 className="font-display text-base font-semibold text-ink group-hover:text-brand">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-muted line-clamp-3">{post.meta_description}</p>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
