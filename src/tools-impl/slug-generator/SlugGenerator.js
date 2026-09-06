"use client";

import React, { useState, useMemo } from "react";
import { Copy, Download, Check, Settings2, Trash2, Link, Scissors, Filter, Globe2, FileText, SplitSquareHorizontal } from "lucide-react";

// Common SEO Stop Words
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", 
  "of", "with", "by", "from", "up", "about", "into", "over", "after", "is", "are", "am"
]);

const SlugGenerator = () => {
  const [input, setInput] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Pro Settings
  const [separator, setSeparator] = useState("-");
  const [removeStopWords, setRemoveStopWords] = useState(true);
  const [maxLength, setMaxLength] = useState(0); // 0 means no limit
  const [strictLowercase, setStrictLowercase] = useState(true);
  const [removeDiacritics, setRemoveDiacritics] = useState(true); // e.g. café -> cafe

  // Engine
  const { slugs, stats } = useMemo(() => {
    if (!input) return { slugs: "", stats: { total: 0, seoOptimized: 0 } };

    const lines = input.split("\n");
    let seoOptimizedCount = 0;

    const processedSlugs = lines.map(line => {
      if (!line.trim()) return "";

      let slug = line;

      // 1. Remove accents/diacritics (café -> cafe)
      if (removeDiacritics) {
        slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }

      // 2. Lowercase
      if (strictLowercase) {
        slug = slug.toLowerCase();
      }

      // 3. Remove Special Characters (Keep alphanumeric and spaces/separators)
      slug = slug.replace(/[^a-zA-Z0-9\s-]/g, " ");

      // 4. Remove Stop Words (SEO Feature)
      if (removeStopWords) {
        const words = slug.split(/\s+/);
        const filteredWords = words.filter(word => !STOP_WORDS.has(word.toLowerCase()));
        if (words.length !== filteredWords.length) seoOptimizedCount++;
        slug = filteredWords.join(" ");
      }

      // 5. Apply Separator and trim excess
      slug = slug.trim().replace(/\s+/g, separator);

      // 6. Smart Truncation (Don't cut words in half if possible)
      if (maxLength > 0 && slug.length > maxLength) {
        let truncated = slug.substring(0, maxLength);
        // Try to cut at the last separator to avoid half-words
        const lastSeparatorIndex = truncated.lastIndexOf(separator);
        if (lastSeparatorIndex > 0) {
          truncated = truncated.substring(0, lastSeparatorIndex);
        }
        slug = truncated;
      }

      // Final cleanup for dangling separators
      if (separator) {
        const sepRegex = new RegExp(`^\\${separator}+|\\${separator}+$`, 'g');
        slug = slug.replace(sepRegex, '');
      }

      return slug;
    });

    return {
      slugs: processedSlugs.join("\n"),
      stats: {
        total: lines.filter(l => l.trim()).length,
        seoOptimized: seoOptimizedCount
      }
    };
  }, [input, separator, removeStopWords, maxLength, strictLowercase, removeDiacritics]);

  const handleCopy = async () => {
    if (!slugs) return;
    try {
      await navigator.clipboard.writeText(slugs);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownloadCSV = () => {
    if (!input || !slugs) return;
    
    // Create CSV mapping Original Title -> Slug
    const originalLines = input.split("\n");
    const slugLines = slugs.split("\n");
    
    let csvContent = "Original Title,Generated Slug\n";
    originalLines.forEach((line, index) => {
      if (line.trim() || slugLines[index]) {
        // Escape quotes for CSV
        const safeTitle = `"${line.replace(/"/g, '""')}"`;
        const safeSlug = `"${slugLines[index].replace(/"/g, '""')}"`;
        csvContent += `${safeTitle},${safeSlug}\n`;
      }
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seo-slugs-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Settings Sidebar */}
        <div className="lg:col-span-4 space-y-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 h-fit">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Slug Rules</h3>
            </div>
            <button onClick={() => setInput("")} className="text-sm text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors">
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>

          <div className="space-y-5">
            {/* SEO Pro Features */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-500" /> SEO Optimization (Pro)
              </label>
              <label className="flex items-center gap-3 cursor-pointer group bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <input type="checkbox" checked={removeStopWords} onChange={(e) => setRemoveStopWords(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Remove Stop Words</span>
                  <span className="text-xs text-slate-400">Drops a, an, the, and, or, but, etc.</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <input type="checkbox" checked={removeDiacritics} onChange={(e) => setRemoveDiacritics(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Remove Accents (café ➔ cafe)</span>
                  <span className="text-xs text-slate-400">Makes foreign words URL-safe</span>
                </div>
              </label>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <SplitSquareHorizontal className="w-4 h-4 text-blue-500" /> Word Separator
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setSeparator("-")} className={`py-2 text-sm font-mono rounded-lg border transition-colors ${separator === "-" ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600"}`}>
                  Hyphen (-)
                </button>
                <button onClick={() => setSeparator("_")} className={`py-2 text-sm font-mono rounded-lg border transition-colors ${separator === "_" ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600"}`}>
                  Underscore (_)
                </button>
                <button onClick={() => setSeparator("")} className={`py-2 text-sm font-mono rounded-lg border transition-colors ${separator === "" ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600"}`}>
                  None
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-amber-500" /> Smart Truncation Length
              </label>
              <select
                value={maxLength}
                onChange={(e) => setMaxLength(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 dark:text-slate-200"
              >
                <option value={0}>No Limit (Keep full length)</option>
                <option value={50}>50 Chars (Strict SEO)</option>
                <option value={60}>60 Chars (Standard SEO)</option>
                <option value={75}>75 Chars (Long SEO)</option>
              </select>
            </div>
            
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={strictLowercase} onChange={(e) => setStrictLowercase(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Force Lowercase</span>
              </label>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Titles</span>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.total}</span>
              </div>
              <FileText className="w-8 h-8 text-slate-200 dark:text-slate-700" />
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">SEO Optimized</span>
                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.seoOptimized}</span>
              </div>
              <Globe2 className="w-8 h-8 text-emerald-200 dark:text-emerald-800/50" />
            </div>
          </div>

          {/* Dual Panels for Bulk Processing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-[450px]">
            
            {/* Input Side */}
            <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <FileText className="w-4 h-4 text-slate-400" /> Original Titles (Bulk)
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste titles here (one per line)...&#10;&#10;How to Bake a Cake in 2024&#10;10 Tips for the Best SEO!&#10;Café au Lait Recipe"
                className="w-full h-full min-h-[400px] p-4 bg-transparent text-sm font-sans leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 inset-ring"
                spellCheck="false"
              />
            </div>

            {/* Output Side */}
            <div className="flex flex-col bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-white dark:bg-slate-800 px-3 py-2 border-b border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400 px-1">
                  <Link className="w-4 h-4" /> Ready Slugs
                </div>
                
                <div className="flex gap-1">
                  <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-300 dark:bg-indigo-900/50 dark:hover:bg-indigo-800/60 rounded-md transition-colors">
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? "Copied" : "Copy"}
                  </button>
                  <button onClick={handleDownloadCSV} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md transition-colors" title="Export as CSV Map">
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                </div>
              </div>
              
              <textarea
                readOnly
                value={slugs}
                placeholder="seo-optimized-slugs-will-appear-here"
                className="w-full h-full min-h-[400px] p-4 bg-transparent text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SlugGenerator;