"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import beautify from "js-beautify";
import { Settings2, Zap, Trash2, Copy, BarChart3, RotateCcw, AlertTriangle, Layers, FileText, Check } from "lucide-react";

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

const HtmlFormatterBeautifier = () => {
  const [input, setInput] = useState("");
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
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">HTML Pro Formatter</h2>
          <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase hidden sm:block">Client-Side</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all"
          >
            <Settings2 className="w-4 h-4" /> {showSettings ? "Hide Settings" : "Show Settings"}
          </button>
          <button onClick={handleCopy} className="flex items-center gap-2 text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
            {copiedState ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiedState ? "Copied!" : "Copy Output"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 items-start">
        
        {/* Work Area - Fixed Height Applied Here */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-[600px] h-[75vh]">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Raw HTML Input</label>
              <div className="flex gap-1">
                <button onClick={() => setInput("")} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Clear All"><Trash2 className="w-4 h-4"/></button>
                <button onClick={formatHTML} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors" title="Force Re-Format"><RotateCcw className="w-4 h-4"/></button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your raw HTML code here..."
              className="w-full h-full flex-grow p-4 bg-transparent text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              spellCheck="false"
            />
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Formatted & Beautified HTML</label>
              <div className="flex gap-1 pr-1">
                 {input.trim() && !output && <span className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Formatting error</span>}
              </div>
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Formatted HTML will appear here..."
              className="w-full h-full flex-grow p-4 bg-slate-50/50 dark:bg-slate-800/30 text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* Sidebar */}
        {showSettings && (
          <div className="space-y-6 lg:w-72 lg:max-w-72 flex flex-col h-full">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Zap className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Formatting Presets</h3>
              </div>
              
              <div className="space-y-2">
                {Object.keys(BEAUTIFICATION_PRESETS).map((key) => (
                  <button 
                    key={key}
                    onClick={() => setPreset(key)}
                    className={`w-full flex items-center gap-3 p-3 text-sm font-medium rounded-lg transition-colors border ${preset === key ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 text-indigo-700 dark:text-indigo-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'}`}
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" /> {BEAUTIFICATION_PRESETS[key].label}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input type="checkbox" checked={sortAttributes} onChange={(e) => setSortAttributes(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Intelligent Attribute Sorting</span>
                    <span className="text-xs text-slate-400">Sorts id, class first then alphabetically.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Real-time Statistics</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                {[
                  { label: "Lines In", val: inputStats.lines },
                  { label: "Words In", val: inputStats.words },
                  { label: "Lines Out", val: outputStats.lines },
                  { label: "Words Out", val: outputStats.words },
                ].map((stat, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{stat.val}</span>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">{stat.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-md mt-2">
                 <span className="text-slate-600 dark:text-slate-300">File Size (Chars):</span>
                 <span className="font-bold text-slate-800 dark:text-slate-100">{inputStats.chars} ➔ {outputStats.chars}</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default HtmlFormatterBeautifier;