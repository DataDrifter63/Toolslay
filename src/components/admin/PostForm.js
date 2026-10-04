"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Eye, Pencil, ImagePlus, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { markdownToHtml } from "@/lib/markdown";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function PostForm({ postId }) {
  const router = useRouter();
  const isEditMode = Boolean(postId);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [metaDescription, setMetaDescription] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true);
  const [coverPreview, setCoverPreview] = useState(null);
  const [tab, setTab] = useState("write"); // "write" | "preview"
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [insertingImage, setInsertingImage] = useState(false);
  const contentRef = useRef(null);

  const previewHtml = useMemo(() => markdownToHtml(content), [content]);

  // Load existing post data when editing
  useEffect(() => {
    if (!isEditMode) return;
    if (!supabase) {
      setError("Supabase isn't configured — check .env.local.");
      setLoading(false);
      return;
    }

    supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single()
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else if (data) {
          setTitle(data.title || "");
          setSlug(data.slug || "");
          setSlugTouched(true); // don't auto-overwrite an existing live slug
          setMetaDescription(data.meta_description || "");
          setCategory(data.category || "");
          setContent(data.content || "");
          setPublished(Boolean(data.published));
          setCoverPreview(data.cover_image || null);
        }
        setLoading(false);
      });
  }, [isEditMode, postId]);

  function handleTitleChange(value) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleCoverChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setCoverUploading(true);
    try {
      const { url } = await uploadImageToCloudinary(file);
      setCoverPreview(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleInsertContentImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // allow picking the same file again later
    setError("");
    setInsertingImage(true);
    try {
      const { url } = await uploadImageToCloudinary(file);
      const markdown = `![${file.name.replace(/\.[^.]+$/, "")}](${url})`;
      const textarea = contentRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const next = content.slice(0, start) + markdown + content.slice(end);
        setContent(next);
        // restore focus + cursor after the inserted markdown
        requestAnimationFrame(() => {
          textarea.focus();
          const pos = start + markdown.length;
          textarea.setSelectionRange(pos, pos);
        });
      } else {
        setContent((prev) => `${prev}\n${markdown}\n`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setInsertingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("Title, slug and content are required.");
      return;
    }
    if (!supabase) {
      setError("Supabase isn't configured — check .env.local.");
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      meta_description: metaDescription.trim() || null,
      category: category.trim() || null,
      cover_image: coverPreview || null,
      published,
    };

    const { error: saveError } = isEditMode
      ? await supabase.from("posts").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", postId)
      : await supabase.from("posts").insert({ ...payload, published_at: new Date().toISOString() });

    setSaving(false);

    if (saveError) {
      if (saveError.message.includes("duplicate") || saveError.message.includes("unique")) {
        setError("That slug is already taken — try a different one.");
      } else {
        setError(saveError.message);
      }
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={22} className="animate-spin text-brand" aria-hidden="true" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">
        {isEditMode ? "Edit post" : "New post"}
      </h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-4 rounded-card border border-line bg-surface p-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Title</span>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Slug <span className="text-muted/70">— /blog/{slug || "..."}</span>
          </span>
          <input
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugTouched(true);
            }}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 font-mono text-sm text-ink focus:border-brand focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">Category (optional)</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Guides"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="accent-brand"
            />
            <span className="text-sm text-ink">Published</span>
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Meta description (for SEO)</span>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            maxLength={160}
            className="w-full resize-none rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
          />
          <span className="mt-1 block text-right text-xs text-muted">{metaDescription.length}/160</span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Cover image (optional)</span>
          <div className="flex items-center gap-3">
            {coverPreview && (
              <img src={coverPreview} alt="Cover preview" className="h-16 w-16 rounded-lg object-cover" />
            )}
            <label
              className={`flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-muted hover:border-brand hover:text-brand ${
                coverUploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              {coverUploading ? (
                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus size={15} aria-hidden="true" />
              )}
              {coverUploading ? "Uploading..." : coverPreview ? "Change image" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                disabled={coverUploading}
                className="hidden"
              />
            </label>
          </div>
        </label>
      </div>

      <div className="mt-4 rounded-card border border-line bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex rounded-lg border border-line bg-paper p-1">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                tab === "write" ? "bg-surface text-ink shadow-card" : "text-muted"
              }`}
            >
              <Pencil size={13} aria-hidden="true" /> Write
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                tab === "preview" ? "bg-surface text-ink shadow-card" : "text-muted"
              }`}
            >
              <Eye size={13} aria-hidden="true" /> Preview
            </button>
          </div>

          {tab === "write" && (
            <label
              className={`flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-medium text-muted hover:border-brand hover:text-brand ${
                insertingImage ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              {insertingImage ? (
                <Loader2 size={13} className="animate-spin" aria-hidden="true" />
              ) : (
                <ImageIcon size={13} aria-hidden="true" />
              )}
              {insertingImage ? "Uploading..." : "Insert image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleInsertContentImage}
                disabled={insertingImage}
                className="hidden"
              />
            </label>
          )}
        </div>

        {tab === "write" ? (
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write in Markdown — # Heading, **bold**, *italic*, [link](url), - list item..."
            rows={18}
            className="w-full resize-none rounded-lg border border-line bg-paper p-3 font-mono text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
          />
        ) : (
          <div
            className="prose prose-sm max-w-none rounded-lg border border-line bg-paper p-4"
            dangerouslySetInnerHTML={{ __html: previewHtml || "<p class='text-muted'>Nothing to preview yet.</p>" }}
          />
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-6 flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
        {saving ? "Saving..." : isEditMode ? "Update post" : "Save post"}
      </button>
    </form>
  );
}