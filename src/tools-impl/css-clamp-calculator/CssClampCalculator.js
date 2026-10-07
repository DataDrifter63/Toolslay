"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Scaling, Monitor, Smartphone, Settings2, 
  Copy, CheckCircle2, Code2, Type, 
  MoveHorizontal, Ruler, Zap
} from "lucide-react";

export default function CssClampCalculator() {
  const [isMounted, setIsMounted] = useState(false);

  const [minWidth, setMinWidth] = useState(320);
  const [maxWidth, setMaxWidth] = useState(1280);
  const [minSize, setMinSize] = useState(16);
  const [maxSize, setMaxSize] = useState(48);
  
  const [rootSize, setRootSize] = useState(16);
  const [propCategory, setPropCategory] = useState("font-size");

  const [previewWidth, setPreviewWidth] = useState(768);
  const [copiedType, setCopiedType] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const results = useMemo(() => {
    if (minWidth >= maxWidth) return { error: "Max viewport must be greater than Min viewport." };

    const minWRem = minWidth / rootSize;
    const maxWRem = maxWidth / rootSize;
    const minSRem = minSize / rootSize;
    const maxSRem = maxSize / rootSize;

    const slope = (maxSRem - minSRem) / (maxWRem - minWRem);
    const intersection = -minWRem * slope + minSRem;

    const formatNum = (num) => Number(num.toFixed(4));
    
    const slopeVw = formatNum(slope * 100);
    const intersectRem = formatNum(intersection);
    const finalMinRem = formatNum(minSRem);
    const finalMaxRem = formatNum(maxSRem);

    let preferredVal = "";
    if (intersectRem === 0) {
      preferredVal = `${slopeVw}vw`;
    } else if (slopeVw >= 0) {
      preferredVal = `${intersectRem}rem + ${slopeVw}vw`;
    } else {
      preferredVal = `${intersectRem}rem - ${Math.abs(slopeVw)}vw`;
    }

    const clampString = `clamp(${finalMinRem}rem, ${preferredVal}, ${finalMaxRem}rem)`;
    
    const rawCSS = `${propCategory}: ${clampString};`;
    
    let twPrefix = "text";
    if (propCategory === "padding") twPrefix = "p";
    if (propCategory === "margin") twPrefix = "m";
    if (propCategory === "gap") twPrefix = "gap";
    if (propCategory === "width") twPrefix = "w";

    const tailwindCSS = `${twPrefix}-[${clampString.replace(/\s+/g, '')}]`;

    return { error: null, clampString, rawCSS, tailwindCSS, finalMinRem, finalMaxRem, slopeVw, intersectRem };
  }, [minWidth, maxWidth, minSize, maxSize, rootSize, propCategory]);

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

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <Scaling className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Fluid Clamp Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Responsive typography & spacing math calculator.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: MATH CONFIGURATION */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border font-sans">
            
            {/* 1. Viewport Bounds */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Monitor className="w-3.5 h-3.5 text-brand" /> 1. Viewport Boundaries
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5"/> Min Width (Mobile)</label>
                  <div className="relative flex items-center bg-surface border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden">
                    <input type="number" value={minWidth} onChange={(e) => setMinWidth(Number(e.target.value))} className="w-full bg-surface px-3.5 py-2.5 text-base font-bold text-ink outline-none tabular-nums" />
                    <span className="pr-3.5 text-xs font-black text-muted">px</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5"/> Max Width (Desktop)</label>
                  <div className="relative flex items-center bg-surface border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden">
                    <input type="number" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} className="w-full bg-surface px-3.5 py-2.5 text-base font-bold text-ink outline-none tabular-nums" />
                    <span className="pr-3.5 text-xs font-black text-muted">px</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-line" />

            {/* 2. Target Sizes */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Ruler className="w-3.5 h-3.5 text-brand" /> 2. Element Sizes
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Min Size (@ Mobile)</label>
                  <div className="relative flex items-center bg-surface border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden">
                    <input type="number" value={minSize} onChange={(e) => setMinSize(Number(e.target.value))} className="w-full bg-surface px-3.5 py-2.5 text-base font-bold text-ink outline-none tabular-nums" />
                    <span className="pr-3.5 text-xs font-black text-muted">px</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Max Size (@ Desktop)</label>
                  <div className="relative flex items-center bg-surface border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden">
                    <input type="number" value={maxSize} onChange={(e) => setMaxSize(Number(e.target.value))} className="w-full bg-surface px-3.5 py-2.5 text-base font-bold text-ink outline-none tabular-nums" />
                    <span className="pr-3.5 text-xs font-black text-muted">px</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-line" />

            {/* 3. Advanced Context */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Settings2 className="w-3.5 h-3.5 text-brand" /> 3. Context Settings
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Root Font Size (REM Base)</label>
                  <select 
                    value={rootSize} 
                    onChange={(e) => setRootSize(Number(e.target.value))}
                    className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none appearance-none cursor-pointer"
                  >
                    <option value="16">16px (Standard Default)</option>
                    <option value="10">10px (62.5% Trick)</option>
                    <option value="14">14px (Tailwind Config)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">CSS Property Type</label>
                  <select 
                    value={propCategory} 
                    onChange={(e) => setPropCategory(e.target.value)}
                    className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none appearance-none cursor-pointer"
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

        {/* RIGHT: PREVIEW & CODE EXPORT */}
        <div className="space-y-4 sm:space-y-6 w-full">
          
          {/* THE LIVE INTERACTIVE PREVIEW */}
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Zap className="w-4 h-4 text-brand" /> Live Emulator
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-xl border border-brand/30">
                Test Scalability
              </span>
            </div>

            <div className="space-y-2 bg-surface p-3.5 rounded-xl border border-line">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-muted">
                <span>Simulated Screen: <span className="text-brand">{previewWidth}px</span></span>
                <span>Size: <span className="text-ink">{livePreviewPx.toFixed(1)}px</span></span>
              </div>
              <input 
                type="range" min="200" max="2000" 
                value={previewWidth} 
                onChange={(e) => setPreviewWidth(Number(e.target.value))} 
                className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand" 
              />
            </div>

            <div className="h-40 sm:h-48 flex items-center justify-center relative w-full overflow-hidden bg-surface rounded-xl border border-line p-4">
              <div 
                className="bg-brand/10 border border-brand/30 rounded-xl flex items-center justify-center transition-all shadow-sm overflow-hidden whitespace-nowrap"
                style={{
                  width: propCategory === 'width' ? `${Math.min(livePreviewPx, 300)}px` : '100%',
                  padding: propCategory === 'padding' ? `${Math.min(livePreviewPx, 24)}px` : '12px',
                }}
              >
                <span 
                  className="font-black text-ink"
                  style={{ 
                    fontSize: propCategory === 'font-size' ? `${Math.min(livePreviewPx, 36)}px` : '16px',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Fluid Text
                </span>
              </div>
            </div>
          </div>

          {/* CODE EXPORT DASHBOARD */}
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Code2 className="w-4 h-4 text-brand" /> Generated CSS Code
              </span>
            </div>

            {results.error ? (
              <div className="p-3.5 bg-[#fb7185]/10 text-[#fb7185] text-xs font-bold rounded-xl border border-[#fb7185]/30">
                Error: {results.error}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Tailwind Arbitrary */}
                <div className="flex flex-col bg-brand/10 border border-brand/30 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex justify-between items-center px-3.5 py-2.5 bg-brand/10 border-b border-brand/30">
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand flex items-center gap-1.5"><Scaling className="w-3 h-3"/> Tailwind JIT Class</span>
                    <button type="button" onClick={() => handleCopy(results.tailwindCSS, 'tailwind')} className="text-brand hover:opacity-80 transition-opacity p-1">
                      {copiedType === 'tailwind' ? <CheckCircle2 className="w-3.5 h-3.5"/> : <Copy className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                  <div className="p-3.5">
                    <pre className="text-xs break-all text-ink leading-relaxed font-mono m-0 whitespace-pre-wrap tabular-nums">
                      <code>{results.tailwindCSS}</code>
                    </pre>
                  </div>
                </div>

                {/* Standard CSS */}
                <div className="flex flex-col bg-surface border border-line rounded-xl overflow-hidden shadow-sm">
                  <div className="flex justify-between items-center px-3.5 py-2.5 bg-surface border-b border-line">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted">Standard CSS Value</span>
                    <button type="button" onClick={() => handleCopy(results.rawCSS, 'css')} className="text-muted hover:text-brand transition-colors p-1">
                      {copiedType === 'css' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                  <div className="p-3.5">
                    <pre className="text-xs break-all text-ink leading-relaxed font-mono m-0 whitespace-pre-wrap tabular-nums">
                      <code>{results.rawCSS}</code>
                    </pre>
                  </div>
                </div>
                
                {/* Math Insight */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface border border-line rounded-xl text-[9px] font-black uppercase tracking-wider text-muted">
                   <span>Slope: <span className="text-ink">{results.slopeVw}vw</span></span>
                   <span>Intersect: <span className="text-ink">{results.intersectRem}rem</span></span>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}