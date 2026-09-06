"use client";

import React, { useState, useMemo } from "react";
import { Copy, Download, Check, Settings2, Trash2, AlignLeft, ArrowDownAZ, ArrowUpZA, ArrowDown10, ArrowUp01, Shuffle, ListEnd, FileText, AtSign, Eraser, FileX2 } from "lucide-react";

export default function TextSorter() {
  const [input, setInput] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("sorted"); // 'sorted' or 'removed'

  // Sorting & Cleaning States
  const [sortBy, setSortBy] = useState("az"); 
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);

  // Core Processing Engine
  const { sortedText, removedLinesLog, stats } = useMemo(() => {
    if (!input) return { sortedText: "", removedLinesLog: [], stats: { original: 0, final: 0, removed: 0 } };

    let originalLines = input.split("\n");
    let processedLines = [];
    const removedTracker = new Map();
    const seenMap = new Map();
    let removedCount = 0;

    // 1. Cleaning Phase
    originalLines.forEach((line) => {
      let currentLine = line;
      
      if (trimWhitespace) currentLine = currentLine.trim();
      
      if (removeEmpty && currentLine === "") {
        removedCount++;
        return;
      }

      if (removeDuplicates) {
        let compKey = currentLine;
        if (!caseSensitive) compKey = compKey.toLowerCase();

        if (seenMap.has(compKey)) {
          const keptLine = seenMap.get(compKey);
          removedTracker.set(keptLine, (removedTracker.get(keptLine) || 0) + 1);
          removedCount++;
          return; // Skip duplicate
        } else {
          seenMap.set(compKey, currentLine);
        }
      }

      processedLines.push(currentLine);
    });

    // 2. Advanced Sorting Phase
    let finalLines = [...processedLines];

    switch (sortBy) {
      case "az":
        finalLines.sort((a, b) => caseSensitive ? a.localeCompare(b) : a.toLowerCase().localeCompare(b.toLowerCase()));
        break;
      case "za":
        finalLines.sort((a, b) => caseSensitive ? b.localeCompare(a) : b.toLowerCase().localeCompare(a.toLowerCase()));
        break;
      case "length-asc":
        finalLines.sort((a, b) => a.length - b.length || a.localeCompare(b));
        break;
      case "length-desc":
        finalLines.sort((a, b) => b.length - a.length || a.localeCompare(b));
        break;
      case "numeric":
        finalLines.sort((a, b) => {
          const numA = parseFloat(a.match(/-?\d+(\.\d+)?/)?.[0] || 0);
          const numB = parseFloat(b.match(/-?\d+(\.\d+)?/)?.[0] || 0);
          return numA - numB;
        });
        break;
      case "domain":
        // Premium feature: Sorts by the domain part of an email (e.g. @gmail.com)
        finalLines.sort((a, b) => {
          const domainA = a.includes("@") ? a.split("@").pop().toLowerCase() : a.toLowerCase();
          const domainB = b.includes("@") ? b.split("@").pop().toLowerCase() : b.toLowerCase();
          return domainA.localeCompare(domainB) || a.localeCompare(b);
        });
        break;
      case "reverse-order":
        finalLines.reverse();
        break;
      case "random":
        for (let i = finalLines.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [finalLines[i], finalLines[j]] = [finalLines[j], finalLines[i]];
        }
        break;
      default:
        break;
    }

    const logArray = Array.from(removedTracker.entries()).map(([line, count]) => ({
      line, count,
    })).sort((a, b) => b.count - a.count);

    return {
      sortedText: finalLines.join("\n"),
      removedLinesLog: logArray,
      stats: {
        original: originalLines.length,
        final: finalLines.length,
        removed: removedCount,
      }
    };
  }, [input, sortBy, removeDuplicates, trimWhitespace, removeEmpty, caseSensitive]);

  const handleCopy = async () => {
    if (!sortedText) return;
    try {
      await navigator.clipboard.writeText(sortedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownload = () => {
    if (!sortedText) return;
    const blob = new Blob([sortedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sorted-list-${Date.now()}.txt`;
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
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Sorting Rules</h3>
            </div>
            <button onClick={() => setInput("")} className="text-sm text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors">
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>

          <div className="space-y-5">
            {/* Sort Algorithms */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Primary Sort Method
              </label>
              
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: "az", icon: ArrowDownAZ, label: "Alphabetical (A-Z)" },
                  { id: "za", icon: ArrowUpZA, label: "Reverse (Z-A)" },
                  { id: "length-asc", icon: ArrowDown10, label: "Length (Shortest First)" },
                  { id: "length-desc", icon: ArrowUp01, label: "Length (Longest First)" },
                  { id: "numeric", icon: ArrowDown10, label: "Numeric Extraction" },
                  { id: "domain", icon: AtSign, label: "Email Domain (Pro)" },
                  { id: "reverse-order", icon: ListEnd, label: "Flip Upside Down" },
                  { id: "random", icon: Shuffle, label: "Random Shuffle" },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSortBy(method.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors border ${
                      sortBy === method.id 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                    }`}
                  >
                    <method.icon className="w-4 h-4" />
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List Cleaning Options */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Pre-Sort Formatting
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={removeDuplicates} onChange={(e) => setRemoveDuplicates(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors" />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Remove Duplicate Lines</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={trimWhitespace} onChange={(e) => setTrimWhitespace(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors" />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Trim Spaces & Tabs</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors" />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Clean Empty Lines</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors" />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Case Sensitive Sort</span>
              </label>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm text-center">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Original Lines</span>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.original}</span>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 p-4 rounded-xl shadow-sm text-center">
              <span className="block text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1">Final Result</span>
              <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stats.final}</span>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 p-4 rounded-xl shadow-sm text-center">
              <span className="block text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider mb-1">Cleaned Out</span>
              <span className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.removed}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-[450px]">
            
            {/* Input Side */}
            <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <AlignLeft className="w-4 h-4 text-slate-400" /> Input Data
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste the list you want to sort here...&#10;&#10;Zebra&#10;user@gmail.com&#10;Apple 123&#10;Apple 123"
                className="w-full h-full min-h-[400px] p-4 bg-transparent text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 inset-ring"
                spellCheck="false"
              />
            </div>

            {/* Output Side */}
            <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                
                <div className="flex space-x-1">
                  <button onClick={() => setActiveTab("sorted")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'sorted' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    <FileText className="w-3.5 h-3.5" /> Output
                  </button>
                  <button onClick={() => setActiveTab("removed")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'removed' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    <FileX2 className="w-3.5 h-3.5" /> Trash
                  </button>
                </div>
                
                {activeTab === "sorted" && (
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
              
              <div className="w-full h-full min-h-[400px] relative">
                {activeTab === "sorted" ? (
                  <textarea
                    readOnly
                    value={sortedText}
                    placeholder="Sorted result will appear here..."
                    className="w-full h-full absolute inset-0 p-4 bg-indigo-50/20 dark:bg-slate-900/50 text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none"
                  />
                ) : (
                  <div className="absolute inset-0 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-900/50">
                    {removedLinesLog.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                        <Eraser className="w-8 h-8 opacity-50" />
                        <p className="text-sm">No items in trash.</p>
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
}