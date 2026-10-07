"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileJson, GitCompare, PlusCircle, MinusCircle, 
  AlertTriangle, Settings2, ShieldAlert, CheckCircle2,
  Activity, Type, Braces, Code2
} from "lucide-react";

export default function JsonDiffChecker() {
  const [isMounted, setIsMounted] = useState(false);

  const [jsonA, setJsonA] = useState('{\n  "server": "muxair-prod",\n  "version": 1.0,\n  "settings": {\n    "theme": "dark",\n    "timeout": 30\n  },\n  "features": ["auth", "analytics"]\n}');
  const [jsonB, setJsonB] = useState('{\n  "version": "1.0",\n  "server": "muxair-prod",\n  "settings": {\n    "timeout": 60,\n    "retry": true\n  },\n  "features": ["auth", "analytics", "billing"]\n}');
  
  const [strictMode, setStrictMode] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* HEADER BAR */}
      <div className="bg-surface border border-line p-4 sm:p-8 rounded-2xl shadow-card space-y-4 sm:space-y-6 w-full box-border relative overflow-hidden font-sans">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-lg sm:text-xl font-black shrink-0">
            <GitCompare className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-brand uppercase mb-0.5 sm:mb-1">
              COMPARISON UTILITY
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-ink tracking-tight truncate">
              Semantic Diff Oracle
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted mt-0.5 truncate">
              Structure-aware JSON comparison engine with strict type checking.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: DATA INPUTS */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border">
            
            {/* Strict Mode Toggle */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border ${strictMode ? 'border-brand/30 bg-brand/10' : 'border-line bg-surface'} transition-colors font-sans`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg bg-surface border border-line shadow-sm shrink-0 ${strictMode ? 'text-brand' : 'text-muted'}`}>
                  <Type className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-black text-ink uppercase tracking-wider truncate">Strict Type Checking</span>
                  <span className="text-[10px] font-medium text-muted block truncate">Flag differences between <code className="bg-surface border border-line px-1 rounded text-ink">1</code> and <code className="bg-surface border border-line px-1 rounded text-ink">"1"</code></span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setStrictMode(!strictMode)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 shadow-inner ${strictMode ? 'bg-brand' : 'bg-surface border border-line'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-surface shadow-sm transition-transform ${strictMode ? "translate-x-6" : "translate-x-0"}`}></div>
              </button>
            </div>

            {/* Inputs Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Original JSON */}
              <div className="flex flex-col border border-line rounded-xl overflow-hidden shadow-inner bg-surface group focus-within:border-brand transition-colors w-full">
                <div className="flex justify-between items-center px-3.5 py-2.5 bg-surface border-b border-line font-sans">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted">Original JSON</span>
                  <Code2 className="w-3.5 h-3.5 text-muted" />
                </div>
                <textarea
                  value={jsonA} 
                  onChange={(e) => setJsonA(e.target.value)}
                  placeholder="{}"
                  rows="10"
                  className="w-full bg-surface p-3.5 text-xs font-mono text-ink outline-none resize-none custom-scrollbar whitespace-pre tabular-nums"
                  spellCheck="false"
                />
              </div>

              {/* Modified JSON */}
              <div className="flex flex-col border border-line rounded-xl overflow-hidden shadow-inner bg-surface group focus-within:border-brand transition-colors w-full">
                <div className="flex justify-between items-center px-3.5 py-2.5 bg-surface border-b border-line font-sans">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted">Modified JSON</span>
                  <Code2 className="w-3.5 h-3.5 text-muted" />
                </div>
                <textarea
                  value={jsonB} 
                  onChange={(e) => setJsonB(e.target.value)}
                  placeholder="{}"
                  rows="10"
                  className="w-full bg-surface p-3.5 text-xs font-mono text-ink outline-none resize-none custom-scrollbar whitespace-pre tabular-nums"
                  spellCheck="false"
                />
              </div>

            </div>

          </div>
        </div>

        {/* RIGHT: THE DELTA DASHBOARD */}
        <div className="space-y-4 sm:space-y-6 w-full">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border">
            
            <div className="flex items-center justify-between border-b border-line pb-3 font-sans">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Activity className="w-4 h-4 text-brand" /> Delta Analysis
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-xl border border-brand/30">
                Semantic Engine
              </span>
            </div>

            {analysis.error ? (
              <div className="flex flex-col items-center justify-center text-[#fb7185] py-12 font-sans text-center">
                <ShieldAlert className="w-10 h-10 mb-2 opacity-50" />
                <span className="text-xs font-bold">{analysis.error}</span>
                <span className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">Check for missing commas or quotes</span>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Dashboard Stats */}
                <div className="grid grid-cols-3 gap-2 font-sans">
                  <div className="flex flex-col items-center p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-sm">
                    <PlusCircle className="w-4 h-4 text-emerald-500 mb-1" />
                    <span className="text-base font-black text-emerald-500 leading-none tabular-nums">{analysis.stats.added}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mt-1">Additions</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-2.5 bg-[#fb7185]/10 border border-[#fb7185]/30 rounded-xl shadow-sm">
                    <MinusCircle className="w-4 h-4 text-[#fb7185] mb-1" />
                    <span className="text-base font-black text-[#fb7185] leading-none tabular-nums">{analysis.stats.removed}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#fb7185] mt-1">Deletions</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl shadow-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mb-1" />
                    <span className="text-base font-black text-amber-500 leading-none tabular-nums">{analysis.stats.modified}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 mt-1">Modified</span>
                  </div>
                </div>

                {/* Detailed Delta List */}
                <div className="flex flex-col bg-surface border border-line rounded-xl shadow-sm overflow-hidden w-full">
                  <div className="flex items-center px-3.5 py-2.5 bg-surface border-b border-line font-sans">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                      Exact Changes Log
                    </span>
                  </div>

                  <div className="p-3 max-h-[350px] overflow-y-auto custom-scrollbar space-y-2.5">
                    {analysis.delta.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-emerald-500 font-sans">
                        <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-center">
                          JSON Objects Match Perfectly
                        </span>
                      </div>
                    ) : (
                      analysis.delta.map((change, idx) => (
                        <div key={idx} className="flex flex-col bg-surface border border-line rounded-xl p-3 text-xs overflow-hidden shadow-sm">
                          <span className="font-bold text-muted mb-2 truncate font-mono">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted mr-1.5 border border-line px-1 rounded bg-surface">Path</span> 
                            {change.path}
                          </span>
                          
                          {change.type === 'added' && (
                            <div className="flex items-start gap-2 text-emerald-500 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 font-mono tabular-nums">
                              <PlusCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span className="break-all">{formatValue(change.value)}</span>
                            </div>
                          )}
                          
                          {change.type === 'removed' && (
                            <div className="flex items-start gap-2 text-[#fb7185] bg-[#fb7185]/10 p-2 rounded-lg border border-[#fb7185]/20 font-mono tabular-nums">
                              <MinusCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span className="break-all line-through opacity-80">{formatValue(change.value)}</span>
                            </div>
                          )}

                          {change.type === 'modified' && (
                            <div className="space-y-1.5 font-mono tabular-nums">
                              <div className="flex items-start gap-2 text-[#fb7185] bg-[#fb7185]/10 p-2 rounded-lg border border-[#fb7185]/20">
                                <MinusCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-60" />
                                <span className="break-all line-through opacity-80">{formatValue(change.old)}</span>
                              </div>
                              <div className="flex items-start gap-2 text-amber-500 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
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

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}