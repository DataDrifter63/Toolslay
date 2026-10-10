import ToolCtaCard from "./ToolCtaCard";
import PostCard from "./PostCard";
import { getToolBySlug } from "@/data/tools";
import "@/styles/blog.css";

// Renders the HTML produced by lib/markdown.js. Slots created by ":::tool slug" and
// ":::post slug" are swapped for real card components; everything else is plain HTML.
// `posts` is a { slug: post } map of the blog posts referenced with ":::post".
export default function BlogContent({ html, posts = {}, className = "" }) {
  if (!html) return null;
  const slot = /<div class="bc-(tool|post)-slot" data-slug="([a-z0-9-]+)"><\/div>/g;
  const parts = [];
  let last = 0;
  let m;
  while ((m = slot.exec(html))) {
    if (m.index > last) parts.push({ type: "html", value: html.slice(last, m.index) });
    parts.push({ type: m[1], value: m[2] });
    last = m.index + m[0].length;
  }
  if (last < html.length) parts.push({ type: "html", value: html.slice(last) });

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "tool") return <ToolCtaCard key={i} tool={getToolBySlug(part.value)} variant="inline" />;
        if (part.type === "post") return <PostCard key={i} post={posts[part.value]} />;
        return <div key={i} className={`blog-content ${className}`} dangerouslySetInnerHTML={{ __html: part.value }} />;
      })}
    </>
  );
}
