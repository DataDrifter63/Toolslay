"use client";

import React, { useState, useEffect, useCallback } from "react";
import beautify from "js-beautify";
import { Settings2, Zap, Trash2, Copy, BarChart3, RotateCcw, AlertTriangle, FileCode2, Check, Minimize2, Maximize2, Scissors, CheckCircle } from "lucide-react";

// --- Pro XML Optimizers ---
const stripXmlNamespaces = (xml) => {
  if (!xml) return "";
  // Removes xmlns attributes like xmlns="...", xmlns:xsi="..." safely
  return xml.replace(/\sxmlns(:\w+)?=(['"])(.*?)\2/g, '');
};

const minifyXML = (xml, removeComments) => {
  if (!xml) return "";
  let minified = xml;
  
  if (removeComments) {
    minified = minified.replace(/<!--[\s\S]*?-->/g, '');
  }
  
  return minified
    .replace(/>\s+</g, '><') // Remove spaces between tags
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

  // Hydration safety
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
        // Clean up the error message for better UI
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
    
    // Live Strict Validation
    const error = validateXML(processed);
    setValidationError(error);

    // Apply Pro Optimizations
    if (optStripNamespaces) processed = stripXmlNamespaces(processed);

    if (mode === "minify") {
      processed = minifyXML(processed, removeComments);
    } else {
      if (removeComments) {
        processed = processed.replace(/<!--[\s\S]*?-->/g, ''); 
      }
      // js-beautify uses HTML mode for XML formatting perfectly
      processed = beautify.html(processed, {
        indent_size: indentSize,
        indent_char: " ",
        preserve_newlines: true,
        max_preserve_newlines: 1,
        unformatted: [], // Important to not inline XML tags
        wrap_attributes: "auto"
      });
    }

    setOutput(processed);
  }, [input, mode, indentSize, optStripNamespaces, removeComments]);

  useEffect(() => {
    processXML();
  }, [processXML]);

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
          <FileCode2 className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">XML Formatter & Validator</h2>
          <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold px-3 py-1 rounded-full uppercase hidden sm:block">Pro Utility</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:text-purple-600 transition-all">
            <Settings2 className="w-4 h-4" /> {showSettings ? "Hide Settings" : "Show Settings"}
          </button>
          <button onClick={handleCopy} className="flex items-center gap-2 text-sm font-semibold bg-purple-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-purple-700 transition-colors">
            {copiedState ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiedState ? "Copied!" : "Copy Output"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 items-start">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-[600px] h-[75vh]">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Raw XML Input</label>
              <div className="flex gap-1">
                <button onClick={() => setInput("")} className="p-1.5 text-slate-500 hover:text-red-600 rounded transition-colors" title="Clear Code"><Trash2 className="w-4 h-4"/></button>
                <button onClick={processXML} className="p-1.5 text-slate-500 hover:text-purple-600 rounded transition-colors" title="Process Again"><RotateCcw className="w-4 h-4"/></button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your unformatted XML here..."
              className="w-full h-full flex-grow p-4 bg-transparent text-sm font-mono text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              spellCheck="false"
            />
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col h-full shadow-sm relative">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                {mode === 'minify' ? <Minimize2 className="w-4 h-4 text-emerald-500"/> : <Maximize2 className="w-4 h-4 text-purple-500"/>}
                {mode === 'minify' ? "Minified Output" : "Beautified Output"}
              </label>
              <div className="flex gap-1 pr-1">
                 {validationError ? (
                   <span className="text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md border border-red-200"><AlertTriangle className="w-3.5 h-3.5" /> Invalid XML</span>
                 ) : input.trim() ? (
                   <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200"><CheckCircle className="w-3.5 h-3.5" /> Valid XML</span>
                 ) : null}
              </div>
            </div>
            
            {/* Show Validation Error Inline */}
            {validationError && (
              <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900/50 p-3 text-xs font-mono text-red-700 dark:text-red-400 break-words">
                <strong>Error Details:</strong> {validationError}
              </div>
            )}

            <textarea
              readOnly
              value={output}
              placeholder="Result will appear here..."
              className={`w-full h-full flex-grow p-4 text-sm font-mono resize-none focus:outline-none ${validationError ? 'bg-red-50/30 dark:bg-red-900/10 text-red-900 dark:text-red-200' : 'bg-slate-50/50 dark:bg-slate-800/30 text-slate-800 dark:text-slate-200'}`}
            />
          </div>
        </div>

        {showSettings && (
          <div className="space-y-6 lg:w-72 lg:max-w-72 flex flex-col h-full">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Zap className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Operation Mode</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={() => setMode("beautify")} className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${mode === 'beautify' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-600'}`}>BEAUTIFY</button>
                <button onClick={() => setMode("minify")} className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${mode === 'minify' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-600'}`}>MINIFY</button>
              </div>

              {mode === 'beautify' && (
                <div className="pt-3">
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Indentation Size</label>
                  <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))} className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 outline-none focus:ring-1 focus:ring-purple-500">
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
                <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50">
                  <input type="checkbox" checked={removeComments} onChange={(e) => setRemoveComments(e.target.checked)} className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Strip Comments</span>
                    <span className="text-xs text-slate-400">Removes &lt;!-- blocks --&gt;</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50">
                  <input type="checkbox" checked={optStripNamespaces} onChange={(e) => setOptStripNamespaces(e.target.checked)} className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Remove Namespaces</span>
                    <span className="text-xs text-slate-400">Cleans xmlns attributes</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Compression</h3>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm font-medium text-slate-500">Original Size</span>
                  <span className="font-bold">{(inputSize / 1024).toFixed(2)} KB</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm font-medium text-slate-500">New Size</span>
                  <span className="font-bold">{(outputSize / 1024).toFixed(2)} KB</span>
                </div>
                {mode === 'minify' && savedPercent > 0 && !validationError && (
                  <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                    <span className="block text-sm text-emerald-600 font-medium">Space Saved</span>
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
}