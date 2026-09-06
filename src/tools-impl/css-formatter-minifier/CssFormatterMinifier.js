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

  // Fix: Ensure component is mounted before doing browser-specific blob calculations
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

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {}
  };

  // Safe size calculation mapping for SSR Hydration
  const inputSize = isMounted && input ? new Blob([input]).size : 0;
  const outputSize = isMounted && output ? new Blob([output]).size : 0;
  const savedPercent = inputSize > 0 ? (((inputSize - outputSize) / inputSize) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Paintbrush className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">CSS Formatter & Minifier</h2>
          <span className="bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs font-bold px-3 py-1 rounded-full uppercase hidden sm:block">Pro Utility</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-pink-500 hover:text-pink-600 transition-all"
          >
            <Settings2 className="w-4 h-4" /> {showSettings ? "Hide Settings" : "Show Settings"}
          </button>
          <button onClick={handleCopy} className="flex items-center gap-2 text-sm font-semibold bg-pink-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-pink-700 transition-colors">
            {copiedState ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiedState ? "Copied!" : "Copy Output"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 items-start">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-[600px] h-[75vh]">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Raw CSS Code</label>
              <div className="flex gap-1">
                <button onClick={() => setInput("")} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Clear Code"><Trash2 className="w-4 h-4"/></button>
                <button onClick={processCSS} className="p-1.5 text-slate-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded transition-colors" title="Process Again"><RotateCcw className="w-4 h-4"/></button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your unformatted or minified CSS here..."
              className="w-full h-full flex-grow p-4 bg-transparent text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
              spellCheck="false"
            />
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col h-full relative">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                {mode === 'minify' ? <Minimize2 className="w-4 h-4 text-emerald-500"/> : <Maximize2 className="w-4 h-4 text-pink-500"/>}
                {mode === 'minify' ? "Minified Output" : "Beautified Output"}
              </label>
              <div className="flex gap-1 pr-1">
                 {input.trim() && !output && <span className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Syntax Error</span>}
              </div>
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Result will appear here..."
              className="w-full h-full flex-grow p-4 bg-slate-50/50 dark:bg-slate-800/30 text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none"
            />
          </div>
        </div>

        {showSettings && (
          <div className="space-y-6 lg:w-72 lg:max-w-72 flex flex-col h-full">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Zap className="w-5 h-5 text-pink-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Operation Mode</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                  onClick={() => setMode("beautify")}
                  className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${mode === 'beautify' ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                  BEAUTIFY
                </button>
                <button 
                  onClick={() => setMode("minify")}
                  className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${mode === 'minify' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                  MINIFY
                </button>
              </div>

              {mode === 'beautify' && (
                <div className="pt-3">
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Indentation Size</label>
                  <select 
                    value={indentSize} 
                    onChange={(e) => setIndentSize(Number(e.target.value))}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 outline-none focus:ring-1 focus:ring-pink-500 text-slate-700 dark:text-slate-300"
                  >
                    <option value={2}>2 Spaces</option>
                    <option value={4}>4 Spaces</option>
                    <option value={8}>8 Spaces</option>
                  </select>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Scissors className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Pro Optimizations</h3>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input type="checkbox" checked={removeComments} onChange={(e) => setRemoveComments(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Strip Comments</span>
                    <span className="text-xs text-slate-400">Removes /* blocks */</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input type="checkbox" checked={optZeroUnits} onChange={(e) => setOptZeroUnits(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Zero-Unit Optimize</span>
                    <span className="text-xs text-slate-400">e.g. 0px becomes 0</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input type="checkbox" checked={optHexColors} onChange={(e) => setOptHexColors(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Hex Color Shorten</span>
                    <span className="text-xs text-slate-400">e.g. #FFFFFF to #fff</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">File Compression</h3>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm font-medium text-slate-500">Original Size</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{(inputSize / 1024).toFixed(2)} KB</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm font-medium text-slate-500">New Size</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{(outputSize / 1024).toFixed(2)} KB</span>
                </div>
                {mode === 'minify' && savedPercent > 0 && (
                  <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-center">
                    <span className="block text-sm text-emerald-600 dark:text-emerald-400 font-medium">Space Saved</span>
                    <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">{savedPercent}%</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}