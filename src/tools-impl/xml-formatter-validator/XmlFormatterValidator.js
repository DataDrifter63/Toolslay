"use client";

import React, { useState, useEffect, useCallback } from "react";
import beautify from "js-beautify";
import { Settings2, Zap, Trash2, Copy, BarChart3, RotateCcw, AlertTriangle, FileCode2, Check, Minimize2, Maximize2, Scissors, CheckCircle } from "lucide-react";

// --- Pro XML Optimizers ---
const stripXmlNamespaces = (xml) => {
  if (!xml) return "";
  return xml.replace(/\sxmlns(:\w+)?=(['"])(.*?)\2/g, '');
};

const minifyXML = (xml, removeComments) => {
  if (!xml) return "";
  let minified = xml;
  
  if (removeComments) {
    minified = minified.replace(/<!--[\s\S]*?-->/g, '');
  }
  
  return minified
    .replace(/>\s+</g, '><')
    .trim();
};

const DEMO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns="http://example.com/catalog" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<!-- Premium Products List -->
  <book id="bk101">
      <author>Gambardella, Matthew</author>
      <title>XML Developer's Guide</title>
      <genre>Computer</genre>
      <price>44.95</price>
      <publish_date>2000-10-01</publish_date>
      <description>An in-depth look at creating applications 
      with XML.</description>
  </book>
  <book id="bk102">
      <author>Ralls, Kim</author>
      <title>Midnight Rain</title>
      <genre>Fantasy</genre>
      <price>5.95</price>
  </book>
</catalog>`;

export default function XmlFormatterValidator() {
  const [isMounted, setIsMounted] = useState(false);
  const [input, setInput] = useState(DEMO_XML);
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("beautify"); 
  const [indentSize, setIndentSize] = useState(2);
  const [optStripNamespaces, setOptStripNamespaces] = useState(false);
  const [removeComments, setRemoveComments] = useState(false);
  const [validationError, setValidationError] = useState(null);
  
  const [copiedState, setCopiedState] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const validateXML = (xmlString) => {
    if (!xmlString || typeof window === "undefined") return null;
    try {
      const parser = new window.DOMParser();
      const dom = parser.parseFromString(xmlString, "application/xml");
      const errorNode = dom.querySelector("parsererror");
      if (errorNode) {
        return errorNode.textContent.replace(/Below is a rendering of the page.*/, '').trim();
      }
      return null;
    } catch (err) {
      return "Critical parsing error occurred.";
    }
  };

  const processXML = useCallback(() => {
    if (!input || !input.trim()) {
      setOutput("");
      setValidationError(null);
      return;
    }

    let processed = input;
    
    const error = validateXML(processed);
    setValidationError(error);

    if (optStripNamespaces) processed = stripXmlNamespaces(processed);

    if (mode === "minify") {
      processed = minifyXML(processed, removeComments);
    } else {
      if (removeComments) {
        processed = processed.replace(/<!--[\s\S]*?-->/g, ''); 
      }
      processed = beautify.html(processed, {
        indent_size: indentSize,
        indent_char: " ",
        preserve_newlines: true,
        max_preserve_newlines: 1,
        unformatted: [],
        wrap_attributes: "auto"
      });
    }

    setOutput(processed);
  }, [input, mode, indentSize, optStripNamespaces, removeComments]);

  useEffect(() => {
    processXML();
  }, [processXML]);

  const handleClear = () => {
    setInput("");
    setOutput("");
    setValidationError(null);
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
              <FileCode2 className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-black tracking-widest text-brand uppercase mb-1">
                WEB DEVELOPMENT UTILITY
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
                XML Formatter & Validator
              </h2>
              <p className="text-[11px] font-bold text-muted mt-0.5 truncate">
                Format, validate, minify, and clean your XML documents instantly.
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
                <label className="text-xs font-black text-ink uppercase tracking-wider">Raw XML Input</label>
                <div className="flex gap-1">
                  <button type="button" onClick={handleClear} className="p-1.5 text-muted hover:text-[#fb7185] hover:bg-paper rounded-xl transition-colors" title="Clear Code"><Trash2 className="w-4 h-4"/></button>
                  <button type="button" onClick={processXML} className="p-1.5 text-muted hover:text-brand hover:bg-paper rounded-xl transition-colors" title="Process Again"><RotateCcw className="w-4 h-4"/></button>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your unformatted XML here..."
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
                   {validationError ? (
                     <span className="text-[10px] text-[#fb7185] font-black uppercase tracking-wider flex items-center gap-1 bg-[#fb7185]/10 px-2.5 py-1 rounded-xl border border-[#fb7185]/30"><AlertTriangle className="w-3.5 h-3.5" /> Invalid XML</span>
                   ) : input.trim() ? (
                     <span className="text-[10px] text-emerald-500 font-black uppercase tracking-wider flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30"><CheckCircle className="w-3.5 h-3.5" /> Valid XML</span>
                   ) : null}
                </div>
              </div>
              
              {validationError && (
                <div className="bg-[#fb7185]/10 border-b border-[#fb7185]/30 p-3 text-xs font-mono text-[#fb7185] break-words">
                  <strong>Error Details:</strong> {validationError}
                </div>
              )}

              <textarea
                readOnly
                value={output}
                placeholder="Result will appear here..."
                className={`w-full h-full flex-grow p-4 border-0 text-xs sm:text-sm font-mono leading-relaxed outline-none resize-none tabular-nums ${validationError ? 'bg-[#fb7185]/5 text-[#fb7185]' : 'bg-surface text-muted'}`}
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
                    [removeComments, setRemoveComments, "Strip Comments", "Removes <!-- blocks -->"],
                    [optStripNamespaces, setOptStripNamespaces, "Remove Namespaces", "Cleans xmlns attributes"]
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
                  {mode === 'minify' && savedPercent > 0 && !validationError && (
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