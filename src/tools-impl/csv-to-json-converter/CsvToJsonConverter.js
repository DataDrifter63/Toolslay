"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileJson, FileText, Settings2, CheckCircle2, 
  Copy, Download, Activity, Braces, 
  Type, AlignLeft, ShieldCheck, AlertCircle
} from "lucide-react";

export default function CsvToJsonConverter() {
  const [isMounted, setIsMounted] = useState(false);

  const [csvInput, setCsvInput] = useState(`id,user.name,user.isActive,score,role\n1,Alex Mercer,true,95.5,admin\n2,Sarah Connor,false,88,user\n3,John Doe,null,0,guest`);
  const [delimiter, setDelimiter] = useState(",");
  const [useNesting, setUseNesting] = useState(true);
  const [autoType, setAutoType] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const parseCSV = (text, del) => {
    let rows = [];
    let currentRow = [];
    let currentVal = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      let nextChar = text[i + 1];
      
      if (char === '"' && inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === del && !inQuotes) {
        currentRow.push(currentVal);
        currentVal = '';
      } else if (char === '\n' && !inQuotes) {
        if (currentVal.endsWith('\r')) currentVal = currentVal.slice(0, -1);
        currentRow.push(currentVal);
        rows.push(currentRow);
        currentRow = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    
    if (currentVal.endsWith('\r')) currentVal = currentVal.slice(0, -1);
    currentRow.push(currentVal);
    if (currentRow.length > 0 || currentVal !== '') rows.push(currentRow);
    
    if (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
      rows.pop();
    }
    return rows;
  };

  const inferType = (val) => {
    if (!val && val !== '0') return null;
    const lower = val.trim().toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
    if (lower === 'null') return null;
    if (!isNaN(val) && val.trim() !== '') return Number(val);
    return val;
  };

  const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  };

  const results = useMemo(() => {
    if (!csvInput.trim()) return { json: "", obj: [], error: false, rows: 0, size: 0 };

    try {
      const parsedRows = parseCSV(csvInput, delimiter === "tab" ? "\t" : delimiter);
      if (parsedRows.length < 2) {
        return { json: "[]", obj: [], error: "Need at least a header row and one data row.", rows: 0, size: 0 };
      }

      const headers = parsedRows[0].map(h => h.trim());
      const jsonData = [];

      for (let i = 1; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        if (row.length === 1 && row[0].trim() === "") continue;

        let obj = {};
        for (let j = 0; j < headers.length; j++) {
          const key = headers[j];
          if (!key) continue;
          
          let val = row[j] !== undefined ? row[j] : "";
          if (autoType) val = inferType(val);

          if (useNesting && key.includes('.')) {
            setNestedValue(obj, key, val);
          } else {
            obj[key] = val;
          }
        }
        jsonData.push(obj);
      }

      const finalJson = JSON.stringify(jsonData, null, 2);
      const bytes = new TextEncoder().encode(finalJson).length;

      return {
        json: finalJson,
        obj: jsonData,
        error: false,
        rows: jsonData.length,
        size: bytes,
        keys: headers.length
      };
    } catch (err) {
      return { json: "", obj: [], error: "Invalid CSV Format.", rows: 0, size: 0 };
    }
  }, [csvInput, delimiter, useNesting, autoType]);

  const handleCopy = () => {
    if (!results.json) return;
    navigator.clipboard.writeText(results.json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!results.json) return;
    const blob = new Blob([results.json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'muxair_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* HEADER BAR */}
      <div className="bg-surface border border-line p-4 sm:p-8 rounded-2xl shadow-card space-y-4 sm:space-y-6 w-full box-border relative overflow-hidden font-sans">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-lg sm:text-xl font-black shrink-0">
            <FileJson className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-brand uppercase mb-0.5 sm:mb-1">
              SERIALIZATION UTILITY
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-ink tracking-tight truncate">
              Data Serialization Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted mt-0.5 truncate">
              CSV to structured JSON transformer with smart type casting and nesting.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: CONFIGURATION ENGINE */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border">
            
            {/* 1. Primary Input */}
            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-brand" /> 1. Raw Data Input
                </h3>
                
                <select
                  value={delimiter} 
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl outline-none cursor-pointer border bg-surface text-ink border-line"
                >
                  <option value=",">Comma (CSV)</option>
                  <option value="tab">Tab (TSV)</option>
                  <option value=";">Semicolon</option>
                  <option value="|">Pipe</option>
                </select>
              </div>
              
              <div className="bg-surface border border-line rounded-xl overflow-hidden focus-within:border-brand transition-all w-full">
                <textarea
                  value={csvInput} 
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="id,name,email..."
                  rows="6"
                  className="w-full bg-surface px-4 py-3 text-xs sm:text-sm font-mono text-ink outline-none resize-none custom-scrollbar break-all whitespace-pre tabular-nums"
                  spellCheck="false"
                />
              </div>

              {results.error && csvInput && (
                <div className="flex items-center gap-2 p-3 bg-[#fb7185]/10 border border-[#fb7185]/30 rounded-xl text-[#fb7185] text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {results.error}
                </div>
              )}
            </div>

            <hr className="border-line" />

            {/* 2. Format Controls */}
            <div className="space-y-3 font-sans">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Settings2 className="w-3.5 h-3.5 text-brand" /> 2. Transformation Rules
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Auto Type Toggle */}
                <div className={`flex flex-col p-3.5 rounded-xl border ${autoType ? 'border-brand/30 bg-brand/10' : 'border-line bg-surface'} transition-colors`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-surface border border-line shadow-sm shrink-0 ${autoType ? 'text-brand' : 'text-muted'}`}>
                      <Type className="w-4 h-4" />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setAutoType(!autoType)} 
                      className={`w-10 h-5 rounded-full transition-colors relative p-1 shadow-inner shrink-0 ${autoType ? 'bg-brand' : 'bg-surface border border-line'}`}
                    >
                      <div className={`w-3 h-3 rounded-full bg-surface shadow-sm transition-transform ${autoType ? "translate-x-5" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                  <span className="block text-xs font-black text-ink uppercase tracking-wider">Smart Type Cast</span>
                  <span className="text-[9px] font-bold text-muted block leading-snug mt-1">Convert strings to numbers/booleans.</span>
                </div>

                {/* Dot Notation Nesting */}
                <div className={`flex flex-col p-3.5 rounded-xl border ${useNesting ? 'border-brand/30 bg-brand/10' : 'border-line bg-surface'} transition-colors`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-surface border border-line shadow-sm shrink-0 ${useNesting ? 'text-brand' : 'text-muted'}`}>
                      <Braces className="w-4 h-4" />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setUseNesting(!useNesting)} 
                      className={`w-10 h-5 rounded-full transition-colors relative p-1 shadow-inner shrink-0 ${useNesting ? 'bg-brand' : 'bg-surface border border-line'}`}
                    >
                      <div className={`w-3 h-3 rounded-full bg-surface shadow-sm transition-transform ${useNesting ? "translate-x-5" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                  <span className="block text-xs font-black text-ink uppercase tracking-wider">Dot Nesting</span>
                  <span className="text-[9px] font-bold text-muted block leading-snug mt-1">e.g. 'user.name' becomes nested objects.</span>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: THE OUTPUT CONSOLE */}
        <div className="space-y-4 sm:space-y-6 w-full">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border">
            
            <div className="flex items-center justify-between border-b border-line pb-3 font-sans">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Activity className="w-4 h-4 text-brand" /> Output Console
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-xl border border-brand/30">
                JSON Structure
              </span>
            </div>

            {/* Data Analytics */}
            {!results.error && results.json && (
              <div className="flex items-center justify-between p-3 bg-surface border border-line rounded-xl shadow-sm font-sans">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted">Payload Integrity</span>
                </div>
                <div className="flex items-center gap-2.5 text-[10px] font-black tracking-wider">
                  <span className="text-ink tabular-nums">{results.rows} Objects</span>
                  <div className="w-1 h-1 rounded-full bg-muted"></div>
                  <span className="text-ink tabular-nums">{(results.size / 1024).toFixed(2)} KB</span>
                </div>
              </div>
            )}

            {/* The Actual Output Area */}
            <div className="flex flex-col bg-surface border border-line rounded-xl shadow-sm overflow-hidden w-full">
              
              <div className="flex justify-between items-center px-3.5 py-2.5 bg-surface border-b border-line font-sans">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                  Compiled JSON
                </span>
                
                {results.json && !results.error && (
                  <div className="flex gap-1.5">
                    <button 
                      type="button"
                      onClick={handleCopy} 
                      className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                        copied ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-surface text-muted border-line hover:text-ink"
                      }`}
                    >
                      {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy</>}
                    </button>
                    <button 
                      type="button"
                      onClick={handleDownload} 
                      className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1 px-2.5 py-1 rounded-lg border bg-brand text-white border-brand hover:opacity-90 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5"/> Save
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                {!results.json || results.error ? (
                  <div className="h-32 flex flex-col items-center justify-center text-muted font-sans">
                    <FileText className="w-8 h-8 mb-2 opacity-30" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-center max-w-[200px]">
                      Awaiting Valid CSV Data
                    </span>
                  </div>
                ) : (
                  <pre className="text-xs sm:text-sm break-all text-ink leading-relaxed font-mono m-0 tabular-nums">
                    <code>{results.json}</code>
                  </pre>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}