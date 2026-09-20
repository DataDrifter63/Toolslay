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

  // States
  const [colors, setColors] = useState(["#3b82f6", "#8b5cf6"]);
  const [type, setType] = useState("linear"); // 'linear' or 'radial'
  const [angle, setAngle] = useState(135);
  const [copiedType, setCopiedType] = useState(null); // 'css' or 'tailwind'

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handlers
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

  // --- CORE CSS ENGINE ---
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

  if (!isMounted) return null;

  // Premium Indigo Theme
  const theme = {
    gradient: "from-indigo-200 via-fuchsia-100 to-transparent dark:from-indigo-900/30 dark:via-fuchsia-900/20",
    bgIcon: "bg-gradient-to-br from-indigo-500 to-fuchsia-500",
    textPri: "text-indigo-600 dark:text-indigo-400",
    textSec: "text-fuchsia-600 dark:text-fuchsia-400",
    borderLight: "border-indigo-200 dark:border-indigo-800/50",
    bgLight: "bg-indigo-50 dark:bg-indigo-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              UI Gradient Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              CSS & Tailwind Background Generator
            </p>
          </div>
        </div>
        <button 
          onClick={applyRandomPreset}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-sm"
        >
          <Sparkles className="w-4 h-4" /> Magic Shuffle
        </button>
      </div>

      {/* HUGE LIVE PREVIEW AREA */}
      <div 
        className="w-full h-48 sm:h-64 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner relative overflow-hidden transition-all duration-300"
        style={{ background: results.cssValue }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-sm">
          <span className="text-white font-sans font-black text-2xl tracking-widest drop-shadow-md">LIVE PREVIEW</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8 font-sans">
            
            {/* 1. Style Geometry */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Layers className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Style Geometry
              </h3>
              
              <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 shadow-inner border border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setType("linear")}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${type === "linear" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  <MoveRight className="w-4 h-4" /> Linear
                </button>
                <button 
                  onClick={() => setType("radial")}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${type === "radial" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  <Sun className="w-4 h-4" /> Radial
                </button>
              </div>

              {type === "linear" && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Angle Direction</label>
                    <span className="text-xs font-black tabular-nums text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">{angle}°</span>
                  </div>
                  <input
                    type="range" min="0" max="360" value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Color Stops Engine */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Palette className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Multi-Color Stops
                </h3>
                <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">{colors.length} / 6 Max</span>
              </div>
              
              <div className="space-y-3">
                {colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm shrink-0 focus-within:border-indigo-500 transition-colors">
                      <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => updateColor(index, e.target.value)}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                      />
                    </div>
                    
                    <div className="flex-1 relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-all">
                      <span className="pl-4 text-slate-400 font-mono text-sm font-bold">#</span>
                      <input 
                        type="text" 
                        value={color.replace('#', '')}
                        onChange={(e) => updateColor(index, '#' + e.target.value)}
                        className="w-full bg-transparent px-2 py-3 text-sm font-mono font-bold text-slate-800 dark:text-slate-100 outline-none uppercase"
                        maxLength={6}
                      />
                    </div>

                    <button 
                      onClick={() => removeColor(index)}
                      disabled={colors.length <= 2}
                      className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors disabled:opacity-30"
                    >
                      <MinusCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                {colors.length < 6 && (
                  <button 
                    onClick={addColor}
                    className="w-full py-3 mt-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl border border-indigo-200 dark:border-indigo-800/50 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Color Stop
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE EXPORT CONSOLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[500px]">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden font-sans">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Code2 className={`w-4 h-4 ${theme.textPri}`} /> Export Code
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.textPri} bg-white dark:bg-[#0d1117] px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700`}>
                  Ready to Paste
                </span>
              </div>

              <div className="flex-1 space-y-4">
                
                {/* Standard CSS Export */}
                <div className="flex flex-col bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm group">
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-100/50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Standard CSS
                    </span>
                    <button 
                      onClick={() => handleCopy(results.cssCode, 'css')} 
                      className="text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      {copiedType === 'css' ? <CheckCircle2 className="w-4 h-4 text-indigo-500"/> : <Copy className="w-4 h-4"/>}
                    </button>
                  </div>
                  <div className="p-4">
                    <pre className="text-xs break-all text-slate-800 dark:text-slate-300 leading-relaxed font-mono m-0 whitespace-pre-wrap">
                      <code>{results.cssCode}</code>
                    </pre>
                  </div>
                </div>

                {/* Tailwind Output - KILLER FEATURE */}
                <div className="flex flex-col bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/50 rounded-xl overflow-hidden shadow-sm group">
                  <div className="flex justify-between items-center px-4 py-3 bg-indigo-100/50 dark:bg-indigo-900/30 border-b border-indigo-200 dark:border-indigo-800/50 shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                      Tailwind CSS (Arbitrary Value)
                    </span>
                    <button 
                      onClick={() => handleCopy(results.tailwindCode, 'tailwind')} 
                      className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                    >
                      {copiedType === 'tailwind' ? <CheckCircle2 className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                    </button>
                  </div>
                  <div className="p-4">
                    <pre className="text-xs break-all text-indigo-900 dark:text-indigo-200 leading-relaxed font-mono m-0 whitespace-pre-wrap">
                      <code>{results.tailwindCode}</code>
                    </pre>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
