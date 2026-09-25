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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-base font-black shrink-0 font-mono">
              {"</>"}
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-black tracking-widest text-brand uppercase mb-1">
                SEO & CRAWLER CONTROL
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
                Robots.txt Generator
              </h2>
              <p className="text-[11px] font-bold text-muted mt-0.5 truncate">
                Build a clean, search-engine friendly robots.txt file with live rules and sitemap support.
              </p>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="p-4 sm:p-5 rounded-2xl bg-paper border border-line space-y-3 min-w-0">
          <div className="text-xs font-black uppercase tracking-wider text-muted">
            Quick presets
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset("standard")}
              className="px-4 py-2 rounded-xl border border-line bg-surface text-ink hover:border-brand text-xs font-black uppercase tracking-wider transition-all"
            >
              Standard SEO
            </button>

            <button
              type="button"
              onClick={() => applyPreset("wordpress")}
              className="px-4 py-2 rounded-xl border border-line bg-surface text-ink hover:border-brand text-xs font-black uppercase tracking-wider transition-all"
            >
              WordPress
            </button>

            <button
              type="button"
              onClick={() => applyPreset("seo")}
              className="px-4 py-2 rounded-xl border border-line bg-surface text-ink hover:border-brand text-xs font-black uppercase tracking-wider transition-all"
            >
              SEO Friendly
            </button>

            <button
              type="button"
              onClick={() => applyPreset("private")}
              className="px-4 py-2 rounded-xl border border-line bg-surface text-[#fb7185] hover:border-[#fb7185] text-xs font-black uppercase tracking-wider transition-all"
            >
              Block Everything
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start min-w-0">
          
          {/* LEFT: Configuration */}
          <div className="bg-paper border border-line p-5 rounded-2xl space-y-5 min-w-0">
            <div className="border-b border-line pb-4 min-w-0">
              <h3 className="text-sm font-black text-ink uppercase tracking-wider">Configuration</h3>
              <span className="text-[11px] font-medium text-muted mt-0.5 block">Define crawler access rules</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">
                  User-agent
                </label>
                <select
                  value={userAgent}
                  onChange={(e) => setUserAgent(e.target.value)}
                  className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-bold text-ink outline-none cursor-pointer"
                >
                  <option value="*">All crawlers (*)</option>
                  <option value="Googlebot">Googlebot</option>
                  <option value="Bingbot">Bingbot</option>
                  <option value="Googlebot-Image">Googlebot-Image</option>
                  <option value="GPTBot">GPTBot</option>
                  <option value="ChatGPT-User">ChatGPT-User</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {userAgent === "Custom" && (
                <div>
                  <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">
                    Custom user-agent
                  </label>
                  <input
                    value=""
                    onChange={(e) => setUserAgent(e.target.value)}
                    placeholder="ExampleBot"
                    className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-mono text-ink outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">
                    Allow path
                  </label>
                  <input
                    value={allow}
                    onChange={(e) => setAllow(e.target.value)}
                    placeholder="/"
                    className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-mono text-ink outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">
                    Disallow path
                  </label>
                  <input
                    value={disallow}
                    onChange={(e) => setDisallow(e.target.value)}
                    placeholder="/admin/"
                    className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-mono text-ink outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">
                    Sitemap URL
                  </label>
                  <input
                    value={sitemap}
                    onChange={(e) => setSitemap(e.target.value)}
                    placeholder="https://example.com/sitemap.xml"
                    className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-mono text-ink outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">
                    Crawl delay
                  </label>
                  <input
                    value={crawlDelay}
                    onChange={(e) => setCrawlDelay(e.target.value)}
                    placeholder="5"
                    inputMode="numeric"
                    className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-mono text-ink outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">
                  Host
                </label>
                <input
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="example.com"
                  className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-mono text-ink outline-none"
                />
                <small className="block mt-1 text-[10px] font-medium text-muted">
                  Optional. Useful for crawlers that support the Host directive.
                </small>
              </div>

              {/* Extra Rules */}
              <div className="pt-5 border-t border-line space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black text-ink uppercase tracking-wider">Advanced rules</h3>
                    <span className="text-[10px] font-medium text-muted">Add custom Allow, Disallow or Sitemap rules</span>
                  </div>

                  <button
                    type="button"
                    onClick={addRule}
                    className="px-3 py-2 rounded-xl border border-brand bg-brand/10 text-brand text-xs font-black uppercase tracking-wider transition-all hover:bg-brand/20 shrink-0"
                  >
                    + Add rule
                  </button>
                </div>

                {extraRules.length === 0 && (
                  <div className="p-4 border border-dashed border-line rounded-xl text-center text-xs font-medium text-muted bg-surface">
                    No additional rules added.
                  </div>
                )}

                <div className="space-y-2">
                  {extraRules.map((rule) => (
                    <div className="grid grid-cols-1 sm:grid-cols-[135px_1fr_40px] gap-2 items-center" key={rule.id}>
                      <select
                        value={rule.type}
                        onChange={(e) => updateRule(rule.id, "type", e.target.value)}
                        className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-bold text-ink outline-none cursor-pointer"
                      >
                        <option value="Allow">Allow</option>
                        <option value="Disallow">Disallow</option>
                        <option value="Sitemap">Sitemap</option>
                        <option value="Crawl-delay">Crawl-delay</option>
                        <option value="Host">Host</option>
                      </select>

                      <input
                        value={rule.value}
                        onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                        placeholder="/private/"
                        className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-mono text-ink outline-none"
                      />

                      <button
                        type="button"
                        className="w-full h-11 border border-line rounded-xl bg-surface text-[#fb7185] font-bold text-base flex items-center justify-center hover:bg-[#fb7185]/10 transition-all"
                        onClick={() => removeRule(rule.id)}
                        aria-label="Remove rule"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="bg-paper border border-line p-5 rounded-2xl space-y-5 min-w-0">
            <div className="flex items-center justify-between border-b border-line pb-4 min-w-0">
              <div>
                <h3 className="text-sm font-black text-ink uppercase tracking-wider">Live Preview</h3>
                <span className="text-[11px] font-medium text-muted mt-0.5 block">Your robots.txt file</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ready
              </div>
            </div>

            <div className="border border-line rounded-xl overflow-hidden bg-[#0b1020]">
              <div className="flex items-center justify-between h-10 px-4 border-b border-white/10 text-[#98a2b3] font-mono text-[11px]">
                <span>robots.txt</span>
                <button
                  type="button"
                  onClick={copyRobots}
                  className="font-bold text-[#d0d5dd] hover:text-white transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <pre className="p-4 text-[#e5e7eb] font-mono text-xs leading-relaxed overflow-auto max-h-[320px] whitespace-pre-wrap break-words">
                <code>{generatedRobots}</code>
              </pre>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-line bg-surface">
                <strong className="block text-base font-black text-ink">{generatedRobots.split("\n").length}</strong>
                <span className="text-[10px] font-black text-muted uppercase tracking-wider">Lines</span>
              </div>

              <div className="p-3 rounded-xl border border-line bg-surface">
                <strong className="block text-base font-black text-ink">{generatedRobots.length}</strong>
                <span className="text-[10px] font-black text-muted uppercase tracking-wider">Characters</span>
              </div>

              <div className="p-3 rounded-xl border border-line bg-surface">
                <strong className="block text-base font-black text-ink">{extraRules.length + 1}</strong>
                <span className="text-[10px] font-black text-muted uppercase tracking-wider">Rule groups</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                className="flex-1 px-4 py-3 rounded-xl bg-brand text-surface hover:opacity-95 text-xs font-black uppercase tracking-wider transition-opacity text-center"
                onClick={downloadRobots}
              >
                ↓ Download robots.txt
              </button>

              <button
                type="button"
                className="px-4 py-3 rounded-xl border border-line bg-surface text-ink hover:bg-paper text-xs font-black uppercase tracking-wider transition-all"
                onClick={resetTool}
              >
                Reset
              </button>
            </div>

            <div className="p-4 rounded-xl border border-line bg-surface flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                i
              </div>
              <div className="min-w-0">
                <strong className="text-xs font-black text-ink block">SEO tip</strong>
                <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                  Keep important public pages allowed and only block private, duplicate or admin areas.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}