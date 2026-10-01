"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return null;

  async function handleSignOut() {
    if (supabase) await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-container items-center justify-between px-5 py-3 sm:px-6 lg:px-8">
        <Link href="/admin" className="font-display text-sm font-bold text-ink">
          tool<span className="text-brand">slay</span> <span className="text-muted">Admin</span>
        </Link>
        <nav className="flex items-center gap-5">
          <Link href="/admin" className="flex items-center gap-1.5 text-sm text-muted transition hover:text-ink">
            <LayoutDashboard size={15} aria-hidden="true" />
            Dashboard
          </Link>
          <Link href="/admin/posts/new" className="flex items-center gap-1.5 text-sm text-muted transition hover:text-ink">
            <PlusCircle size={15} aria-hidden="true" />
            New Post
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-muted transition hover:text-red-600"
          >
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
