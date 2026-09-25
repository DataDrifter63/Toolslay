"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileCode2, FileText, CheckCircle2, 
  Copy, Eye, Code2, Sparkles, LayoutTemplate,
  AlignLeft, Minimize2, Braces
} from "lucide-react";

export default function MarkdownToHtmlConverter() {
  const [isMounted, setIsMounted] = useState(false);

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
  
  const [styleMode, setStyleMode] = useState("plain");
  const [formatMode, setFormatMode] = useState("pretty");
  const [activeTab, setActiveTab] = useState("code");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const parseMarkdown = (md, mode) => {
    if (!md) return "";
    
    let html = md;
    
    html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    html = html.replace(/^>\s+(.+)$/gm, mode === 'tailwind' 
      ? '<blockquote class="border-l-4 border-brand pl-4 italic text-muted my-4 bg-surface py-2 rounded-r-xl">$1</blockquote>' 
      : '<blockquote>$1</blockquote>');

    html = html.replace(/^### (.*$)/gim, mode === 'tailwind' ? '<h3 class="text-lg sm:text-xl font-bold mt-6 mb-3 text-ink">$1</h3>' : '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, mode === 'tailwind' ? '<h2 class="text-xl sm:text-2xl font-black mt-8 mb-4 text-ink border-b border-line pb-2">$1</h2>' : '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, mode === 'tailwind' ? '<h1 class="text-2xl sm:text-4xl font-black mt-4 mb-6 text-brand">$1</h1>' : '<h1>$1</h1>');

    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, mode === 'tailwind' 
      ? '<a href="$2" class="text-brand hover:opacity-80 font-bold underline underline-offset-2 transition-opacity">$1</a>' 
      : '<a href="$2">$1</a>');

    html = html.replace(/\*\*(.*?)\*\*/gim, mode === 'tailwind' ? '<strong class="font-black text-ink">$1</strong>' : '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, mode === 'tailwind' ? '<em class="italic text-muted">$1</em>' : '<em>$1</em>');

    html = html.replace(/`(.*?)`/gim, mode === 'tailwind' 
      ? '<code class="bg-surface text-[#fb7185] px-1.5 py-0.5 rounded-lg text-xs font-mono border border-line">$1</code>' 
      : '<code>$1</code>');

    html = html.replace(/^\-\s+(.*)$/gim, mode === 'tailwind' ? '<li class="ml-6 list-disc mb-1.5 text-muted">$1</li>' : '<li>$1</li>');
    html = html.replace(/(<li.*?>.*?<\/li>\n?)+/gim, mode === 'tailwind' ? '<ul class="my-4">$n$&</ul>' : '<ul>\n$&</ul>');

    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
      if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<blockquote')) {
        return p;
      }
      return mode === 'tailwind' ? `<p class="mb-4 leading-relaxed text-muted text-xs sm:text-sm font-medium">${p}</p>` : `<p>${p}</p>`;
    }).join('\n');

    return html;
  };

  const results = useMemo(() => {
    let finalHtml = parseMarkdown(markdown, styleMode);

    if (formatMode === "minify") {
      finalHtml = finalHtml.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim();
    } else {
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

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* HEADER BAR */}
      <div className="bg-surface border border-line p-4 sm:p-8 rounded-2xl shadow-card space-y-4 sm:space-y-6 w-full box-border relative overflow-hidden font-sans">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-lg sm:text-xl font-black shrink-0">
            <FileCode2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-brand uppercase mb-0.5 sm:mb-1">
              COMPILER UTILITY
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-ink tracking-tight truncate">
              Markdown Compiler
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted mt-0.5 truncate">
              Zero-dependency text to HTML engine with Tailwind CSS injection.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: CONFIGURATION & INPUT */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border">
            
            {/* 1. Feature Segmented Controls (Replaced ugly toggles) */}
            <div className="space-y-4 font-sans">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Sparkles className="w-3.5 h-3.5 text-brand" /> 1. Output Engine Configuration
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Style Mode Segmented Switch */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-muted">Tailwind CSS Injection</span>
                  <div className="flex bg-surface rounded-xl p-1 border border-line">
                    <button 
                      type="button"
                      onClick={() => setStyleMode('plain')}
                      className={`flex-1 text-[10px] font-black uppercase tracking-wider py-2 rounded-lg transition-all ${styleMode === 'plain' ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
                    >
                      Plain HTML
                    </button>
                    <button 
                      type="button"
                      onClick={() => setStyleMode('tailwind')}
                      className={`flex-1 text-[10px] font-black uppercase tracking-wider py-2 rounded-lg transition-all ${styleMode === 'tailwind' ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
                    >
                      Tailwind
                    </button>
                  </div>
                </div>

                {/* Format Mode Segmented Switch */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-muted">Formatting Payload</span>
                  <div className="flex bg-surface rounded-xl p-1 border border-line">
                    <button 
                      type="button"
                      onClick={() => setFormatMode('pretty')}
                      className={`flex-1 text-[10px] font-black uppercase tracking-wider py-2 rounded-lg transition-all ${formatMode === 'pretty' ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
                    >
                      Pretty
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormatMode('minify')}
                      className={`flex-1 text-[10px] font-black uppercase tracking-wider py-2 rounded-lg transition-all ${formatMode === 'minify' ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
                    >
                      Minify
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <hr className="border-line" />

            {/* 2. Markdown Input */}
            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-brand" /> 2. Markdown Source
                </h3>
              </div>
              
              <div className="bg-surface border border-line rounded-xl overflow-hidden focus-within:border-brand transition-all w-full">
                <textarea
                  value={markdown} 
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="# Hello World..."
                  rows="12"
                  className="w-full bg-surface px-4 py-3 text-xs sm:text-sm font-mono text-ink outline-none resize-none custom-scrollbar break-all whitespace-pre tabular-nums"
                  spellCheck="false"
                />
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: THE DUAL OUTPUT CONSOLE */}
        <div className="space-y-4 sm:space-y-6 w-full">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border">
            
            <div className="flex items-center justify-between border-b border-line pb-3 font-sans">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Braces className="w-4 h-4 text-brand" /> Output Panel
              </span>
              
              {/* Tab Switcher */}
              <div className="flex bg-surface rounded-xl p-1 border border-line">
                <button 
                  type="button"
                  onClick={() => setActiveTab("code")}
                  className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${activeTab === 'code' ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
                >
                  <Code2 className="w-3 h-3" /> Raw Code
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${activeTab === 'preview' ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
              </div>
            </div>

            {/* The Actual Output Area */}
            <div className="flex flex-col bg-surface border border-line rounded-xl shadow-sm overflow-hidden w-full">
              
              {activeTab === "code" ? (
                <>
                  <div className="flex justify-between items-center px-3.5 py-2.5 bg-surface border-b border-line font-sans">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                      Compiled HTML
                    </span>
                    
                    <button 
                      type="button"
                      onClick={handleCopy} 
                      disabled={!results}
                      className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                        copied ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-surface text-muted border-line hover:text-ink disabled:opacity-50"
                      }`}
                    >
                      {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy HTML</>}
                    </button>
                  </div>

                  <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                    {!results ? (
                      <div className="h-32 flex flex-col items-center justify-center text-muted font-sans">
                        <FileText className="w-8 h-8 mb-2 opacity-30" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-center">
                          Type Markdown to Compile
                        </span>
                      </div>
                    ) : (
                      <pre className="text-xs sm:text-sm break-all text-ink leading-relaxed font-mono m-0 whitespace-pre-wrap tabular-nums">
                        <code>{results}</code>
                      </pre>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 sm:p-5 max-h-[380px] overflow-y-auto custom-scrollbar bg-surface font-sans">
                  {!results ? (
                    <div className="h-32 flex flex-col items-center justify-center text-muted font-sans">
                      <Eye className="w-8 h-8 mb-2 opacity-30" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-center">
                        Nothing to Preview
                      </span>
                    </div>
                  ) : (
                    <div 
                      className="prose dark:prose-invert max-w-none text-ink"
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
  );
}