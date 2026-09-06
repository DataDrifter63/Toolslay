"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings2, Fingerprint, Trash2, Copy, RotateCcw, Check, Download, Hash, ListOrdered, Braces } from "lucide-react";

// ✅ 100% Native, Dependency-Free UUID v4 Generator
const generateNativeUUID = () => {
  // Use Modern Native Crypto API if available (Ultra-fast & Secure)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Safe Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function UuidGuidGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  const [results, setResults] = useState([]);
  
  // Settings State
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState("standard"); // standard, uppercase, no-hyphen, braces
  
  const [copiedState, setCopiedState] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  const generateUUIDs = useCallback(() => {
    const newUUIDs = [];
    const maxCount = Math.min(Math.max(1, count), 10000); // Strict limit 1 to 10,000
    
    for (let i = 0; i < maxCount; i++) {
      let id = generateNativeUUID();
      
      // Apply Custom Formatting
      if (format === "uppercase") id = id.toUpperCase();
      if (format === "no-hyphen") id = id.replace(/-/g, "");
      if (format === "no-hyphen-upper") id = id.replace(/-/g, "").toUpperCase();
      if (format === "braces") id = `{${id}}`;
      if (format === "braces-upper") id = `{${id.toUpperCase()}}`;

      newUUIDs.push(id);
    }
    setResults(newUUIDs);
  }, [count, format]);

  // Generate initial UUID only after client mount for hydration safety
  useEffect(() => {
    setIsMounted(true);
    generateUUIDs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Regenerate immediately when settings change
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
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Fingerprint className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">UUID / GUID Generator</h2>
          <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase hidden sm:block">Native Speed</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all">
            <Settings2 className="w-4 h-4" /> {showSettings ? "Hide Options" : "Show Options"}
          </button>
          <button onClick={handleDownload} disabled={!results.length} className="flex items-center gap-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Export .txt
          </button>
          <button onClick={handleCopy} disabled={!results.length} className="flex items-center gap-2 text-sm font-semibold bg-indigo-600 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
            {copiedState ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiedState ? "Copied!" : "Copy All"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 items-start">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-sm min-h-[600px] h-[75vh]">
          <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-500"/> Generated v4 Outputs ({isMounted ? results.length : 0})
            </label>
            <div className="flex gap-1">
              <button onClick={() => setResults([])} className="p-1.5 text-slate-500 hover:text-red-600 rounded transition-colors" title="Clear"><Trash2 className="w-4 h-4"/></button>
              <button onClick={generateUUIDs} className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors flex items-center gap-1 font-bold text-xs" title="Generate New">
                  <RotateCcw className="w-3.5 h-3.5"/> REGENERATE
              </button>
            </div>
          </div>
          
          <textarea
            readOnly
            value={displayedText}
            placeholder="UUIDs will appear here..."
            className="w-full h-full flex-grow p-6 bg-transparent text-sm md:text-base font-mono leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            spellCheck="false"
          />
        </div>

        {showSettings && (
          <div className="space-y-6 lg:w-72 lg:max-w-72 flex flex-col h-full">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ListOrdered className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Generation Quantity</h3>
              </div>
              
              <div className="pt-1">
                <label className="block text-xs font-semibold text-slate-500 mb-2">How many UUIDs?</label>
                <input 
                    type="number" 
                    min="1" 
                    max="10000" 
                    value={count} 
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full font-bold text-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
                />
                <span className="block text-[10px] text-slate-400 mt-1.5 text-right">Max: 10,000 per click</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Braces className="w-5 h-5 text-pink-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Output Format</h3>
              </div>
              
              <div className="space-y-2">
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
                        onClick={() => setFormat(fmt.id)}
                        className={`w-full flex items-center justify-between p-2.5 text-xs font-medium rounded-lg transition-colors border ${format === fmt.id ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-pink-300'}`}
                    >
                        <span className="font-bold">{fmt.label}</span>
                        <span className="font-mono opacity-60 text-[10px]">{fmt.desc}</span>
                    </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}