"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Twitter, Copy, CheckCircle2, 
  AlignLeft, Hash, Trash2,
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
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border">
      
      {/* Premium Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-sky-500/10 to-transparent rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-paper p-3 rounded-xl border border-line">
            <Twitter className="w-6 h-6 text-sky-500 fill-sky-500" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              X/Twitter Thread Splitter
            </h2>
            <p className="text-[10px] font-black text-brand uppercase tracking-widest mt-1">
              Smart Sentence-Boundary Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] xl:grid-cols-2 gap-6 items-start">
        
        {/* ================= LEFT: TEXT EDITOR ================= */}
        <div className="space-y-6">
          <div className="bg-paper border border-line rounded-2xl shadow-sm flex flex-col h-[700px] overflow-hidden">
            
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-line bg-surface">
              <div className="flex items-center gap-2 text-muted">
                <AlignLeft className="w-4 h-4 text-brand" />
                <span className="text-[10px] font-black uppercase tracking-wider text-ink">Draft Editor</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-black uppercase tracking-wider text-sky-500 bg-surface px-2.5 py-1 rounded-lg border border-line">
                  {inputText.length} Chars
                </div>
                <button onClick={handleClear} className="p-1.5 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Textarea */}
            <textarea
              className="flex-1 w-full p-4 sm:p-5 bg-transparent resize-none outline-none text-ink text-sm sm:text-base leading-relaxed placeholder-muted font-sans"
              placeholder="Paste your incredibly long draft here to see the magic happen..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            ></textarea>

            {/* Bottom Config Bar */}
            <div className="border-t border-line p-4 bg-surface space-y-2.5">
              <label className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-muted" /> Numbering Style
              </label>
              <div className="grid grid-cols-4 gap-2">
                {NUMBERING_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setNumbering(style)}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      numbering.id === style.id
                        ? "bg-brand text-surface shadow-sm"
                        : "bg-paper text-ink border border-line hover:border-brand/50"
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
          <div className="bg-paper border border-line rounded-2xl shadow-sm relative h-[700px] flex flex-col overflow-hidden">
            
            <div className="px-4 sm:px-5 py-3.5 border-b border-line flex items-center justify-between shrink-0 bg-surface">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-paper border border-line text-[10px] font-black uppercase tracking-wider text-muted shadow-sm">
                <MessageCircle className="w-3.5 h-3.5 text-brand" /> Thread Preview
              </span>
              <span className="text-xs font-black text-sky-500 font-mono">
                {tweets.length} Tweets Generated
              </span>
            </div>

            {/* Scrollable Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface">
              {tweets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <Twitter className="w-12 h-12 text-muted mb-3" />
                  <p className="text-xs font-black text-muted uppercase tracking-wider">Awaiting Content</p>
                </div>
              ) : (
                <div className="relative space-y-3">
                  {/* The vertical thread line */}
                  {tweets.length > 1 && (
                    <div className="absolute left-[27px] top-12 bottom-12 w-0.5 bg-line z-0"></div>
                  )}

                  {/* Individual Tweets */}
                  <div className="space-y-3 z-10 relative">
                    {tweets.map((tweet, index) => (
                      <div key={index} className="flex gap-3 group">
                        
                        {/* Avatar Col */}
                        <div className="flex flex-col items-center shrink-0 pt-1">
                          <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 shadow-sm shrink-0 relative z-10"></div>
                        </div>

                        {/* Content Col */}
                        <div className="flex-1 min-w-0 bg-paper p-4 rounded-2xl border border-line shadow-sm transition-shadow group-hover:shadow-md relative">
                          
                          {/* User Header Mock */}
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-xs font-black text-ink truncate">You</span>
                            <span className="text-[11px] font-bold text-muted truncate">@yourhandle</span>
                          </div>
                          
                          {/* Tweet Body */}
                          <p className="text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-wrap break-words font-sans">
                            {tweet.text}
                          </p>
                          {tweet.suffix && (
                            <p className="text-xs sm:text-sm text-sky-500 dark:text-sky-400 mt-2 font-bold font-mono">
                              {tweet.suffix.trim()}
                            </p>
                          )}

                          {/* Stats & Actions Footer */}
                          <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                            <span className={`text-[10px] font-black tracking-wider uppercase font-mono ${tweet.length > 270 ? 'text-amber-500' : 'text-muted'}`}>
                              {tweet.length} / 280
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => handleCopy(tweet.content, index)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                copiedIndex === index 
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                                  : "bg-surface text-ink border border-line hover:border-brand/50"
                              }`}
                            >
                              {copiedIndex === index ? (
                                <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                              ) : (
                                <><Copy className="w-3.5 h-3.5 text-muted" /> Copy Part {index + 1}</>
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
            <div className="p-3.5 bg-surface border-t border-line flex items-start gap-2.5 shrink-0">
              <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-muted leading-relaxed">
                URLs count as 23 characters on X, regardless of their actual length. If your thread contains long links, the character count may differ slightly when pasting into X.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}