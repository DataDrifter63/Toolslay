import Link from "next/link";
import Container from "@/components/layout/Container";
import LoginForm from "@/components/admin/LoginForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Admin Login",
  path: "/admin/login",
  noIndex: true,
});

export default function AdminLoginPage() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-14">
      <Link href="/" className="mb-6 font-display text-lg font-bold text-ink">
        tool<span className="text-brand">slay</span>
      </Link>
      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-6 shadow-card">
        <h1 className="mb-1 font-display text-xl font-bold text-ink">Admin sign in</h1>
        <p className="mb-6 text-sm text-muted">Manage blog posts and site content.</p>
        <LoginForm />
      </div>
    </Container>
  );
}
