"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import beautify from "js-beautify";
import { Settings2, Zap, Trash2, Copy, BarChart3, RotateCcw, AlertTriangle, Layers, FileText, Check } from "lucide-react";

// --- Demo Sample HTML ---
const DEMO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Demo Page</title>
<style>
body { font-family: sans-serif; margin: 0; padding: 20px; background: #f9f9f9; }
.card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
</style>
</head>
<body>
<div class="container" id="main-wrapper"><div class="card"><h2 style="color: #333;" class="title">Welcome to HTML Pro Formatter</h2><p>This is an unformatted sample snippet with mixed attributes. Click buttons on the right to test presets and sorting!</p><button type="button" class="btn primary" id="action-btn">Click Me</button></div></div>
</body>
</html>`;

// --- Configuration & Presets Database ---
const BEAUTIFICATION_PRESETS = {
  expanded: {
    label: "Expanded (Standard)",
    config: { indent_size: 2, indent_char: " ", max_preserve_newlines: 2, preserve_newlines: true, indent_inner_html: false, wrap_line_length: 0, indent_scripts: "normal", brace_style: "collapse", end_with_newline: false }
  },
  compact: {
    label: "Compact",
    config: { indent_size: 1, max_preserve_newlines: 1, keep_array_indentation: true, indent_inner_html: true, indent_scripts: "keep", brace_style: "collapse", end_with_newline: false }
  },
  bootstrap: {
    label: "Bootstrap Style",
    config: { indent_size: 4, indent_char: " ", wrap_line_length: 120, indent_inner_html: true }
  },
  developer: {
    label: "Developer Focused",
    config: { indent_size: 2, indent_char: " ", max_preserve_newlines: 2, preserve_newlines: true, indent_inner_html: true, wrap_line_length: 80, indent_scripts: "keep", brace_style: "expand" }
  }
};

const ATTRIBUTE_SORT_ORDER = [
  "id", "class", "name", "type", "src", "href", "action", "method", "style", "value", "title", "alt", "width", "height", "data-", "role", "aria-"
];

const sortHtmlAttributes = (htmlString) => {
  if (typeof window === "undefined" || !window.DOMParser) return htmlString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<!DOCTYPE html><html><body>${htmlString}</body></html>`, 'text/html');
    if (!doc.body) return htmlString;

    const allElements = doc.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      const attrs = Array.from(el.attributes);
      if (attrs.length === 0) continue;

      attrs.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        const getIndex = (name) => {
          for (let j = 0; j < ATTRIBUTE_SORT_ORDER.length; j++) {
            if (name.startsWith(ATTRIBUTE_SORT_ORDER[j])) return j;
          }
          return -1;
        };

        const indexA = getIndex(nameA);
        const indexB = getIndex(nameB);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        return nameA.localeCompare(nameB);
      });

      while (el.attributes.length > 0) el.removeAttributeNode(el.attributes[0]);
      for (const attr of attrs) el.setAttribute(attr.name, attr.value);
    }

    if (htmlString.toLowerCase().includes("<!doctype html>") || htmlString.toLowerCase().includes("<html>")) {
       return doc.documentElement.outerHTML;
    }
    return doc.body.innerHTML;
  } catch (err) {
    return htmlString;
  }
};

