"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Scaling, Monitor, Smartphone, Settings2, 
  Copy, CheckCircle2, Code2, Type, 
  MoveHorizontal, Ruler, Zap
} from "lucide-react";

export default function CssClampCalculator() {
  const [isMounted, setIsMounted] = useState(false);

  // Core Math States (in Pixels)
  const [minWidth, setMinWidth] = useState(320); // Mobile
  const [maxWidth, setMaxWidth] = useState(1280); // Desktop
  const [minSize, setMinSize] = useState(16); // Font/Space min
  const [maxSize, setMaxSize] = useState(48); // Font/Space max
  
  // Advanced States
  const [rootSize, setRootSize] = useState(16); // Standard Browser Default
  const [propCategory, setPropCategory] = useState("font-size"); // 'font-size', 'padding', 'margin'

  // Live Demo State
  const [previewWidth, setPreviewWidth] = useState(768); // Starts at iPad size
  const [copiedType, setCopiedType] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- CORE CLAMP MATH ENGINE ---
  const results = useMemo(() => {
    // Avoid division by zero
    if (minWidth >= maxWidth) return { error: "Max viewport must be greater than Min viewport." };

    // Convert everything to REM based on Root Size
    const minWRem = minWidth / rootSize;
    const maxWRem = maxWidth / rootSize;
    const minSRem = minSize / rootSize;
    const maxSRem = maxSize / rootSize;

    // The Math: y = mx + c
    const slope = (maxSRem - minSRem) / (maxWRem - minWRem);
    const intersection = -minWRem * slope + minSRem;

    // Formatting values to look clean (max 4 decimal places)
    const formatNum = (num) => Number(num.toFixed(4));
    
    const slopeVw = formatNum(slope * 100);
    const intersectRem = formatNum(intersection);
    const finalMinRem = formatNum(minSRem);
    const finalMaxRem = formatNum(maxSRem);

    // Build the preferred value string
    let preferredVal = "";
    if (intersectRem === 0) {
      preferredVal = `${slopeVw}vw`;
    } else if (slopeVw >= 0) {
      preferredVal = `${intersectRem}rem + ${slopeVw}vw`;
    } else {
      preferredVal = `${intersectRem}rem - ${Math.abs(slopeVw)}vw`;
    }

    const clampString = `clamp(${finalMinRem}rem, ${preferredVal}, ${finalMaxRem}rem)`;
    
    // Output Formats
    const rawCSS = `${propCategory}: ${clampString};`;
    
    // Map property to Tailwind prefix
    let twPrefix = "text";
    if (propCategory === "padding") twPrefix = "p";
    if (propCategory === "margin") twPrefix = "m";
    if (propCategory === "gap") twPrefix = "gap";
    if (propCategory === "width") twPrefix = "w";

    const tailwindCSS = `${twPrefix}-[${clampString.replace(/\s+/g, '')}]`;

    return { error: null, clampString, rawCSS, tailwindCSS, finalMinRem, finalMaxRem, slopeVw, intersectRem };
  }, [minWidth, maxWidth, minSize, maxSize, rootSize, propCategory]);

  // Live Preview Math Calculation
  const livePreviewPx = useMemo(() => {
    if (previewWidth <= minWidth) return minSize;
    if (previewWidth >= maxWidth) return maxSize;
    
    const progress = (previewWidth - minWidth) / (maxWidth - minWidth);
    return minSize + (maxSize - minSize) * progress;
  }, [previewWidth, minWidth, maxWidth, minSize, maxSize]);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  if (!isMounted) return null;

  // Premium Rose/Violet Theme
  const theme = {
    gradient: "from-rose-200 via-violet-100 to-transparent dark:from-rose-900/30 dark:via-violet-900/20",
    bgIcon: "bg-gradient-to-br from-rose-500 to-violet-600",
    textPri: "text-rose-600 dark:text-rose-400",
    textSec: "text-violet-600 dark:text-violet-400",
    borderLight: "border-rose-200 dark:border-rose-800/50",
    bgLight: "bg-rose-50 dark:bg-rose-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Scaling className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Fluid Clamp Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Responsive Typography & Spacing Math
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.1fr] gap-6 items-start">
        
        {/* ================= LEFT: MATH CONFIGURATION ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8 font-sans">
            
            {/* 1. Viewport Bounds */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Monitor className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Viewport Boundaries
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5"/> Min Width (Mobile)</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-rose-500 transition-all overflow-hidden">
                    <input type="number" value={minWidth} onChange={(e) => setMinWidth(Number(e.target.value))} className="w-full bg-transparent px-4 py-3 text-lg font-bold text-slate-800 dark:text-slate-100 outline-none tabular-nums" />
                    <span className="pr-4 text-xs font-black text-slate-400">px</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5"/> Max Width (Desktop)</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-rose-500 transition-all overflow-hidden">
                    <input type="number" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} className="w-full bg-transparent px-4 py-3 text-lg font-bold text-slate-800 dark:text-slate-100 outline-none tabular-nums" />
                    <span className="pr-4 text-xs font-black text-slate-400">px</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Target Sizes */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Ruler className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Element Sizes
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Min Size (@ Mobile)</label>
                  <div className="relative flex items-center bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/50 rounded-xl focus-within:border-indigo-500 transition-all overflow-hidden">
                    <input type="number" value={minSize} onChange={(e) => setMinSize(Number(e.target.value))} className="w-full bg-transparent px-4 py-3 text-lg font-bold text-indigo-700 dark:text-indigo-400 outline-none tabular-nums" />
                    <span className="pr-4 text-xs font-black text-indigo-400 dark:text-indigo-600">px</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Size (@ Desktop)</label>
                  <div className="relative flex items-center bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50 rounded-xl focus-within:border-rose-500 transition-all overflow-hidden">
                    <input type="number" value={maxSize} onChange={(e) => setMaxSize(Number(e.target.value))} className="w-full bg-transparent px-4 py-3 text-lg font-bold text-rose-700 dark:text-rose-400 outline-none tabular-nums" />
                    <span className="pr-4 text-xs font-black text-rose-400 dark:text-rose-600">px</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 3. Advanced Context */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Settings2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 3. Context Settings
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Root Font Size (REM Base)</label>
                  <select 
                    value={rootSize} 
                    onChange={(e) => setRootSize(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none appearance-none cursor-pointer"
                  >
                    <option value="16">16px (Standard Default)</option>
                    <option value="10">10px (62.5% Trick)</option>
                    <option value="14">14px (Tailwind Config)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">CSS Property Type</label>
                  <select 
                    value={propCategory} 
                    onChange={(e) => setPropCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none appearance-none cursor-pointer"
                  >
                    <option value="font-size">Font Size (Typography)</option>
                    <option value="padding">Padding (Spacing)</option>
                    <option value="margin">Margin (Spacing)</option>
                    <option value="gap">Gap (Flex/Grid)</option>
                    <option value="width">Width (Sizing)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: PREVIEW & CODE EXPORT ================= */}
        <div className="space-y-6 sticky top-6">
          
          {/* THE LIVE INTERACTIVE PREVIEW */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col font-sans">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-64 flex flex-col relative overflow-hidden transition-colors duration-500">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-3 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Zap className={`w-4 h-4 ${theme.textPri}`} /> Live Emulator
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.textPri} bg-white dark:bg-[#0d1117] px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700`}>
                  Test Scalability
                </span>
              </div>

              {/* Slider for Emulator */}
              <div className="space-y-2 shrink-0 z-10 relative bg-white dark:bg-[#0d1117] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Simulated Screen: <span className="text-rose-500">{previewWidth}px</span></span>
                  <span>Size: <span className="text-violet-500">{livePreviewPx.toFixed(1)}px</span></span>
                </div>
                <input 
                  type="range" min="200" max="2000" 
                  value={previewWidth} 
                  onChange={(e) => setPreviewWidth(Number(e.target.value))} 
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500" 
                />
              </div>

              {/* Simulated Output Area */}
              <div className="flex-1 flex items-center justify-center mt-4 relative w-full overflow-hidden">
                <div 
                  className="bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-700/50 rounded-2xl flex items-center justify-center transition-all shadow-inner overflow-hidden whitespace-nowrap"
                  style={{
                    width: propCategory === 'width' ? `${livePreviewPx}px` : '100%',
                    padding: propCategory === 'padding' ? `${livePreviewPx}px` : '16px',
                  }}
                >
                  <span 
                    className="font-black text-indigo-900 dark:text-indigo-200"
                    style={{ 
                      fontSize: propCategory === 'font-size' ? `${livePreviewPx}px` : '20px',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    Fluid Text
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* CODE EXPORT DASHBOARD */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col font-sans">
            <div className="bg-white dark:bg-[#161b22] rounded-[22px] p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-3 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Code2 className={`w-4 h-4 ${theme.textPri}`} /> Generated CSS Code
                </span>
              </div>

              {results.error ? (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-xl border border-rose-200 dark:border-rose-800">
                  Error: {results.error}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tailwind Arbitrary */}
                  <div className="flex flex-col bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50 rounded-xl overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center px-4 py-2.5 bg-rose-100/50 dark:bg-rose-900/30 border-b border-rose-200 dark:border-rose-800/50">
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 flex items-center gap-1.5"><Scaling className="w-3 h-3"/> Tailwind JIT Class</span>
                      <button onClick={() => handleCopy(results.tailwindCSS, 'tailwind')} className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors">
                        {copiedType === 'tailwind' ? <CheckCircle2 className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                      </button>
                    </div>
                    <div className="p-3">
                      <pre className="text-xs break-all text-rose-900 dark:text-rose-200 leading-relaxed font-mono m-0 whitespace-pre-wrap">
                        <code>{results.tailwindCSS}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Standard CSS */}
                  <div className="flex flex-col bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center px-4 py-2.5 bg-slate-100/50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Standard CSS Value</span>
                      <button onClick={() => handleCopy(results.rawCSS, 'css')} className="text-slate-400 hover:text-rose-500 transition-colors">
                        {copiedType === 'css' ? <CheckCircle2 className="w-4 h-4 text-rose-500"/> : <Copy className="w-4 h-4"/>}
                      </button>
                    </div>
                    <div className="p-3">
                      <pre className="text-xs break-all text-slate-800 dark:text-slate-300 leading-relaxed font-mono m-0 whitespace-pre-wrap">
                        <code>{results.rawCSS}</code>
                      </pre>
                    </div>
                  </div>
                  
                  {/* Math Insight */}
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400">
                     <span>Slope: <span className="text-slate-600 dark:text-slate-300">{results.slopeVw}vw</span></span>
                     <span>Intersect: <span className="text-slate-600 dark:text-slate-300">{results.intersectRem}rem</span></span>
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