"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Repeat, Copy, CheckCircle2, Sliders, 
  Hash, ArrowRightLeft, Zap, ShieldAlert,
  FileText, Activity, Trash2
} from "lucide-react";

export default function TextRepeater() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [text, setText] = useState("Muxair Engine");
  const [count, setCount] = useState(10);
  const [delimiter, setDelimiter] = useState("newline"); // newline, space, comma, custom
  const [customDelimiter, setCustomDelimiter] = useState(" | ");
  const [addIndex, setAddIndex] = useState(false);
  const [indexStyle, setIndexStyle] = useState("number"); // number (1.), bracket, roman (i.)
  const [transform, setTransform] = useState("none"); // none, uppercase, lowercase, reverse

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- CORE REPEATER ENGINE ---
  const results = useMemo(() => {
    if (!text) return { output: "", stats: { chars: 0, lines: 0, warning: false } };

    const safeCount = Math.max(1, Math.min(50000, parseInt(count) || 1));
    
    // 1. Transform step
    let processedText = text;
    if (transform === "uppercase") processedText = text.toUpperCase();
    else if (transform === "lowercase") processedText = text.toLowerCase();
    else if (transform === "reverse") processedText = text.split("").reverse().join("");

    // 2. Determine separator
    let separator = "\n";
    if (delimiter === "space") separator = " ";
    else if (delimiter === "comma") separator = ", ";
    else if (delimiter === "custom") separator = customDelimiter;

    // 3. Build array of repeated items
    const items = [];
    for (let i = 0; i < safeCount; i++) {
      let prefix = "";
      if (addIndex) {
        const idx = i + 1;
        if (indexStyle === "number") prefix = `${idx}. `;
        else if (indexStyle === "bracket") prefix = `[${idx}] `;
        else if (indexStyle === "roman") {
          const romanMap = ["", "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
          prefix = `${romanMap[idx] || idx}. `;
        }
      }
      items.push(`${prefix}${processedText}`);
    }

    const outputString = items.join(separator);
    const charsCount = outputString.length;
    const linesCount = outputString.split(/\r?\n/).length;
    const warning = charsCount > 1000000; // Warning if &gt; 1MB string

    return {
      output: outputString,
      stats: { chars: charsCount, lines: linesCount, warning, count: safeCount }
    };
  }, [text, count, delimiter, customDelimiter, addIndex, indexStyle, transform]);

  const handleCopy = () => {
    if (!results.output) return;
    navigator.clipboard.writeText(results.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText("");
  };

  // Premium Pink & Violet Theme
  const theme = {
    gradient: "from-pink-200 via-purple-100 to-transparent dark:from-pink-900/30 dark:via-purple-900/20",
    bgIcon: "bg-gradient-to-br from-pink-500 to-purple-600",
    textPri: "text-pink-600 dark:text-pink-400",
    textSec: "text-purple-600 dark:text-purple-400",
    borderLight: "border-pink-200 dark:border-pink-800/50",
    bgLight: "bg-pink-50 dark:bg-pink-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Repeat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Payload Pattern Repeater
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              High-Velocity Text, Emoji & Sequence Generator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.3fr] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 font-sans">
            
            {/* 1. Source Text Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <FileText className={`w-3.5 h-3.5 ${theme.textPri}`} /> Source Payload
                </label>
                <button onClick={handleClear} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
              <textarea
                value={text} 
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter word, sentence, or emoji..."
                rows="3"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-sans text-slate-800 dark:text-slate-100 outline-none focus:border-pink-500 transition-all resize-none"
                spellCheck="false"
              />
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Count & Delimiter */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Sliders className={`w-3.5 h-3.5 ${theme.textPri}`} /> Frequency &amp; Delimiter
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500">Repeat Count (1 - 50,000)</label>
                  <input 
                    type="number" min="1" max="50000" 
                    value={count} onChange={(e) => setCount(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-pink-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500">Delimiter Style</label>
                  <select 
                    value={delimiter} onChange={(e) => setDelimiter(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="newline">New Line (\n)</option>
                    <option value="space">Space ( )</option>
                    <option value="comma">Comma (, )</option>
                    <option value="custom">Custom String/Emoji</option>
                  </select>
                </div>
              </div>

              {delimiter === "custom" && (
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-bold text-slate-500">Custom Delimiter</label>
                  <input 
                    type="text" 
                    value={customDelimiter} onChange={(e) => setCustomDelimiter(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-pink-500"
                  />
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 3. Sequence Numbering & Transform */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Hash className={`w-3.5 h-3.5 ${theme.textPri}`} /> Sequence &amp; Transformations
              </h3>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input type="checkbox" checked={addIndex} onChange={(e) => setAddIndex(e.target.checked)} className="w-4 h-4 accent-pink-500 rounded" />
                  <div className="flex-1">
                    <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Inject Line/Item Numbering</span>
                    <span className="block text-[9px] text-slate-500">Adds progressive index to each repetition.</span>
                  </div>
                </label>

                {addIndex && (
                  <div className="flex items-center gap-2 pl-4">
                    <span className="text-[10px] font-bold text-slate-400">Format:</span>
                    {['number', 'bracket', 'roman'].map((style) => (
                      <button 
                        key={style} onClick={() => setIndexStyle(style)}
                        className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border transition-all ${indexStyle === style ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-pink-300 dark:border-pink-700' : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-700'}`}
                      >
                        {style === 'number' ? '1.' : style === 'bracket' ? '[i]' : 'i.'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5"><ArrowRightLeft className="w-3 h-3"/> Text Transformation Pipeline</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'uppercase', label: 'ALL CAPS' },
                    { id: 'lowercase', label: 'lower' },
                    { id: 'reverse', label: 'Reverse' }
                  ].map((t) => (
                    <button 
                      key={t.id} onClick={() => setTransform(t.id)}
                      className={`py-2 text-[10px] font-black uppercase rounded-xl border transition-all ${transform === t.id ? theme.borderLight + " " + theme.bgLight + " " + theme.textPri : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
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
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Generated Output
                </span>
                
                <button 
                  onClick={handleCopy} 
                  disabled={!results.output}
                  className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                    copied ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  }`}
                >
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy Payload</>}
                </button>
              </div>

              {/* Data Analytics Dashboard */}
              <div className="grid grid-cols-3 gap-2 mb-4 shrink-0">
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <Zap className="w-4 h-4 text-pink-500 mb-1" />
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">{results.stats.count}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Repeats</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <FileText className="w-4 h-4 text-purple-500 mb-1" />
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">{results.stats.chars.toLocaleString()}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Characters</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <Activity className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">{(results.stats.chars / 1024).toFixed(1)} KB</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Payload Size</span>
                </div>
              </div>

              {results.stats.warning && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-600 dark:text-amber-400 text-[10px] font-bold mb-4 shrink-0">
                  <ShieldAlert className="w-4 h-4 shrink-0" /> Large payload detected (&gt;1MB). Copying or rendering might take a moment.
                </div>
              )}

              {/* Output Editor Area */}
              <div className="flex-1 bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden flex flex-col group relative">
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar relative font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all leading-relaxed">
                  {!results.output ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans">
                      <Repeat className="w-10 h-10 mb-3 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest text-center">
                        Awaiting Payload Configuration
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