export default function HtmlFormatterBeautifier() {
  const [input, setInput] = useState(DEMO_HTML);
  const [output, setOutput] = useState("");
  const [preset, setPreset] = useState("expanded");
  const [sortAttributes, setSortAttributes] = useState(true);
  const [copiedState, setCopiedState] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  const formatHTML = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const currentPresetConfig = BEAUTIFICATION_PRESETS[preset].config;
    let formattedHtml = beautify.html(input, currentPresetConfig);

    if (sortAttributes) {
      formattedHtml = sortHtmlAttributes(formattedHtml);
      formattedHtml = beautify.html(formattedHtml, currentPresetConfig);
    }
    setOutput(formattedHtml);
  }, [input, preset, sortAttributes]);

  useEffect(() => {
    if (input) formatHTML();
  }, [input, preset, sortAttributes, formatHTML]);

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {}
  };

  const calculateStats = (text) => {
    const lines = text.split('\n').filter(l => l.trim().length > 0).length;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    return { lines, words, chars };
  };

  const inputStats = useMemo(() => calculateStats(input), [input]);
  const outputStats = useMemo(() => calculateStats(output), [output]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
        
        {/* HEADER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-xl font-black shrink-0">
              <Layers className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-black tracking-widest text-brand uppercase mb-1">
                WEB DEVELOPMENT UTILITY
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
                HTML Pro Formatter
              </h2>
              <p className="text-[11px] font-bold text-muted mt-0.5 truncate">
                Beautify, clean, and format your HTML markup instantly with custom presets.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button 
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-paper text-ink hover:border-brand text-xs font-black uppercase tracking-wider transition-all"
            >
              <Settings2 className="w-4 h-4 text-brand" /> {showSettings ? "Hide Settings" : "Show Settings"}
            </button>
            <button 
              type="button"
              onClick={handleCopy} 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-surface hover:opacity-95 text-xs font-black uppercase tracking-wider transition-opacity shadow-sm"
            >
              {copiedState ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiedState ? "Copied!" : "Copy Output"}
            </button>
          </div>
        </div>

        {/* WORK AREA GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start min-w-0">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-[500px] sm:min-h-[600px] h-[75vh] min-w-0">
            
            {/* Input Panel */}
            <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col h-full min-w-0">
              <div className="bg-surface px-4 py-3 border-b border-line flex items-center justify-between min-w-0">
                <label className="text-xs font-black text-ink uppercase tracking-wider">Raw HTML Input</label>
                <div className="flex gap-1">
                  <button type="button" onClick={handleClear} className="p-1.5 text-muted hover:text-[#fb7185] hover:bg-paper rounded-xl transition-colors" title="Clear All"><Trash2 className="w-4 h-4"/></button>
                  <button type="button" onClick={formatHTML} className="p-1.5 text-muted hover:text-brand hover:bg-paper rounded-xl transition-colors" title="Force Re-Format"><RotateCcw className="w-4 h-4"/></button>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your raw HTML code here..."
                className="w-full h-full flex-grow p-4 bg-surface border-0 text-xs sm:text-sm font-mono leading-relaxed text-ink outline-none resize-none tabular-nums"
                spellCheck="false"
              />
            </div>
            
            {/* Output Panel */}
            <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col h-full min-w-0">
              <div className="bg-surface px-4 py-3 border-b border-line flex items-center justify-between min-w-0">
                <label className="text-xs font-black text-ink uppercase tracking-wider">Formatted & Beautified HTML</label>
                <div className="flex gap-1 pr-1">
                   {input.trim() && !output && <span className="text-[10px] text-[#fb7185] font-black uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Formatting error</span>}
                </div>
              </div>
              <textarea
                readOnly
                value={output}
                placeholder="Formatted HTML will appear here..."
                className="w-full h-full flex-grow p-4 bg-surface border-0 text-xs sm:text-sm font-mono leading-relaxed text-muted outline-none resize-none tabular-nums"
              />
            </div>
          </div>

          {/* SIDEBAR SETTINGS & STATS */}
          {showSettings && (
            <div className="space-y-6 lg:w-72 lg:max-w-72 flex flex-col h-full min-w-0">
              
              <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
                <div className="flex items-center gap-2 border-b border-line pb-3 min-w-0">
                  <Zap className="w-5 h-5 text-brand" />
                  <h3 className="text-xs font-black text-ink uppercase tracking-wider">Formatting Presets</h3>
                </div>
                
                <div className="space-y-2">
                  {Object.keys(BEAUTIFICATION_PRESETS).map((key) => (
                    <button 
                      type="button"
                      key={key}
                      onClick={() => setPreset(key)}
                      className={`w-full flex items-center gap-3 p-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${preset === key ? 'bg-brand/10 border-brand text-brand' : 'bg-surface border-line text-muted hover:text-ink hover:border-brand/50'}`}
                    >
                      <FileText className="w-4 h-4 shrink-0" /> {BEAUTIFICATION_PRESETS[key].label}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-line space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group bg-surface p-3 rounded-xl border border-line hover:border-brand/50 transition-all select-none">
                    <input type="checkbox" checked={sortAttributes} onChange={(e) => setSortAttributes(e.target.checked)} className="w-4 h-4 accent-brand rounded border-line" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black text-ink uppercase tracking-wider truncate">Intelligent Sorting</span>
                      <span className="text-[10px] font-medium text-muted mt-0.5 truncate">Sorts id, class first then alphabetically.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
                <div className="flex items-center gap-2 border-b border-line pb-3 min-w-0">
                  <BarChart3 className="w-5 h-5 text-brand" />
                  <h3 className="text-xs font-black text-ink uppercase tracking-wider">Real-time Statistics</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  {[
                    { label: "Lines In", val: inputStats.lines },
                    { label: "Words In", val: inputStats.words },
                    { label: "Lines Out", val: outputStats.lines },
                    { label: "Words Out", val: outputStats.words },
                  ].map((stat, i) => (
                    <div key={i} className="p-3 bg-surface border border-line rounded-xl">
                      <strong className="text-lg font-black text-brand block">{stat.val}</strong>
                      <span className="block text-[10px] font-black text-muted uppercase tracking-wider mt-1">{stat.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center text-xs font-bold bg-surface px-3.5 py-2.5 rounded-xl border border-line text-muted">
                   <span>File Size (Chars):</span>
                   <span className="font-mono text-ink">{inputStats.chars} → {outputStats.chars}</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}