"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Binary, Type, Copy, CheckCircle2, 
  Settings2, Activity, ShieldCheck, FileText,
  Code2, Terminal
} from "lucide-react";

export default function TextBinaryConverter() {
  const [isMounted, setIsMounted] = useState(false);

  const [inputValue, setInputValue] = useState("Muxair 🚀");
  const [spacing, setSpacing] = useState(true);
  const [copiedStates, setCopiedStates] = useState({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const results = useMemo(() => {
    const val = inputValue.trim();
    if (!val) return { type: "empty", output: "", bits: 0, bytes: 0, error: false };

    const isBinaryInput = /^[01\s]+$/.test(val);

    try {
      if (isBinaryInput) {
        const rawBits = val.replace(/\s+/g, '');
        
        if (rawBits.length % 8 !== 0) {
          return { type: "binary", output: "", bits: 0, bytes: 0, error: "Incomplete byte sequence (must be multiple of 8 bits)." };
        }

        const bytesArray = [];
        for (let i = 0; i < rawBits.length; i += 8) {
          bytesArray.push(parseInt(rawBits.substring(i, i + 8), 2));
        }

        const textOutput = new TextDecoder('utf-8').decode(new Uint8Array(bytesArray));

        return {
          type: "binary",
          output: textOutput,
          bits: rawBits.length,
          bytes: rawBits.length / 8,
          error: false
        };

      } else {
        const utf8Array = new TextEncoder().encode(inputValue);
        
        let binString = "";
        utf8Array.forEach(byte => {
          const binByte = byte.toString(2).padStart(8, '0');
          binString += spacing ? binByte + " " : binByte;
        });

        binString = binString.trim();

        return {
          type: "text",
          output: binString,
          bits: utf8Array.length * 8,
          bytes: utf8Array.length,
          error: false
        };
      }
    } catch (e) {
      return { type: isBinaryInput ? "binary" : "text", output: "", bits: 0, bytes: 0, error: "Invalid encoding detected." };
    }
  }, [inputValue, spacing]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [id]: true });
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* HEADER BAR */}
      <div className="bg-surface border border-line p-4 sm:p-8 rounded-2xl shadow-card space-y-4 sm:space-y-6 w-full box-border relative overflow-hidden font-sans">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-lg sm:text-xl font-black shrink-0">
            <Binary className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-brand uppercase mb-0.5 sm:mb-1">
              ENCODING UTILITY
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-ink tracking-tight truncate">
              Binary Translation Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted mt-0.5 truncate">
              UTF-8 text to machine code encoder and binary decoder.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: CONFIGURATION ENGINE */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border">
            
            {/* 1. Primary Input */}
            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-brand" /> 1. Input Stream
                </h3>
                
                {results.type !== "empty" && (
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1 border ${
                    results.type === "text" 
                      ? "bg-brand/10 text-brand border-brand/30"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  }`}>
                    {results.type === "text" ? <><Type className="w-3 h-3"/> Text Mode</> : <><Code2 className="w-3 h-3"/> Binary Mode</>}
                  </span>
                )}
              </div>
              
              <div className="bg-surface border border-line rounded-xl overflow-hidden focus-within:border-brand transition-all w-full">
                <textarea
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Paste text or 010101 binary here..."
                  rows="5"
                  className="w-full bg-surface px-4 py-3 text-xs sm:text-sm font-mono text-ink outline-none resize-none custom-scrollbar break-all tabular-nums"
                  spellCheck="false"
                />
              </div>
            </div>

            <hr className="border-line" />

            {/* 2. Format Controls */}
            <div className={`space-y-3 font-sans transition-all duration-300 ${results.type === 'text' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Settings2 className="w-3.5 h-3.5 text-brand" /> 2. Binary Formatting
              </h3>
              
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border ${spacing ? 'border-brand/30 bg-brand/10' : 'border-line bg-surface'} transition-colors`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg bg-surface border border-line shadow-sm shrink-0 ${spacing ? 'text-brand' : 'text-muted'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-black text-ink uppercase tracking-wider truncate">Byte Spacing</span>
                    <span className="text-[10px] font-medium text-muted block truncate">Add spaces between 8-bit blocks.</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSpacing(!spacing)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 shadow-inner ${spacing ? 'bg-brand' : 'bg-surface border border-line'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-surface shadow-sm transition-transform ${spacing ? "translate-x-6" : "translate-x-0"}`}></div>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: THE OUTPUT CONSOLE */}
        <div className="space-y-4 sm:space-y-6 w-full">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border">
            
            <div className="flex items-center justify-between border-b border-line pb-3 font-sans">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Activity className="w-4 h-4 text-brand" /> Output Console
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-xl border border-brand/30">
                Live Preview
              </span>
            </div>

            {/* Data Size Analytics */}
            {results.type !== "empty" && !results.error && (
              <div className="flex items-center justify-between p-3 bg-surface border border-line rounded-xl shadow-sm font-sans">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted">Payload Size</span>
                </div>
                <div className="flex items-center gap-2.5 text-[10px] font-black tracking-wider">
                  <span className="text-ink tabular-nums">{results.bytes} Bytes</span>
                  <div className="w-1 h-1 rounded-full bg-muted"></div>
                  <span className="text-ink tabular-nums">{results.bits} Bits</span>
                </div>
              </div>
            )}

            {/* The Actual Output Area */}
            <div className="flex flex-col bg-surface border border-line rounded-xl shadow-sm overflow-hidden w-full">
              
              <div className="flex justify-between items-center px-3.5 py-2.5 bg-surface border-b border-line font-sans">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                  {results.type === "empty" ? "Result" : results.type === "text" ? "Binary Code" : "Decoded Text"}
                </span>
                
                {results.output && !results.error && (
                  <button 
                    type="button"
                    onClick={() => handleCopy(results.output, 'main')} 
                    className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                      copiedStates['main'] ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-surface text-muted border-line hover:text-ink"
                    }`}
                  >
                    {copiedStates['main'] ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy</>}
                  </button>
                )}
              </div>

              <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                {results.type === "empty" ? (
                  <div className="h-32 flex flex-col items-center justify-center text-muted font-sans">
                    <Code2 className="w-8 h-8 mb-2 opacity-30" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Awaiting Stream...</span>
                  </div>
                ) : results.error ? (
                  <div className="h-32 flex items-center justify-center text-[#fb7185] text-xs font-bold font-sans text-center">
                    {results.error}
                  </div>
                ) : (
                  <div className={`text-xs sm:text-sm break-all whitespace-pre-wrap text-ink leading-relaxed ${results.type === "text" ? "font-mono" : "font-sans"} tabular-nums`}>
                    {results.output}
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