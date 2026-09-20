"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!supabase) {
      setError("Supabase isn't configured yet — check your .env.local file (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).");
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (authError) {
      setError("Incorrect email or password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <LogIn size={15} aria-hidden="true" />}
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
