"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings2, Fingerprint, Trash2, Copy, RotateCcw, Check, Download, Hash, ListOrdered, Braces } from "lucide-react";

// ✅ 100% Native, Dependency-Free UUID v4 Generator
const generateNativeUUID = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function UuidGuidGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  const [results, setResults] = useState([]);
  
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState("standard");
  
  const [copiedState, setCopiedState] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // Default closed on mobile for clean start

  const generateUUIDs = useCallback(() => {
    const newUUIDs = [];
    const maxCount = Math.min(Math.max(1, count), 10000);
    
    for (let i = 0; i < maxCount; i++) {
      let id = generateNativeUUID();
      
      if (format === "uppercase") id = id.toUpperCase();
      if (format === "no-hyphen") id = id.replace(/-/g, "");
      if (format === "no-hyphen-upper") id = id.replace(/-/g, "").toUpperCase();
      if (format === "braces") id = `{${id}}`;
      if (format === "braces-upper") id = `{${id.toUpperCase()}}`;

      newUUIDs.push(id);
    }
    setResults(newUUIDs);
  }, [count, format]);

  useEffect(() => {
    setIsMounted(true);
    generateUUIDs();
  }, [generateUUIDs]);

  useEffect(() => {
    if (isMounted) generateUUIDs();
  }, [format, count, generateUUIDs, isMounted]);

  const handleCopy = async () => {
    if (!results.length) return;
    try {
      await navigator.clipboard.writeText(results.join('\n'));
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {}
  };

  const handleDownload = () => {
    if (!results.length) return;
    const blob = new Blob([results.join('\n')], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uuids-v4-${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const displayedText = isMounted ? results.join('\n') : "";

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border">
      
      {/* HEADER BAR */}
      <div className="bg-surface border border-line p-4 sm:p-8 rounded-2xl shadow-card space-y-4 sm:space-y-6 w-full box-border">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4 sm:pb-5 w-full">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-lg sm:text-xl font-black shrink-0">
              <Fingerprint className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-brand uppercase mb-0.5 sm:mb-1">
                WEB DEVELOPMENT UTILITY
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-ink tracking-tight truncate">
                UUID / GUID Generator
              </h2>
              <p className="text-[10px] sm:text-[11px] font-bold text-muted mt-0.5 truncate">
                Generate secure version 4 UUIDs in bulk instantly using native crypto.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
            <button 
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-line bg-paper text-ink hover:border-brand text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all shrink-0"
            >
              <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" /> {showSettings ? "Hide Options" : "Options"}
            </button>
            <button 
              type="button"
              onClick={handleDownload} 
              disabled={!results.length}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-line bg-paper disabled:opacity-50 text-ink text-[11px] sm:text-xs font-black uppercase tracking-wider hover:bg-surface transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" /> Export
            </button>
            <button 
              type="button"
              onClick={handleCopy} 
              disabled={!results.length}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-brand disabled:opacity-50 text-surface hover:opacity-95 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-opacity shadow-sm shrink-0"
            >
              {copiedState ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} {copiedState ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* WORK AREA GRID (Responsive stack on mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 sm:gap-6 items-start w-full">
          
          {/* Main Output Panel */}
          <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col h-[65vh] sm:h-[70vh] min-h-[400px] w-full shadow-sm">
            <div className="bg-surface px-4 py-3 border-b border-line flex items-center justify-between w-full">
              <label className="text-[11px] sm:text-xs font-black text-ink uppercase tracking-wider flex items-center gap-2 truncate">
                <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand shrink-0"/> Outputs ({isMounted ? results.length : 0})
              </label>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => setResults([])} className="p-1.5 text-muted hover:text-[#fb7185] hover:bg-paper rounded-xl transition-colors" title="Clear"><Trash2 className="w-4 h-4"/></button>
                <button type="button" onClick={generateUUIDs} className="flex items-center gap-1 text-[11px] font-black text-brand uppercase tracking-wider hover:opacity-80 transition-opacity">
                  <RotateCcw className="w-3 h-3"/> Regenerate
                </button>
              </div>
            </div>
            
            <textarea
              readOnly
              value={displayedText}
              placeholder="UUIDs will appear here..."
              className="w-full h-full flex-grow p-4 sm:p-5 bg-surface border-0 text-xs sm:text-sm font-mono leading-relaxed text-ink outline-none resize-none tabular-nums box-border"
              spellCheck="false"
            />
          </div>

          {/* SIDEBAR OPTIONS (Collapsible on mobile or stacked cleanly) */}
          <div className={`space-y-4 sm:space-y-6 w-full ${showSettings ? "block" : "hidden lg:block"}`}>
            
            <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl space-y-3 sm:space-y-4 w-full box-border">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <ListOrdered className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                <h3 className="text-xs font-black text-ink uppercase tracking-wider">Quantity</h3>
              </div>
              
              <div className="pt-1">
                <label className="block text-[10px] font-black text-muted uppercase tracking-wider mb-1.5">How many UUIDs?</label>
                <input 
                    type="number" 
                    min="1" 
                    max="10000" 
                    value={count} 
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full h-10 sm:h-11 text-xs sm:text-sm font-bold bg-surface border border-line rounded-xl px-3 outline-none focus:border-brand text-ink tabular-nums"
                />
                <span className="block text-[10px] font-medium text-muted mt-1 text-right">Max: 10,000 per click</span>
              </div>
            </div>

            <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl space-y-3 sm:space-y-4 w-full box-border">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <Braces className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                <h3 className="text-xs font-black text-ink uppercase tracking-wider">Output Format</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                {[
                    { id: "standard", label: "Standard", desc: "xxxx-xxxx" },
                    { id: "uppercase", label: "Uppercase", desc: "XXXX-XXXX" },
                    { id: "no-hyphen", label: "No Hyphens", desc: "xxxxxxxx" },
                    { id: "no-hyphen-upper", label: "Stripped Upper", desc: "XXXXXXXX" },
                    { id: "braces", label: "Braces", desc: "{xxxx-xxxx}" },
                    { id: "braces-upper", label: "Braces Upper", desc: "{XXXX-XXXX}" },
                ].map((fmt) => (
                    <button 
                        key={fmt.id}
                        type="button"
                        onClick={() => setFormat(fmt.id)}
                        className={`w-full flex items-center justify-between p-2.5 sm:p-3 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${format === fmt.id ? 'bg-brand/10 border-brand/30 text-brand shadow-sm' : 'bg-surface border-line text-muted hover:text-ink'}`}
                    >
                        <span className="truncate">{fmt.label}</span>
                        <span className="font-mono text-[9px] sm:text-[10px] font-medium opacity-70 shrink-0">{fmt.desc}</span>
                    </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}