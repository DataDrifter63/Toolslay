"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const [checking, setChecking] = useState(!isLoginPage);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (isLoginPage) return;

    if (!supabase) {
      router.replace("/admin/login");
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        setAuthed(true);
        setChecking(false);
      } else {
        router.replace("/admin/login");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/admin/login");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [isLoginPage, router]);

  if (isLoginPage) return children;

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 size={22} className="animate-spin text-brand" aria-hidden="true" />
      </div>
    );
  }

  if (!authed) return null; // mid-redirect to /admin/login

  return children;
}
