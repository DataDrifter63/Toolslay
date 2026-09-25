"use client";

import React, { useState, useEffect, useCallback } from "react";
import beautify from "js-beautify";
import { Settings2, Zap, Trash2, Copy, BarChart3, RotateCcw, AlertTriangle, Paintbrush, Check, Minimize2, Maximize2, Scissors } from "lucide-react";

// --- Custom Pro CSS Optimizers ---
const optimizeZeroUnits = (css) => {
  if (!css) return "";
  return css.replace(/\b0(?:px|em|rem|pt|pc|in|cm|mm|%)\b/gi, '0');
};

const optimizeHexColors = (css) => {
  if (!css) return "";
  return css.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g, '#$1$2$3').toLowerCase();
};

const minifyCSS = (css, removeComments = true) => {
  if (!css) return "";
  let minified = css;
  if (removeComments) {
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
  }
  return minified
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,>+~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
};

const DEMO_CSS = `/* 
 * Pro Application Styles
 * Header Section 
 */
.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 40px;
    background-color: #FFFFFF;
    margin: 0px auto;
}

.nav-links li {
    list-style: none;
    margin-right: 15px;
}

.nav-links a {
    text-decoration: none;
    color: #333333;
    font-size: 16px;
    transition: color 0.3s ease;
}

.nav-links a:hover {
    color: #0066CC;
}

@media (max-width: 768px) {
    .header-container {
        flex-direction: column;
        padding: 10px 0px;
    }
    .nav-links {
        margin-top: 20px;
    }
}`;

