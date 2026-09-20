"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Hash, Cpu, Binary, BoxSelect, 
  Copy, CheckCircle2, Type, AlertCircle, 
  Terminal, Activity
} from "lucide-react";

export default function NumberBaseConverter() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [inputValue, setInputValue] = useState("4D7578616972"); // Default Hex for "Muxair"
  const [inputBase, setInputBase] = useState(16); // 2, 8, 10, 16
  const [copiedStates, setCopiedStates] = useState({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Validation logic based on base
  const handleInputChange = (val) => {
    let cleanVal = val.trim();
    
    // Basic regex validation to prevent invalid chars based on selected base
    if (inputBase === 2) cleanVal = cleanVal.replace(/[^01]/g, '');
    else if (inputBase === 8) cleanVal = cleanVal.replace(/[^0-7]/g, '');
    else if (inputBase === 10) cleanVal = cleanVal.replace(/[^0-9]/g, '');
    else if (inputBase === 16) cleanVal = cleanVal.replace(/[^0-9A-Fa-f]/g, '');

    setInputValue(cleanVal);
  };

  const handleBaseChange = (newBase) => {
    // Attempt to auto-convert the existing value to the new base so context isn't lost
    try {
      if (inputValue) {
        let bigIntVal;
        if (inputBase === 10) bigIntVal = BigInt(inputValue);
        else if (inputBase === 16) bigIntVal = BigInt("0x" + inputValue);
        else if (inputBase === 8) bigIntVal = BigInt("0o" + inputValue);
        else if (inputBase === 2) bigIntVal = BigInt("0b" + inputValue);

        if (newBase === 10) setInputValue(bigIntVal.toString(10));
        else if (newBase === 16) setInputValue(bigIntVal.toString(16).toUpperCase());
        else if (newBase === 8) setInputValue(bigIntVal.toString(8));
        else if (newBase === 2) setInputValue(bigIntVal.toString(2));
      }
    } catch (e) {
      setInputValue(""); // Clear if conversion fails gracefully
    }
    setInputBase(newBase);
  };

  // --- CORE CONVERSION ENGINE (BigInt for infinite precision) ---
  const results = useMemo(() => {
    if (!inputValue) return null;

    let bigIntVal = null;
    let error = false;

    try {
      if (inputBase === 10) bigIntVal = BigInt(inputValue);
      else if (inputBase === 16) bigIntVal = BigInt("0x" + inputValue);
      else if (inputBase === 8) bigIntVal = BigInt("0o" + inputValue);
      else if (inputBase === 2) bigIntVal = BigInt("0b" + inputValue);
    } catch (e) {
      error = true;
    }

    if (error || bigIntVal === null) return { error: true };

    const hexStr = bigIntVal.toString(16).toUpperCase();
    const binStr = bigIntVal.toString(2);
    
    // Group binary into nibbles (4 bits) for readability
    const paddedBin = binStr.padStart(Math.ceil(binStr.length / 4) * 4, '0');
    const formattedBin = paddedBin.match(/.{1,4}/g)?.join(' ') || binStr;

    // Group Hex into pairs
    const paddedHex = hexStr.padStart(Math.ceil(hexStr.length / 2) * 2, '0');
    const formattedHex = paddedHex.match(/.{1,2}/g)?.join(' ') || hexStr;

    // Try to decode ASCII from Hex
    let asciiDecode = "";
    for (let i = 0; i < paddedHex.length; i += 2) {
      const code = parseInt(paddedHex.substr(i, 2), 16);
      if (code >= 32 && code <= 126) {
        asciiDecode += String.fromCharCode(code);
      } else {
        asciiDecode += "·"; // non-printable placeholder
      }
    }

    // Analytics
    const bits = binStr.length;
    const bytes = Math.ceil(bits / 8);

    return {
      error: false,
      dec: bigIntVal.toString(10),
      hex: hexStr,
      hexFormatted: formattedHex,
      bin: binStr,
      binFormatted: formattedBin,
      oct: bigIntVal.toString(8),
      ascii: asciiDecode,
      bits,
      bytes
    };
  }, [inputValue, inputBase]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [id]: true });
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  if (!isMounted) return null;

  // Premium Cyberpunk Theme (Emerald & Indigo)
  const theme = {
    gradient: "from-emerald-200 via-indigo-100 to-transparent dark:from-emerald-900/30 dark:via-indigo-900/20",
    bgIcon: "bg-gradient-to-br from-emerald-500 to-indigo-600",
    textPri: "text-emerald-600 dark:text-emerald-400",
    textSec: "text-indigo-600 dark:text-indigo-400",
    borderLight: "border-emerald-200 dark:border-emerald-800/50",
    bgLight: "bg-emerald-50 dark:bg-emerald-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Developer Base Oracle
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Infinite Precision Hex/Bin/Dec Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,560px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Base Logic Selectors */}
            <div className="space-y-4 font-sans">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <BoxSelect className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Input Base
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 10, label: "Decimal", sub: "Base-10", icon: <Hash className="w-4 h-4"/>, color: "text-blue-500" },
                  { id: 16, label: "Hexadecimal", sub: "Base-16", icon: <Hash className="w-4 h-4"/>, color: "text-purple-500" },
                  { id: 2, label: "Binary", sub: "Base-2", icon: <Binary className="w-4 h-4"/>, color: "text-emerald-500" },
                  { id: 8, label: "Octal", sub: "Base-8", icon: <Hash className="w-4 h-4"/>, color: "text-amber-500" }
                ].map(base => (
                  <button 
                    key={base.id}
                    onClick={() => handleBaseChange(base.id)}
                    className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${inputBase === base.id ? `${theme.borderLight}${theme.bgLight}` : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/50"}`}
                  >
                    <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${base.color}`}>
                      {base.icon}
                    </div>
                    <div className="text-left">
                      <span className={`block text-xs font-black uppercase tracking-widest ${inputBase === base.id ? theme.textPri : "text-slate-600 dark:text-slate-300"}`}>{base.label}</span>
                      <span className="text-[10px] font-bold text-slate-400">{base.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Primary Input */}
            <div className="space-y-4 font-sans">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Cpu className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Enter Data
              </h3>
              
              <div className={`relative flex flex-col bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all overflow-hidden group`}>
                <div className="flex justify-between items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {inputBase === 16 ? "HEX" : inputBase === 2 ? "BIN" : inputBase === 8 ? "OCT" : "DEC"} INPUT
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded shadow-sm border border-slate-200 dark:border-slate-700">
                    BigInt Precision
                  </span>
                </div>
                <textarea
                  value={inputValue} 
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Enter number..."
                  rows="3"
                  className="w-full bg-transparent px-4 py-4 text-lg font-mono text-slate-800 dark:text-slate-100 outline-none resize-none custom-scrollbar break-all"
                  spellCheck="false"
                />
              </div>

              {results?.error && inputValue && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" /> Invalid characters for the selected base.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD / ORACLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[640px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0 font-sans">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Omni-Grid
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.textPri} bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700`}>
                  Real-Time Engine
                </span>
              </div>

              {!results || results.error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <Terminal className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-xs font-sans font-bold uppercase tracking-widest">Awaiting Valid Input</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0 space-y-4">
                  
                  {/* HEXADECIMAL */}
                  <div className="flex flex-col bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden shadow-sm group">
                    <div className="flex justify-between items-center px-3 py-2 bg-slate-100 dark:bg-[#1f2937] border-b border-slate-200 dark:border-slate-700/50 font-sans">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hexadecimal (Base-16)</span>
                      <button onClick={() => handleCopy(results.hex, 'hex')} className="text-slate-400 hover:text-emerald-500 transition-colors">
                        {copiedStates['hex'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5"/>}
                      </button>
                    </div>
                    <div className="p-3 text-sm text-slate-800 dark:text-slate-200 break-all max-h-24 overflow-y-auto custom-scrollbar">
                      <span className="text-slate-400 select-none mr-1">0x</span>{results.hexFormatted}
                    </div>
                  </div>

                  {/* DECIMAL */}
                  <div className="flex flex-col bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden shadow-sm group">
                    <div className="flex justify-between items-center px-3 py-2 bg-slate-100 dark:bg-[#1f2937] border-b border-slate-200 dark:border-slate-700/50 font-sans">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Decimal (Base-10)</span>
                      <button onClick={() => handleCopy(results.dec, 'dec')} className="text-slate-400 hover:text-emerald-500 transition-colors">
                        {copiedStates['dec'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5"/>}
                      </button>
                    </div>
                    <div className="p-3 text-sm text-slate-800 dark:text-slate-200 break-all max-h-24 overflow-y-auto custom-scrollbar">
                      {results.dec}
                    </div>
                  </div>

                  {/* BINARY */}
                  <div className="flex flex-col bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden shadow-sm group">
                    <div className="flex justify-between items-center px-3 py-2 bg-slate-100 dark:bg-[#1f2937] border-b border-slate-200 dark:border-slate-700/50 font-sans">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Binary (Base-2)</span>
                      <button onClick={() => handleCopy(results.bin, 'bin')} className="text-slate-400 hover:text-emerald-500 transition-colors">
                        {copiedStates['bin'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5"/>}
                      </button>
                    </div>
                    <div className="p-3 text-sm text-slate-800 dark:text-slate-200 break-all max-h-32 overflow-y-auto custom-scrollbar">
                      <span className="text-slate-400 select-none mr-1">0b</span>{results.binFormatted}
                    </div>
                  </div>

                  {/* OCTAL & DATA ANALYTICS */}
                  <div className="grid grid-cols-2 gap-4 mt-auto pt-4 font-sans shrink-0">
                    {/* OCTAL */}
                    <div className="flex flex-col bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden shadow-sm">
                      <div className="flex justify-between items-center px-3 py-1.5 bg-slate-100 dark:bg-[#1f2937] border-b border-slate-200 dark:border-slate-700/50">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Octal (Base-8)</span>
                      </div>
                      <div className="p-2.5 text-xs text-slate-800 dark:text-slate-200 break-all truncate font-mono">
                         <span className="text-slate-400 select-none">0o</span>{results.oct}
                      </div>
                    </div>
                    
                    {/* BIT/BYTE ANALYTICS */}
                    <div className="flex flex-col bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/50 rounded-xl overflow-hidden shadow-sm">
                      <div className="flex justify-between items-center px-3 py-1.5 bg-indigo-100/50 dark:bg-indigo-900/30 border-b border-indigo-200 dark:border-indigo-800/50">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Data Size</span>
                      </div>
                      <div className="p-2.5 flex items-center justify-around text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        <span>{results.bytes} Bytes</span>
                        <div className="w-px h-3 bg-indigo-200 dark:bg-indigo-700"></div>
                        <span>{results.bits} Bits</span>
                      </div>
                    </div>
                  </div>

                  {/* ASCII DECODER PRO-FEATURE */}
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl font-sans shrink-0">
                    <Type className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-0.5">ASCII Text Decoder</span>
                      <p className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 break-all line-clamp-2">
                        {results.ascii || "No printable text detected."}
                      </p>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}