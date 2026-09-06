"use client";

import React, { useState, useMemo } from "react";
import { Copy, Download, Check, Settings2, Trash2, AlignLeft, ArrowDownAZ, Eraser, FileText, FileX2 } from "lucide-react";

const DuplicateLineRemover = () => {
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("cleaned");
  const [isCopied, setIsCopied] = useState(false);

  const [caseSensitive, setCaseSensitive] = useState(false);
  const [ignorePunctuation, setIgnorePunctuation] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [sortBy, setSortBy] = useState("original");

  const { cleanedText, removedLinesLog, stats } = useMemo(() => {
    if (!input) return { cleanedText: "", removedLinesLog: [], stats: { original: 0, cleaned: 0, removed: 0 } };

    const lines = input.split("\n");
    const originalCount = lines.length;
    
    const seenMap = new Map();
    const removedTracker = new Map();
    
    let resultLines = [];
    let removedCount = 0;

    lines.forEach((originalLine) => {
      let processLine = originalLine;
      if (trimWhitespace) processLine = processLine.trim();
      
      if (removeEmpty && processLine === "") {
        removedCount++;
        return;
      }

      let compKey = processLine;
      if (!caseSensitive) compKey = compKey.toLowerCase();
      if (ignorePunctuation) compKey = compKey.replace(/[\W_]+/g, "");

      if (seenMap.has(compKey)) {
        const keptLine = seenMap.get(compKey);
        removedTracker.set(keptLine, (removedTracker.get(keptLine) || 0) + 1);
        removedCount++;
      } else {
        seenMap.set(compKey, processLine);
        resultLines.push(processLine);
      }
    });

    if (sortBy === "az") {
      resultLines.sort((a, b) => a.localeCompare(b));
    } else if (sortBy === "za") {
      resultLines.sort((a, b) => b.localeCompare(a));
    }

    const logArray = Array.from(removedTracker.entries()).map(([line, count]) => ({
      line,
      count,
    })).sort((a, b) => b.count - a.count);

    return {
      cleanedText: resultLines.join("\n"),
      removedLinesLog: logArray,
      stats: {
        original: originalCount,
        cleaned: resultLines.length,
        removed: removedCount,
      }
    };
  }, [input, caseSensitive, ignorePunctuation, trimWhitespace, removeEmpty, sortBy]);

  const handleCopy = async () => {
    if (!cleanedText) return;
    try {
      await navigator.clipboard.writeText(cleanedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownload = () => {
    if (!cleanedText) return;
    const blob = new Blob([cleanedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cleaned-list-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-4 space-y-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 h-fit">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Cleaning Rules</h3>
            </div>
            <button onClick={handleClear} className="text-sm text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors">
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Match Sensitivity
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors" />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Case Sensitive (A ≠ a)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={ignorePunctuation} onChange={(e) => setIgnorePunctuation(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors" />
                <div className="flex flex-col">
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Ignore Punctuation & Spaces</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Treats "apple," and "apple " as duplicates</span>
                </div>
              </label>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Data Formatting
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={trimWhitespace} onChange={(e) => setTrimWhitespace(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors" />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Trim Leading/Trailing Spaces</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors" />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Remove Empty / Blank Lines</span>
              </label>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ArrowDownAZ className="w-4 h-4" /> Output Sorting
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 dark:text-slate-200"
              >
                <option value="original">Keep Original Order</option>
                <option value="az">Sort Alphabetically (A to Z)</option>
                <option value="za">Sort Reverse (Z to A)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm text-center">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Lines</span>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.original}</span>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 p-4 rounded-xl shadow-sm text-center">
              <span className="block text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1">Cleaned Lines</span>
              <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stats.cleaned}</span>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 p-4 rounded-xl shadow-sm text-center">
              <span className="block text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider mb-1">Duplicates Removed</span>
              <span className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.removed}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-[400px]">
            
            <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <AlignLeft className="w-4 h-4 text-slate-400" /> Original Text
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your list here...&#10;&#10;apple&#10;banana&#10;apple&#10;orange"
                className="w-full h-full min-h-[350px] p-4 bg-transparent text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 inset-ring"
                spellCheck="false"
              />
            </div>

            <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex space-x-1">
                  <button onClick={() => setActiveTab("cleaned")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'cleaned' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    <FileText className="w-3.5 h-3.5" /> Cleaned List
                  </button>
                  <button onClick={() => setActiveTab("removed")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'removed' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    <FileX2 className="w-3.5 h-3.5" /> Trash Bin
                  </button>
                </div>
                
                {activeTab === "cleaned" && (
                  <div className="flex gap-1 pr-1">
                    <button onClick={handleCopy} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors" title="Copy text">
                      {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button onClick={handleDownload} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors" title="Download .txt">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="w-full h-full min-h-[350px] relative">
                {activeTab === "cleaned" ? (
                  <textarea
                    readOnly
                    value={cleanedText}
                    placeholder="Cleaned list will appear here..."
                    className="w-full h-full absolute inset-0 p-4 bg-transparent text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none"
                  />
                ) : (
                  <div className="absolute inset-0 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-900/50">
                    {removedLinesLog.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                        <Eraser className="w-8 h-8 opacity-50" />
                        <p className="text-sm">No duplicates found yet.</p>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {removedLinesLog.map((log, i) => (
                          <li key={i} className="flex justify-between items-start gap-4 text-sm font-mono p-2 bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/30 rounded-md shadow-sm">
                            <span className="text-red-700 dark:text-red-400 break-words flex-1">
                              {log.line === "" ? <span className="italic opacity-50">{"(Empty Line)"}</span> : log.line}
                            </span>
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 text-xs font-bold rounded-full flex-shrink-0">
                              {log.count} deleted
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Strict explicit export to prevent registry object errors
export default DuplicateLineRemover;