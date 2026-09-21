"use client";

import React, { useState, useMemo } from "react";
import { Link2, FileCode2, ShieldCheck, HardDrive } from "lucide-react";
import ToolLayout from "@/components/tools/ui/ToolLayout";
import SettingsPanel from "@/components/tools/ui/SettingsPanel";
import Toggle from "@/components/tools/ui/Toggle";
import FormField from "@/components/tools/ui/FormField";
import ToolSelect from "@/components/tools/ui/ToolSelect";
import ToolTextarea from "@/components/tools/ui/ToolTextarea";
import OutputPanel from "@/components/tools/ui/OutputPanel";
import CopyButton from "@/components/tools/ui/CopyButton";
import DownloadButton from "@/components/tools/ui/DownloadButton";

// NOTE: no internal title/heading here on purpose — the page shell (ToolPageShell)
// already renders the tool's name and description from tools.js. Every tool should
// go straight into its functional UI, never repeat its own name/subtitle again.

const CHANGE_FREQ_OPTIONS = [
  { value: "always", label: "Always" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly (Standard)" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "never", label: "Never" },
];

const SAMPLE_INPUT = `https://example.com
https://example.com/about
https://example.com/blog/hello-world`;

export default function XmlSitemapGenerator() {
  const [rawInput, setRawInput] = useState(SAMPLE_INPUT);
  const [autoPriority, setAutoPriority] = useState(true);
  const [includeLastMod, setIncludeLastMod] = useState(true);
  const [changeFreq, setChangeFreq] = useState("weekly");

  const results = useMemo(() => {
    if (!rawInput.trim()) return { xml: "", error: null, stats: null };

    const urlRegex = /(https?:\/\/[^\s<"']+)/g;
    const matches = rawInput.match(urlRegex) || [];

    const cleanUrls = [];
    const seen = new Set();
    matches.forEach((url) => {
      try {
        const parsed = new URL(url);
        let clean = parsed.href;
        if (clean.endsWith("/") && clean.length > parsed.origin.length + 1) clean = clean.slice(0, -1);
        if (!seen.has(clean)) {
          seen.add(clean);
          cleanUrls.push(clean);
        }
      } catch {
        // skip invalid URLs
      }
    });

    if (cleanUrls.length === 0) {
      return { xml: "", error: "No valid http:// or https:// URLs found in the text above.", stats: null };
    }

    const getPriority = (urlStr) => {
      if (!autoPriority) return "0.8";
      try {
        const path = new URL(urlStr).pathname;
        if (path === "/" || path === "") return "1.0";
        const depth = (path.match(/\//g) || []).length;
        if (depth === 1) return "0.8";
        if (depth === 2) return "0.6";
        return "0.5";
      } catch {
        return "0.5";
      }
    };

    const today = new Date().toISOString().split("T")[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    let highPriority = 0;

    cleanUrls.forEach((url) => {
      const priority = getPriority(url);
      if (priority === "1.0" || priority === "0.8") highPriority++;
      xml += `  <url>\n    <loc>${url}</loc>\n`;
      if (includeLastMod) xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${changeFreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
    });
    xml += `</urlset>`;

    const sizeKb = (new TextEncoder().encode(xml).length / 1024).toFixed(2);

    return { xml, error: null, stats: { count: cleanUrls.length, highPriority, sizeKb } };
  }, [rawInput, autoPriority, includeLastMod, changeFreq]);

  return (
    <ToolLayout
      settings={
        <SettingsPanel title="Sitemap Settings" icon="Settings2">
          <Toggle
            label="Smart Prioritization"
            hint="Auto-scores priority by URL depth — 1.0 for the homepage down to 0.5 for deep pages."
            checked={autoPriority}
            onChange={setAutoPriority}
          />
          <Toggle
            label="Include <lastmod>"
            hint="Adds today's date to every URL entry."
            checked={includeLastMod}
            onChange={setIncludeLastMod}
          />
          <FormField label="Change frequency">
            <ToolSelect options={CHANGE_FREQ_OPTIONS} value={changeFreq} onChange={(e) => setChangeFreq(e.target.value)} />
          </FormField>
        </SettingsPanel>
      }
      output={
        <div className="space-y-6">
          <OutputPanel title="Your URLs">
            <ToolTextarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste one URL per line — or dump messy text/HTML, links are extracted automatically."
              rows={7}
              spellCheck="false"
              className="font-mono text-xs"
            />
            {results.error && (
              <p className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {results.error}
              </p>
            )}
          </OutputPanel>

          <OutputPanel
            title="sitemap.xml"
            actions={
              <>
                <CopyButton text={results.xml} />
                <DownloadButton blob={results.xml ? new Blob([results.xml], { type: "application/xml" }) : null} filename="sitemap.xml" />
              </>
            }
          >
            {results.stats && (
              <div className="mb-4 grid grid-cols-3 gap-3">
                <Stat icon={Link2} value={results.stats.count} label="Total URLs" />
                <Stat icon={ShieldCheck} value={results.stats.highPriority} label="High priority" />
                <Stat icon={HardDrive} value={`${results.stats.sizeKb} KB`} label="File size" />
              </div>
            )}
            {results.xml ? (
              <pre className="max-h-[420px] overflow-auto rounded-lg border border-line bg-paper p-4 font-mono text-xs leading-relaxed text-ink">
                {results.xml}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-paper py-16 text-center text-sm text-muted">
                <FileCode2 size={28} className="text-muted/50" />
                Add at least one valid URL above to generate a sitemap.
              </div>
            )}
          </OutputPanel>
        </div>
      }
    />
  );
}

function Stat({ icon: IconCmp, value, label }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-line bg-paper py-3">
      <IconCmp size={15} className="mb-1 text-brand" />
      <span className="font-display text-sm font-bold text-ink">{value}</span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</span>
    </div>
  );
}
