"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  Eye,
  Pencil,
  ImagePlus,
  Image as ImageIcon,
  Search,
  X,
  Wrench,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Link as LinkIcon,
  Table2,
  Swords,
  ThumbsUp,
  Lightbulb,
  AlertTriangle,
  ListOrdered,
  LayoutGrid,
  Hash,
  CheckSquare,
  HelpCircle,
  MousePointerClick,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { renderMarkdown } from "@/lib/markdown";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { TOOLS, getToolBySlug } from "@/data/tools";
import BlogContent from "@/components/blog/BlogContent";
import ToolCtaCard from "@/components/blog/ToolCtaCard";

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const MAX_TOOLS = 3;

// Blocks the editor can insert. Syntax is documented in docs/BLOG_FORMATTING.md
const BLOCKS = [
  {
    label: "Table",
    icon: Table2,
    text: "| Feature | Option A | Option B |\n| --- | --- | --- |\n| Speed | Fast | Slower |\n| Price | Free | Paid |",
  },
  {
    label: "VS table",
    icon: Table2,
    text: "| Feature | Tool A | Tool B |\n| --- | :---: | :---: |\n| Free to use | ✓ | ✓ |\n| No sign-up | ✓ | ✗ |\n| Works offline | ✗ | ✓ |",
  },
  {
    label: "VS cards",
    icon: Swords,
    text: ":::vs Option A | Option B\n- Strength one\n- Strength two\n---\n- Strength one\n- Strength two\n:::",
  },
  {
    label: "Pros / Cons",
    icon: ThumbsUp,
    text: ":::proscons\n- First advantage\n- Second advantage\n---\n- First drawback\n- Second drawback\n:::",
  },
  { label: "Tip", icon: Lightbulb, text: ":::tip Pro tip\nWrite the helpful tip here.\n:::" },
  { label: "Warning", icon: AlertTriangle, text: ":::warning Watch out\nWrite the warning here.\n:::" },
  {
    label: "Key takeaways",
    icon: CheckSquare,
    text: ":::takeaways\n- Main point one\n- Main point two\n- Main point three\n:::",
  },
  {
    label: "Steps",
    icon: ListOrdered,
    text: ":::steps\n1. **First step.** What to do.\n2. **Second step.** What to do next.\n3. **Third step.** Finish up.\n:::",
  },
  {
    label: "Cards",
    icon: LayoutGrid,
    text: ":::cards\n- Card title | Short description | /tools\n- Another card | Short description | /blog\n:::",
  },
  { label: "Stats", icon: Hash, text: ":::stats\n- 128 | bits in a UUID\n- 10,000 | per click\n- 6 | formats\n:::" },
  {
    label: "FAQ",
    icon: HelpCircle,
    text: ":::faq\n### First question?\nAnswer to the first question.\n### Second question?\nAnswer to the second question.\n:::",
  },
];

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
  const [relatedTools, setRelatedTools] = useState([]); // slugs, first one is the main "Try it now" card
  const [toolQuery, setToolQuery] = useState("");
  const [tab, setTab] = useState("write"); // "write" | "preview"
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [insertingImage, setInsertingImage] = useState(false);
  const contentRef = useRef(null);
  const [picker, setPicker] = useState(null); // null | "tool" | "post" (insert-card popover)
  const [pickerQuery, setPickerQuery] = useState("");
  const [allPosts, setAllPosts] = useState([]); // for ":::post" cards (internal linking)

  const rendered = useMemo(() => renderMarkdown(content), [content]);

  const toolMatches = useMemo(() => {
    const q = toolQuery.trim().toLowerCase();
    if (!q) return [];
    return TOOLS.filter(
      (t) => t.implemented !== false && !relatedTools.includes(t.slug) && (t.name.toLowerCase().includes(q) || t.slug.includes(q))
    ).slice(0, 7);
  }, [toolQuery, relatedTools]);

  // Existing posts, so you can drop a "Read next" card for any of them into this article
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("posts")
      .select("title, slug, meta_description, cover_image, category")
      .or("published.is.null,published.eq.true")
      .order("published_at", { ascending: false })
      .limit(200)
      .then(({ data }) => setAllPosts((data || []).filter((p) => p.slug !== slug)));
  }, [slug]);

  const linkedPosts = useMemo(() => Object.fromEntries(allPosts.map((p) => [p.slug, p])), [allPosts]);

  const pickerResults = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (picker === "tool") {
      return TOOLS.filter((t) => t.implemented !== false && (!q || t.name.toLowerCase().includes(q) || t.slug.includes(q)))
        .slice(0, 8)
        .map((t) => ({ slug: t.slug, label: t.name }));
    }
    if (picker === "post") {
      return allPosts
        .filter((p) => !q || p.title.toLowerCase().includes(q) || p.slug.includes(q))
        .slice(0, 8)
        .map((p) => ({ slug: p.slug, label: p.title }));
    }
    return [];
  }, [picker, pickerQuery, allPosts]);

  function pickCard(kind, slugValue) {
    insertText(`:::${kind} ${slugValue}`, { block: true });
    setPicker(null);
    setPickerQuery("");
  }

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
          setRelatedTools(
            (data.related_tool || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .slice(0, MAX_TOOLS)
          );
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

  // Insert text at the cursor (or replace the selection). `block` puts it on its own lines.
  function insertText(text, { block = false } = {}) {
    const textarea = contentRef.current;
    const start = textarea ? textarea.selectionStart : content.length;
    const end = textarea ? textarea.selectionEnd : content.length;
    let insert = text;
    if (block) {
      const before = content.slice(0, start);
      const after = content.slice(end);
      const lead = before.length === 0 || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
      const tail = after.startsWith("\n\n") || after.length === 0 ? "\n" : after.startsWith("\n") ? "\n" : "\n\n";
      insert = `${lead}${text}${tail}`;
    }
    const next = content.slice(0, start) + insert + content.slice(end);
    setContent(next);
    setTab("write");
    requestAnimationFrame(() => {
      const ta = contentRef.current;
      if (!ta) return;
      ta.focus();
      const pos = start + insert.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function wrapSelection(before, after = before, placeholder = "text") {
    const textarea = contentRef.current;
    if (!textarea) return insertText(`${before}${placeholder}${after}`);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  async function handleInsertContentImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // allow picking the same file again later
    setError("");
    setInsertingImage(true);
    try {
      const { url } = await uploadImageToCloudinary(file);
      insertText(`![${file.name.replace(/\.[^.]+$/, "")}](${url})`, { block: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setInsertingImage(false);
    }
  }

  function addTool(slugValue) {
    if (relatedTools.length >= MAX_TOOLS || relatedTools.includes(slugValue)) return;
    setRelatedTools([...relatedTools, slugValue]);
    setToolQuery("");
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
      related_tool: relatedTools.length ? relatedTools.join(",") : null,
      published,
    };

    const { error: saveError } = isEditMode
      ? await supabase.from("posts").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", postId)
      : await supabase.from("posts").insert({ ...payload, published_at: new Date().toISOString() });

    setSaving(false);

    if (saveError) {
      if (saveError.message.includes("related_tool")) {
        setError(
          "The posts table has no related_tool column yet. Run this once in the Supabase SQL editor, then save again:  alter table posts add column related_tool text;"
        );
      } else if (saveError.message.includes("duplicate") || saveError.message.includes("unique")) {
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

  const inputCls =
    "w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none";
  const tbBtn =
    "inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-2.5 py-1.5 text-xs font-medium text-muted transition hover:border-brand hover:text-brand";
  const primaryTool = getToolBySlug(relatedTools[0]);

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">{isEditMode ? "Edit post" : "New post"}</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-4 rounded-card border border-line bg-surface p-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Title</span>
          <input value={title} onChange={(e) => handleTitleChange(e.target.value)} className={inputCls} />
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
            className={`${inputCls} font-mono`}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">Category (optional)</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Guides"
              className={inputCls}
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
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Meta description (shown under the title and in Google)
          </span>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            maxLength={160}
            className={`${inputCls} resize-none`}
          />
          <span className="mt-1 block text-right text-xs text-muted">{metaDescription.length}/160</span>
        </label>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Featured image (shown at the top, 16:9 works best, e.g. 1600 × 900)
          </span>
          <div className="flex items-center gap-3">
            {coverPreview && (
              <img src={coverPreview} alt="Cover preview" className="aspect-[16/9] h-16 rounded-lg object-cover" />
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
              <input type="file" accept="image/*" onChange={handleCoverChange} disabled={coverUploading} className="hidden" />
            </label>
            {coverPreview && (
              <button type="button" onClick={() => setCoverPreview(null)} className="text-xs text-muted hover:text-red-600">
                Remove
              </button>
            )}
          </div>
        </div>

        {/* related tool(s) → "Try it now" card at the end of the post */}
        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Related tool(s) — shows a &quot;Try it now&quot; card at the end of the post (up to {MAX_TOOLS}, first one is the big card)
          </span>
          {relatedTools.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {relatedTools.map((s, i) => {
                const t = getToolBySlug(s);
                return (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-light py-1 pl-3 pr-1.5 text-xs font-medium text-brand"
                  >
                    <Wrench size={12} aria-hidden="true" />
                    {t ? t.name : s}
                    {i === 0 && <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] text-white">Main</span>}
                    <button
                      type="button"
                      onClick={() => setRelatedTools(relatedTools.filter((x) => x !== s))}
                      aria-label={`Remove ${t ? t.name : s}`}
                      className="rounded-full p-0.5 hover:bg-brand/20"
                    >
                      <X size={12} aria-hidden="true" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          {relatedTools.length < MAX_TOOLS && (
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                value={toolQuery}
                onChange={(e) => setToolQuery(e.target.value)}
                placeholder="Search a tool to attach, e.g. password generator"
                className={`${inputCls} pl-9`}
              />
              {toolMatches.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-line bg-surface shadow-hover">
                  {toolMatches.map((t) => (
                    <li key={t.slug}>
                      <button
                        type="button"
                        onClick={() => addTool(t.slug)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink hover:bg-brand-light"
                      >
                        {t.name}
                        <span className="font-mono text-[11px] text-muted">{t.slug}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-card border border-line bg-surface p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
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
          <span className="text-xs text-muted">
            {rendered.wordCount} words · {rendered.readingMinutes} min read
          </span>
        </div>

        {tab === "write" ? (
          <>
            {/* formatting + blocks toolbar */}
            <div className="mb-3 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                <button type="button" className={tbBtn} onClick={() => insertText("## Heading", { block: true })}>
                  <Heading2 size={13} aria-hidden="true" /> H2
                </button>
                <button type="button" className={tbBtn} onClick={() => insertText("### Sub heading", { block: true })}>
                  <Heading3 size={13} aria-hidden="true" /> H3
                </button>
                <button type="button" className={tbBtn} onClick={() => wrapSelection("**")}>
                  <Bold size={13} aria-hidden="true" /> Bold
                </button>
                <button type="button" className={tbBtn} onClick={() => wrapSelection("*")}>
                  <Italic size={13} aria-hidden="true" /> Italic
                </button>
                <button type="button" className={tbBtn} onClick={() => wrapSelection("[", "](https://)", "link text")}>
                  <LinkIcon size={13} aria-hidden="true" /> Link
                </button>
                <label
                  className={`${tbBtn} ${insertingImage ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                >
                  {insertingImage ? (
                    <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <ImageIcon size={13} aria-hidden="true" />
                  )}
                  {insertingImage ? "Uploading..." : "Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleInsertContentImage}
                    disabled={insertingImage}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 border-t border-line pt-2">
                <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Insert block</span>
                {BLOCKS.map(({ label, icon: I, text }) => (
                  <button key={label} type="button" className={tbBtn} onClick={() => insertText(text, { block: true })}>
                    <I size={13} aria-hidden="true" /> {label}
                  </button>
                ))}
                <button
                  type="button"
                  className={`${tbBtn} ${picker === "tool" ? "!border-brand !text-brand" : ""}`}
                  onClick={() => {
                    setPicker(picker === "tool" ? null : "tool");
                    setPickerQuery("");
                  }}
                  title="Add a tool card inside the article"
                >
                  <MousePointerClick size={13} aria-hidden="true" /> Tool card
                </button>
                <button
                  type="button"
                  className={`${tbBtn} ${picker === "post" ? "!border-brand !text-brand" : ""}`}
                  onClick={() => {
                    setPicker(picker === "post" ? null : "post");
                    setPickerQuery("");
                  }}
                  title="Add a Read next card linking to another blog post"
                >
                  <BookOpen size={13} aria-hidden="true" /> Post card
                </button>
              </div>
            </div>

            {picker && (
              <div className="mb-3 rounded-lg border border-brand/30 bg-brand-light/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand">
                    {picker === "tool" ? "Pick a tool to add as a card" : "Pick a post to link as a Read next card"}
                  </span>
                  <button type="button" onClick={() => setPicker(null)} aria-label="Close" className="text-muted hover:text-ink">
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
                <input
                  autoFocus
                  value={pickerQuery}
                  onChange={(e) => setPickerQuery(e.target.value)}
                  placeholder={picker === "tool" ? "Search tools..." : "Search your posts..."}
                  className={inputCls}
                />
                <ul className="mt-2 max-h-52 overflow-auto rounded-lg border border-line bg-surface">
                  {pickerResults.length === 0 && (
                    <li className="px-3 py-2 text-sm text-muted">
                      {picker === "post" ? "No other published posts found yet." : "No tools match."}
                    </li>
                  )}
                  {pickerResults.map((r) => (
                    <li key={r.slug}>
                      <button
                        type="button"
                        onClick={() => pickCard(picker, r.slug)}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-ink hover:bg-brand-light"
                      >
                        <span className="truncate">{r.label}</span>
                        <span className="flex-none font-mono text-[11px] text-muted">{r.slug}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write in Markdown. Use the buttons above to insert tables, VS comparisons, tips, steps and more."
              rows={22}
              className="w-full resize-y rounded-lg border border-line bg-paper p-3 font-mono text-sm leading-relaxed text-ink placeholder:text-muted focus:border-brand focus:outline-none"
            />
            <p className="mt-2 text-xs text-muted">
              Plain text works as normal. Blocks use <code className="font-mono">:::name</code> … <code className="font-mono">:::</code>.
              Full list in docs/BLOG_FORMATTING.md.
            </p>
          </>
        ) : (
          <div className="rounded-xl border border-line bg-paper p-4 sm:p-6">
            <div className="mx-auto max-w-[720px]">
              {coverPreview && (
                <img src={coverPreview} alt="" className="mb-6 aspect-[16/9] w-full rounded-2xl border border-line object-cover" />
              )}
              {category && (
                <span className="inline-block rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
                  {category}
                </span>
              )}
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-ink">
                {title || "Post title"}
              </h2>
              {metaDescription && <p className="mt-3 text-base text-muted">{metaDescription}</p>}
              <div className="mt-6">
                {rendered.html ? (
                  <BlogContent html={rendered.html} posts={linkedPosts} />
                ) : (
                  <p className="text-sm text-muted">Nothing to preview yet.</p>
                )}
              </div>
              {primaryTool && (
                <div className="mt-10">
                  <ToolCtaCard tool={primaryTool} variant="end" />
                </div>
              )}
            </div>
          </div>
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
