"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Palette, Sun, Maximize, Copy, CheckCircle2, 
  Shuffle, PlusCircle, MinusCircle, Code2, MoveRight,
  Sparkles, Layers
} from "lucide-react";

// Premium Curated Presets
const PRESETS = [
  ["#f43f5e", "#8b5cf6", "#3b82f6"], // Cyber Sunset
  ["#10b981", "#059669", "#047857"], // Emerald Depth
  ["#f59e0b", "#f97316", "#ef4444"], // Ember Heat
  ["#06b6d4", "#3b82f6", "#4f46e5"], // Ocean Deep
  ["#c084fc", "#db2777", "#9333ea"], // Neon Night
  ["#fbbf24", "#34d399", "#3b82f6"], // Pastel Aurora
];

export default function CssGradientGenerator() {
  const [isMounted, setIsMounted] = useState(false);

  const [colors, setColors] = useState(["#3b82f6", "#8b5cf6"]);
  const [type, setType] = useState("linear"); // 'linear' or 'radial'
  const [angle, setAngle] = useState(135);
  const [copiedType, setCopiedType] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addColor = () => {
    if (colors.length < 6) {
      setColors([...colors, "#ffffff"]);
    }
  };

  const removeColor = (index) => {
    if (colors.length > 2) {
      const newColors = [...colors];
      newColors.splice(index, 1);
      setColors(newColors);
    }
  };

  const updateColor = (index, value) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };

  const applyRandomPreset = () => {
    const randomPreset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setColors([...randomPreset]);
    setAngle(Math.floor(Math.random() * 360));
  };

  const results = useMemo(() => {
    const colorString = colors.join(", ");
    let cssValue = "";
    
    if (type === "linear") {
      cssValue = `linear-gradient(${angle}deg, ${colorString})`;
    } else {
      cssValue = `radial-gradient(circle, ${colorString})`;
    }

    const cssCode = `background: ${cssValue};`;
    const tailwindCode = `bg-[${cssValue.replace(/\s+/g, '')}]`;

    return { cssValue, cssCode, tailwindCode };
  }, [colors, type, angle]);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              UI Gradient Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              CSS & Tailwind Background Generator.
            </p>
          </div>
        </div>

        <button 
          type="button"
          onClick={applyRandomPreset}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand text-surface rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" /> Magic Shuffle
        </button>
      </div>

      {/* HUGE LIVE PREVIEW AREA */}
      <div 
        className="w-full h-40 sm:h-56 rounded-2xl border border-line shadow-inner relative overflow-hidden transition-all duration-300"
        style={{ background: results.cssValue }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-xs">
          <span className="text-white font-sans font-black text-xl tracking-widest drop-shadow-md">LIVE PREVIEW</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: CONFIGURATION ENGINE */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border font-sans">
            
            {/* 1. Style Geometry */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Layers className="w-3.5 h-3.5 text-brand" /> 1. Style Geometry
              </h3>
              
              <div className="flex bg-surface rounded-xl p-1 border border-line">
                <button 
                  type="button"
                  onClick={() => setType("linear")}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${type === "linear" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
                >
                  <MoveRight className="w-4 h-4" /> Linear
                </button>
                <button 
                  type="button"
                  onClick={() => setType("radial")}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${type === "radial" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
                >
                  <Sun className="w-4 h-4" /> Radial
                </button>
              </div>

              {type === "linear" && (
                <div className="mt-3 p-3.5 bg-surface rounded-xl border border-line">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted">Angle Direction</label>
                    <span className="text-xs font-black tabular-nums text-brand bg-brand/10 px-2 py-0.5 rounded-lg border border-brand/30">{angle}°</span>
                  </div>
                  <input
                    type="range" min="0" max="360" value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value))}
                    className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand"
                  />
                </div>
              )}
            </div>

            <hr className="border-line" />

            {/* 2. Color Stops Engine */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-brand" /> 2. Multi-Color Stops
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider bg-surface text-muted px-2 py-0.5 rounded-lg border border-line">{colors.length} / 6 Max</span>
              </div>
              
              <div className="space-y-2.5">
                {colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-line shadow-sm shrink-0 cursor-pointer">
                      <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => updateColor(index, e.target.value)}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer opacity-0"
                      />
                      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ backgroundColor: color }}></div>
                    </div>
                    
                    <div className="flex-1 relative flex items-center bg-surface border border-line rounded-xl overflow-hidden focus-within:border-brand transition-all">
                      <span className="pl-3 text-muted font-mono text-xs font-bold">#</span>
                      <input 
                        type="text" 
                        value={color.replace('#', '')}
                        onChange={(e) => updateColor(index, '#' + e.target.value)}
                        className="w-full bg-surface px-1.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-ink outline-none uppercase tabular-nums"
                        maxLength={6}
                      />
                    </div>

                    <button 
                      type="button"
                      onClick={() => removeColor(index)}
                      disabled={colors.length <= 2}
                      className="p-2.5 text-muted hover:text-[#fb7185] hover:bg-[#fb7185]/10 rounded-xl transition-colors disabled:opacity-30"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {colors.length < 6 && (
                  <button 
                    type="button"
                    onClick={addColor}
                    className="w-full py-2.5 mt-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand bg-brand/10 hover:bg-brand/20 rounded-xl border border-brand/30 transition-colors shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Color Stop
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: THE EXPORT CONSOLE */}
        <div className="space-y-4 sm:space-y-6 w-full">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
            
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Code2 className="w-4 h-4 text-brand" /> Export Code
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-xl border border-brand/30">
                Ready to Paste
              </span>
            </div>

            <div className="space-y-3">
              
              {/* Standard CSS Export */}
              <div className="flex flex-col bg-surface border border-line rounded-xl overflow-hidden shadow-sm">
                <div className="flex justify-between items-center px-3.5 py-2.5 bg-surface border-b border-line">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                    Standard CSS
                  </span>
                  <button 
                    type="button"
                    onClick={() => handleCopy(results.cssCode, 'css')} 
                    className="text-muted hover:text-brand transition-colors p-1"
                  >
                    {copiedType === 'css' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5"/>}
                  </button>
                </div>
                <div className="p-3.5">
                  <pre className="text-xs break-all text-ink leading-relaxed font-mono m-0 whitespace-pre-wrap tabular-nums">
                    <code>{results.cssCode}</code>
                  </pre>
                </div>
              </div>

              {/* Tailwind Output */}
              <div className="flex flex-col bg-brand/10 border border-brand/30 rounded-xl overflow-hidden shadow-sm">
                <div className="flex justify-between items-center px-3.5 py-2.5 bg-brand/10 border-b border-brand/30">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand">
                    Tailwind CSS (Arbitrary Value)
                  </span>
                  <button 
                    type="button"
                    onClick={() => handleCopy(results.tailwindCode, 'tailwind')} 
                    className="text-brand hover:opacity-80 transition-opacity p-1"
                  >
                    {copiedType === 'tailwind' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5"/>}
                  </button>
                </div>
                <div className="p-3.5">
                  <pre className="text-xs break-all text-ink leading-relaxed font-mono m-0 whitespace-pre-wrap tabular-nums">
                    <code>{results.tailwindCode}</code>
                  </pre>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}