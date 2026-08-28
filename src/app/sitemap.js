import { TOOLS } from "@/data/tools";
import { CATEGORIES } from "@/data/categories";
import { getAllPosts } from "@/lib/posts";
import { SITE } from "@/lib/constants";

// New tool → add it to /src/data/tools.js and it appears here automatically.
// New blog post → publish it from /admin and it appears here automatically.
// New static page → add one line to `staticPages` below.
export default async function sitemap() {
  const now = new Date();

  const staticPages = ["", "/tools", "/blog", "/about", "/contact", "/privacy-policy", "/terms"].map(
    (path) => ({
      url: `${SITE.url}${path}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: path === "" ? 1 : 0.6,
    })
  );

  const categoryPages = CATEGORIES.map((cat) => ({
    url: `${SITE.url}/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const toolPages = TOOLS.map((tool) => ({
    url: `${SITE.url}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const posts = await getAllPosts();
  const blogPages = posts.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...categoryPages, ...toolPages, ...blogPages];
}
