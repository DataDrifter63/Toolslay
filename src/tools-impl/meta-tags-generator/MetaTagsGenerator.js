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
    <div className="mtg-field">
      <div className="mtg-field-head">
        <label>{label}</label>

        {maxLength ? (
          <span className="mtg-counter">
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
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          spellCheck={false}
        />
      )}

      {hint ? <div className="mtg-hint">{hint}</div> : null}
    </div>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <div className="mtg-field">
      <div className="mtg-field-head">
        <label>{label}</label>
      </div>

      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </div>
  );
}

function SectionTitle({ number, title, description }) {
  return (
    <div className="mtg-section-title">
      <span className="mtg-number">{number}</span>

      <div>
        <h3>{title}</h3>
        <p>{description}</p>
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

  /*
   * IMPORTANT:
   * This updater keeps the same component mounted.
   * It does NOT create a new component and does NOT change input keys.
   * Therefore typing into any input will not cause focus loss.
   */
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

    // Open Graph
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

    // Twitter
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
    <>
      <style jsx>{`
        .mtg-root {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 24px;
          color: var(--foreground, #111827);
        }

        .mtg-shell {
          width: 100%;
          border: 1px solid
            color-mix(
              in srgb,
              var(--foreground, #111827) 12%,
              transparent
            );
          border-radius: 22px;
          background: var(--background, #ffffff);
          overflow: hidden;
          box-shadow: 0 16px 45px rgba(15, 23, 42, 0.07);
        }

        .mtg-top {
          padding: 24px;
          border-bottom: 1px solid
            color-mix(
              in srgb,
              var(--foreground, #111827) 10%,
              transparent
            );
        }

        .mtg-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
        }

        .mtg-brand {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .mtg-logo {
          width: 46px;
          height: 46px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          background: #f1eaff;
          color: #7c3aed;
          flex: 0 0 auto;
        }

        .mtg-title {
          margin: 0;
          font-size: 20px;
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -0.02em;
        }

        .mtg-subtitle {
          margin: 5px 0 0;
          font-size: 13px;
          opacity: 0.62;
        }

        .mtg-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .mtg-btn {
          height: 38px;
          border-radius: 10px;
          border: 1px solid
            color-mix(
              in srgb,
              var(--foreground, #111827) 12%,
              transparent
            );
          background: var(--background, #ffffff);
          color: var(--foreground, #111827);
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            border-color 0.15s ease,
            background 0.15s ease;
        }

        .mtg-btn:hover {
          transform: translateY(-1px);
          border-color: #7c3aed;
        }

        .mtg-btn.primary {
          background: #7c3aed;
          color: white;
          border-color: #7c3aed;
        }

        .mtg-btn.danger:hover {
          border-color: #ef4444;
          color: #ef4444;
        }

        .mtg-body {
          padding: 22px;
        }

        .mtg-tabs {
          display: inline-flex;
          padding: 4px;
          border-radius: 11px;
          background: color-mix(
            in srgb,
            var(--foreground, #111827) 6%,
            transparent
          );
          margin-bottom: 22px;
        }

        .mtg-tab {
          border: 0;
          background: transparent;
          color: var(--foreground, #111827);
          padding: 8px 15px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          opacity: 0.65;
        }

        .mtg-tab.active {
          opacity: 1;
          background: var(--background, #ffffff);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        }

        .mtg-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
          gap: 18px;
          align-items: start;
        }

        .mtg-card {
          border: 1px solid
            color-mix(
              in srgb,
              var(--foreground, #111827) 10%,
              transparent
            );
          border-radius: 17px;
          padding: 19px;
          background: color-mix(
            in srgb,
            var(--background, #ffffff) 96%,
            var(--foreground, #111827) 4%
          );
        }

        .mtg-card + .mtg-card {
          margin-top: 18px;
        }

        .mtg-section-title {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin-bottom: 17px;
        }

        .mtg-number {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #f1eaff;
          color: #7c3aed;
          font-size: 12px;
          font-weight: 800;
          flex: 0 0 auto;
        }

        .mtg-section-title h3 {
          margin: 2px 0 3px;
          font-size: 15px;
          font-weight: 750;
        }

        .mtg-section-title p {
          margin: 0;
          font-size: 12px;
          opacity: 0.58;
          line-height: 1.45;
        }

        .mtg-fields {
          display: grid;
          gap: 14px;
        }

        .mtg-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .mtg-field {
          min-width: 0;
        }

        .mtg-field-head {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 7px;
        }

        .mtg-field label {
          font-size: 12px;
          font-weight: 700;
        }

        .mtg-counter {
          font-size: 10px;
          opacity: 0.48;
          white-space: nowrap;
        }

        .mtg-field input,
        .mtg-field textarea,
        .mtg-field select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid
            color-mix(
              in srgb,
              var(--foreground, #111827) 14%,
              transparent
            );
          background: var(--background, #ffffff);
          color: var(--foreground, #111827);
          border-radius: 10px;
          outline: none;
          font: inherit;
          font-size: 13px;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .mtg-field input,
        .mtg-field select {
          height: 42px;
          padding: 0 12px;
        }

        .mtg-field textarea {
          min-height: 86px;
          resize: vertical;
          padding: 11px 12px;
          line-height: 1.5;
        }

        .mtg-field input:focus,
        .mtg-field textarea:focus,
        .mtg-field select:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        .mtg-hint {
          margin-top: 5px;
          font-size: 10px;
          opacity: 0.48;
        }

        .mtg-preview {
          position: sticky;
          top: 18px;
        }

        .mtg-preview-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 13px;
        }

        .mtg-preview-head strong {
          font-size: 14px;
        }

        .mtg-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 8px;
          border-radius: 999px;
          background: #ecfdf5;
          color: #047857;
        }

        .mtg-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .mtg-code {
          min-height: 470px;
          max-height: 620px;
          overflow: auto;
          border-radius: 13px;
          background: #0b1020;
          color: #dbeafe;
          padding: 17px;
          font-family:
            ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            monospace;
          font-size: 12px;
          line-height: 1.7;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .mtg-code-actions {
          display: flex;
          gap: 8px;
          margin-top: 11px;
        }

        .mtg-code-actions .mtg-btn {
          flex: 1;
        }

        .mtg-seo-score {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 14px;
        }

        .mtg-score {
          padding: 12px;
          border: 1px solid
            color-mix(
              in srgb,
              var(--foreground, #111827) 9%,
              transparent
            );
          border-radius: 11px;
        }

        .mtg-score-label {
          font-size: 10px;
          opacity: 0.55;
          margin-bottom: 5px;
        }

        .mtg-score-value {
          font-size: 13px;
          font-weight: 750;
        }

        .mtg-good {
          color: #059669;
        }

        .mtg-long {
          color: #d97706;
        }

        .mtg-empty {
          opacity: 0.45;
        }

        .mtg-preview-box {
          border: 1px solid
            color-mix(
              in srgb,
              var(--foreground, #111827) 10%,
              transparent
            );
          border-radius: 13px;
          padding: 16px;
          margin-top: 15px;
        }

        .mtg-preview-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          opacity: 0.45;
          margin-bottom: 9px;
        }

        .mtg-google-title {
          font-size: 18px;
          line-height: 1.3;
          color: #2563eb;
          margin-bottom: 5px;
        }

        .mtg-google-url {
          font-size: 11px;
          color: #059669;
          margin-bottom: 5px;
          word-break: break-all;
        }

        .mtg-google-description {
          font-size: 12px;
          line-height: 1.5;
          opacity: 0.68;
        }

        .mtg-empty-preview {
          min-height: 160px;
          display: grid;
          place-items: center;
          text-align: center;
          opacity: 0.48;
          font-size: 12px;
          line-height: 1.6;
        }

        .mtg-mobile-actions {
          display: none;
        }

        @media (max-width: 900px) {
          .mtg-grid {
            grid-template-columns: 1fr;
          }

          .mtg-preview {
            position: static;
          }

          .mtg-mobile-actions {
            display: flex;
          }
        }

        @media (max-width: 640px) {
          .mtg-root {
            padding: 10px;
          }

          .mtg-shell {
            border-radius: 15px;
          }

          .mtg-top,
          .mtg-body {
            padding: 15px;
          }

          .mtg-top-row {
            align-items: flex-start;
          }

          .mtg-actions {
            width: 100%;
          }

          .mtg-actions .mtg-btn {
            flex: 1;
          }

          .mtg-two {
            grid-template-columns: 1fr;
          }

          .mtg-card {
            padding: 14px;
          }

          .mtg-code {
            min-height: 360px;
            font-size: 11px;
          }

          .mtg-seo-score {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div className="mtg-root">
        <div className="mtg-shell">
          <div className="mtg-top">
            <div className="mtg-top-row">
              <div className="mtg-brand">
                <div className="mtg-logo">
                  <Icon name="code" />
                </div>

                <div>
                  <h2 className="mtg-title">Meta Tags Generator</h2>
                  <p className="mtg-subtitle">
                    Generate SEO, Open Graph and Twitter meta tags without
                    writing code.
                  </p>
                </div>
              </div>

              <div className="mtg-actions">
                <button
                  type="button"
                  className="mtg-btn"
                  onClick={loadExample}
                >
                  Load Example
                </button>

                <button
                  type="button"
                  className="mtg-btn danger"
                  onClick={resetTool}
                >
                  <Icon name="refresh" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="mtg-body">
            <div className="mtg-tabs">
              <button
                type="button"
                className={`mtg-tab ${
                  activeTab === "editor" ? "active" : ""
                }`}
                onClick={() => setActiveTab("editor")}
              >
                Editor
              </button>

              <button
                type="button"
                className={`mtg-tab ${
                  activeTab === "preview" ? "active" : ""
                }`}
                onClick={() => setActiveTab("preview")}
              >
                Preview
              </button>
            </div>

            {activeTab === "editor" ? (
              <div className="mtg-grid">
                <div>
                  <div className="mtg-card">
                    <SectionTitle
                      number="01"
                      title="Core SEO"
                      description="The essential metadata search engines use to understand your page."
                    />

                    <div className="mtg-fields">
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
                        onChange={(value) =>
                          updateField("description", value)
                        }
                        placeholder="Describe what this page is about..."
                        maxLength={160}
                        type="textarea"
                        hint="A clear description can improve search-result CTR."
                      />

                      <Field
                        label="Keywords"
                        value={data.keywords}
                        onChange={(value) =>
                          updateField("keywords", value)
                        }
                        placeholder="seo, digital marketing, web design"
                      />

                      <Field
                        label="Canonical URL"
                        value={data.canonical}
                        onChange={(value) =>
                          updateField("canonical", value)
                        }
                        placeholder="https://example.com/page"
                      />

                      <div className="mtg-two">
                        <SelectField
                          label="Robots"
                          value={data.robots}
                          onChange={(value) =>
                            updateField("robots", value)
                          }
                        >
                          <option value="index, follow">
                            Index, Follow
                          </option>
                          <option value="noindex, follow">
                            Noindex, Follow
                          </option>
                          <option value="index, nofollow">
                            Index, Nofollow
                          </option>
                          <option value="noindex, nofollow">
                            Noindex, Nofollow
                          </option>
                        </SelectField>

                        <SelectField
                          label="Language"
                          value={data.language}
                          onChange={(value) =>
                            updateField("language", value)
                          }
                        >
                          <option value="en">English</option>
                          <option value="ur">Urdu</option>
                          <option value="ar">Arabic</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="es">Spanish</option>
                        </SelectField>
                      </div>

                      <div className="mtg-two">
                        <Field
                          label="Author"
                          value={data.author}
                          onChange={(value) =>
                            updateField("author", value)
                          }
                          placeholder="Your name or brand"
                        />

                        <Field
                          label="Theme Color"
                          value={data.themeColor}
                          onChange={(value) =>
                            updateField("themeColor", value)
                          }
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mtg-card">
                    <SectionTitle
                      number="02"
                      title="Social Sharing"
                      description="Control how your page appears when shared on social platforms."
                    />

                    <div className="mtg-fields">
                      <Field
                        label="Open Graph Title"
                        value={data.ogTitle}
                        onChange={(value) =>
                          updateField("ogTitle", value)
                        }
                        placeholder="Leave empty to use Page Title"
                      />

                      <Field
                        label="Open Graph Description"
                        value={data.ogDescription}
                        onChange={(value) =>
                          updateField("ogDescription", value)
                        }
                        placeholder="Leave empty to use Meta Description"
                        type="textarea"
                      />

                      <Field
                        label="Open Graph URL"
                        value={data.ogUrl}
                        onChange={(value) =>
                          updateField("ogUrl", value)
                        }
                        placeholder="https://example.com/page"
                      />

                      <Field
                        label="Social Image URL"
                        value={data.ogImage}
                        onChange={(value) =>
                          updateField("ogImage", value)
                        }
                        placeholder="https://example.com/og-image.jpg"
                      />

                      <SelectField
                        label="Open Graph Type"
                        value={data.ogType}
                        onChange={(value) =>
                          updateField("ogType", value)
                        }
                      >
                        <option value="website">Website</option>
                        <option value="article">Article</option>
                        <option value="product">Product</option>
                        <option value="profile">Profile</option>
                      </SelectField>
                    </div>
                  </div>

                  <div className="mtg-card">
                    <SectionTitle
                      number="03"
                      title="X / Twitter"
                      description="Create optimized metadata for X/Twitter cards."
                    />

                    <div className="mtg-fields">
                      <SelectField
                        label="Card Type"
                        value={data.twitterCard}
                        onChange={(value) =>
                          updateField("twitterCard", value)
                        }
                      >
                        <option value="summary_large_image">
                          Summary Large Image
                        </option>
                        <option value="summary">Summary</option>
                      </SelectField>

                      <Field
                        label="Twitter Title"
                        value={data.twitterTitle}
                        onChange={(value) =>
                          updateField("twitterTitle", value)
                        }
                        placeholder="Leave empty to use Page Title"
                      />

                      <Field
                        label="Twitter Description"
                        value={data.twitterDescription}
                        onChange={(value) =>
                          updateField("twitterDescription", value)
                        }
                        placeholder="Leave empty to use Meta Description"
                        type="textarea"
                      />

                      <Field
                        label="Twitter Image"
                        value={data.twitterImage}
                        onChange={(value) =>
                          updateField("twitterImage", value)
                        }
                        placeholder="https://example.com/twitter.jpg"
                      />

                      <Field
                        label="Twitter / X Handle"
                        value={data.twitterSite}
                        onChange={(value) =>
                          updateField("twitterSite", value)
                        }
                        placeholder="@yourbrand"
                      />
                    </div>
                  </div>
                </div>

                <div className="mtg-preview">
                  <div className="mtg-card">
                    <div className="mtg-preview-head">
                      <strong>Generated Code</strong>

                      <span className="mtg-status">
                        <span className="mtg-status-dot" />
                        Live
                      </span>
                    </div>

                    <div className="mtg-code">{generated}</div>

                    <div className="mtg-code-actions">
                      <button
                        type="button"
                        className="mtg-btn primary"
                        onClick={copyCode}
                      >
                        {copied ? (
                          <Icon name="check" />
                        ) : (
                          <Icon name="copy" />
                        )}

                        {copied ? "Copied" : "Copy Code"}
                      </button>

                      <button
                        type="button"
                        className="mtg-btn"
                        onClick={downloadCode}
                      >
                        {downloaded ? (
                          <Icon name="check" />
                        ) : (
                          <Icon name="download" />
                        )}

                        {downloaded ? "Downloaded" : "Download"}
                      </button>
                    </div>
                  </div>

                  <div className="mtg-card">
                    <div className="mtg-preview-head">
                      <strong>SEO Quick Check</strong>
                    </div>

                    <div className="mtg-seo-score">
                      <div className="mtg-score">
                        <div className="mtg-score-label">
                          TITLE LENGTH
                        </div>

                        <div
                          className={`mtg-score-value mtg-${titleStatus}`}
                        >
                          {titleLength}/60
                        </div>
                      </div>

                      <div className="mtg-score">
                        <div className="mtg-score-label">
                          DESCRIPTION
                        </div>

                        <div
                          className={`mtg-score-value mtg-${descriptionStatus}`}
                        >
                          {descriptionLength}/160
                        </div>
                      </div>
                    </div>

                    <div className="mtg-preview-box">
                      <div className="mtg-preview-label">
                        Google-style preview
                      </div>

                      {data.title || data.description ? (
                        <>
                          <div className="mtg-google-title">
                            {data.title || "Your page title"}
                          </div>

                          <div className="mtg-google-url">
                            {data.canonical ||
                              data.ogUrl ||
                              "https://example.com/page"}
                          </div>

                          <div className="mtg-google-description">
                            {data.description ||
                              "Your meta description will appear here."}
                          </div>
                        </>
                      ) : (
                        <div className="mtg-empty-preview">
                          Start typing your page title and description
                          to see a live search preview.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mtg-grid">
                <div className="mtg-card">
                  <SectionTitle
                    number="01"
                    title="Search Preview"
                    description="See how your metadata may appear in a search result."
                  />

                  <div className="mtg-preview-box">
                    <div className="mtg-preview-label">
                      Google-style preview
                    </div>

                    <div className="mtg-google-title">
                      {data.title || "Your page title"}
                    </div>

                    <div className="mtg-google-url">
                      {data.canonical ||
                        data.ogUrl ||
                        "https://example.com/page"}
                    </div>

                    <div className="mtg-google-description">
                      {data.description ||
                        "Your meta description will appear here."}
                    </div>
                  </div>

                  <div className="mtg-seo-score">
                    <div className="mtg-score">
                      <div className="mtg-score-label">
                        TITLE
                      </div>

                      <div
                        className={`mtg-score-value mtg-${titleStatus}`}
                      >
                        {titleLength === 0
                          ? "Missing"
                          : titleLength <= 60
                          ? "Good"
                          : "Too Long"}
                      </div>
                    </div>

                    <div className="mtg-score">
                      <div className="mtg-score-label">
                        DESCRIPTION
                      </div>

                      <div
                        className={`mtg-score-value mtg-${descriptionStatus}`}
                      >
                        {descriptionLength === 0
                          ? "Missing"
                          : descriptionLength <= 160
                          ? "Good"
                          : "Too Long"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mtg-card">
                  <div className="mtg-preview-head">
                    <strong>HTML Output</strong>
                  </div>

                  <div className="mtg-code">{generated}</div>

                  <div className="mtg-code-actions">
                    <button
                      type="button"
                      className="mtg-btn primary"
                      onClick={copyCode}
                    >
                      {copied ? (
                        <Icon name="check" />
                      ) : (
                        <Icon name="copy" />
                      )}
                      {copied ? "Copied" : "Copy Code"}
                    </button>

                    <button
                      type="button"
                      className="mtg-btn"
                      onClick={downloadCode}
                    >
                      <Icon name="download" />
                      {downloaded ? "Downloaded" : "Download"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}