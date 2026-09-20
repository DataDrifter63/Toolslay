"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Binary, Type, Copy, CheckCircle2, 
  Settings2, Activity, ShieldCheck, FileText,
  Code2, Terminal
} from "lucide-react";

export default function TextBinaryConverter() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [inputValue, setInputValue] = useState("Muxair 🚀");
  const [spacing, setSpacing] = useState(true); // True = spaces between bytes
  const [copiedStates, setCopiedStates] = useState({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- CORE TRANSLATION ENGINE ---
  const results = useMemo(() => {
    const val = inputValue.trim();
    if (!val) return { type: "empty", output: "", bits: 0, bytes: 0, error: false };

    // 1. Auto-Detect Mode (If it only contains 0, 1, and spaces, it's likely binary)
    const isBinaryInput = /^[01\s]+$/.test(val);

    try {
      if (isBinaryInput) {
        // --- BINARY TO TEXT (DECODE) ---
        // Remove spaces to get raw bits
        const rawBits = val.replace(/\s+/g, '');
        
        if (rawBits.length % 8 !== 0) {
          return { type: "binary", output: "", bits: 0, bytes: 0, error: "Incomplete byte sequence (must be multiple of 8 bits)." };
        }

        // Convert binary string to byte array
        const bytesArray = [];
        for (let i = 0; i < rawBits.length; i += 8) {
          bytesArray.push(parseInt(rawBits.substring(i, i + 8), 2));
        }

        // Decode UTF-8 Array back to Text
        const textOutput = new TextDecoder('utf-8').decode(new Uint8Array(bytesArray));

        return {
          type: "binary",
          output: textOutput,
          bits: rawBits.length,
          bytes: rawBits.length / 8,
          error: false
        };

      } else {
        // --- TEXT TO BINARY (ENCODE) ---
        // Encode Text to UTF-8 Array (Handles Emojis perfectly)
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

  if (!isMounted) return null;

  // Premium Terminal Theme (Cyan & Emerald)
  const theme = {
    gradient: "from-cyan-200 via-emerald-100 to-transparent dark:from-cyan-900/30 dark:via-emerald-900/20",
    bgIcon: "bg-gradient-to-br from-cyan-500 to-emerald-500",
    textPri: "text-cyan-600 dark:text-cyan-400",
    textSec: "text-emerald-600 dark:text-emerald-400",
    borderLight: "border-cyan-200 dark:border-cyan-800/50",
    bgLight: "bg-cyan-50 dark:bg-cyan-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Binary className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Binary Translation Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              UTF-8 Text to Machine Code Encoder
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,500px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Primary Input */}
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Terminal className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Input Stream
                </h3>
                
                {/* Dynamic Mode Indicator */}
                {results.type !== "empty" && (
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm flex items-center gap-1 border ${
                    results.type === "text" 
                      ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50"
                      : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50"
                  }`}>
                    {results.type === "text" ? <><Type className="w-3 h-3"/> Text Mode</> : <><Code2 className="w-3 h-3"/> Binary Mode</>}
                  </span>
                )}
              </div>
              
              <div className={`relative flex flex-col bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all overflow-hidden group shadow-inner`}>
                <textarea
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Paste text or 010101 binary here..."
                  rows="6"
                  className="w-full bg-transparent px-5 py-5 text-base font-mono text-slate-800 dark:text-slate-100 outline-none resize-none custom-scrollbar break-all"
                  spellCheck="false"
                />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Format Controls (Only show if converting Text to Binary) */}
            <div className={`space-y-4 font-sans transition-all duration-300 ${results.type === 'text' ? 'opacity-100 h-auto' : 'opacity-50 pointer-events-none'}`}>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Settings2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Binary Formatting
              </h3>
              
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border ${spacing ? theme.borderLight + " " + theme.bgLight : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"} transition-colors duration-500`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${spacing ? `bg-white dark:bg-slate-800 shadow-sm ${theme.textPri}` : "text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-800 dark:text-slate-100 font-sans">Byte Spacing</span>
                    <span className="text-[10px] text-slate-500 block leading-snug font-sans">Add spaces between 8-bit blocks for readability.</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSpacing(!spacing)}
                  className={`w-14 h-7 rounded-full transition-colors relative p-1 shrink-0 shadow-inner ${spacing ? `bg-gradient-to-r ${theme.gradient.split(' ').slice(0, 2).join(' ')}` : "bg-slate-300 dark:bg-slate-700"}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${spacing ? "translate-x-7" : "translate-x-0"}`}></div>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE OUTPUT CONSOLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0 font-sans">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Output Console
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.textPri} bg-white dark:bg-[#0d1117] px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700`}>
                  Live Preview
                </span>
              </div>

              {/* Data Size Analytics */}
              {results.type !== "empty" && !results.error && (
                <div className="flex items-center justify-between p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl mb-4 shadow-sm shrink-0 font-sans">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payload Size</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-black tracking-widest">
                    <span className="text-slate-700 dark:text-slate-300 tabular-nums">{results.bytes} Bytes</span>
                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                    <span className="text-slate-700 dark:text-slate-300 tabular-nums">{results.bits} Bits</span>
                  </div>
                </div>
              )}

              {/* The Actual Output Area */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0d1117] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                
                {/* Output Header */}
                <div className="flex justify-between items-center px-4 py-3 bg-slate-100/50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-800 font-sans shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {results.type === "empty" ? "Result" : results.type === "text" ? "Binary Code" : "Decoded Text"}
                  </span>
                  
                  {results.output && !results.error && (
                    <button 
                      onClick={() => handleCopy(results.output, 'main')} 
                      className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                        copiedStates['main'] ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {copiedStates['main'] ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy</>}
                    </button>
                  )}
                </div>

                {/* Output Content */}
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                  {results.type === "empty" ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans">
                      <Code2 className="w-10 h-10 mb-3 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest">Awaiting Stream...</span>
                    </div>
                  ) : results.error ? (
                    <div className="h-full flex items-center justify-center text-rose-500 text-sm font-bold font-sans">
                      {results.error}
                    </div>
                  ) : (
                    <div className={`text-sm break-all whitespace-pre-wrap text-slate-800 dark:text-slate-300 leading-relaxed ${results.type === "text" ? "font-mono" : "font-sans"}`}>
                      {results.output}
                    </div>
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