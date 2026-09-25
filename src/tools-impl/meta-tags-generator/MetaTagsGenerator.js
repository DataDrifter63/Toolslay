"use client";

import React, { useMemo, useState } from "react";

const INITIAL_DATA = {
  title: "",
  description: "",
  keywords: "",
  canonical: "",
  robots: "index, follow",
  author: "",
  language: "en",
  ogTitle: "",
  ogDescription: "",
  ogUrl: "",
  ogImage: "",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
  twitterSite: "",
  themeColor: "#ffffff",
};

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
  hint,
}) {
  return (
    <div className="space-y-2 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-black text-ink uppercase tracking-wider truncate">{label}</label>

        {maxLength ? (
          <span className="text-[10px] font-bold text-muted shrink-0">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>

      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          spellCheck={false}
          className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-ink outline-none resize-y min-h-[86px]"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          spellCheck={false}
          className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-ink outline-none"
        />
      )}

      {hint ? <div className="text-[10px] font-medium text-muted">{hint}</div> : null}
    </div>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <div className="space-y-2 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-black text-ink uppercase tracking-wider truncate">{label}</label>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none cursor-pointer"
      >
        {children}
      </select>
    </div>
  );
}

function SectionTitle({ number, title, description }) {
  return (
    <div className="flex items-start gap-3.5 mb-5 min-w-0">
      <span className="w-7 h-7 rounded-lg bg-brand/10 text-brand text-xs font-black flex items-center justify-center shrink-0">
        {number}
      </span>

      <div className="min-w-0">
        <h3 className="text-sm font-black text-ink tracking-tight truncate">{title}</h3>
        <p className="text-[11px] font-medium text-muted mt-0.5 truncate">{description}</p>
      </div>
    </div>
  );
}

