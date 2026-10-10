import { notFound } from "next/navigation";
import PostView from "@/components/blog/PostView";
import { getPostBySlug, getAllPosts, getRelatedPosts } from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return buildMetadata({ title: "Post not found", path: `/blog/${slug}` });
  const meta = buildMetadata({
    title: post.title,
    description: post.meta_description,
    path: `/blog/${post.slug}`,
    image: post.cover_image || undefined,
  });
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || post.published_at || undefined,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post.slug, post.category, 3);
  return <PostView post={post} related={related} />;
}
