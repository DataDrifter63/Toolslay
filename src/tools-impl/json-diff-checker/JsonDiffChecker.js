"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileJson, GitCompare, PlusCircle, MinusCircle, 
  AlertTriangle, Settings2, ShieldAlert, CheckCircle2,
  Activity, Type, Braces, Code2
} from "lucide-react";

export default function JsonDiffChecker() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [jsonA, setJsonA] = useState('{\n  "server": "muxair-prod",\n  "version": 1.0,\n  "settings": {\n    "theme": "dark",\n    "timeout": 30\n  },\n  "features": ["auth", "analytics"]\n}');
  const [jsonB, setJsonB] = useState('{\n  "version": "1.0",\n  "server": "muxair-prod",\n  "settings": {\n    "timeout": 60,\n    "retry": true\n  },\n  "features": ["auth", "analytics", "billing"]\n}');
  
  const [strictMode, setStrictMode] = useState(true); // true = 1 !== "1"

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- SEMANTIC DIFF ENGINE ---
  const computeDiff = (obj1, obj2, currentPath = "root", strict) => {
    let changes = [];

    const isObject = (val) => val && typeof val === 'object' && !Array.isArray(val);
    const isArray = (val) => Array.isArray(val);

    const keys1 = isObject(obj1) ? Object.keys(obj1) : [];
    const keys2 = isObject(obj2) ? Object.keys(obj2) : [];
    const allKeys = Array.from(new Set([...keys1, ...keys2]));

    if (isObject(obj1) && isObject(obj2)) {
      for (const key of allKeys) {
        const path = currentPath === "root" ? key : `${currentPath}.${key}`;
        
        if (!(key in obj1)) {
          changes.push({ path, type: 'added', value: obj2[key] });
        } else if (!(key in obj2)) {
          changes.push({ path, type: 'removed', value: obj1[key] });
        } else {
          changes = changes.concat(computeDiff(obj1[key], obj2[key], path, strict));
        }
      }
    } else if (isArray(obj1) && isArray(obj2)) {
      const maxLen = Math.max(obj1.length, obj2.length);
      for (let i = 0; i < maxLen; i++) {
        const path = `${currentPath}[${i}]`;
        if (i >= obj1.length) {
          changes.push({ path, type: 'added', value: obj2[i] });
        } else if (i >= obj2.length) {
          changes.push({ path, type: 'removed', value: obj1[i] });
        } else {
          changes = changes.concat(computeDiff(obj1[i], obj2[i], path, strict));
        }
      }
    } else {
      // Primitive comparison
      const valsEqual = strict ? obj1 === obj2 : String(obj1) === String(obj2);
      if (!valsEqual) {
        changes.push({ path: currentPath, type: 'modified', old: obj1, new: obj2 });
      }
    }

    return changes;
  };

  const analysis = useMemo(() => {
    let parsedA = null;
    let parsedB = null;
    let errorA = null;
    let errorB = null;

    try { parsedA = JSON.parse(jsonA || "{}"); } catch (e) { errorA = "Invalid JSON in Original"; }
    try { parsedB = JSON.parse(jsonB || "{}"); } catch (e) { errorB = "Invalid JSON in Modified"; }

    if (errorA || errorB) {
      return { error: errorA || errorB, delta: [] };
    }

    const delta = computeDiff(parsedA, parsedB, "root", strictMode);
    
    const stats = {
      added: delta.filter(d => d.type === 'added').length,
      removed: delta.filter(d => d.type === 'removed').length,
      modified: delta.filter(d => d.type === 'modified').length,
    };

    return { error: false, delta, stats };
  }, [jsonA, jsonB, strictMode]);

  const formatValue = (val) => {
    if (val === null) return "null";
    if (val === undefined) return "undefined";
    if (typeof val === 'object') return JSON.stringify(val);
    if (typeof val === 'string') return `"${val}"`;
    return String(val);
  };

  if (!isMounted) return null;

  // Premium Cyber-Orange Theme
  const theme = {
    gradient: "from-amber-200 via-orange-100 to-transparent dark:from-amber-900/30 dark:via-orange-900/20",
    bgIcon: "bg-gradient-to-br from-amber-500 to-orange-600",
    textPri: "text-amber-600 dark:text-amber-400",
    textSec: "text-orange-600 dark:text-orange-400",
    borderLight: "border-amber-200 dark:border-amber-800/50",
    bgLight: "bg-amber-50 dark:bg-amber-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <GitCompare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Semantic Diff Oracle
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Structure-Aware JSON Comparison
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6 items-start">
        
        {/* ================= LEFT: DATA INPUTS ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
            
            {/* Strict Mode Toggle */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border ${strictMode ? theme.borderLight + " " + theme.bgLight : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"} transition-colors duration-500 font-sans`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${strictMode ? `bg-white dark:bg-slate-800 shadow-sm ${theme.textPri}` : "text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"}`}>
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-sm font-black text-slate-800 dark:text-slate-100">Strict Type Checking</span>
                  <span className="text-[10px] text-slate-500 block leading-snug">Flag differences between <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">1</code> and <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">"1"</code></span>
                </div>
              </div>
              <button 
                onClick={() => setStrictMode(!strictMode)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 shadow-inner ${strictMode ? `bg-gradient-to-r ${theme.gradient.split(' ').slice(0, 2).join(' ')}` : "bg-slate-300 dark:bg-slate-700"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${strictMode ? "translate-x-6" : "translate-x-0"}`}></div>
              </button>
            </div>

            {/* Inputs Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Original JSON */}
              <div className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-900 group focus-within:border-amber-400 transition-colors">
                <div className="flex justify-between items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-sans">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Original JSON</span>
                  <Code2 className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <textarea
                  value={jsonA} 
                  onChange={(e) => setJsonA(e.target.value)}
                  placeholder="{}"
                  className="w-full h-80 bg-transparent p-4 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none resize-none custom-scrollbar whitespace-pre"
                  spellCheck="false"
                />
              </div>

              {/* Modified JSON */}
              <div className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-900 group focus-within:border-amber-400 transition-colors">
                <div className="flex justify-between items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-sans">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Modified JSON</span>
                  <Code2 className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <textarea
                  value={jsonB} 
                  onChange={(e) => setJsonB(e.target.value)}
                  placeholder="{}"
                  className="w-full h-80 bg-transparent p-4 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none resize-none custom-scrollbar whitespace-pre"
                  spellCheck="false"
                />
              </div>

            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DELTA DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[640px]">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0 font-sans">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Delta Analysis
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.textPri} bg-white dark:bg-[#0d1117] px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700`}>
                  Semantic Engine
                </span>
              </div>

              {analysis.error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-rose-500 font-sans">
                  <ShieldAlert className="w-10 h-10 mb-3 opacity-50" />
                  <span className="text-sm font-bold">{analysis.error}</span>
                  <span className="text-[10px] uppercase tracking-widest mt-1 opacity-70">Check for missing commas or quotes</span>
                </div>
              ) : (
                <>
                  {/* Dashboard Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-6 shrink-0 font-sans">
                    <div className="flex flex-col items-center p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl shadow-sm">
                      <PlusCircle className="w-4 h-4 text-emerald-500 mb-1" />
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none">{analysis.stats.added}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600/70 dark:text-emerald-500 mt-1">Additions</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50 rounded-xl shadow-sm">
                      <MinusCircle className="w-4 h-4 text-rose-500 mb-1" />
                      <span className="text-lg font-black text-rose-600 dark:text-rose-400 leading-none">{analysis.stats.removed}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-rose-600/70 dark:text-rose-500 mt-1">Deletions</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl shadow-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mb-1" />
                      <span className="text-lg font-black text-amber-600 dark:text-amber-400 leading-none">{analysis.stats.modified}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-amber-600/70 dark:text-amber-500 mt-1">Modified</span>
                    </div>
                  </div>

                  {/* Detailed Delta List */}
                  <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0d1117] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center px-4 py-2 bg-slate-100/50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-800 font-sans shrink-0">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Exact Changes Log
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                      {analysis.delta.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-emerald-500 font-sans">
                          <CheckCircle2 className="w-10 h-10 mb-3 opacity-50" />
                          <span className="text-xs font-bold uppercase tracking-widest text-center">
                            JSON Objects Match Perfectly
                          </span>
                        </div>
                      ) : (
                        analysis.delta.map((change, idx) => (
                          <div key={idx} className="flex flex-col bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 p-3 text-xs overflow-hidden">
                            <span className="font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mr-2 border border-slate-200 dark:border-slate-700 px-1 rounded bg-white dark:bg-slate-900">Path</span> 
                              {change.path}
                            </span>
                            
                            {change.type === 'added' && (
                              <div className="flex items-start gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10 p-2 rounded">
                                <PlusCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span className="break-all">{formatValue(change.value)}</span>
                              </div>
                            )}
                            
                            {change.type === 'removed' && (
                              <div className="flex items-start gap-2 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/10 p-2 rounded">
                                <MinusCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span className="break-all line-through opacity-80">{formatValue(change.value)}</span>
                              </div>
                            )}

                            {change.type === 'modified' && (
                              <div className="space-y-1">
                                <div className="flex items-start gap-2 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/10 p-2 rounded">
                                  <MinusCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-60" />
                                  <span className="break-all line-through opacity-80">{formatValue(change.old)}</span>
                                </div>
                                <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10 p-2 rounded border border-amber-200/50 dark:border-amber-800/50">
                                  <PlusCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <span className="break-all font-bold">{formatValue(change.new)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}