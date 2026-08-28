import { supabase } from "./supabase";

// posts table schema (create in Supabase):
// id uuid, title text, slug text unique, content text, meta_description text,
// cover_image text, category text, published_at timestamptz

export async function getLatestPosts(limit = 3) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("posts")
    .select("title, slug, meta_description, cover_image, published_at")
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
    .select("title, slug, meta_description, cover_image, published_at")
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
  return data;
}
