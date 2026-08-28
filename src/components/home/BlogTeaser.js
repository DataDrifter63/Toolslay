import Link from "next/link";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { getLatestPosts } from "@/lib/posts";

export default async function BlogTeaser() {
  const posts = await getLatestPosts(3);
  if (!posts.length) return null;

  return (
    <section className="py-16">
      <Container>
        <SectionHeading
          eyebrow="From the blog"
          title="Guides to get more out of your tools"
          action={
            <Link href="/blog" className="text-sm font-medium text-brand hover:text-brand-dark">
              View all posts →
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-card border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
            >
              <h3 className="font-display text-base font-semibold text-ink group-hover:text-brand">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-muted line-clamp-2">{post.meta_description}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
