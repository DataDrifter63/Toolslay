"use client";

import React, { useState, useEffect, useCallback } from "react";
import yaml from "js-yaml";
import { Settings2, Zap, Trash2, Copy, BarChart3, RotateCcw, AlertTriangle, FileJson, Check, ArrowRightLeft, ListOrdered } from "lucide-react";

const DEMO_YAML = `# Database Configuration
server:
  port: 8080
  host: 0.0.0.0
  active: true

database:
  user: admin
  password: "super_secret_password"
  nodes:
    - 192.168.1.1
    - 192.168.1.2
  
metrics:
  enabled: false`;

export default function YamlToJsonConverter() {
  const [isMounted, setIsMounted] = useState(false);
  const [input, setInput] = useState(DEMO_YAML);
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("yaml-to-json"); // 'yaml-to-json' or 'json-to-yaml'
  const [indentSize, setIndentSize] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [copiedState, setCopiedState] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  // Hydration safety
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const processData = useCallback(() => {
    if (!input || !input.trim()) {
      setOutput("");
      setErrorMsg(null);
      return;
    }

    try {
      if (mode === "yaml-to-json") {
        // Parse YAML, convert to JSON
        const parsedObj = yaml.load(input);
        if (typeof parsedObj !== 'object' || parsedObj === null) {
            throw new Error("Invalid YAML structure (must be an object or array)");
        }

        // Handle Key Sorting manually for JSON if enabled
        let finalObj = parsedObj;
        if (sortKeys) {
            const sortObject = (obj) => {
                if (obj === null || typeof obj !== 'object') return obj;
                if (Array.isArray(obj)) return obj.map(sortObject);
                return Object.keys(obj).sort().reduce((result, key) => {
                    result[key] = sortObject(obj[key]);
                    return result;
                }, {});
            };
            finalObj = sortObject(parsedObj);
        }

        setOutput(JSON.stringify(finalObj, null, indentSize));
      } else {
        // Parse JSON, convert to YAML
        const parsedObj = JSON.parse(input);
        const yamlStr = yaml.dump(parsedObj, {
            indent: indentSize,
            sortKeys: sortKeys, // js-yaml handles sorting natively for YAML
            lineWidth: -1 // Disable line wrapping
        });
        setOutput(yamlStr);
      }
      setErrorMsg(null);
    } catch (err) {
      // Clean error messages for better UI
      const cleanError = err.message.replace(/^YAMLException:\s*/, '');
      setErrorMsg(cleanError);
      setOutput("");
    }
  }, [input, mode, indentSize, sortKeys]);

  useEffect(() => {
    processData();
  }, [processData]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {}
  };

  const handleModeSwitch = () => {
    // If output is valid, flip the panes for seamless bi-directional editing
    if (!errorMsg && output) {
        setInput(output);
    }
    setMode(prev => prev === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json");
  };

  const inputSize = isMounted && input ? new Blob([input]).size : 0;
  const outputSize = isMounted && output ? new Blob([output]).size : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <FileJson className="w-6 h-6 text-sky-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">YAML ⇄ JSON Converter</h2>
          <span className="bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-bold px-3 py-1 rounded-full uppercase hidden sm:block">Pro Utility</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-sky-500 hover:text-sky-600 transition-all">
            <Settings2 className="w-4 h-4" /> {showSettings ? "Hide Settings" : "Show Settings"}
          </button>
          <button onClick={handleCopy} disabled={!!errorMsg || !output} className="flex items-center gap-2 text-sm font-semibold bg-sky-600 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-sky-700 transition-colors">
            {copiedState ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiedState ? "Copied!" : "Copy Output"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 items-start">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-[600px] h-[75vh]">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {mode === "yaml-to-json" ? "Raw YAML Input" : "Raw JSON Input"}
              </label>
              <div className="flex gap-1">
                <button onClick={() => setInput("")} className="p-1.5 text-slate-500 hover:text-red-600 rounded transition-colors" title="Clear Code"><Trash2 className="w-4 h-4"/></button>
                <button onClick={processData} className="p-1.5 text-slate-500 hover:text-sky-600 rounded transition-colors" title="Process Again"><RotateCcw className="w-4 h-4"/></button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "yaml-to-json" ? "Paste YAML here..." : "Paste JSON here..."}
              className="w-full h-full flex-grow p-4 bg-transparent text-sm font-mono text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
              spellCheck="false"
            />
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col h-full shadow-sm relative">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                {mode === "yaml-to-json" ? "JSON Output" : "YAML Output"}
              </label>
              <div className="flex gap-1 pr-1">
                 {errorMsg && (
                   <span className="text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md border border-red-200"><AlertTriangle className="w-3.5 h-3.5" /> Syntax Error</span>
                 )}
              </div>
            </div>
            
            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900/50 p-3 text-xs font-mono text-red-700 dark:text-red-400 whitespace-pre-wrap overflow-x-auto">
                <strong>Error Details:</strong> {errorMsg}
              </div>
            )}

            <textarea
              readOnly
              value={output}
              placeholder="Converted result will appear here..."
              className={`w-full h-full flex-grow p-4 text-sm font-mono resize-none focus:outline-none ${errorMsg ? 'bg-red-50/30 dark:bg-red-900/10 text-red-900 dark:text-red-200' : 'bg-slate-50/50 dark:bg-slate-800/30 text-slate-800 dark:text-slate-200'}`}
            />
          </div>
        </div>

        {showSettings && (
          <div className="space-y-6 lg:w-72 lg:max-w-72 flex flex-col h-full">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ArrowRightLeft className="w-5 h-5 text-sky-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Conversion Mode</h3>
              </div>
              
              <button 
                onClick={handleModeSwitch}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-lg font-bold transition-colors border border-slate-200 dark:border-slate-600 text-sm"
              >
                {mode === "yaml-to-json" ? "YAML ➔ JSON" : "JSON ➔ YAML"}
                <RotateCcw className="w-4 h-4 ml-1 opacity-50" />
              </button>

              <div className="pt-3">
                <label className="block text-xs font-semibold text-slate-500 mb-2">Indentation Size</label>
                <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))} className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 outline-none focus:ring-1 focus:ring-sky-500">
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                </select>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ListOrdered className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Pro Formatting</h3>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Alphabetical Sorting</span>
                    <span className="text-xs text-slate-400">Sorts object keys alphabetically (A-Z)</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Data Statistics</h3>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm font-medium text-slate-500">Input Size</span>
                  <span className="font-bold">{(inputSize / 1024).toFixed(2)} KB</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm font-medium text-slate-500">Output Size</span>
                  <span className="font-bold">{(outputSize / 1024).toFixed(2)} KB</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}