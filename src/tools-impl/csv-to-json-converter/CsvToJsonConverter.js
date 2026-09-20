"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileJson, FileText, Settings2, CheckCircle2, 
  Copy, Download, Activity, Braces, 
  Type, AlignLeft, ShieldCheck, AlertCircle
} from "lucide-react";

export default function CsvToJsonConverter() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [csvInput, setCsvInput] = useState(`id,user.name,user.isActive,score,role\n1,Alex Mercer,true,95.5,admin\n2,Sarah Connor,false,88,user\n3,John Doe,null,0,guest`);
  const [delimiter, setDelimiter] = useState(","); // ',', '\t', ';', '|'
  const [useNesting, setUseNesting] = useState(true);
  const [autoType, setAutoType] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- CORE PARSING ENGINE ---
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
    
    // Remove empty trailing rows
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

  // --- COMPUTE JSON ---
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
        if (row.length === 1 && row[0].trim() === "") continue; // Skip empty rows

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

  if (!isMounted) return null;

  // Premium Cyber-Fuchsia Theme
  const theme = {
    gradient: "from-fuchsia-200 via-violet-100 to-transparent dark:from-fuchsia-900/30 dark:via-violet-900/20",
    bgIcon: "bg-gradient-to-br from-fuchsia-500 to-violet-600",
    textPri: "text-fuchsia-600 dark:text-fuchsia-400",
    textSec: "text-violet-600 dark:text-violet-400",
    borderLight: "border-fuchsia-200 dark:border-fuchsia-800/50",
    bgLight: "bg-fuchsia-50 dark:bg-fuchsia-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <FileJson className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Data Serialization Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              CSV to Structured JSON Transformer
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,500px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Primary Input */}
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <AlignLeft className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Raw Data Input
                </h3>
                
                <select
                  value={delimiter} onChange={(e) => setDelimiter(e.target.value)}
                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm outline-none cursor-pointer border bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700`}
                >
                  <option value=",">Comma (CSV)</option>
                  <option value="tab">Tab (TSV)</option>
                  <option value=";">Semicolon</option>
                  <option value="|">Pipe</option>
                </select>
              </div>
              
              <div className={`relative flex flex-col bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-fuchsia-500 focus-within:ring-4 focus-within:ring-fuchsia-500/10 transition-all overflow-hidden group shadow-inner`}>
                <textarea
                  value={csvInput} 
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="id,name,email..."
                  rows="8"
                  className="w-full bg-transparent px-5 py-5 text-sm font-mono text-slate-800 dark:text-slate-100 outline-none resize-none custom-scrollbar break-all whitespace-pre"
                  spellCheck="false"
                />
              </div>

              {results.error && csvInput && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" /> {results.error}
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Format Controls */}
            <div className="space-y-4 font-sans">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Settings2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Transformation Rules
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Auto Type Toggle */}
                <div className={`flex flex-col p-4 rounded-xl border ${autoType ? theme.borderLight + " " + theme.bgLight : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"} transition-colors duration-500`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg ${autoType ? `bg-white dark:bg-slate-800 shadow-sm ${theme.textPri}` : "text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"}`}>
                      <Type className="w-4 h-4" />
                    </div>
                    <button onClick={() => setAutoType(!autoType)} className={`w-10 h-5 rounded-full transition-colors relative p-1 shadow-inner ${autoType ? `bg-gradient-to-r ${theme.gradient.split(' ').slice(0, 2).join(' ')}` : "bg-slate-300 dark:bg-slate-700"}`}>
                      <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${autoType ? "translate-x-5" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                  <span className="block text-xs font-black text-slate-800 dark:text-slate-100 font-sans">Smart Type Cast</span>
                  <span className="text-[9px] font-bold text-slate-500 block leading-snug mt-1 font-sans">Convert strings to numbers/booleans.</span>
                </div>

                {/* Dot Notation Nesting */}
                <div className={`flex flex-col p-4 rounded-xl border ${useNesting ? theme.borderLight + " " + theme.bgLight : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"} transition-colors duration-500`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg ${useNesting ? `bg-white dark:bg-slate-800 shadow-sm ${theme.textSec}` : "text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"}`}>
                      <Braces className="w-4 h-4" />
                    </div>
                    <button onClick={() => setUseNesting(!useNesting)} className={`w-10 h-5 rounded-full transition-colors relative p-1 shadow-inner ${useNesting ? `bg-gradient-to-r ${theme.gradient.split(' ').slice(0, 2).join(' ')}` : "bg-slate-300 dark:bg-slate-700"}`}>
                      <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${useNesting ? "translate-x-5" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                  <span className="block text-xs font-black text-slate-800 dark:text-slate-100 font-sans">Dot Nesting</span>
                  <span className="text-[9px] font-bold text-slate-500 block leading-snug mt-1 font-sans">e.g. 'user.name' becomes `{'{ user: { name } }'}`</span>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE OUTPUT CONSOLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[640px]">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0 font-sans">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Output Console
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.textPri} bg-white dark:bg-[#0d1117] px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700`}>
                  JSON Structure
                </span>
              </div>

              {/* Data Analytics */}
              {!results.error && results.json && (
                <div className="flex items-center justify-between p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl mb-4 shadow-sm shrink-0 font-sans">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payload Integrity</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black tracking-widest">
                    <span className="text-slate-700 dark:text-slate-300 tabular-nums">{results.rows} Objects</span>
                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                    <span className="text-slate-700 dark:text-slate-300 tabular-nums">{(results.size / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
              )}

              {/* The Actual Output Area */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0d1117] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                
                {/* Output Header */}
                <div className="flex justify-between items-center px-4 py-3 bg-slate-100/50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-800 font-sans shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Compiled JSON
                  </span>
                  
                  {results.json && !results.error && (
                    <div className="flex gap-2">
                      <button 
                        onClick={handleCopy} 
                        className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                          copied ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy</>}
                      </button>
                      <button 
                        onClick={handleDownload} 
                        className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-slate-800 text-white border-slate-700 hover:bg-slate-700 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5"/> Save
                      </button>
                    </div>
                  )}
                </div>

                {/* Output Content */}
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                  {!results.json || results.error ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans">
                      <FileText className="w-10 h-10 mb-3 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest text-center max-w-[200px]">
                        Awaiting Valid CSV Data
                      </span>
                    </div>
                  ) : (
                    <pre className="text-xs break-all text-slate-800 dark:text-slate-300 leading-relaxed font-mono m-0">
                      <code>{results.json}</code>
                    </pre>
                  )}
                </div>

              </div>
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}