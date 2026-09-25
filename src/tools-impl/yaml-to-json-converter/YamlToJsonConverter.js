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
        const parsedObj = yaml.load(input);
        if (typeof parsedObj !== 'object' || parsedObj === null) {
            throw new Error("Invalid YAML structure (must be an object or array)");
        }

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
        const parsedObj = JSON.parse(input);
        const yamlStr = yaml.dump(parsedObj, {
            indent: indentSize,
            sortKeys: sortKeys,
            lineWidth: -1
        });
        setOutput(yamlStr);
      }
      setErrorMsg(null);
    } catch (err) {
      const cleanError = err.message.replace(/^YAMLException:\s*/, '');
      setErrorMsg(cleanError);
      setOutput("");
    }
  }, [input, mode, indentSize, sortKeys]);

  useEffect(() => {
    processData();
  }, [processData]);

  const handleClear = () => {
    setInput("");
    setOutput("");
    setErrorMsg(null);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {}
  };

  const handleModeSwitch = () => {
    if (!errorMsg && output) {
        setInput(output);
    }
    setMode(prev => prev === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json");
  };

  const inputSize = isMounted && input ? new Blob([input]).size : 0;
  const outputSize = isMounted && output ? new Blob([output]).size : 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* HEADER BAR */}
      <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-xl font-black shrink-0">
              <FileJson className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-black tracking-widest text-brand uppercase mb-1">
                WEB DEVELOPMENT UTILITY
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
                YAML ⇄ JSON Converter
              </h2>
              <p className="text-[11px] font-bold text-muted mt-0.5 truncate">
                Convert back and forth between YAML and JSON formats seamlessly.
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
              disabled={!!errorMsg || !output}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand disabled:opacity-50 text-surface hover:opacity-95 text-xs font-black uppercase tracking-wider transition-opacity shadow-sm"
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
                <label className="text-xs font-black text-ink uppercase tracking-wider">
                  {mode === "yaml-to-json" ? "Raw YAML Input" : "Raw JSON Input"}
                </label>
                <div className="flex gap-1">
                  <button type="button" onClick={handleClear} className="p-1.5 text-muted hover:text-[#fb7185] hover:bg-paper rounded-xl transition-colors" title="Clear Code"><Trash2 className="w-4 h-4"/></button>
                  <button type="button" onClick={processData} className="p-1.5 text-muted hover:text-brand hover:bg-paper rounded-xl transition-colors" title="Process Again"><RotateCcw className="w-4 h-4"/></button>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === "yaml-to-json" ? "Paste YAML here..." : "Paste JSON here..."}
                className="w-full h-full flex-grow p-4 bg-surface border-0 text-xs sm:text-sm font-mono leading-relaxed text-ink outline-none resize-none tabular-nums"
                spellCheck="false"
              />
            </div>
            
            {/* Output Panel */}
            <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col h-full min-w-0">
              <div className="bg-surface px-4 py-3 border-b border-line flex items-center justify-between min-w-0">
                <label className="text-xs font-black text-ink uppercase tracking-wider">
                  {mode === "yaml-to-json" ? "JSON Output" : "YAML Output"}
                </label>
                <div className="flex gap-1 pr-1">
                   {errorMsg && (
                     <span className="text-[10px] text-[#fb7185] font-black uppercase tracking-wider flex items-center gap-1 bg-[#fb7185]/10 px-2.5 py-1 rounded-xl border border-[#fb7185]/30"><AlertTriangle className="w-3.5 h-3.5" /> Syntax Error</span>
                   )}
                </div>
              </div>
              
              {errorMsg && (
                <div className="bg-[#fb7185]/10 border-b border-[#fb7185]/30 p-3 text-xs font-mono text-[#fb7185] whitespace-pre-wrap overflow-x-auto">
                  <strong>Error Details:</strong> {errorMsg}
                </div>
              )}

              <textarea
                readOnly
                value={output}
                placeholder="Converted result will appear here..."
                className={`w-full h-full flex-grow p-4 border-0 text-xs sm:text-sm font-mono leading-relaxed outline-none resize-none tabular-nums ${errorMsg ? 'bg-[#fb7185]/5 text-[#fb7185]' : 'bg-surface text-muted'}`}
              />
            </div>
          </div>

          {/* SIDEBAR SETTINGS & STATS */}
          {showSettings && (
            <div className="space-y-6 lg:w-72 lg:max-w-72 flex flex-col h-full min-w-0">
              
              <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
                <div className="flex items-center gap-2 border-b border-line pb-3 min-w-0">
                  <ArrowRightLeft className="w-5 h-5 text-brand" />
                  <h3 className="text-xs font-black text-ink uppercase tracking-wider">Conversion Mode</h3>
                </div>
                
                <button 
                  type="button"
                  onClick={handleModeSwitch}
                  className="w-full flex items-center justify-center gap-2 bg-surface hover:opacity-90 text-ink py-2.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all border border-line"
                >
                  {mode === "yaml-to-json" ? "YAML ➔ JSON" : "JSON ➔ YAML"}
                  <RotateCcw className="w-3.5 h-3.5 ml-1 text-muted" />
                </button>

                <div className="pt-2">
                  <label className="block text-[10px] font-black text-muted uppercase tracking-wider mb-2">Indentation Size</label>
                  <select 
                    value={indentSize} 
                    onChange={(e) => setIndentSize(Number(e.target.value))}
                    className="w-full h-11 text-xs font-bold bg-surface border border-line rounded-xl px-3 outline-none cursor-pointer text-ink"
                  >
                    <option value={2}>2 Spaces</option>
                    <option value={4}>4 Spaces</option>
                  </select>
                </div>
              </div>

              <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
                <div className="flex items-center gap-2 border-b border-line pb-3 min-w-0">
                  <ListOrdered className="w-5 h-5 text-brand" />
                  <h3 className="text-xs font-black text-ink uppercase tracking-wider">Pro Formatting</h3>
                </div>
                
                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer group bg-surface p-3 rounded-xl border border-line hover:border-brand/50 transition-all select-none">
                    <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} className="w-4 h-4 accent-brand rounded border-line" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black text-ink uppercase tracking-wider truncate">Alphabetical Sorting</span>
                      <span className="text-[10px] font-medium text-muted mt-0.5 truncate">Sorts object keys alphabetically (A-Z)</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
                <div className="flex items-center gap-2 border-b border-line pb-3 min-w-0">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-xs font-black text-ink uppercase tracking-wider">Data Statistics</h3>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center p-3 bg-surface border border-line rounded-xl text-xs font-bold">
                    <span className="text-muted uppercase tracking-wider text-[10px]">Input Size</span>
                    <span className="font-mono text-ink">{(inputSize / 1024).toFixed(2)} KB</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface border border-line rounded-xl text-xs font-bold">
                    <span className="text-muted uppercase tracking-wider text-[10px]">Output Size</span>
                    <span className="font-mono text-ink">{(outputSize / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}