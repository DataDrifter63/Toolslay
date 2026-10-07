"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Hash, Cpu, Binary, BoxSelect, 
  Copy, CheckCircle2, Type, AlertCircle, 
  Terminal, Activity
} from "lucide-react";

export default function NumberBaseConverter() {
  const [isMounted, setIsMounted] = useState(false);

  const [inputValue, setInputValue] = useState("4D7578616972"); // Default Hex for "Muxair"
  const [inputBase, setInputBase] = useState(16); // 2, 8, 10, 16
  const [copiedStates, setCopiedStates] = useState({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInputChange = (val) => {
    let cleanVal = val.trim();
    
    if (inputBase === 2) cleanVal = cleanVal.replace(/[^01]/g, '');
    else if (inputBase === 8) cleanVal = cleanVal.replace(/[^0-7]/g, '');
    else if (inputBase === 10) cleanVal = cleanVal.replace(/[^0-9]/g, '');
    else if (inputBase === 16) cleanVal = cleanVal.replace(/[^0-9A-Fa-f]/g, '');

    setInputValue(cleanVal);
  };

  const handleBaseChange = (newBase) => {
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
      setInputValue("");
    }
    setInputBase(newBase);
  };

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
    
    const paddedBin = binStr.padStart(Math.ceil(binStr.length / 4) * 4, '0');
    const formattedBin = paddedBin.match(/.{1,4}/g)?.join(' ') || binStr;

    const paddedHex = hexStr.padStart(Math.ceil(hexStr.length / 2) * 2, '0');
    const formattedHex = paddedHex.match(/.{1,2}/g)?.join(' ') || hexStr;

    let asciiDecode = "";
    for (let i = 0; i < paddedHex.length; i += 2) {
      const code = parseInt(paddedHex.substr(i, 2), 16);
      if (code >= 32 && code <= 126) {
        asciiDecode += String.fromCharCode(code);
      } else {
        asciiDecode += "·";
      }
    }

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

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* HEADER BAR */}
      <div className="bg-surface border border-line p-4 sm:p-8 rounded-2xl shadow-card space-y-4 sm:space-y-6 w-full box-border relative overflow-hidden font-sans">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-lg sm:text-xl font-black shrink-0">
            <Terminal className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-brand uppercase mb-0.5 sm:mb-1">
              DEVELOPER UTILITY
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-ink tracking-tight truncate">
              Developer Base Oracle
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted mt-0.5 truncate">
              Infinite precision Hex, Binary, and Decimal conversion engine.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: CONFIGURATION ENGINE */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border">
            
            {/* 1. Base Logic Selectors */}
            <div className="space-y-3 font-sans">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <BoxSelect className="w-3.5 h-3.5 text-brand" /> 1. Input Base
              </h3>
              
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 10, label: "Decimal", sub: "Base-10", icon: <Hash className="w-4 h-4"/>, color: "text-blue-500" },
                  { id: 16, label: "Hexadecimal", sub: "Base-16", icon: <Hash className="w-4 h-4"/>, color: "text-purple-500" },
                  { id: 2, label: "Binary", sub: "Base-2", icon: <Binary className="w-4 h-4"/>, color: "text-emerald-500" },
                  { id: 8, label: "Octal", sub: "Base-8", icon: <Hash className="w-4 h-4"/>, color: "text-amber-500" }
                ].map(base => (
                  <button 
                    key={base.id}
                    type="button"
                    onClick={() => handleBaseChange(base.id)}
                    className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2.5 ${inputBase === base.id ? 'border-brand bg-brand/10' : 'border-line hover:border-brand/50 bg-surface'}`}
                  >
                    <div className={`p-2 rounded-lg bg-surface border border-line shadow-sm shrink-0 ${base.color}`}>
                      {base.icon}
                    </div>
                    <div className="text-left min-w-0">
                      <span className={`block text-[11px] font-black uppercase tracking-wider truncate ${inputBase === base.id ? 'text-brand' : 'text-ink'}`}>{base.label}</span>
                      <span className="text-[9px] font-bold text-muted block truncate">{base.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-line" />

            {/* 2. Primary Input */}
            <div className="space-y-3 font-sans">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Cpu className="w-3.5 h-3.5 text-brand" /> 2. Enter Data
              </h3>
              
              <div className="bg-surface border border-line rounded-xl overflow-hidden focus-within:border-brand transition-all w-full">
                <div className="flex justify-between items-center px-4 py-2 bg-surface border-b border-line">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                    {inputBase === 16 ? "HEX" : inputBase === 2 ? "BIN" : inputBase === 8 ? "OCT" : "DEC"} INPUT
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2 py-0.5 rounded-lg border border-brand/30">
                    BigInt Precision
                  </span>
                </div>
                <textarea
                  value={inputValue} 
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Enter number..."
                  rows="3"
                  className="w-full bg-surface px-4 py-3 text-xs sm:text-sm font-mono text-ink outline-none resize-none custom-scrollbar break-all tabular-nums"
                  spellCheck="false"
                />
              </div>

              {results?.error && inputValue && (
                <div className="flex items-center gap-2 p-3 bg-[#fb7185]/10 border border-[#fb7185]/30 rounded-xl text-[#fb7185] text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" /> Invalid characters for the selected base.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT: THE DASHBOARD / ORACLE */}
        <div className="space-y-4 sm:space-y-6 w-full">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border">
            
            <div className="flex items-center justify-between border-b border-line pb-3 font-sans">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Activity className="w-4 h-4 text-brand" /> Omni-Grid
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-xl border border-brand/30">
                Real-Time
              </span>
            </div>

            {!results || results.error ? (
              <div className="flex flex-col items-center justify-center text-muted py-12">
                <Terminal className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-[10px] font-sans font-black uppercase tracking-widest">Awaiting Valid Input</p>
              </div>
            ) : (
              <div className="space-y-3">
                
                {/* HEXADECIMAL */}
                <div className="flex flex-col bg-surface border border-line rounded-xl overflow-hidden shadow-sm">
                  <div className="flex justify-between items-center px-3 py-2 bg-surface border-b border-line font-sans">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted">Hexadecimal (Base-16)</span>
                    <button type="button" onClick={() => handleCopy(results.hex, 'hex')} className="text-muted hover:text-brand transition-colors p-1">
                      {copiedStates['hex'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                  <div className="p-3 text-xs sm:text-sm text-ink break-all max-h-24 overflow-y-auto custom-scrollbar tabular-nums">
                    <span className="text-muted select-none mr-1">0x</span>{results.hexFormatted}
                  </div>
                </div>

                {/* DECIMAL */}
                <div className="flex flex-col bg-surface border border-line rounded-xl overflow-hidden shadow-sm">
                  <div className="flex justify-between items-center px-3 py-2 bg-surface border-b border-line font-sans">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted">Decimal (Base-10)</span>
                    <button type="button" onClick={() => handleCopy(results.dec, 'dec')} className="text-muted hover:text-brand transition-colors p-1">
                      {copiedStates['dec'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                  <div className="p-3 text-xs sm:text-sm text-ink break-all max-h-24 overflow-y-auto custom-scrollbar tabular-nums">
                    {results.dec}
                  </div>
                </div>

                {/* BINARY */}
                <div className="flex flex-col bg-surface border border-line rounded-xl overflow-hidden shadow-sm">
                  <div className="flex justify-between items-center px-3 py-2 bg-surface border-b border-line font-sans">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted">Binary (Base-2)</span>
                    <button type="button" onClick={() => handleCopy(results.bin, 'bin')} className="text-muted hover:text-brand transition-colors p-1">
                      {copiedStates['bin'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                  <div className="p-3 text-xs sm:text-sm text-ink break-all max-h-32 overflow-y-auto custom-scrollbar tabular-nums">
                    <span className="text-muted select-none mr-1">0b</span>{results.binFormatted}
                  </div>
                </div>

                {/* OCTAL & DATA ANALYTICS */}
                <div className="grid grid-cols-2 gap-2.5 font-sans">
                  <div className="flex flex-col bg-surface border border-line rounded-xl overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center px-3 py-1.5 bg-surface border-b border-line">
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted">Octal (Base-8)</span>
                    </div>
                    <div className="p-2.5 text-xs text-ink break-all truncate font-mono tabular-nums">
                       <span className="text-muted select-none">0o</span>{results.oct}
                    </div>
                  </div>
                  
                  <div className="flex flex-col bg-brand/10 border border-brand/30 rounded-xl overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center px-3 py-1.5 bg-brand/10 border-b border-brand/30">
                      <span className="text-[9px] font-black uppercase tracking-wider text-brand">Data Size</span>
                    </div>
                    <div className="p-2.5 flex items-center justify-around text-[10px] font-black text-ink tabular-nums">
                      <span>{results.bytes} B</span>
                      <div className="w-px h-3 bg-brand/30"></div>
                      <span>{results.bits} bits</span>
                    </div>
                  </div>
                </div>

                {/* ASCII DECODER */}
                <div className="flex items-start gap-2.5 p-3 bg-surface border border-line rounded-xl font-sans">
                  <Type className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[9px] font-black uppercase tracking-wider text-muted mb-0.5">ASCII Text Decoder</span>
                    <p className="text-xs font-mono font-medium text-ink break-all line-clamp-2">
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
  );
}