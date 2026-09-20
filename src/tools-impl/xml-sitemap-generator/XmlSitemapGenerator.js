"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Globe, Link, FileCode2, CheckCircle2, 
  Copy, Download, Settings2, Activity,
  BarChart3, Zap, ShieldCheck
} from "lucide-react";

export default function XmlSitemapGenerator() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [rawInput, setRawInput] = useState(
`https://muxair.com
https://muxair.com/about
https://muxair.com/tools/xml-sitemap-generator
You can also just paste messy text like:
Check out our blog at https://muxair.com/blog and also https://muxair.com/contact-us!
`
  );
  
  // Settings
  const [autoPriority, setAutoPriority] = useState(true);
  const [includeLastMod, setIncludeLastMod] = useState(true);
  const [globalChangeFreq, setGlobalChangeFreq] = useState("weekly"); // always, hourly, daily, weekly, monthly, yearly, never

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- CORE ENGINE: URL EXTRACTION & XML COMPILATION ---
  const results = useMemo(() => {
    if (!rawInput.trim()) return { urls: [], xml: "", error: false, stats: null };

    // 1. Chaos Extractor (Regex for URLs)
    // Matches http:// or https:// followed by non-space, non-quote characters
    const urlRegex = /(https?:\/\/[^\s<"']+)/g;
    const matches = rawInput.match(urlRegex) || [];
    
    // 2. Clean & Deduplicate
    const cleanUrls = [];
    const uniqueSet = new Set();
    
    matches.forEach(url => {
      try {
        // Basic validation and trailing slash cleanup
        const parsed = new URL(url);
        let clean = parsed.href;
        if (clean.endsWith('/') && clean.length > parsed.origin.length + 1) {
          clean = clean.slice(0, -1);
        }
        if (!uniqueSet.has(clean)) {
          uniqueSet.add(clean);
          cleanUrls.push(clean);
        }
      } catch (e) {
        // Skip invalid URLs
      }
    });

    if (cleanUrls.length === 0) {
      return { urls: [], xml: "", error: "No valid HTTP/HTTPS URLs found in the input.", stats: null };
    }

    // 3. Smart Prioritization Logic
    const getPriority = (urlStr) => {
      if (!autoPriority) return "0.8"; // Default fallback if auto is off
      try {
        const urlObj = new URL(urlStr);
        const path = urlObj.pathname;
        if (path === '/' || path === '') return '1.0'; // Home
        
        const slashes = (path.match(/\//g) || []).length;
        if (slashes === 1) return '0.8'; // Top level (e.g. /about)
        if (slashes === 2) return '0.6'; // Second level (e.g. /blog/post)
        return '0.5'; // Deep level
      } catch {
        return '0.5';
      }
    };

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 4. Generate XML
    let xmlOutput = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xmlOutput += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    let highPriorityCount = 0;
    
    cleanUrls.forEach(url => {
      const priority = getPriority(url);
      if (priority === '1.0' || priority === '0.8') highPriorityCount++;

      xmlOutput += `  <url>\n`;
      xmlOutput += `    <loc>${url}</loc>\n`;
      if (includeLastMod) {
        xmlOutput += `    <lastmod>${today}</lastmod>\n`;
      }
      xmlOutput += `    <changefreq>${globalChangeFreq}</changefreq>\n`;
      xmlOutput += `    <priority>${priority}</priority>\n`;
      xmlOutput += `  </url>\n`;
    });

    xmlOutput += `</urlset>`;

    // Stats
    const bytes = new TextEncoder().encode(xmlOutput).length;
    const stats = {
      count: cleanUrls.length,
      size: (bytes / 1024).toFixed(2),
      highPriority: highPriorityCount
    };

    return { urls: cleanUrls, xml: xmlOutput, error: false, stats };
  }, [rawInput, autoPriority, includeLastMod, globalChangeFreq]);

  const handleCopy = () => {
    if (!results.xml) return;
    navigator.clipboard.writeText(results.xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!results.xml) return;
    const blob = new Blob([results.xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isMounted) return null;

  // Premium Blue/Violet Theme
  const theme = {
    gradient: "from-blue-200 via-violet-100 to-transparent dark:from-blue-900/30 dark:via-violet-900/20",
    bgIcon: "bg-gradient-to-br from-blue-500 to-violet-600",
    textPri: "text-blue-600 dark:text-blue-400",
    textSec: "text-violet-600 dark:text-violet-400",
    borderLight: "border-blue-200 dark:border-blue-800/50",
    bgLight: "bg-blue-50 dark:bg-blue-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              SEO Sitemap Oracle
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Intelligent XML Generator & URL Extractor
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1fr] gap-6 items-start">
        
        {/* ================= LEFT: DATA INPUT & CONFIG ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8 font-sans">
            
            {/* 1. Global Settings */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Settings2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. SEO Parameters
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Auto Priority Toggle */}
                <div className={`flex flex-col p-4 rounded-xl border ${autoPriority ? theme.borderLight + " " + theme.bgLight : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"} transition-colors duration-500`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">Smart Prioritization</span>
                    <button onClick={() => setAutoPriority(!autoPriority)} className={`w-9 h-5 rounded-full transition-colors relative p-1 shadow-inner ${autoPriority ? `bg-gradient-to-r ${theme.gradient.split(' ').slice(0, 2).join(' ')}` : "bg-slate-300 dark:bg-slate-700"}`}>
                      <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${autoPriority ? "translate-x-4" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 block">Auto-calculates priority based on URL depth (1.0 for Home, 0.6 for deep links).</span>
                </div>

                {/* Lastmod Toggle */}
                <div className={`flex flex-col p-4 rounded-xl border ${includeLastMod ? theme.borderLight + " " + theme.bgLight : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"} transition-colors duration-500`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">Inject LastModified</span>
                    <button onClick={() => setIncludeLastMod(!includeLastMod)} className={`w-9 h-5 rounded-full transition-colors relative p-1 shadow-inner ${includeLastMod ? `bg-gradient-to-r ${theme.gradient.split(' ').slice(0, 2).join(' ')}` : "bg-slate-300 dark:bg-slate-700"}`}>
                      <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${includeLastMod ? "translate-x-4" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 block">Adds today's date to `{'<lastmod>'}` tag.</span>
                </div>

                {/* ChangeFreq Dropdown */}
                <div className="sm:col-span-2 flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 mb-2">Crawl Frequency (changefreq)</span>
                  <select 
                    value={globalChangeFreq} onChange={(e) => setGlobalChangeFreq(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
                  >
                    <option value="always">Always</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly (Standard)</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Raw Input Box */}
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Link className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Data Source
                </h3>
                <span className="text-[9px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <Zap className="w-3 h-3"/> Smart Extraction
                </span>
              </div>
              
              <div className={`relative flex flex-col bg-slate-50 dark:bg-[#161b22] border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all overflow-hidden group shadow-inner`}>
                <textarea
                  value={rawInput} 
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="Paste perfectly formatted URLs, or just dump a messy CSV/HTML text here. We will extract the links automatically..."
                  rows="12"
                  className="w-full bg-transparent px-5 py-5 text-xs font-mono text-slate-800 dark:text-slate-300 outline-none resize-none custom-scrollbar whitespace-pre"
                  spellCheck="false"
                />
              </div>

              {results.error && rawInput && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold">
                  {results.error}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE OUTPUT CONSOLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col h-[700px]">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden font-sans">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <FileCode2 className={`w-4 h-4 ${theme.textPri}`} /> Compiled Sitemap
                </span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopy} 
                    disabled={!results.xml}
                    className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                      copied ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                    }`}
                  >
                    {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy</>}
                  </button>
                  <button 
                    onClick={handleDownload} 
                    disabled={!results.xml}
                    className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-slate-800 text-white border-slate-700 hover:bg-slate-700 disabled:opacity-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5"/> Download .xml
                  </button>
                </div>
              </div>

              {/* Data Analytics Dashboard */}
              {results.stats && (
                <div className="grid grid-cols-3 gap-2 mb-4 shrink-0">
                  <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                    <BarChart3 className="w-4 h-4 text-blue-500 mb-1" />
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">{results.stats.count}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Total URLs</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1" />
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">{results.stats.highPriority}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">High Priority</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                    <Activity className="w-4 h-4 text-violet-500 mb-1" />
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">{results.stats.size}KB</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">File Size</span>
                  </div>
                </div>
              )}

              {/* Output Area */}
              <div className="flex-1 bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden flex flex-col group">
                <div className="flex items-center px-4 py-2 bg-slate-100/50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">sitemap.xml</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                  {!results.xml ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <FileCode2 className="w-10 h-10 mb-3 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest text-center">
                        Awaiting Valid URLs
                      </span>
                    </div>
                  ) : (
                    <pre className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-mono m-0 whitespace-pre-wrap">
                      <code>{results.xml}</code>
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