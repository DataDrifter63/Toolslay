"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Database, Code2, Minimize2, AlignLeft, 
  Copy, CheckCircle2, Zap, ShieldCheck, 
  Settings2, Activity, TerminalSquare
} from "lucide-react";

export default function SqlFormatterMinifier() {
  const [isMounted, setIsMounted] = useState(false);

  const [inputSql, setInputSql] = useState(
`SELECT users.id,users.name,orders.total FROM users LEFT JOIN orders ON users.id=orders.user_id WHERE users.status='active' AND orders.total>1000 GROUP BY users.id ORDER BY orders.total DESC LIMIT 10;`
  );
  
  const [mode, setMode] = useState("format");
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const processSql = (sql, action, uppercase) => {
    if (!sql.trim()) return "";

    let processed = sql;
    const stringLiterals = [];

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
      processed = processed.replace(/\s+/g, ' ').trim();
    } else if (action === 'format' || action === 'parameterize') {
      processed = processed.replace(/\s+/g, ' ').trim();

      if (uppercase) {
        keywords.forEach(kw => {
          const regex = new RegExp(`\\b${kw}\\b`, 'gi');
          processed = processed.replace(regex, kw);
        });
      }

      const blockKeywords = ['SELECT', 'FROM', 'WHERE', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'OUTER JOIN', 'JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'UPDATE', 'SET', 'DELETE', 'INSERT INTO', 'VALUES', 'UNION'];
      blockKeywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'g');
        processed = processed.replace(regex, `\n${kw}`);
      });

      processed = processed.replace(/\bAND\b/g, '\n  AND');
      processed = processed.replace(/\bOR\b/g, '\n  OR');
      processed = processed.replace(/\bON\b/g, '\n  ON');
      processed = processed.replace(/,\s*/g, ',\n  ');
      
      processed = processed.replace(/\n+/g, '\n').trim();
    }

    if (action === 'parameterize') {
      processed = processed.replace(/__MUXAIR_STR_\d+__/g, '?');
      processed = processed.replace(/(?<=[=<>!+\-*/\s])\d+(?=[,\s;]|$)/g, '?');
    } else {
      stringLiterals.forEach((str, i) => {
        processed = processed.replace(`__MUXAIR_STR_${i}__`, str);
      });
    }

    return processed;
  };

  const highlightSql = (sql) => {
    if (!sql) return "";
    let highlighted = sql
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    highlighted = highlighted.replace(/('[^']*')/g, '<span class="text-emerald-500">$1</span>');
    highlighted = highlighted.replace(/(\?)/g, '<span class="text-fuchsia-500 font-bold">$1</span>');
    highlighted = highlighted.replace(/(?<=[=<>!+\-*/\s])(\d+)(?=[,\s;]|$)/g, '<span class="text-orange-500">$1</span>');
    
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'JOIN',
      'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UPDATE', 'SET', 'DELETE',
      'INSERT INTO', 'VALUES', 'AND', 'OR', 'ON', 'AS', 'IN', 'IS', 'NULL', 'NOT', 'DESC', 'ASC'
    ];
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<span class="text-brand font-bold">$&</span>`);
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

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              SQL Ops Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Formatter, minifier & query parameterizer.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: CONFIG & INPUT */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border font-sans">
            
            {/* 1. Tool Mode */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Settings2 className="w-3.5 h-3.5 text-brand" /> 1. Execution Mode
              </h3>
              
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setMode('format')} className={`p-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all border flex flex-col items-center gap-1.5 ${mode === 'format' ? 'bg-brand text-surface border-brand shadow-sm' : 'border-line text-muted hover:text-ink bg-surface'}`}>
                  <AlignLeft className="w-4 h-4" /> Format
                </button>
                <button type="button" onClick={() => setMode('minify')} className={`p-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all border flex flex-col items-center gap-1.5 ${mode === 'minify' ? 'bg-brand text-surface border-brand shadow-sm' : 'border-line text-muted hover:text-ink bg-surface'}`}>
                  <Minimize2 className="w-4 h-4" /> Minify
                </button>
                <button type="button" onClick={() => setMode('parameterize')} className={`p-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border flex flex-col items-center gap-1.5 ${mode === 'parameterize' ? 'bg-brand text-surface border-brand shadow-sm' : 'border-line text-muted hover:text-ink bg-surface'}`}>
                  <ShieldCheck className="w-4 h-4" /> Parameterize
                </button>
              </div>

              {(mode === 'format' || mode === 'parameterize') && (
                <label className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors mt-3">
                  <input type="checkbox" checked={uppercaseKeywords} onChange={(e) => setUppercaseKeywords(e.target.checked)} className="w-4 h-4 accent-brand rounded cursor-pointer" />
                  <div>
                    <span className="block text-xs font-black text-ink uppercase tracking-wider">Uppercase SQL Keywords</span>
                    <span className="block text-[9px] text-muted">Converts 'select' to 'SELECT' automatically.</span>
                  </div>
                </label>
              )}
            </div>

            <hr className="border-line" />

            {/* 2. Raw SQL Input */}
            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-brand" /> 2. Raw SQL Input
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider bg-brand/10 text-brand border border-brand/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Zap className="w-3 h-3"/> Auto-Parse
                </span>
              </div>
              
              <div className="relative flex flex-col bg-surface border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden shadow-sm">
                <textarea
                  value={inputSql} 
                  onChange={(e) => setInputSql(e.target.value)}
                  placeholder="SELECT * FROM table WHERE..."
                  rows="8"
                  className="w-full bg-surface px-4 py-3.5 text-xs font-mono text-ink outline-none resize-none custom-scrollbar whitespace-pre"
                  spellCheck="false"
                />
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: THE OUTPUT CONSOLE */}
        <div className="space-y-4 sm:space-y-6 w-full">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
            
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <TerminalSquare className="w-4 h-4 text-brand" /> Engine Output
              </span>
              
              <button 
                type="button"
                onClick={handleCopy} 
                disabled={!results.raw}
                className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                  copied ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-surface text-muted border-line hover:text-ink disabled:opacity-50"
                }`}
              >
                {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy SQL</>}
              </button>
            </div>

            {mode === 'parameterize' && (
              <div className="flex items-start gap-2 p-3 bg-surface border border-line rounded-xl shadow-sm">
                <ShieldCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-muted leading-relaxed">
                  <strong className="text-ink">Security Mode ON:</strong> Raw numbers and string literals have been replaced with <code className="bg-brand/10 text-brand px-1 rounded">?</code> placeholders. Use for prepared statements.
                </p>
              </div>
            )}

            {mode === 'minify' && (
              <div className="flex items-start gap-2 p-3 bg-surface border border-line rounded-xl shadow-sm">
                <Activity className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-muted leading-relaxed">
                  Query has been compressed into a single line for production logging or inline application code.
                </p>
              </div>
            )}

            <div className="flex flex-col bg-surface border border-line rounded-xl shadow-sm overflow-hidden w-full">
              <div className="flex items-center px-3.5 py-2.5 bg-surface border-b border-line">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider font-black flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#fb7185]/80"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                  </div>
                  query.sql
                </span>
              </div>
              
              <div className="p-4 max-h-[440px] overflow-y-auto custom-scrollbar relative">
                {!results.raw ? (
                  <div className="h-40 flex flex-col items-center justify-center text-muted">
                    <Code2 className="w-8 h-8 mb-2 opacity-30" />
                    <span className="text-xs font-bold uppercase tracking-wider text-center">
                      Awaiting SQL Query
                    </span>
                  </div>
                ) : (
                  <div 
                    className={`text-xs leading-relaxed font-mono m-0 whitespace-pre-wrap tabular-nums ${mode === 'minify' ? 'break-all' : ''}`}
                    dangerouslySetInnerHTML={{ __html: results.highlighted }}
                  />
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}