import { supabase } from "./supabase";

// posts table schema (create in Supabase):
// id uuid, title text, slug text unique, content text, meta_description text,
// cover_image text, category text, published boolean, published_at timestamptz,
// updated_at timestamptz,
// related_tool text   <- NEW: comma separated tool slugs for the "Try it now" card
//                        (run docs/blog-migration.sql once to add this column)

const LIST_COLUMNS = "title, slug, meta_description, cover_image, category, published_at";

// Drafts (published = false) never show up publicly. Rows where the column is empty still count as published.
const PUBLISHED_FILTER = "published.is.null,published.eq.true";

export async function getLatestPosts(limit = 3) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("posts")
    .select(LIST_COLUMNS)
    .or(PUBLISHED_FILTER)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getLatestPosts error:", error.message);
    return [];
  }
  return data || [];
}

export async function getAllPosts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("posts")
    .select(LIST_COLUMNS)
    .or(PUBLISHED_FILTER)
    .order("published_at", { ascending: false });
  if (error) {
    console.error("getAllPosts error:", error.message);
    return [];
  }
  return data || [];
}

export async function getPostBySlug(slug) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).single();
  if (error) {
    console.error("getPostBySlug error:", error.message);
    return null;
  }
  if (data && data.published === false) return null;
  return data;
}

// More articles for the bottom of a post: same category first, then newest.
export async function getRelatedPosts(slug, category, limit = 3) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("posts")
    .select(LIST_COLUMNS)
    .or(PUBLISHED_FILTER)
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(12);
  if (error) {
    console.error("getRelatedPosts error:", error.message);
    return [];
  }
  const rows = data || [];
  const same = category ? rows.filter((p) => p.category === category) : [];
  const rest = rows.filter((p) => !same.includes(p));
  return [...same, ...rest].slice(0, limit);
}

// Cards for ":::post slug" blocks inside an article. Returns a { slug: post } map.
export async function getPostsBySlugs(slugs = []) {
  if (!supabase || !slugs.length) return {};
  const { data, error } = await supabase
    .from("posts")
    .select(LIST_COLUMNS)
    .or(PUBLISHED_FILTER)
    .in("slug", slugs);
  if (error) {
    console.error("getPostsBySlugs error:", error.message);
    return {};
  }
  return Object.fromEntries((data || []).map((p) => [p.slug, p]));
}
