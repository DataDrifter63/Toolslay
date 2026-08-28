import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// `supabase` is null until env vars are set (see .env.example) — every caller
// in /src/lib/posts.js checks for this and falls back to an empty list instead
// of crashing the build, so the site works before Supabase is wired up.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
