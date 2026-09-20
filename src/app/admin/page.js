"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Pencil, Trash2, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    if (!supabase) {
      setError("Supabase isn't configured — check .env.local.");
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("posts")
      .select("id, title, slug, published, published_at, updated_at")
      .order("updated_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    const { error: deleteError } = await supabase.from("posts").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setConfirmId(null);
  }

  return (
    <div className="mx-auto max-w-container px-5 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Blog posts</h1>
          <p className="mt-1 text-sm text-muted">{posts.length} total</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
        >
          <PlusCircle size={15} aria-hidden="true" />
          New Post
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : posts.length === 0 ? (
        <div className="rounded-card border border-dashed border-line py-16 text-center">
          <FileText size={28} className="mx-auto mb-3 text-muted" aria-hidden="true" />
          <p className="text-sm text-muted">No posts yet.</p>
          <Link href="/admin/posts/new" className="mt-3 inline-block text-sm font-medium text-brand hover:text-brand-dark">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last updated</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{post.title}</p>
                    <p className="text-xs text-muted">/blog/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        post.published ? "bg-teal-light text-teal" : "bg-amber-light text-amber"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {post.updated_at ? new Date(post.updated_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="flex items-center gap-1 text-xs font-medium text-muted hover:text-brand"
                      >
                        <Pencil size={13} aria-hidden="true" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
                        onBlur={() => setConfirmId(null)}
                        className={`flex items-center gap-1 text-xs font-medium ${
                          confirmId === post.id ? "text-red-600" : "text-muted hover:text-red-600"
                        }`}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        {confirmId === post.id ? "Confirm?" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