export default function CssFormatterMinifier() {
  const [isMounted, setIsMounted] = useState(false);
  const [input, setInput] = useState(DEMO_CSS);
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("beautify"); 
  const [indentSize, setIndentSize] = useState(2);
  const [optZeroUnits, setOptZeroUnits] = useState(true);
  const [optHexColors, setOptHexColors] = useState(true);
  const [removeComments, setRemoveComments] = useState(true);
  
  const [copiedState, setCopiedState] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const processCSS = useCallback(() => {
    if (!input || !input.trim()) {
      setOutput("");
      return;
    }

    let processed = input;

    if (optZeroUnits) processed = optimizeZeroUnits(processed);
    if (optHexColors) processed = optimizeHexColors(processed);

    if (mode === "minify") {
      processed = minifyCSS(processed, removeComments);
    } else {
      if (removeComments) {
        processed = processed.replace(/\/\*[\s\S]*?\*\//g, ''); 
      }
      processed = beautify.css(processed, {
        indent_size: indentSize,
        indent_char: " ",
        preserve_newlines: false,
        selector_separator_newline: true,
        newline_between_rules: true
      });
    }

    setOutput(processed);
  }, [input, mode, indentSize, optZeroUnits, optHexColors, removeComments]);

  useEffect(() => {
    processCSS();
  }, [processCSS]);

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

  const inputSize = isMounted && input ? new Blob([input]).size : 0;
  const outputSize = isMounted && output ? new Blob([output]).size : 0;
  const savedPercent = inputSize > 0 ? (((inputSize - outputSize) / inputSize) * 100).toFixed(1) : "0.0";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* HEADER BAR */}
      <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-xl font-black shrink-0">
              <Paintbrush className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-black tracking-widest text-brand uppercase mb-1">
                WEB DEVELOPMENT UTILITY
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
                CSS Formatter & Minifier
              </h2>
              <p className="text-[11px] font-bold text-muted mt-0.5 truncate">
                Beautify, clean, compress, and optimize your stylesheets instantly.
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
                <label className="text-xs font-black text-ink uppercase tracking-wider">Raw CSS Code</label>
                <div className="flex gap-1">
                  <button type="button" onClick={handleClear} className="p-1.5 text-muted hover:text-[#fb7185] hover:bg-paper rounded-xl transition-colors" title="Clear Code"><Trash2 className="w-4 h-4"/></button>
                  <button type="button" onClick={processCSS} className="p-1.5 text-muted hover:text-brand hover:bg-paper rounded-xl transition-colors" title="Process Again"><RotateCcw className="w-4 h-4"/></button>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your unformatted or minified CSS here..."
                className="w-full h-full flex-grow p-4 bg-surface border-0 text-xs sm:text-sm font-mono leading-relaxed text-ink outline-none resize-none tabular-nums"
                spellCheck="false"
              />
            </div>
            
            {/* Output Panel */}
            <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col h-full min-w-0">
              <div className="bg-surface px-4 py-3 border-b border-line flex items-center justify-between min-w-0">
                <label className="text-xs font-black text-ink uppercase tracking-wider flex items-center gap-2">
                  {mode === 'minify' ? <Minimize2 className="w-4 h-4 text-emerald-500"/> : <Maximize2 className="w-4 h-4 text-brand"/>}
                  {mode === 'minify' ? "Minified Output" : "Beautified Output"}
                </label>
                <div className="flex gap-1 pr-1">
                   {input.trim() && !output && <span className="text-[10px] text-[#fb7185] font-black uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Syntax Error</span>}
                </div>
              </div>
              <textarea
                readOnly
                value={output}
                placeholder="Result will appear here..."
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
                  <h3 className="text-xs font-black text-ink uppercase tracking-wider">Operation Mode</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-2 bg-surface p-1 rounded-xl border border-line">
                  <button 
                    type="button"
                    onClick={() => setMode("beautify")}
                    className={`py-2 px-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${mode === 'beautify' ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
                  >
                    Beautify
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMode("minify")}
                    className={`py-2 px-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${mode === 'minify' ? 'bg-emerald-500 text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
                  >
                    Minify
                  </button>
                </div>

                {mode === 'beautify' && (
                  <div className="pt-2">
                    <label className="block text-[10px] font-black text-muted uppercase tracking-wider mb-2">Indentation Size</label>
                    <select 
                      value={indentSize} 
                      onChange={(e) => setIndentSize(Number(e.target.value))}
                      className="w-full h-11 text-xs font-bold bg-surface border border-line rounded-xl px-3 outline-none cursor-pointer text-ink"
                    >
                      <option value={2}>2 Spaces</option>
                      <option value={4}>4 Spaces</option>
                      <option value={8}>8 Spaces</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
                <div className="flex items-center gap-2 border-b border-line pb-3 min-w-0">
                  <Scissors className="w-5 h-5 text-brand" />
                  <h3 className="text-xs font-black text-ink uppercase tracking-wider">Pro Optimizations</h3>
                </div>
                
                <div className="space-y-2.5">
                  {[
                    [removeComments, setRemoveComments, "Strip Comments", "Removes /* blocks */"],
                    [optZeroUnits, setOptZeroUnits, "Zero-Unit Optimize", "e.g. 0px becomes 0"],
                    [optHexColors, setOptHexColors, "Hex Color Shorten", "e.g. #FFFFFF to #fff"]
                  ].map(([val, setter, label, desc], i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group bg-surface p-3 rounded-xl border border-line hover:border-brand/50 transition-all select-none">
                      <input type="checkbox" checked={val} onChange={(e) => setter(e.target.checked)} className="w-4 h-4 accent-brand rounded border-line" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-ink uppercase tracking-wider truncate">{label}</span>
                        <span className="text-[10px] font-medium text-muted mt-0.5 truncate">{desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
                <div className="flex items-center gap-2 border-b border-line pb-3 min-w-0">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-xs font-black text-ink uppercase tracking-wider">File Compression</h3>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center p-3 bg-surface border border-line rounded-xl text-xs font-bold">
                    <span className="text-muted uppercase tracking-wider text-[10px]">Original Size</span>
                    <span className="font-mono text-ink">{(inputSize / 1024).toFixed(2)} KB</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface border border-line rounded-xl text-xs font-bold">
                    <span className="text-muted uppercase tracking-wider text-[10px]">New Size</span>
                    <span className="font-mono text-ink">{(outputSize / 1024).toFixed(2)} KB</span>
                  </div>
                  {mode === 'minify' && savedPercent > 0 && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                      <span className="block text-[10px] font-black text-emerald-500 uppercase tracking-wider">Space Saved</span>
                      <strong className="text-xl font-black text-emerald-500 block mt-0.5">{savedPercent}%</strong>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}