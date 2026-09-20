"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileCode2, FileText, CheckCircle2, 
  Copy, Eye, Code2, Sparkles, LayoutTemplate,
  AlignLeft, Minimize2, Braces
} from "lucide-react";

export default function MarkdownToHtmlConverter() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [markdown, setMarkdown] = useState(
`# Muxair Pro Converter
Welcome to the enterprise Markdown engine!

## Features
- Blazing fast compilation
- Zero dependencies
- **Tailwind CSS** injection

Here is a [link to Muxair](https://muxair.com).

> "The best tool for developers."

Try writing some \`inline code\` or bold text.`
  );
  
  const [styleMode, setStyleMode] = useState("plain"); // 'plain' or 'tailwind'
  const [formatMode, setFormatMode] = useState("pretty"); // 'pretty' or 'minify'
  const [activeTab, setActiveTab] = useState("code"); // 'code' or 'preview'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- CORE MARKDOWN NATIVE PARSER ---
  const parseMarkdown = (md, mode) => {
    if (!md) return "";
    
    let html = md;
    
    // 1. Escape HTML to prevent basic XSS before parsing
    html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 2. Blockquotes
    html = html.replace(/^>\s+(.+)$/gm, mode === 'tailwind' 
      ? '<blockquote class="border-l-4 border-emerald-500 pl-4 italic text-slate-600 dark:text-slate-400 my-4 bg-slate-50 dark:bg-slate-800/50 py-2 rounded-r-lg">$1</blockquote>' 
      : '<blockquote>$1</blockquote>');

    // 3. Headers
    html = html.replace(/^### (.*$)/gim, mode === 'tailwind' ? '<h3 class="text-xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-100">$1</h3>' : '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, mode === 'tailwind' ? '<h2 class="text-2xl font-black mt-8 mb-4 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">$1</h2>' : '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, mode === 'tailwind' ? '<h1 class="text-4xl font-black mt-4 mb-6 text-emerald-600 dark:text-emerald-400">$1</h1>' : '<h1>$1</h1>');

    // 4. Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, mode === 'tailwind' 
      ? '<a href="$2" class="text-emerald-500 hover:text-emerald-600 font-medium underline underline-offset-2 transition-colors">$1</a>' 
      : '<a href="$2">$1</a>');

    // 5. Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/gim, mode === 'tailwind' ? '<strong class="font-black text-slate-900 dark:text-white">$1</strong>' : '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, mode === 'tailwind' ? '<em class="italic text-slate-700 dark:text-slate-300">$1</em>' : '<em>$1</em>');

    // 6. Inline Code
    html = html.replace(/`(.*?)`/gim, mode === 'tailwind' 
      ? '<code class="bg-slate-100 dark:bg-slate-800 text-rose-500 dark:text-rose-400 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200 dark:border-slate-700">$1</code>' 
      : '<code>$1</code>');

    // 7. Unordered Lists
    html = html.replace(/^\-\s+(.*)$/gim, mode === 'tailwind' ? '<li class="ml-6 list-disc mb-1.5 text-slate-700 dark:text-slate-300">$1</li>' : '<li>$1</li>');
    // Group adjacent <li> tags into a single <ul>
    html = html.replace(/(<li.*?>.*?<\/li>\n?)+/gim, mode === 'tailwind' ? '<ul class="my-4">$n$&</ul>' : '<ul>\n$&</ul>');

    // 8. Paragraphs
    // Split by double line breaks
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
      // Don't wrap existing block elements in <p>
      if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<blockquote')) {
        return p;
      }
      return mode === 'tailwind' ? `<p class="mb-4 leading-relaxed text-slate-700 dark:text-slate-300">${p}</p>` : `<p>${p}</p>`;
    }).join('\n');

    return html;
  };

  const results = useMemo(() => {
    let finalHtml = parseMarkdown(markdown, styleMode);

    if (formatMode === "minify") {
      finalHtml = finalHtml.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim();
    } else {
      // Simple pretty formatting cleanup (removing empty lines left by regex)
      finalHtml = finalHtml.replace(/<\/ul>\n<ul>/g, '\n').replace(/\n\n+/g, '\n\n').trim();
    }

    return finalHtml;
  }, [markdown, styleMode, formatMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(results);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) return null;

  // Premium Emerald/Teal Theme
  const theme = {
    gradient: "from-emerald-200 via-teal-100 to-transparent dark:from-emerald-900/30 dark:via-teal-900/20",
    bgIcon: "bg-gradient-to-br from-emerald-500 to-teal-600",
    textPri: "text-emerald-600 dark:text-emerald-400",
    textSec: "text-teal-600 dark:text-teal-400",
    borderLight: "border-emerald-200 dark:border-emerald-800/50",
    bgLight: "bg-emerald-50 dark:bg-emerald-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <FileCode2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Markdown Compiler
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Zero-Dependency Text to HTML Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,500px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION & INPUT ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Feature Toggles */}
            <div className="space-y-4 font-sans">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Sparkles className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Output Engine
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Style Toggle */}
                <div className={`flex flex-col p-4 rounded-xl border ${styleMode === 'tailwind' ? theme.borderLight + " " + theme.bgLight : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"} transition-colors duration-500`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg ${styleMode === 'tailwind' ? `bg-white dark:bg-slate-800 shadow-sm ${theme.textPri}` : "text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"}`}>
                      <LayoutTemplate className="w-4 h-4" />
                    </div>
                    <button onClick={() => setStyleMode(styleMode === 'plain' ? 'tailwind' : 'plain')} className={`w-10 h-5 rounded-full transition-colors relative p-1 shadow-inner ${styleMode === 'tailwind' ? `bg-gradient-to-r ${theme.gradient.split(' ').slice(0, 2).join(' ')}` : "bg-slate-300 dark:bg-slate-700"}`}>
                      <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${styleMode === 'tailwind' ? "translate-x-5" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                  <span className="block text-xs font-black text-slate-800 dark:text-slate-100 font-sans">Tailwind Injector</span>
                  <span className="text-[9px] font-bold text-slate-500 block leading-snug mt-1 font-sans">Auto-adds modern CSS classes to tags.</span>
                </div>

                {/* Minify Toggle */}
                <div className={`flex flex-col p-4 rounded-xl border ${formatMode === 'minify' ? theme.borderLight + " " + theme.bgLight : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"} transition-colors duration-500`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg ${formatMode === 'minify' ? `bg-white dark:bg-slate-800 shadow-sm ${theme.textSec}` : "text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"}`}>
                      <Minimize2 className="w-4 h-4" />
                    </div>
                    <button onClick={() => setFormatMode(formatMode === 'pretty' ? 'minify' : 'pretty')} className={`w-10 h-5 rounded-full transition-colors relative p-1 shadow-inner ${formatMode === 'minify' ? `bg-gradient-to-r ${theme.gradient.split(' ').slice(0, 2).join(' ')}` : "bg-slate-300 dark:bg-slate-700"}`}>
                      <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${formatMode === 'minify' ? "translate-x-5" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                  <span className="block text-xs font-black text-slate-800 dark:text-slate-100 font-sans">Minify HTML</span>
                  <span className="text-[9px] font-bold text-slate-500 block leading-snug mt-1 font-sans">Removes line breaks for production payload.</span>
                </div>

              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Markdown Input */}
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <AlignLeft className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Markdown Source
                </h3>
              </div>
              
              <div className={`relative flex flex-col bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all overflow-hidden group shadow-inner`}>
                <textarea
                  value={markdown} 
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="# Hello World..."
                  rows="15"
                  className="w-full bg-transparent px-5 py-5 text-sm font-mono text-slate-800 dark:text-slate-100 outline-none resize-none custom-scrollbar break-all whitespace-pre"
                  spellCheck="false"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DUAL OUTPUT CONSOLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[680px]">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0 font-sans">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Braces className={`w-4 h-4 ${theme.textPri}`} /> Output Panel
                </span>
                
                {/* Tab Switcher */}
                <div className="flex bg-slate-200/50 dark:bg-[#0d1117] rounded-lg p-0.5 border border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => setActiveTab("code")}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'code' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <Code2 className="w-3 h-3" /> Raw Code
                  </button>
                  <button 
                    onClick={() => setActiveTab("preview")}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'preview' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                </div>
              </div>

              {/* The Actual Output Area */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0d1117] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                
                {activeTab === "code" ? (
                  <>
                    <div className="flex justify-between items-center px-4 py-3 bg-slate-100/50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-800 font-sans shrink-0">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Compiled HTML
                      </span>
                      
                      <button 
                        onClick={handleCopy} 
                        disabled={!results}
                        className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                          copied ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                        }`}
                      >
                        {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy HTML</>}
                      </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                      {!results ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans">
                          <FileText className="w-10 h-10 mb-3 opacity-20" />
                          <span className="text-xs font-bold uppercase tracking-widest text-center">
                            Type Markdown to Compile
                          </span>
                        </div>
                      ) : (
                        <pre className="text-xs break-all text-slate-800 dark:text-slate-300 leading-relaxed font-mono m-0 whitespace-pre-wrap">
                          <code>{results}</code>
                        </pre>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0d1117] font-sans">
                    {!results ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans">
                        <Eye className="w-10 h-10 mb-3 opacity-20" />
                        <span className="text-xs font-bold uppercase tracking-widest text-center">
                          Nothing to Preview
                        </span>
                      </div>
                    ) : (
                      // Dangerously Setting Inner HTML to render the live preview safely within our controlled UI
                      <div 
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: results }}
                      />
                    )}
                  </div>
                )}

              </div>
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}