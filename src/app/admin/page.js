import Container from "@/components/layout/Container";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Admin",
  path: "/admin",
  noIndex: true,
});

// This route is intentionally minimal — it's blocked in robots.js and excluded
// from the sitemap. Wire up Supabase Auth here before building out post
// create/edit/delete forms:
//   1. supabase.auth.signInWithPassword({ email, password })
//   2. Protect this page with a server-side session check (redirect to /admin/login if none)
//   3. Build forms that insert/update/delete rows in the `posts` table (see src/lib/posts.js)
export default function AdminPage() {
  return (
    <Container className="py-14">
      <h1 className="font-display text-2xl font-bold text-ink">Admin dashboard</h1>
      <p className="mt-2 max-w-lg text-sm text-muted">
        This is a placeholder. Wire up Supabase Auth and blog post forms here (see the comment at
        the top of this file for the build order).
      </p>
    </Container>
  );
}
