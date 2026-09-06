"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ArrowRightLeft, GitMerge, FileCheck, Trash2, Check, Copy, Download, ChevronRight, ChevronLeft } from "lucide-react";

// --- Advanced Diffing Algorithms ---
const tokenize = (text) => text.split(/(\s+)/);

const lcs = (arr1, arr2, ignoreCase, ignoreWhitespace) => {
  const compare = (a, b) => {
    if (ignoreWhitespace && a.trim() === "" && b.trim() === "") return true;
    return ignoreCase ? a.toLowerCase() === b.toLowerCase() : a === b;
  };

  const matrix = Array(arr1.length + 1).fill(null).map(() => Array(arr2.length + 1).fill(0));
  for (let i = 1; i <= arr1.length; i++) {
    for (let j = 1; j <= arr2.length; j++) {
      if (compare(arr1[i - 1], arr2[j - 1])) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
  }

  let i = arr1.length, j = arr2.length;
  const diff = [];
  while (i > 0 && j > 0) {
    if (compare(arr1[i - 1], arr2[j - 1])) {
      diff.unshift({ type: "equal", value: arr1[i - 1] });
      i--; j--;
    } else if (matrix[i - 1][j] > matrix[i][j - 1]) {
      diff.unshift({ type: "removed", value: arr1[i - 1] });
      i--;
    } else {
      diff.unshift({ type: "added", value: arr2[j - 1] });
      j--;
    }
  }
  while (i > 0) { diff.unshift({ type: "removed", value: arr1[i - 1] }); i--; }
  while (j > 0) { diff.unshift({ type: "added", value: arr2[j - 1] }); j--; }
  return diff;
};

// Groups line-by-line diffs into logical blocks for the Merge Editor
const groupDiffsIntoBlocks = (lineDiffs) => {
  const blocks = [];
  let currentBlock = null;

  lineDiffs.forEach((diff) => {
    if (diff.type === "equal") {
      if (currentBlock) blocks.push(currentBlock);
      blocks.push({ type: "equal", lines: [diff.value] });
      currentBlock = null;
    } else {
      if (!currentBlock) currentBlock = { type: "conflict", removed: [], added: [], resolvedValue: null };
      if (diff.type === "removed") currentBlock.removed.push(diff.value);
      if (diff.type === "added") currentBlock.added.push(diff.value);
    }
  });
  if (currentBlock) blocks.push(currentBlock);

  // Consolidate adjacent equal blocks
  return blocks.reduce((acc, curr) => {
    if (acc.length > 0 && curr.type === "equal" && acc[acc.length - 1].type === "equal") {
      acc[acc.length - 1].lines.push(...curr.lines);
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);
};

export default function TextDiffChecker() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [blocks, setBlocks] = useState(null);
  
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCompare = useCallback(() => {
    const lines1 = text1.split("\n");
    const lines2 = text2.split("\n");
    const lineDiffs = lcs(lines1, lines2, ignoreCase, ignoreWhitespace);
    const groupedBlocks = groupDiffsIntoBlocks(lineDiffs);
    
    // Add unique IDs for state management during merge
    setBlocks(groupedBlocks.map((b, i) => ({ ...b, id: i })));
  }, [text1, text2, ignoreCase, ignoreWhitespace]);

  const handleSwap = () => {
    setText1(text2);
    setText2(text1);
    setBlocks(null);
  };

  const handleClear = () => {
    setText1("");
    setText2("");
    setBlocks(null);
  };

  // Merge Resolution Handlers
  const resolveBlock = (id, resolutionType) => {
    setBlocks(blocks.map(b => {
      if (b.id !== id) return b;
      let resolvedValue = "";
      if (resolutionType === "left") resolvedValue = b.removed.join("\n");
      if (resolutionType === "right") resolvedValue = b.added.join("\n");
      if (resolutionType === "both") resolvedValue = [...b.removed, ...b.added].join("\n");
      return { ...b, resolvedValue };
    }));
  };

  const getMergedText = () => {
    if (!blocks) return "";
    return blocks.map(b => {
      if (b.type === "equal") return b.lines.join("\n");
      return b.resolvedValue !== null ? b.resolvedValue : b.removed.join("\n"); // fallback to left
    }).join("\n");
  };

  const handleCopyMerged = async () => {
    await navigator.clipboard.writeText(getMergedText());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadMerged = () => {
    const blob = new Blob([getMergedText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `merged-document-${Date.now()}.txt`;
    link.click();
  };

  // Analytics
  const stats = useMemo(() => {
    if (!blocks) return null;
    let added = 0, removed = 0, equal = 0;
    blocks.forEach(b => {
      if (b.type === "equal") equal += b.lines.length;
      else { added += b.added.length; removed += b.removed.length; }
    });
    const total = added + removed + equal;
    const similarity = total === 0 ? 0 : Math.round((equal / total) * 100);
    const conflictsRemaining = blocks.filter(b => b.type === "conflict" && b.resolvedValue === null).length;
    return { similarity, added, removed, conflictsRemaining };
  }, [blocks]);

  // Word-level highlight render
  const renderWordDiff = (oldLine, newLine) => {
    const oldTokens = tokenize(oldLine || "");
    const newTokens = tokenize(newLine || "");
    const wordDiffs = lcs(oldTokens, newTokens, ignoreCase, ignoreWhitespace);

    const oldRender = [], newRender = [];
    wordDiffs.forEach((token, i) => {
      if (token.type === "equal") {
        oldRender.push(<span key={i}>{token.value}</span>);
        newRender.push(<span key={i}>{token.value}</span>);
      } else if (token.type === "removed") {
        oldRender.push(<span key={i} className="bg-red-200 dark:bg-red-800/50 rounded-sm">{token.value}</span>);
      } else if (token.type === "added") {
        newRender.push(<span key={i} className="bg-green-200 dark:bg-green-800/50 rounded-sm">{token.value}</span>);
      }
    });
    return { oldRender, newRender };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Tool Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={ignoreCase} onChange={(e) => { setIgnoreCase(e.target.checked); setBlocks(null); }} className="rounded text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ignore Case</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => { setIgnoreWhitespace(e.target.checked); setBlocks(null); }} className="rounded text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ignore Whitespace</span>
          </label>
        </div>
        <button onClick={handleClear} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors">
          <Trash2 className="w-4 h-4" /> Clear Inputs
        </button>
      </div>

      {/* Input Area (Hidden when analyzing) */}
      {!blocks && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Version 1 (Left)</label>
              <textarea value={text1} onChange={(e) => setText1(e.target.value)} placeholder="Paste original text..." className="w-full h-80 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500" spellCheck="false" />
            </div>
            <div className="space-y-2 relative">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Version 2 (Right)</label>
                <button onClick={handleSwap} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 p-2 rounded-full shadow-lg hover:scale-105 transition-all z-10 text-slate-600">
                  <ArrowRightLeft className="w-5 h-5" />
                </button>
              </div>
              <textarea value={text2} onChange={(e) => setText2(e.target.value)} placeholder="Paste modified text..." className="w-full h-80 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500" spellCheck="false" />
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button onClick={handleCompare} disabled={!text1 && !text2} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-indigo-500/25 disabled:bg-slate-400">
              <GitMerge className="w-5 h-5" /> Analyze & Merge
            </button>
          </div>
        </div>
      )}

      {/* Interactive Merge Editor */}
      {blocks && (
        <div className="space-y-6 animate-fade-in">
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
            <div className="flex gap-6">
              <div className="text-sm">
                <span className="text-slate-500 block mb-1">Similarity</span>
                <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{stats.similarity}%</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-500 block mb-1">Additions</span>
                <span className="font-bold text-lg text-green-600">+{stats.added}</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-500 block mb-1">Deletions</span>
                <span className="font-bold text-lg text-red-600">-{stats.removed}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setBlocks(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                Edit Texts
              </button>
              <button onClick={handleCopyMerged} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy Merged
              </button>
              <button onClick={handleDownloadMerged} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Merge Blocks */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden font-mono text-sm">
            {blocks.map((block) => {
              if (block.type === "equal") {
                return (
                  <div key={block.id} className="p-4 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 whitespace-pre-wrap">
                    {block.lines.join("\n")}
                  </div>
                );
              }

              // Conflict Block
              const isResolved = block.resolvedValue !== null;
              return (
                <div key={block.id} className={`border-b border-slate-200 dark:border-slate-700 transition-colors ${isResolved ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}`}>
                  
                  {/* Resolution Toolbar */}
                  <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-sans text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                      {isResolved ? "Resolved" : "Conflict Detected"}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => resolveBlock(block.id, "left")} className={`flex items-center gap-1 text-xs font-sans px-3 py-1.5 rounded-md font-semibold transition-colors ${block.resolvedValue === block.removed.join("\n") ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" : "bg-white text-slate-600 hover:bg-red-50 hover:text-red-600 dark:bg-slate-700 dark:text-slate-300"}`}>
                        <ChevronLeft className="w-3 h-3" /> Keep Left
                      </button>
                      <button onClick={() => resolveBlock(block.id, "right")} className={`flex items-center gap-1 text-xs font-sans px-3 py-1.5 rounded-md font-semibold transition-colors ${block.resolvedValue === block.added.join("\n") ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-white text-slate-600 hover:bg-green-50 hover:text-green-600 dark:bg-slate-700 dark:text-slate-300"}`}>
                        Keep Right <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Diff View */}
                  {!isResolved ? (
                    <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
                      <div className="p-4 bg-red-50/30 dark:bg-red-900/10 text-red-800 dark:text-red-300 whitespace-pre-wrap break-words">
                        {block.removed.map((line, i) => {
                          const { oldRender } = renderWordDiff(line, block.added[i]);
                          return <div key={i}>{oldRender}</div>;
                        })}
                      </div>
                      <div className="p-4 bg-green-50/30 dark:bg-green-900/10 text-green-800 dark:text-green-300 whitespace-pre-wrap break-words">
                        {block.added.map((line, i) => {
                          const { newRender } = renderWordDiff(block.removed[i], line);
                          return <div key={i}>{newRender}</div>;
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 whitespace-pre-wrap break-words text-indigo-900 dark:text-indigo-200 relative group">
                      <div className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      {block.resolvedValue || <span className="text-slate-400 italic font-sans text-xs">Block cleared.</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}