function Icon({ name }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "copy") {
    return (
      <svg {...common}>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    );
  }

  if (name === "download") {
    return (
      <svg {...common}>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
    );
  }

  if (name === "refresh") {
    return (
      <svg {...common}>
        <path d="M20 11a8.1 8.1 0 0 0-15.5-3" />
        <path d="M4 4v4h4" />
        <path d="M4 13a8.1 8.1 0 0 0 15.5 3" />
        <path d="M20 20v-4h-4" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (name === "code") {
    return (
      <svg {...common}>
        <path d="m8 9-4 3 4 3" />
        <path d="m16 9 4 3-4 3" />
        <path d="m14 5-4 14" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export default function MetaTagsGenerator() {
  const [data, setData] = useState(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState("editor");
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const updateField = (field, value) => {
    setData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const generated = useMemo(() => {
    const title = data.title.trim();
    const description = data.description.trim();

    const ogTitle = (data.ogTitle || title).trim();
    const ogDescription = (data.ogDescription || description).trim();

    const twitterTitle = (data.twitterTitle || title).trim();
    const twitterDescription = (
      data.twitterDescription || description
    ).trim();

    const lines = [];

    lines.push(`<meta charset="UTF-8" />`);
    lines.push(
      `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
    );

    if (title) {
      lines.push(`<title>${escapeHtml(title)}</title>`);
    }

    if (description) {
      lines.push(
        `<meta name="description" content="${escapeHtml(
          description
        )}" />`
      );
    }

    if (data.keywords.trim()) {
      lines.push(
        `<meta name="keywords" content="${escapeHtml(
          data.keywords
        )}" />`
      );
    }

    if (data.canonical.trim()) {
      lines.push(
        `<link rel="canonical" href="${escapeHtml(
          data.canonical.trim()
        )}" />`
      );
    }

    if (data.robots.trim()) {
      lines.push(
        `<meta name="robots" content="${escapeHtml(
          data.robots
        )}" />`
      );
    }

    if (data.author.trim()) {
      lines.push(
        `<meta name="author" content="${escapeHtml(
          data.author.trim()
        )}" />`
      );
    }

    if (data.language.trim()) {
      lines.push(
        `<meta http-equiv="content-language" content="${escapeHtml(
          data.language
        )}" />`
      );
    }

    if (data.themeColor.trim()) {
      lines.push(
        `<meta name="theme-color" content="${escapeHtml(
          data.themeColor
        )}" />`
      );
    }

    if (ogTitle) {
      lines.push(
        `<meta property="og:title" content="${escapeHtml(
          ogTitle
        )}" />`
      );
    }

    if (ogDescription) {
      lines.push(
        `<meta property="og:description" content="${escapeHtml(
          ogDescription
        )}" />`
      );
    }

    if (data.ogUrl.trim()) {
      lines.push(
        `<meta property="og:url" content="${escapeHtml(
          data.ogUrl.trim()
        )}" />`
      );
    }

    if (data.ogImage.trim()) {
      lines.push(
        `<meta property="og:image" content="${escapeHtml(
          data.ogImage.trim()
        )}" />`
      );
    }

    if (data.ogType) {
      lines.push(
        `<meta property="og:type" content="${escapeHtml(
          data.ogType
        )}" />`
      );
    }

    if (data.twitterCard) {
      lines.push(
        `<meta name="twitter:card" content="${escapeHtml(
          data.twitterCard
        )}" />`
      );
    }

    if (twitterTitle) {
      lines.push(
        `<meta name="twitter:title" content="${escapeHtml(
          twitterTitle
        )}" />`
      );
    }

    if (twitterDescription) {
      lines.push(
        `<meta name="twitter:description" content="${escapeHtml(
          twitterDescription
        )}" />`
      );
    }

    if (data.twitterImage.trim()) {
      lines.push(
        `<meta name="twitter:image" content="${escapeHtml(
          data.twitterImage.trim()
        )}" />`
      );
    }

    if (data.twitterSite.trim()) {
      lines.push(
        `<meta name="twitter:site" content="${escapeHtml(
          data.twitterSite.trim()
        )}" />`
      );
    }

    return lines.join("\n");
  }, [data]);

  const titleLength = data.title.length;
  const descriptionLength = data.description.length;

  const titleStatus =
    titleLength === 0
      ? "empty"
      : titleLength <= 60
      ? "good"
      : "long";

  const descriptionStatus =
    descriptionLength === 0
      ? "empty"
      : descriptionLength <= 160
      ? "good"
      : "long";

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([generated], {
      type: "text/html;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "meta-tags.html";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    setDownloaded(true);

    setTimeout(() => {
      setDownloaded(false);
    }, 1800);
  };

  const resetTool = () => {
    setData(INITIAL_DATA);
    setCopied(false);
    setDownloaded(false);
    setActiveTab("editor");
  };

  const loadExample = () => {
    setData({
      title: "Premium Digital Marketing Agency",
      description:
        "Grow your business with SEO, Google Ads and high-converting digital marketing strategies.",
      keywords:
        "digital marketing, SEO, Google Ads, content marketing",
      canonical: "https://example.com/",
      robots: "index, follow",
      author: "Your Brand",
      language: "en",
      ogTitle: "Premium Digital Marketing Agency",
      ogDescription:
        "Data-driven SEO, paid advertising and digital marketing solutions for growing brands.",
      ogUrl: "https://example.com/",
      ogImage: "https://example.com/og-image.jpg",
      ogType: "website",
      twitterCard: "summary_large_image",
      twitterTitle: "Premium Digital Marketing Agency",
      twitterDescription:
        "Grow your business with modern digital marketing strategies.",
      twitterImage: "https://example.com/twitter-image.jpg",
      twitterSite: "@yourbrand",
      themeColor: "#ffffff",
    });

    setActiveTab("editor");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* CARD CONTAINER */}
      <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
        
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-xl font-black shrink-0">
              <Icon name="code" />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
                Meta Tags Generator
              </h2>
              <p className="text-[11px] font-bold text-muted mt-0.5 truncate">
                Generate SEO, Open Graph and Twitter meta tags without writing code.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              className="px-4 py-2.5 rounded-xl border border-line bg-paper text-ink hover:bg-surface text-xs font-black uppercase tracking-wider transition-all"
              onClick={loadExample}
            >
              Load Example
            </button>

            <button
              type="button"
              className="px-4 py-2.5 rounded-xl border border-line bg-paper text-[#fb7185] hover:bg-surface text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
              onClick={resetTool}
            >
              <Icon name="refresh" />
              Reset
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center bg-paper border border-line p-1 rounded-xl gap-1 w-fit">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === "editor" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
            onClick={() => setActiveTab("editor")}
          >
            Editor
          </button>

          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === "preview" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
            onClick={() => setActiveTab("preview")}
          >
            Preview
          </button>
        </div>

        {activeTab === "editor" ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-6 items-start min-w-0">
            <div className="space-y-6 min-w-0">
              
              {/* SECTION 1: Core SEO */}
              <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
                <SectionTitle
                  number="01"
                  title="Core SEO"
                  description="The essential metadata search engines use to understand your page."
                />

                <div className="space-y-4">
                  <Field
                    label="Page Title"
                    value={data.title}
                    onChange={(value) => updateField("title", value)}
                    placeholder="e.g. Best Digital Marketing Agency"
                    maxLength={60}
                    hint="Keep the title concise for better search visibility."
                  />

                  <Field
                    label="Meta Description"
                    value={data.description}
                    onChange={(value) => updateField("description", value)}
                    placeholder="Describe what this page is about..."
                    maxLength={160}
                    type="textarea"
                    hint="A clear description can improve search-result CTR."
                  />

                  <Field
                    label="Keywords"
                    value={data.keywords}
                    onChange={(value) => updateField("keywords", value)}
                    placeholder="seo, digital marketing, web design"
                  />

                  <Field
                    label="Canonical URL"
                    value={data.canonical}
                    onChange={(value) => updateField("canonical", value)}
                    placeholder="https://example.com/page"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField
                      label="Robots"
                      value={data.robots}
                      onChange={(value) => updateField("robots", value)}
                    >
                      <option value="index, follow">Index, Follow</option>
                      <option value="noindex, follow">Noindex, Follow</option>
                      <option value="index, nofollow">Index, Nofollow</option>
                      <option value="noindex, nofollow">Noindex, Nofollow</option>
                    </SelectField>

                    <SelectField
                      label="Language"
                      value={data.language}
                      onChange={(value) => updateField("language", value)}
                    >
                      <option value="en">English</option>
                      <option value="ur">Urdu</option>
                      <option value="ar">Arabic</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="es">Spanish</option>
                    </SelectField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Author"
                      value={data.author}
                      onChange={(value) => updateField("author", value)}
                      placeholder="Your name or brand"
                    />

                    <Field
                      label="Theme Color"
                      value={data.themeColor}
                      onChange={(value) => updateField("themeColor", value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Social Sharing */}
              <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
                <SectionTitle
                  number="02"
                  title="Social Sharing"
                  description="Control how your page appears when shared on social platforms."
                />

                <div className="space-y-4">
                  <Field
                    label="Open Graph Title"
                    value={data.ogTitle}
                    onChange={(value) => updateField("ogTitle", value)}
                    placeholder="Leave empty to use Page Title"
                  />

                  <Field
                    label="Open Graph Description"
                    value={data.ogDescription}
                    onChange={(value) => updateField("ogDescription", value)}
                    placeholder="Leave empty to use Meta Description"
                    type="textarea"
                  />

                  <Field
                    label="Open Graph URL"
                    value={data.ogUrl}
                    onChange={(value) => updateField("ogUrl", value)}
                    placeholder="https://example.com/page"
                  />

                  <Field
                    label="Social Image URL"
                    value={data.ogImage}
                    onChange={(value) => updateField("ogImage", value)}
                    placeholder="https://example.com/og-image.jpg"
                  />

                  <SelectField
                    label="Open Graph Type"
                    value={data.ogType}
                    onChange={(value) => updateField("ogType", value)}
                  >
                    <option value="website">Website</option>
                    <option value="article">Article</option>
                    <option value="product">Product</option>
                    <option value="profile">Profile</option>
                  </SelectField>
                </div>
              </div>

              {/* SECTION 3: X / Twitter */}
              <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
                <SectionTitle
                  number="03"
                  title="X / Twitter"
                  description="Create optimized metadata for X/Twitter cards."
                />

                <div className="space-y-4">
                  <SelectField
                    label="Card Type"
                    value={data.twitterCard}
                    onChange={(value) => updateField("twitterCard", value)}
                  >
                    <option value="summary_large_image">Summary Large Image</option>
                    <option value="summary">Summary</option>
                  </SelectField>

                  <Field
                    label="Twitter Title"
                    value={data.twitterTitle}
                    onChange={(value) => updateField("twitterTitle", value)}
                    placeholder="Leave empty to use Page Title"
                  />

                  <Field
                    label="Twitter Description"
                    value={data.twitterDescription}
                    onChange={(value) => updateField("twitterDescription", value)}
                    placeholder="Leave empty to use Meta Description"
                    type="textarea"
                  />

                  <Field
                    label="Twitter Image"
                    value={data.twitterImage}
                    onChange={(value) => updateField("twitterImage", value)}
                    placeholder="https://example.com/twitter.jpg"
                  />

                  <Field
                    label="Twitter / X Handle"
                    value={data.twitterSite}
                    onChange={(value) => updateField("twitterSite", value)}
                    placeholder="@yourbrand"
                  />
                </div>
              </div>

            </div>

            {/* PREVIEW & CODE OUTPUT STICKY COLUMN */}
            <div className="lg:sticky lg:top-6 space-y-6 min-w-0">
              
              <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-xs font-black text-ink uppercase tracking-wider">Generated Code</strong>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="w-full h-80 overflow-auto bg-[#0b1020] text-[#dbeafe] p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">
                  {generated}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-brand text-surface hover:opacity-95 text-xs font-black uppercase tracking-wider transition-opacity flex items-center justify-center gap-2"
                    onClick={copyCode}
                  >
                    {copied ? <Icon name="check" /> : <Icon name="copy" />}
                    {copied ? "Copied" : "Copy Code"}
                  </button>

                  <button
                    type="button"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-line bg-surface text-ink hover:bg-paper text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    onClick={downloadCode}
                  >
                    {downloaded ? <Icon name="check" /> : <Icon name="download" />}
                    {downloaded ? "Downloaded" : "Download"}
                  </button>
                </div>
              </div>

              <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
                <strong className="text-xs font-black text-ink uppercase tracking-wider block">SEO Quick Check</strong>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-line bg-surface">
                    <div className="text-[10px] font-black text-muted uppercase tracking-wider mb-1">Title Length</div>
                    <div className={`text-xs font-black ${titleStatus === "good" ? "text-emerald-600" : titleStatus === "long" ? "text-amber-600" : "text-muted"}`}>
                      {titleLength}/60
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-line bg-surface">
                    <div className="text-[10px] font-black text-muted uppercase tracking-wider mb-1">Description</div>
                    <div className={`text-xs font-black ${descriptionStatus === "good" ? "text-emerald-600" : descriptionStatus === "long" ? "text-amber-600" : "text-muted"}`}>
                      {descriptionLength}/160
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-line bg-surface space-y-2">
                  <div className="text-[10px] font-black text-muted uppercase tracking-wider">Google-style preview</div>

                  {data.title || data.description ? (
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-blue-600 truncate">{data.title || "Your page title"}</div>
                      <div className="text-[10px] font-medium text-emerald-600 truncate">
                        {data.canonical || data.ogUrl || "https://example.com/page"}
                      </div>
                      <div className="text-[11px] text-muted line-clamp-2">
                        {data.description || "Your meta description will appear here."}
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs font-medium text-muted">
                      Start typing your page title and description to see a live search preview.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start min-w-0">
            <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
              <SectionTitle
                number="01"
                title="Search Preview"
                description="See how your metadata may appear in a search result."
              />

              <div className="p-4 rounded-xl border border-line bg-surface space-y-2">
                <div className="text-[10px] font-black text-muted uppercase tracking-wider">Google-style preview</div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-blue-600 truncate">{data.title || "Your page title"}</div>
                  <div className="text-[10px] font-medium text-emerald-600 truncate">
                    {data.canonical || data.ogUrl || "https://example.com/page"}
                  </div>
                  <div className="text-[11px] text-muted line-clamp-2">
                    {data.description || "Your meta description will appear here."}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-line bg-surface">
                  <div className="text-[10px] font-black text-muted uppercase tracking-wider mb-1">Title</div>
                  <div className={`text-xs font-black ${titleStatus === "good" ? "text-emerald-600" : titleStatus === "long" ? "text-amber-600" : "text-muted"}`}>
                    {titleLength === 0 ? "Missing" : titleLength <= 60 ? "Good" : "Too Long"}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-line bg-surface">
                  <div className="text-[10px] font-black text-muted uppercase tracking-wider mb-1">Description</div>
                  <div className={`text-xs font-black ${descriptionStatus === "good" ? "text-emerald-600" : descriptionStatus === "long" ? "text-amber-600" : "text-muted"}`}>
                    {descriptionLength === 0 ? "Missing" : descriptionLength <= 160 ? "Good" : "Too Long"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
              <strong className="text-xs font-black text-ink uppercase tracking-wider block">HTML Output</strong>

              <div className="w-full h-80 overflow-auto bg-[#0b1020] text-[#dbeafe] p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">
                {generated}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand text-surface hover:opacity-95 text-xs font-black uppercase tracking-wider transition-opacity flex items-center justify-center gap-2"
                  onClick={copyCode}
                >
                  {copied ? <Icon name="check" /> : <Icon name="copy" />}
                  {copied ? "Copied" : "Copy Code"}
                </button>

                <button
                  type="button"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-line bg-surface text-ink hover:bg-paper text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  onClick={downloadCode}
                >
                  {downloaded ? <Icon name="check" /> : <Icon name="download" />}
                  {downloaded ? "Downloaded" : "Download"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}