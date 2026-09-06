"use client";

import React, { useState, useEffect, useCallback } from "react";
import beautify from "js-beautify";
import { Settings2, Zap, Trash2, Copy, BarChart3, RotateCcw, AlertTriangle, FileCode2, Check, Minimize2, Maximize2, Scissors } from "lucide-react";

// --- Safe JS Optimizers ---
const stripConsoleLogs = (js) => {
  if (!js) return "";
  return js.replace(/console\.(log|info|warn|error|debug|table|clear|trace|dir)\s*\([^)]*\);?/gi, '');
};

const stripDebuggers = (js) => {
  if (!js) return "";
  return js.replace(/debugger\s*;/gi, '');
};

const minifyJS = (js, removeComments) => {
  if (!js) return "";
  let minified = js;
  
  if (removeComments) {
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
    minified = minified.replace(/(?<![:"'])\/\/.*$/gm, '');
  }
  
  return minified
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\s*([{};(),=<>+\-*/!&|])\s*/g, '$1')
    .trim();
};

const DEMO_JS = `/* 
 * App Logic
 */
function init(config) {
    console.log("Starting...");
    if (config.debug) {
        debugger;
    }
    return true;
}`;

const JsFormatterMinifier = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [input, setInput] = useState(DEMO_JS);
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("beautify"); 
  const [indentSize, setIndentSize] = useState(2);
  const [optStripLogs, setOptStripLogs] = useState(true);
  const [optStripDebuggers, setOptStripDebuggers] = useState(true);
  const [removeComments, setRemoveComments] = useState(true);
  const [copiedState, setCopiedState] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const processJS = useCallback(() => {
    if (!input || !input.trim()) {
      setOutput("");
      return;
    }

    let processed = input;

    if (optStripLogs) processed = stripConsoleLogs(processed);
    if (optStripDebuggers) processed = stripDebuggers(processed);

    if (mode === "minify") {
      processed = minifyJS(processed, removeComments);
      processed = processed.replace(/\n/g, '');
    } else {
      if (removeComments) {
        processed = processed.replace(/\/\*[\s\S]*?\*\//g, ''); 
        processed = processed.replace(/(?<![:"'])\/\/.*$/gm, '');
      }
      processed = beautify.js(processed, {
        indent_size: indentSize,
        indent_char: " ",
        preserve_newlines: true,
        max_preserve_newlines: 2,
        space_in_paren: false,
        space_in_empty_paren: false,
        brace_style: "collapse",
      });
    }

    setOutput(processed);
  }, [input, mode, indentSize, optStripLogs, optStripDebuggers, removeComments]);

  useEffect(() => {
    processJS();
  }, [processJS]);

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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <FileCode2 className="w-6 h-6 text-amber-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">JS Formatter & Minifier</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600">
            <Settings2 className="w-4 h-4" /> {showSettings ? "Hide Settings" : "Show Settings"}
          </button>
          <button onClick={handleCopy} className="flex items-center gap-2 text-sm font-semibold bg-amber-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-amber-600">
            {copiedState ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiedState ? "Copied!" : "Copy Output"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 items-start">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-[600px] h-[75vh]">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Raw JS Code</label>
              <div className="flex gap-1">
                <button onClick={() => setInput("")} className="p-1.5 text-slate-500 hover:text-red-600 rounded"><Trash2 className="w-4 h-4"/></button>
                <button onClick={processJS} className="p-1.5 text-slate-500 hover:text-amber-600 rounded"><RotateCcw className="w-4 h-4"/></button>
              </div>
            </div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste JS here..." className="w-full h-full flex-grow p-4 bg-transparent text-sm font-mono text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500" spellCheck="false" />
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col h-full relative">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                {mode === 'minify' ? <Minimize2 className="w-4 h-4 text-emerald-500"/> : <Maximize2 className="w-4 h-4 text-amber-500"/>}
                {mode === 'minify' ? "Minified Output" : "Beautified Output"}
              </label>
              <div className="flex gap-1 pr-1">
                 {input.trim() && !output && <span className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Error</span>}
              </div>
            </div>
            <textarea readOnly value={output} placeholder="Result here..." className="w-full h-full flex-grow p-4 bg-slate-50/50 dark:bg-slate-800/30 text-sm font-mono text-slate-800 dark:text-slate-200 resize-none focus:outline-none" />
          </div>
        </div>

        {showSettings && (
          <div className="space-y-6 lg:w-72 lg:max-w-72 flex flex-col h-full">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Mode</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={() => setMode("beautify")} className={`py-2 px-3 text-xs font-bold rounded-md ${mode === 'beautify' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm' : 'text-slate-600'}`}>BEAUTIFY</button>
                <button onClick={() => setMode("minify")} className={`py-2 px-3 text-xs font-bold rounded-md ${mode === 'minify' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-600'}`}>MINIFY</button>
              </div>
              {mode === 'beautify' && (
                <div className="pt-3">
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Indentation</label>
                  <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))} className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 outline-none">
                    <option value={2}>2 Spaces</option>
                    <option value={4}>4 Spaces</option>
                  </select>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Scissors className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Optimizations</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input type="checkbox" checked={removeComments} onChange={(e) => setRemoveComments(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm font-semibold">Strip Comments</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input type="checkbox" checked={optStripLogs} onChange={(e) => setOptStripLogs(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm font-semibold">Remove Console Logs</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input type="checkbox" checked={optStripDebuggers} onChange={(e) => setOptStripDebuggers(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm font-semibold">Remove Debuggers</span>
                </label>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Compression</h3>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-medium">Original</span>
                  <span className="font-bold">{isMounted ? (inputSize / 1024).toFixed(2) : "0.00"} KB</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-medium">New</span>
                  <span className="font-bold">{isMounted ? (outputSize / 1024).toFixed(2) : "0.00"} KB</span>
                </div>
                {mode === 'minify' && savedPercent > 0 && (
                  <div className="mt-2 p-3 bg-emerald-50 text-center rounded-lg border border-emerald-200">
                    <span className="block text-sm text-emerald-600 font-medium">Saved</span>
                    <span className="block text-2xl font-black text-emerald-600">{savedPercent}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JsFormatterMinifier;