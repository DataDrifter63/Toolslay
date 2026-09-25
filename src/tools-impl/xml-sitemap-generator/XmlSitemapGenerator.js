"use client";

import React, { useState, useMemo } from "react";
import { Link2, FileCode2, ShieldCheck, HardDrive } from "lucide-react";
import ToolLayout from "@/components/tools/ui/ToolLayout";
import SettingsPanel from "@/components/tools/ui/SettingsPanel";
import FormField from "@/components/tools/ui/FormField";
import ToolSelect from "@/components/tools/ui/ToolSelect";
import ToolTextarea from "@/components/tools/ui/ToolTextarea";
import OutputPanel from "@/components/tools/ui/OutputPanel";
import CopyButton from "@/components/tools/ui/CopyButton";
import DownloadButton from "@/components/tools/ui/DownloadButton";

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
          <div className="space-y-4 font-sans">
            
            {/* Toggle 1: Smart Prioritization */}
            <div 
              onClick={() => setAutoPriority(!autoPriority)}
              className="flex items-center justify-between p-3 rounded-xl border border-line bg-surface cursor-pointer select-none transition-all hover:border-brand/50"
            >
              <div className="space-y-0.5 pr-3">
                <span className="block text-xs font-black text-ink uppercase tracking-wider">Smart Prioritization</span>
                <span className="block text-[10px] font-medium text-muted leading-snug">Auto-scores priority by URL depth — 1.0 for homepage down to 0.5.</span>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors relative p-1 shrink-0 shadow-inner ${autoPriority ? 'bg-brand' : 'bg-line'}`}>
                <div className={`w-4 h-4 rounded-full bg-surface shadow-sm transition-transform ${autoPriority ? "translate-x-4" : "translate-x-0"}`}></div>
              </div>
            </div>

            {/* Toggle 2: Include LastMod */}
            <div 
              onClick={() => setIncludeLastMod(!includeLastMod)}
              className="flex items-center justify-between p-3 rounded-xl border border-line bg-surface cursor-pointer select-none transition-all hover:border-brand/50"
            >
              <div className="space-y-0.5 pr-3">
                <span className="block text-xs font-black text-ink uppercase tracking-wider">Include &lt;lastmod&gt;</span>
                <span className="block text-[10px] font-medium text-muted leading-snug">Adds today's date to every URL entry.</span>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors relative p-1 shrink-0 shadow-inner ${includeLastMod ? 'bg-brand' : 'bg-line'}`}>
                <div className={`w-4 h-4 rounded-full bg-surface shadow-sm transition-transform ${includeLastMod ? "translate-x-4" : "translate-x-0"}`}></div>
              </div>
            </div>

            <FormField label="Change frequency">
              <ToolSelect options={CHANGE_FREQ_OPTIONS} value={changeFreq} onChange={(e) => setChangeFreq(e.target.value)} />
            </FormField>
          </div>
        </SettingsPanel>
      }
      output={
        <div className="space-y-4 sm:space-y-6 w-full box-border font-sans">
          
          {/* Your URLs Input Panel */}
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Link2 className="w-4 h-4 text-brand" /> Your URLs Source
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-xl border border-brand/30">
                Input List
              </span>
            </div>

            <ToolTextarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste one URL per line — or dump messy text/HTML, links are extracted automatically."
              rows={6}
              spellCheck="false"
              className="font-mono text-xs"
            />
            {results.error && (
              <p className="flex items-center gap-2 rounded-xl border border-[#fb7185]/30 bg-[#fb7185]/10 px-3 py-2 text-xs font-bold text-[#fb7185]">
                {results.error}
              </p>
            )}
          </div>

          {/* Sitemap Output Panel */}
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <FileCode2 className="w-4 h-4 text-brand" /> sitemap.xml Output
              </span>
              <div className="flex items-center gap-2">
                <CopyButton text={results.xml} />
                <DownloadButton blob={results.xml ? new Blob([results.xml], { type: "application/xml" }) : null} filename="sitemap.xml" />
              </div>
            </div>

            {results.stats && (
              <div className="grid grid-cols-3 gap-3">
                <Stat icon={Link2} value={results.stats.count} label="Total URLs" />
                <Stat icon={ShieldCheck} value={results.stats.highPriority} label="High priority" />
                <Stat icon={HardDrive} value={`${results.stats.sizeKb} KB`} label="File size" />
              </div>
            )}

            {results.xml ? (
              <div className="bg-surface border border-line rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center px-3.5 py-2.5 bg-surface border-b border-line font-mono">
                  <span className="text-[10px] text-muted uppercase tracking-wider font-black">sitemap.xml</span>
                </div>
                <div className="p-4 max-h-[380px] overflow-y-auto custom-scrollbar">
                  <pre className="text-xs break-all text-ink leading-relaxed font-mono m-0 whitespace-pre-wrap tabular-nums">
                    <code>{results.xml}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface py-12 text-center text-xs font-bold text-muted font-sans">
                <FileCode2 size={28} className="text-muted/50 mb-1" />
                <span>Add at least one valid URL above to generate a sitemap.</span>
              </div>
            )}
          </div>

        </div>
      }
    />
  );
}

function Stat({ icon: IconCmp, value, label }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface py-3.5 px-2">
      <IconCmp size={15} className="mb-1.5 text-brand" />
      <span className="font-display text-xs sm:text-sm font-black text-ink tabular-nums">{value}</span>
      <span className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-muted text-center">{label}</span>
    </div>
  );
}