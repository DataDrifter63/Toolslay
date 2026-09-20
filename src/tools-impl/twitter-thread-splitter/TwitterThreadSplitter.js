"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Twitter, Copy, CheckCircle2, Settings2, 
  AlignLeft, Hash, ArrowRight, Trash2,
  MessageCircle, Info
} from "lucide-react";

const NUMBERING_STYLES = [
  { id: "slash", label: "1/X", example: "1/5" },
  { id: "bracket", label: "[1/X]", example: "[1/5]" },
  { id: "parenthesis", label: "(1/X)", example: "(1/5)" },
  { id: "none", label: "None", example: "..." }
];

export default function TwitterThreadSplitter() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Inputs
  const [inputText, setInputText] = useState("");
  const [numbering, setNumbering] = useState(NUMBERING_STYLES[0]);
  
  // Interactions
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    // Placeholder text for demo
    setInputText("Welcome to the Premium Thread Splitter!\n\nThis tool is designed to take your long-form content and automatically break it down into perfectly sized, numbered posts for X (formerly Twitter).\n\nInstead of blindly cutting off words at the 280-character mark, our smart engine looks for natural breakpoints. It prioritizes double line breaks (paragraphs), then single line breaks, then periods, and finally spaces. This ensures your thoughts remain coherent and easy to read for your audience.\n\nTry pasting a massive block of text here and watch the engine perfectly slice it into a ready-to-publish thread. It dynamically calculates the space needed for your counter (like 1/15) so you never exceed the 280 limit.");
  }, []);

  // Core Smart Splitting Engine
  const tweets = useMemo(() => {
    if (!inputText.trim()) return [];
    
    const MAX_LEN = 280;

    const getSuffix = (i, total) => {
      if (numbering.id === "slash") return `\n\n${i}/${total}`;
      if (numbering.id === "bracket") return `\n\n[${i}/${total}]`;
      if (numbering.id === "parenthesis") return `\n\n(${i}/${total})`;
      return "";
    };

    // The core recursive logic for the Two-Pass Engine
    const executeSplit = (assumedTotal) => {
      let chunks = [];
      let remainingText = inputText.trim();
      let tweetIndex = 1;

      while (remainingText.length > 0) {
        let suffix = getSuffix(tweetIndex, assumedTotal);
        let limit = MAX_LEN - suffix.length;

        // If the remaining text fits perfectly, take it all
        if (remainingText.length <= limit) {
          chunks.push({
            text: remainingText,
            suffix,
            content: remainingText + suffix,
            length: remainingText.length + suffix.length
          });
          break;
        }

        // SMART BOUNDARY DETECTION
        let chunkCandidate = remainingText.substring(0, limit);
        let breakIndex = limit;

        const lastDoubleNewLine = chunkCandidate.lastIndexOf('\n\n');
        const lastNewLine = chunkCandidate.lastIndexOf('\n');
        const lastPeriod = chunkCandidate.lastIndexOf('. ');
        const lastSpace = chunkCandidate.lastIndexOf(' ');

        // Prioritize natural breaks (only break if it's in the second half of the tweet to avoid micro-tweets)
        if (lastDoubleNewLine > limit * 0.5) {
          breakIndex = lastDoubleNewLine;
        } else if (lastNewLine > limit * 0.6) {
          breakIndex = lastNewLine;
        } else if (lastPeriod > limit * 0.7) {
          breakIndex = lastPeriod + 1; // Keep the period
        } else if (lastSpace > 0) {
          breakIndex = lastSpace;
        }

        let finalSlice = remainingText.substring(0, breakIndex).trimEnd();
        chunks.push({
          text: finalSlice,
          suffix,
          content: finalSlice + suffix,
          length: finalSlice.length + suffix.length
        });

        remainingText = remainingText.substring(breakIndex).trimStart();
        tweetIndex++;
      }
      return chunks;
    };

    // Pass 1: Estimate total based on rough division
    let estTotal = Math.ceil(inputText.length / 260);
    let firstPass = executeSplit(estTotal);

    // Pass 2: If our estimation was off, recalculate with the EXACT total
    // This ensures counter strings like "1/10" (4 chars) are accurately accommodated
    if (firstPass.length !== estTotal) {
      return executeSplit(firstPass.length);
    }

    return firstPass;
  }, [inputText, numbering]);

  // Copy Handler
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Clear Input
  const handleClear = () => {
    if(confirm("Are you sure you want to clear the editor?")) {
      setInputText("");
    }
  }

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-sky-100 to-transparent dark:from-sky-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-sky-50 dark:bg-sky-900/30 p-3.5 rounded-2xl">
            <Twitter className="w-6 h-6 text-sky-500 fill-sky-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              X/Twitter Thread Splitter
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Smart Sentence-Boundary Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] xl:grid-cols-2 gap-6 items-start">
        
        {/* ================= LEFT: TEXT EDITOR ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col h-[700px] overflow-hidden">
            
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-slate-500">
                <AlignLeft className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Draft Editor</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-sky-600 bg-sky-50 dark:bg-sky-900/20 px-2 py-1 rounded border border-sky-100 dark:border-sky-800">
                  {inputText.length} Chars
                </div>
                <button onClick={handleClear} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Textarea */}
            <textarea
              className="flex-1 w-full p-6 bg-transparent resize-none outline-none text-slate-800 dark:text-slate-100 text-lg leading-relaxed placeholder-slate-300 dark:placeholder-slate-700 custom-scrollbar"
              placeholder="Paste your incredibly long draft here to see the magic happen..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            ></textarea>

            {/* Bottom Config Bar */}
            <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <Hash className="w-3 h-3" /> Numbering Style
              </label>
              <div className="flex gap-2">
                {NUMBERING_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setNumbering(style)}
                    className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                      numbering.id === style.id
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                        : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-sky-300"
                    }`}
                  >
                    {style.example}
                  </button>
                ))}
              </div>
            </div>
            
          </div>
        </div>

        {/* ================= RIGHT: THREAD PREVIEW ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative h-[700px] flex flex-col">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                <MessageCircle className="w-3.5 h-3.5" /> Thread Preview
              </span>
              <span className="text-xs font-black text-sky-500">
                {tweets.length} Tweets Generated
              </span>
            </div>

            {/* Scrollable Feed */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/20">
              
              {tweets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <Twitter className="w-12 h-12 text-slate-400 mb-3" />
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Awaiting Content</p>
                </div>
              ) : (
                <div className="relative">
                  {/* The vertical thread line */}
                  {tweets.length > 1 && (
                    <div className="absolute left-[27px] top-12 bottom-12 w-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>
                  )}

                  {/* Individual Tweets */}
                  <div className="space-y-0 z-10 relative">
                    {tweets.map((tweet, index) => (
                      <div key={index} className="flex gap-3 p-3 group">
                        
                        {/* Avatar Col */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 shadow-inner shrink-0 relative z-10"></div>
                        </div>

                        {/* Content Col */}
                        <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-shadow group-hover:shadow-md relative">
                          
                          {/* User Header Mock */}
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">You</span>
                            <span className="text-[13px] font-medium text-slate-500 truncate">@yourhandle</span>
                          </div>
                          
                          {/* Tweet Body */}
                          <p className="text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                            {tweet.text}
                          </p>
                          {tweet.suffix && (
                            <p className="text-[15px] text-sky-500 dark:text-sky-400 mt-2 font-medium">
                              {tweet.suffix.trim()}
                            </p>
                          )}

                          {/* Stats & Actions Footer */}
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className={`text-[10px] font-bold tracking-widest uppercase ${tweet.length > 270 ? 'text-amber-500' : 'text-slate-400'}`}>
                              {tweet.length} / 280
                            </span>
                            
                            <button
                              onClick={() => handleCopy(tweet.content, index)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                copiedIndex === index 
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50" 
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/30 dark:hover:text-sky-400"
                              }`}
                            >
                              {copiedIndex === index ? (
                                <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</>
                              ) : (
                                <><Copy className="w-3.5 h-3.5" /> Copy Part {index + 1}</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Educational Banner */}
            <div className="p-4 bg-sky-50/50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 shrink-0">
              <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                URLs count as 23 characters on X, regardless of their actual length. If your thread contains long links, the character count may differ slightly when pasting into X.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}