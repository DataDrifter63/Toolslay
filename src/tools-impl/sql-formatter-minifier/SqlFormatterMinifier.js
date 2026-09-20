"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Database, Code2, Minimize2, AlignLeft, 
  Copy, CheckCircle2, Zap, ShieldCheck, 
  Settings2, Activity, TerminalSquare
} from "lucide-react";

export default function SqlFormatterMinifier() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [inputSql, setInputSql] = useState(
`SELECT users.id,users.name,orders.total FROM users LEFT JOIN orders ON users.id=orders.user_id WHERE users.status='active' AND orders.total>1000 GROUP BY users.id ORDER BY orders.total DESC LIMIT 10;`
  );
  
  const [mode, setMode] = useState("format"); // 'format', 'minify', 'parameterize'
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- CORE SQL ENGINE ---
  const processSql = (sql, action, uppercase) => {
    if (!sql.trim()) return "";

    let processed = sql;
    const stringLiterals = [];

    // 1. Safely extract string literals to avoid messing up spaces/keywords inside quotes
    processed = processed.replace(/'[^']*'/g, (match) => {
      stringLiterals.push(match);
      return `__MUXAIR_STR_${stringLiterals.length - 1}__`;
    });

    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'OUTER JOIN', 'JOIN',
      'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UPDATE', 'SET', 'DELETE',
      'INSERT INTO', 'VALUES', 'UNION ALL', 'UNION', 'AND', 'OR', 'ON', 'AS', 'IN', 'IS NULL', 'IS NOT NULL'
    ];

    if (action === 'minify') {
      // Minify: Remove extra spaces and newlines
      processed = processed.replace(/\s+/g, ' ').trim();
      
    } else if (action === 'format' || action === 'parameterize') {
      // Basic normalization
      processed = processed.replace(/\s+/g, ' ').trim();

      // Uppercase keywords if enabled
      if (uppercase) {
        keywords.forEach(kw => {
          const regex = new RegExp(`\\b${kw}\\b`, 'gi');
          processed = processed.replace(regex, kw);
        });
      }

      // Add newlines before major block keywords
      const blockKeywords = ['SELECT', 'FROM', 'WHERE', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'OUTER JOIN', 'JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'UPDATE', 'SET', 'DELETE', 'INSERT INTO', 'VALUES', 'UNION'];
      blockKeywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'g');
        processed = processed.replace(regex, `\n${kw}`);
      });

      // Indent sub-clauses
      processed = processed.replace(/\bAND\b/g, '\n  AND');
      processed = processed.replace(/\bOR\b/g, '\n  OR');
      processed = processed.replace(/\bON\b/g, '\n  ON');
      processed = processed.replace(/,\s*/g, ',\n  '); // Break on commas
      
      // Cleanup extra newlines created by regex
      processed = processed.replace(/\n+/g, '\n').trim();
    }

    if (action === 'parameterize') {
      // Replace extracted strings with ?
      processed = processed.replace(/__MUXAIR_STR_\d+__/g, '?');
      // Replace standalone numbers with ? (avoiding column names with numbers)
      processed = processed.replace(/(?<=[=<>!+\-*/\s])\d+(?=[,\s;]|$)/g, '?');
    } else {
      // Restore string literals for Format and Minify
      stringLiterals.forEach((str, i) => {
        processed = processed.replace(`__MUXAIR_STR_${i}__`, str);
      });
    }

    return processed;
  };

  // Syntax Highlighter Helper
  const highlightSql = (sql) => {
    if (!sql) return "";
    let highlighted = sql
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Highlight strings (Green)
    highlighted = highlighted.replace(/('[^']*')/g, '<span class="text-emerald-500">$1</span>');
    
    // Highlight parameters (Pink)
    highlighted = highlighted.replace(/(\?)/g, '<span class="text-fuchsia-500 font-bold">$1</span>');
    
    // Highlight numbers (Orange)
    highlighted = highlighted.replace(/(?<=[=<>!+\-*/\s])(\d+)(?=[,\s;]|$)/g, '<span class="text-orange-500">$1</span>');
    
    // Highlight keywords (Blue)
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'JOIN',
      'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UPDATE', 'SET', 'DELETE',
      'INSERT INTO', 'VALUES', 'AND', 'OR', 'ON', 'AS', 'IN', 'IS', 'NULL', 'NOT', 'DESC', 'ASC'
    ];
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<span class="text-sky-500 font-bold">$&</span>`);
    });

    return highlighted;
  };

  const results = useMemo(() => {
    const rawOutput = processSql(inputSql, mode, uppercaseKeywords);
    const highlightedOutput = highlightSql(rawOutput);
    return { raw: rawOutput, highlighted: highlightedOutput };
  }, [inputSql, mode, uppercaseKeywords]);

  const handleCopy = () => {
    if (!results.raw) return;
    navigator.clipboard.writeText(results.raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) return null;

  // Premium Slate & Sky Theme
  const theme = {
    gradient: "from-sky-200 via-indigo-100 to-transparent dark:from-sky-900/30 dark:via-indigo-900/20",
    bgIcon: "bg-gradient-to-br from-sky-500 to-indigo-600",
    textPri: "text-sky-600 dark:text-sky-400",
    textSec: "text-indigo-600 dark:text-indigo-400",
    borderLight: "border-sky-200 dark:border-sky-800/50",
    bgLight: "bg-sky-50 dark:bg-sky-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              SQL Ops Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Formatter, Minifier & Query Parameterizer
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.1fr] gap-6 items-start">
        
        {/* ================= LEFT: CONFIG & INPUT ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8 font-sans">
            
            {/* 1. Tool Mode */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Settings2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Execution Mode
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => setMode('format')} className={`p-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all border-2 flex flex-col items-center gap-2 ${mode === 'format' ? theme.borderLight + " " + theme.bgLight + " " + theme.textPri : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                  <AlignLeft className="w-5 h-5" /> Format
                </button>
                <button onClick={() => setMode('minify')} className={`p-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all border-2 flex flex-col items-center gap-2 ${mode === 'minify' ? theme.borderLight + " " + theme.bgLight + " " + theme.textPri : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                  <Minimize2 className="w-5 h-5" /> Minify
                </button>
                <button onClick={() => setMode('parameterize')} className={`p-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border-2 flex flex-col items-center gap-2 ${mode === 'parameterize' ? theme.borderLight + " " + theme.bgLight + " text-fuchsia-600 dark:text-fuchsia-400" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                  <ShieldCheck className="w-5 h-5" /> Parameterize
                </button>
              </div>

              {/* Extra settings based on mode */}
              {(mode === 'format' || mode === 'parameterize') && (
                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-sky-300 transition-colors mt-3">
                  <input type="checkbox" checked={uppercaseKeywords} onChange={(e) => setUppercaseKeywords(e.target.checked)} className="w-4 h-4 accent-sky-500" />
                  <div>
                    <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Uppercase SQL Keywords</span>
                    <span className="block text-[9px] text-slate-500">Converts 'select' to 'SELECT' automatically.</span>
                  </div>
                </label>
              )}
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Raw SQL Input */}
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Code2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Raw SQL Input
                </h3>
                <span className="text-[9px] font-bold bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <Zap className="w-3 h-3"/> Auto-Parse
                </span>
              </div>
              
              <div className={`relative flex flex-col bg-slate-50 dark:bg-[#161b22] border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/10 transition-all overflow-hidden group shadow-inner`}>
                <textarea
                  value={inputSql} 
                  onChange={(e) => setInputSql(e.target.value)}
                  placeholder="SELECT * FROM table WHERE..."
                  rows="10"
                  className="w-full bg-transparent px-5 py-5 text-xs font-mono text-slate-800 dark:text-slate-300 outline-none resize-none custom-scrollbar whitespace-pre"
                  spellCheck="false"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE OUTPUT CONSOLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col h-[700px]">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden font-sans">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <TerminalSquare className={`w-4 h-4 ${theme.textPri}`} /> Engine Output
                </span>
                
                <button 
                  onClick={handleCopy} 
                  disabled={!results.raw}
                  className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                    copied ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  }`}
                >
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy SQL</>}
                </button>
              </div>

              {/* Mode Context Notice */}
              {mode === 'parameterize' && (
                <div className="flex items-start gap-2 p-3 bg-fuchsia-50 dark:bg-fuchsia-900/10 border border-fuchsia-200/50 dark:border-fuchsia-800/50 rounded-xl mb-4 shadow-sm shrink-0 font-sans">
                  <ShieldCheck className="w-4 h-4 text-fuchsia-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                    <strong className="text-fuchsia-600 dark:text-fuchsia-400">Security Mode ON:</strong> Raw numbers and string literals have been safely replaced with <code className="bg-fuchsia-100 dark:bg-fuchsia-800 px-1 rounded text-fuchsia-700 dark:text-fuchsia-200">?</code> placeholders. Use this format for PDO / Prepared Statements to prevent SQL injection.
                  </p>
                </div>
              )}

              {mode === 'minify' && (
                <div className="flex items-start gap-2 p-3 bg-sky-50 dark:bg-sky-900/10 border border-sky-200/50 dark:border-sky-800/50 rounded-xl mb-4 shadow-sm shrink-0 font-sans">
                  <Activity className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                    Query has been compressed into a single line for production logging or inline application code.
                  </p>
                </div>
              )}

              {/* Output Editor Area with Syntax Highlighting */}
              <div className="flex-1 bg-[#1e293b] dark:bg-[#0d1117] rounded-xl border border-slate-700 dark:border-slate-800 shadow-inner overflow-hidden flex flex-col group relative">
                <div className="flex items-center px-4 py-2 bg-slate-800 dark:bg-[#161b22] border-b border-slate-700 dark:border-slate-800 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                    </div>
                    query.sql
                  </span>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar relative">
                  {!results.raw ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <Code2 className="w-10 h-10 mb-3 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest text-center">
                        Awaiting SQL Query
                      </span>
                    </div>
                  ) : (
                    // Render HTML with syntax colors
                    <div 
                      className={`text-[12.5px] leading-relaxed font-mono m-0 whitespace-pre-wrap ${mode === 'minify' ? 'break-all' : ''}`}
                      dangerouslySetInnerHTML={{ __html: results.highlighted }}
                    />
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