"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Space, Copy, CheckCircle2, Sliders, 
  Trash2, Zap, FileText, Activity, Layers, ShieldCheck
} from "lucide-react";

export default function WhitespaceRemover() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [text, setText] = useState(
`   Hello,    world!   
   This is a   multiline 
   
   text with    extra spaces,	tabs, and zero-width spaces​ hidden inside.   `
  );

  // Granular Toggles
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [removeBlankLines, setRemoveBlankLines] = useState(false);
  const [collapseBlankLines, setCollapseBlankLines] = useState(true);
  const [convertTabs, setConvertTabs] = useState(true);
  const [cleanUnicode, setCleanUnicode] = useState(true);
  const [flattenSingleLine, setFlattenSingleLine] = useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- CORE SANITIZATION ENGINE ---
  const results = useMemo(() => {
    if (!text) {
      return {
        output: "",
        stats: { originalLen: 0, cleanedLen: 0, removedCount: 0, percentSaved: "0.0" }
      };
    }

    let processed = text;

    // 1. Clean invisible/weird unicode chars (zero-width spaces, BOM, etc.)
    if (cleanUnicode) {
      processed = processed.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ');
    }

    // 2. Convert tabs to 4 spaces
    if (convertTabs) {
      processed = processed.replace(/\t/g, '    ');
    }

    // Split into lines for line-level processing
    let lines = processed.split(/\r?\n/);

    if (trimLines) {
      lines = lines.map(line => line.trim());
    }

    if (collapseSpaces) {
      lines = lines.map(line => line.replace(/[ \t]{2,}/g, ' '));
    }

    // Filter or collapse blank lines
    if (removeBlankLines) {
      lines = lines.filter(line => line.length > 0);
    } else if (collapseBlankLines) {
      const collapsedLines = [];
      let prevBlank = false;
      for (const line of lines) {
        const isBlank = line.trim().length === 0;
        if (isBlank && prevBlank) continue;
        collapsedLines.push(line);
        prevBlank = isBlank;
      }
      lines = collapsedLines;
    }

    let outputString = lines.join('\n');

    // Flatten to single line if enabled
    if (flattenSingleLine) {
      outputString = outputString.replace(/\r?\n+/g, ' ').replace(/[ \t]{2,}/g, ' ').trim();
    }

    const originalLen = text.length;
    const cleanedLen = outputString.length;
    const removedCount = Math.max(0, originalLen - cleanedLen);
    const percentSaved = originalLen > 0 ? ((removedCount / originalLen) * 100).toFixed(1) : "0.0";

    return {
      output: outputString,
      stats: { originalLen, cleanedLen, removedCount, percentSaved }
    };
  }, [text, collapseSpaces, trimLines, removeBlankLines, collapseBlankLines, convertTabs, cleanUnicode, flattenSingleLine]);

  const handleCopy = () => {
    if (!results.output) return;
    navigator.clipboard.writeText(results.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText("");
  };

  if (!isMounted) return null;

  // Premium Cyan & Blue Theme
  const theme = {
    gradient: "from-cyan-200 via-sky-100 to-transparent dark:from-cyan-900/30 dark:via-sky-900/20",
    bgIcon: "bg-gradient-to-br from-cyan-500 to-blue-600",
    textPri: "text-cyan-600 dark:text-cyan-400",
    textSec: "text-blue-600 dark:text-blue-400",
    borderLight: "border-cyan-200 dark:border-cyan-800/50",
    bgLight: "bg-cyan-50 dark:bg-cyan-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Space className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Whitespace Sanitization Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Deep Space, Tab, Unicode & Line-Break Stripper
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.3fr] gap-6 items-start">
        
        {/* ================= LEFT: CONFIG & INPUT ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 font-sans">
            
            {/* 1. Source Text Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <FileText className={`w-3.5 h-3.5 ${theme.textPri}`} /> Raw Input Text
                </label>
                <button onClick={handleClear} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
              <textarea
                value={text} 
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste messy text, code logs, or multiline content here..."
                rows="7"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-cyan-500 transition-all resize-none leading-relaxed"
                spellCheck="false"
              />
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Granular Rules */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Sliders className={`w-3.5 h-3.5 ${theme.textPri}`} /> Sanitization Pipeline Rules
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Collapse Multiple Spaces", checked: collapseSpaces, onChange: setCollapseSpaces, desc: "Turns '    ' into ' '" },
                  { label: "Trim Line Edges", checked: trimLines, onChange: setTrimLines, desc: "Remove start/end spaces per line" },
                  { label: "Collapse Blank Lines", checked: collapseBlankLines, onChange: setCollapseBlankLines, desc: "Max 1 empty line between blocks" },
                  { label: "Remove All Blank Lines", checked: removeBlankLines, onChange: setRemoveBlankLines, desc: "Strips empty lines completely" },
                  { label: "Convert Tabs to 4 Spaces", checked: convertTabs, onChange: setConvertTabs, desc: "Standardize indentation" },
                  { label: "Strip Invisible Unicode", checked: cleanUnicode, onChange: setCleanUnicode, desc: "Zero-width spaces & BOM" }
                ].map((item, idx) => (
                  <label key={idx} className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-cyan-300 transition-colors">
                    <input type="checkbox" checked={item.checked} onChange={(e) => item.onChange(e.target.checked)} className="w-4 h-4 accent-cyan-500 rounded mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs font-black text-slate-800 dark:text-slate-100">{item.label}</span>
                      <span className="block text-[9px] text-slate-500">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Flatten Mode */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 bg-cyan-50/50 dark:bg-cyan-900/10 rounded-xl border border-cyan-200 dark:border-cyan-800/50 cursor-pointer">
                  <input type="checkbox" checked={flattenSingleLine} onChange={(e) => setFlattenSingleLine(e.target.checked)} className="w-4 h-4 accent-cyan-600 rounded" />
                  <div>
                    <span className="block text-xs font-black text-cyan-900 dark:text-cyan-200">Flatten to Single Line</span>
                    <span className="block text-[9px] text-cyan-600 dark:text-cyan-400">Removes all newlines and converts entire text into one continuous sentence.</span>
                  </div>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: OUTPUT CONSOLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col h-[700px] font-sans">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden transition-colors duration-500">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Cleaned Output
                </span>
                
                <button 
                  onClick={handleCopy} 
                  disabled={!results.output}
                  className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                    copied ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  }`}
                >
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy Output</>}
                </button>
              </div>

              {/* Data Analytics Dashboard */}
              <div className="grid grid-cols-3 gap-2 mb-4 shrink-0">
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <Layers className="w-4 h-4 text-cyan-500 mb-1" />
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">{results.stats.originalLen}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Original Chars</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">{results.stats.removedCount}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Chars Stripped</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <Zap className="w-4 h-4 text-sky-500 mb-1" />
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">-{results.stats.percentSaved}%</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Reduction</span>
                </div>
              </div>

              {/* Output Editor Area */}
              <div className="flex-1 bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden flex flex-col group relative">
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar relative font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all leading-relaxed">
                  {!results.output ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans">
                      <Space className="w-10 h-10 mb-3 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest text-center">
                        Awaiting Valid Input
                      </span>
                    </div>
                  ) : (
                    results.output
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}