"use client";

import React, { useMemo, useState } from "react";

export default function RobotsTxtGenerator() {
  const [userAgent, setUserAgent] = useState("*");
  const [allow, setAllow] = useState("/");
  const [disallow, setDisallow] = useState("/admin/");
  const [sitemap, setSitemap] = useState("");
  const [crawlDelay, setCrawlDelay] = useState("");
  const [host, setHost] = useState("");
  const [extraRules, setExtraRules] = useState([]);
  const [copied, setCopied] = useState(false);

  const generatedRobots = useMemo(() => {
    const lines = [];

    lines.push(`User-agent: ${userAgent.trim() || "*"}`);

    if (allow.trim()) {
      lines.push(`Allow: ${allow.trim()}`);
    }

    if (disallow.trim()) {
      lines.push(`Disallow: ${disallow.trim()}`);
    }

    if (crawlDelay.trim()) {
      lines.push(`Crawl-delay: ${crawlDelay.trim()}`);
    }

    if (host.trim()) {
      lines.push(`Host: ${host.trim()}`);
    }

    extraRules.forEach((rule) => {
      if (rule.type && rule.value.trim()) {
        lines.push(`${rule.type}: ${rule.value.trim()}`);
      }
    });

    if (sitemap.trim()) {
      lines.push("");
      lines.push(`Sitemap: ${sitemap.trim()}`);
    }

    return lines.join("\n");
  }, [
    userAgent,
    allow,
    disallow,
    sitemap,
    crawlDelay,
    host,
    extraRules,
  ]);

  const addRule = () => {
    setExtraRules((current) => [
      ...current,
      {
        id: Date.now() + Math.random(),
        type: "Disallow",
        value: "",
      },
    ]);
  };

  const updateRule = (id, field, value) => {
    setExtraRules((current) =>
      current.map((rule) =>
        rule.id === id
          ? {
              ...rule,
              [field]: value,
            }
          : rule
      )
    );
  };

  const removeRule = (id) => {
    setExtraRules((current) =>
      current.filter((rule) => rule.id !== id)
    );
  };

  const copyRobots = async () => {
    try {
      await navigator.clipboard.writeText(generatedRobots);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  const downloadRobots = () => {
    const blob = new Blob([generatedRobots], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "robots.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const resetTool = () => {
    setUserAgent("*");
    setAllow("/");
    setDisallow("/admin/");
    setSitemap("");
    setCrawlDelay("");
    setHost("");
    setExtraRules([]);
    setCopied(false);
  };

  const applyPreset = (preset) => {
    if (preset === "standard") {
      setUserAgent("*");
      setAllow("/");
      setDisallow("/admin/");
      setCrawlDelay("");
      setHost("");
    }

    if (preset === "wordpress") {
      setUserAgent("*");
      setAllow("/");
      setDisallow("/wp-admin/");
      setCrawlDelay("");
      setHost("");
    }

    if (preset === "private") {
      setUserAgent("*");
      setAllow("");
      setDisallow("/");
      setCrawlDelay("");
      setHost("");
    }

    if (preset === "seo") {
      setUserAgent("*");
      setAllow("/");
      setDisallow("/admin/");
      setCrawlDelay("");
      setHost("");
    }
  };

  const inputStyle = {
    width: "100%",
    minHeight: "44px",
    padding: "11px 13px",
    borderRadius: "10px",
    border: "1px solid var(--rtg-border)",
    background: "var(--rtg-input)",
    color: "var(--rtg-text)",
    outline: "none",
    fontSize: "14px",
    transition: "border-color .2s ease, box-shadow .2s ease",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "7px",
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--rtg-muted)",
  };

  return (
    <div className="robots-tool">
      <div className="robots-card">
        {/* Header */}
        <div className="robots-header">
          <div>
            <div className="robots-eyebrow">
              SEO & CRAWLER CONTROL
            </div>

            <h2>Robots.txt Generator</h2>

            <p>
              Build a clean, search-engine friendly robots.txt file
              with live rules and sitemap support.
            </p>
          </div>

          <div className="robots-header-icon">
            {"</>"}
          </div>
        </div>

        {/* Presets */}
        <div className="preset-section">
          <div className="section-title">
            Quick presets
          </div>

          <div className="preset-grid">
            <button
              type="button"
              onClick={() => applyPreset("standard")}
            >
              Standard SEO
            </button>

            <button
              type="button"
              onClick={() => applyPreset("wordpress")}
            >
              WordPress
            </button>

            <button
              type="button"
              onClick={() => applyPreset("seo")}
            >
              SEO Friendly
            </button>

            <button
              type="button"
              onClick={() => applyPreset("private")}
            >
              Block Everything
            </button>
          </div>
        </div>

        <div className="robots-layout">
          {/* LEFT */}
          <div className="settings-panel">
            <div className="panel-heading">
              <div>
                <h3>Configuration</h3>
                <span>Define crawler access rules</span>
              </div>
            </div>

            <div className="field">
              <label style={labelStyle}>
                User-agent
              </label>

              <select
                value={userAgent}
                onChange={(e) => setUserAgent(e.target.value)}
                style={inputStyle}
              >
                <option value="*">All crawlers (*)</option>
                <option value="Googlebot">Googlebot</option>
                <option value="Bingbot">Bingbot</option>
                <option value="Googlebot-Image">
                  Googlebot-Image
                </option>
                <option value="GPTBot">GPTBot</option>
                <option value="ChatGPT-User">
                  ChatGPT-User
                </option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {userAgent === "Custom" && (
              <div className="field">
                <label style={labelStyle}>
                  Custom user-agent
                </label>

                <input
                  value=""
                  onChange={(e) => setUserAgent(e.target.value)}
                  placeholder="ExampleBot"
                  style={inputStyle}
                />
              </div>
            )}

            <div className="two-columns">
              <div className="field">
                <label style={labelStyle}>
                  Allow path
                </label>

                <input
                  value={allow}
                  onChange={(e) => setAllow(e.target.value)}
                  placeholder="/"
                  style={inputStyle}
                />
              </div>

              <div className="field">
                <label style={labelStyle}>
                  Disallow path
                </label>

                <input
                  value={disallow}
                  onChange={(e) => setDisallow(e.target.value)}
                  placeholder="/admin/"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="two-columns">
              <div className="field">
                <label style={labelStyle}>
                  Sitemap URL
                </label>

                <input
                  value={sitemap}
                  onChange={(e) => setSitemap(e.target.value)}
                  placeholder="https://example.com/sitemap.xml"
                  style={inputStyle}
                />
              </div>

              <div className="field">
                <label style={labelStyle}>
                  Crawl delay
                </label>

                <input
                  value={crawlDelay}
                  onChange={(e) => setCrawlDelay(e.target.value)}
                  placeholder="5"
                  inputMode="numeric"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="field">
              <label style={labelStyle}>
                Host
              </label>

              <input
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="example.com"
                style={inputStyle}
              />

              <small>
                Optional. Useful for crawlers that support the
                Host directive.
              </small>
            </div>

            {/* Extra Rules */}
            <div className="extra-rules">
              <div className="extra-heading">
                <div>
                  <h3>Advanced rules</h3>
                  <span>
                    Add custom Allow, Disallow or Sitemap rules
                  </span>
                </div>

                <button
                  type="button"
                  onClick={addRule}
                  className="add-rule"
                >
                  + Add rule
                </button>
              </div>

              {extraRules.length === 0 && (
                <div className="empty-rules">
                  No additional rules added.
                </div>
              )}

              {extraRules.map((rule) => (
                <div
                  className="rule-row"
                  key={rule.id}
                >
                  <select
                    value={rule.type}
                    onChange={(e) =>
                      updateRule(
                        rule.id,
                        "type",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="Allow">Allow</option>
                    <option value="Disallow">
                      Disallow
                    </option>
                    <option value="Sitemap">
                      Sitemap
                    </option>
                    <option value="Crawl-delay">
                      Crawl-delay
                    </option>
                    <option value="Host">Host</option>
                  </select>

                  <input
                    value={rule.value}
                    onChange={(e) =>
                      updateRule(
                        rule.id,
                        "value",
                        e.target.value
                      )
                    }
                    placeholder="/private/"
                    style={inputStyle}
                  />

                  <button
                    type="button"
                    className="remove-rule"
                    onClick={() => removeRule(rule.id)}
                    aria-label="Remove rule"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="preview-panel">
            <div className="preview-heading">
              <div>
                <h3>Live Preview</h3>
                <span>Your robots.txt file</span>
              </div>

              <div className="status">
                <span />
                Ready
              </div>
            </div>

            <div className="code-window">
              <div className="code-topbar">
                <span>robots.txt</span>

                <button
                  type="button"
                  onClick={copyRobots}
                  className="copy-button"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <pre>
                <code>{generatedRobots}</code>
              </pre>
            </div>

            <div className="preview-stats">
              <div>
                <strong>
                  {generatedRobots.split("\n").length}
                </strong>
                <span>Lines</span>
              </div>

              <div>
                <strong>
                  {generatedRobots.length}
                </strong>
                <span>Characters</span>
              </div>

              <div>
                <strong>
                  {extraRules.length + 1}
                </strong>
                <span>Rule groups</span>
              </div>
            </div>

            <div className="action-row">
              <button
                type="button"
                className="primary-action"
                onClick={downloadRobots}
              >
                ↓ Download robots.txt
              </button>

              <button
                type="button"
                className="secondary-action"
                onClick={resetTool}
              >
                Reset
              </button>
            </div>

            <div className="tip-box">
              <div className="tip-icon">i</div>

              <div>
                <strong>SEO tip</strong>
                <p>
                  Keep important public pages allowed and only
                  block private, duplicate or admin areas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .robots-tool {
          --rtg-text: #111827;
          --rtg-muted: #667085;
          --rtg-border: #d9dee8;
          --rtg-input: #ffffff;
          --rtg-card: #ffffff;
          --rtg-soft: #f6f8fb;
          --rtg-code: #111827;

          width: 100%;
          padding: 24px 0;
          color: var(--rtg-text);
        }

        .robots-card {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          background: var(--rtg-card);
          border: 1px solid var(--rtg-border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(16, 24, 40, 0.07);
        }

        .robots-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 30px 32px;
          border-bottom: 1px solid var(--rtg-border);
        }

        .robots-eyebrow {
          margin-bottom: 7px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #635bff;
        }

        .robots-header h2 {
          margin: 0;
          font-size: 27px;
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -0.025em;
        }

        .robots-header p {
          margin: 8px 0 0;
          color: var(--rtg-muted);
          font-size: 14px;
          line-height: 1.6;
        }

        .robots-header-icon {
          width: 58px;
          height: 58px;
          flex: 0 0 58px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: #f0edff;
          color: #635bff;
          font-size: 17px;
          font-weight: 800;
          font-family: monospace;
        }

        .preset-section {
          padding: 20px 32px;
          background: var(--rtg-soft);
          border-bottom: 1px solid var(--rtg-border);
        }

        .section-title {
          margin-bottom: 10px;
          font-size: 12px;
          font-weight: 700;
          color: var(--rtg-muted);
        }

        .preset-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .preset-grid button,
        .add-rule,
        .copy-button,
        .action-row button,
        .remove-rule {
          font-family: inherit;
          cursor: pointer;
        }

        .preset-grid button {
          min-height: 38px;
          padding: 0 13px;
          border: 1px solid var(--rtg-border);
          border-radius: 9px;
          background: var(--rtg-input);
          color: var(--rtg-text);
          font-size: 13px;
          font-weight: 600;
        }

        .preset-grid button:hover {
          border-color: #635bff;
        }

        .robots-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }

        .settings-panel,
        .preview-panel {
          min-width: 0;
          padding: 28px 32px;
        }

        .settings-panel {
          border-right: 1px solid var(--rtg-border);
        }

        .panel-heading,
        .preview-heading,
        .extra-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .panel-heading h3,
        .preview-heading h3,
        .extra-heading h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 750;
        }

        .panel-heading span,
        .preview-heading span,
        .extra-heading span {
          display: block;
          margin-top: 4px;
          color: var(--rtg-muted);
          font-size: 12px;
        }

        .field {
          margin-bottom: 17px;
        }

        .field small {
          display: block;
          margin-top: 6px;
          color: var(--rtg-muted);
          font-size: 11px;
        }

        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .extra-rules {
          margin-top: 26px;
          padding-top: 23px;
          border-top: 1px solid var(--rtg-border);
        }

        .add-rule {
          min-height: 36px;
          padding: 0 12px;
          border: 1px solid #635bff;
          border-radius: 9px;
          background: transparent;
          color: #635bff;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .empty-rules {
          padding: 15px;
          border: 1px dashed var(--rtg-border);
          border-radius: 10px;
          color: var(--rtg-muted);
          text-align: center;
          font-size: 12px;
        }

        .rule-row {
          display: grid;
          grid-template-columns: 135px minmax(0, 1fr) 40px;
          gap: 8px;
          margin-bottom: 9px;
        }

        .remove-rule {
          min-height: 44px;
          border: 1px solid var(--rtg-border);
          border-radius: 10px;
          background: var(--rtg-input);
          color: #ef4444;
          font-size: 22px;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border-radius: 20px;
          background: #ecfdf3;
          color: #027a48;
          font-size: 11px;
          font-weight: 700;
        }

        .status span {
          width: 6px;
          height: 6px;
          margin: 0;
          border-radius: 50%;
          background: #12b76a;
        }

        .code-window {
          overflow: hidden;
          border: 1px solid var(--rtg-border);
          border-radius: 12px;
          background: var(--rtg-code);
        }

        .code-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 42px;
          padding: 0 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          color: #98a2b3;
          font-family: monospace;
          font-size: 11px;
        }

        .copy-button {
          border: 0;
          background: transparent;
          color: #d0d5dd;
          font-size: 11px;
          font-weight: 700;
        }

        .copy-button:hover {
          color: white;
        }

        .code-window pre {
          min-height: 260px;
          max-height: 360px;
          overflow: auto;
          margin: 0;
          padding: 20px;
          color: #e5e7eb;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 13px;
          line-height: 1.8;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .preview-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 12px;
        }

        .preview-stats div {
          padding: 12px;
          border: 1px solid var(--rtg-border);
          border-radius: 10px;
          background: var(--rtg-soft);
        }

        .preview-stats strong {
          display: block;
          font-size: 16px;
        }

        .preview-stats span {
          margin-top: 3px;
          font-size: 10px;
          color: var(--rtg-muted);
        }

        .action-row {
          display: flex;
          gap: 8px;
          margin-top: 15px;
        }

        .action-row button {
          min-height: 42px;
          padding: 0 15px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 700;
        }

        .primary-action {
          flex: 1;
          border: 1px solid #635bff;
          background: #635bff;
          color: white;
        }

        .secondary-action {
          border: 1px solid var(--rtg-border);
          background: var(--rtg-input);
          color: var(--rtg-text);
        }

        .tip-box {
          display: flex;
          gap: 10px;
          margin-top: 15px;
          padding: 13px;
          border: 1px solid var(--rtg-border);
          border-radius: 10px;
          background: var(--rtg-soft);
        }

        .tip-icon {
          width: 22px;
          height: 22px;
          flex: 0 0 22px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #e0e7ff;
          color: #4338ca;
          font-size: 11px;
          font-weight: 800;
        }

        .tip-box strong {
          font-size: 12px;
        }

        .tip-box p {
          margin: 3px 0 0;
          color: var(--rtg-muted);
          font-size: 11px;
          line-height: 1.5;
        }

        @media (max-width: 850px) {
          .robots-layout {
            grid-template-columns: 1fr;
          }

          .settings-panel {
            border-right: 0;
            border-bottom: 1px solid var(--rtg-border);
          }
        }

        @media (max-width: 600px) {
          .robots-tool {
            padding: 10px 0;
          }

          .robots-card {
            border-radius: 14px;
          }

          .robots-header,
          .preset-section,
          .settings-panel,
          .preview-panel {
            padding: 20px 16px;
          }

          .robots-header {
            align-items: flex-start;
          }

          .robots-header h2 {
            font-size: 22px;
          }

          .robots-header-icon {
            width: 45px;
            height: 45px;
            flex-basis: 45px;
          }

          .two-columns {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .rule-row {
            grid-template-columns: 1fr 40px;
          }

          .rule-row select {
            grid-column: 1 / -1;
          }

          .rule-row input {
            grid-column: 1;
          }

          .rule-row .remove-rule {
            grid-column: 2;
            grid-row: 2;
          }

          .extra-heading {
            align-items: flex-start;
          }

          .preview-stats {
            grid-template-columns: 1fr;
          }

          .action-row {
            flex-direction: column;
          }

          .primary-action,
          .secondary-action {
            width: 100%;
          }
        }

        @media (prefers-color-scheme: dark) {
          .robots-tool {
            --rtg-text: #f5f7fa;
            --rtg-muted: #98a2b3;
            --rtg-border: #303644;
            --rtg-input: #171b24;
            --rtg-card: #11151d;
            --rtg-soft: #171b24;
            --rtg-code: #090c11;
          }

          .robots-header-icon {
            background: rgba(99, 91, 255, 0.15);
          }

          .status {
            background: rgba(18, 183, 106, 0.12);
          }

          .tip-icon {
            background: rgba(99, 91, 255, 0.15);
          }
        }
      `}</style>
    </div>
  );
}