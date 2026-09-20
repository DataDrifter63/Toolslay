"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Layers, Sliders, Copy, CheckCircle2, 
  PlusCircle, MinusCircle, Sparkles, Code2,
  PaintBucket, Maximize
} from "lucide-react";

// Helper: Hex to RGB for rgba() strings
const hexToRgb = (hex) => {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.slice(0, 2), 16) || 0;
  const g = parseInt(c.slice(2, 4), 16) || 0;
  const b = parseInt(c.slice(4, 6), 16) || 0;
  return `${r}, ${g}, ${b}`;
};

const PRESETS = {
  soft: [
    { x: 0, y: 1, blur: 2, spread: 0, color: "#000000", opacity: 0.05, inset: false },
    { x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 0.1, inset: false },
    { x: 0, y: 10, blur: 15, spread: -3, color: "#000000", opacity: 0.1, inset: false }
  ],
  glow: [
    { x: 0, y: 0, blur: 15, spread: 2, color: "#3b82f6", opacity: 0.5, inset: false },
    { x: 0, y: 0, blur: 40, spread: 10, color: "#8b5cf6", opacity: 0.3, inset: false }
  ],
  neumorphic: [
    { x: 8, y: 8, blur: 16, spread: 0, color: "#a3b1c6", opacity: 0.5, inset: false },
    { x: -8, y: -8, blur: 16, spread: 0, color: "#ffffff", opacity: 0.8, inset: false }
  ],
  innerDepth: [
    { x: 0, y: 2, blur: 4, spread: 0, color: "#000000", opacity: 0.1, inset: true },
    { x: 0, y: 10, blur: 20, spread: -5, color: "#000000", opacity: 0.1, inset: true }
  ]
};

export default function CssBoxShadowGenerator() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [layers, setLayers] = useState([
    { x: 0, y: 10, blur: 25, spread: -5, color: "#000000", opacity: 0.1, inset: false }
  ]);
  const [activeLayer, setActiveLayer] = useState(0);
  
  // Environment States
  const [bgColor, setBgColor] = useState("#f8fafc");
  const [boxColor, setBoxColor] = useState("#ffffff");
  
  const [copiedType, setCopiedType] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Layer Management
  const addLayer = () => {
    if (layers.length < 6) {
      setLayers([...layers, { x: 0, y: 5, blur: 10, spread: 0, color: "#000000", opacity: 0.1, inset: false }]);
      setActiveLayer(layers.length);
    }
  };

  const removeLayer = (e, index) => {
    e.stopPropagation();
    if (layers.length > 1) {
      const newLayers = layers.filter((_, i) => i !== index);
      setLayers(newLayers);
      setActiveLayer(Math.min(activeLayer, newLayers.length - 1));
    }
  };

  const updateLayer = (key, value) => {
    const newLayers = [...layers];
    newLayers[activeLayer][key] = value;
    setLayers(newLayers);
  };

  const applyPreset = (presetKey) => {
    const newLayers = JSON.parse(JSON.stringify(PRESETS[presetKey]));
    setLayers(newLayers);
    setActiveLayer(0);
    
    // Auto-adjust canvas for neumorphism to look good
    if (presetKey === 'neumorphic') {
      setBgColor("#e0e5ec");
      setBoxColor("#e0e5ec");
    } else if (presetKey === 'glow') {
      setBgColor("#0f172a");
      setBoxColor("#1e293b");
    } else {
      setBgColor("#f8fafc");
      setBoxColor("#ffffff");
    }
  };

  // --- CORE ENGINE ---
  const results = useMemo(() => {
    // Generate standard CSS
    const shadowStrings = layers.map(layer => {
      const rgb = hexToRgb(layer.color);
      const prefix = layer.inset ? "inset " : "";
      return `${prefix}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px rgba(${rgb}, ${layer.opacity})`;
    });
    
    const cssValue = shadowStrings.join(", ");
    const cssCode = `box-shadow: ${cssValue};`;

    // Generate Tailwind Arbitrary Value
    // Tailwind requires spaces to be replaced by underscores in arbitrary values, EXCEPT after commas separating multiple shadows.
    let tailwindValue = shadowStrings.map(shadow => shadow.replace(/\s+/g, '_')).join(',_');
    const tailwindCode = `shadow-[${tailwindValue}]`;

    return { cssValue, cssCode, tailwindCode };
  }, [layers]);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  if (!isMounted) return null;

  // Theme
  const theme = {
    gradient: "from-blue-200 via-indigo-100 to-transparent dark:from-blue-900/30 dark:via-indigo-900/20",
    bgIcon: "bg-gradient-to-br from-blue-500 to-indigo-600",
    textPri: "text-blue-600 dark:text-blue-400",
    textSec: "text-indigo-600 dark:text-indigo-400",
    borderLight: "border-blue-200 dark:border-blue-800/50",
    bgLight: "bg-blue-50 dark:bg-blue-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Depth & Shadow Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Multi-Layer Box-Shadow Generator
            </p>
          </div>
        </div>
        
        {/* Presets Menu */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => applyPreset('soft')} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Soft Drop</button>
          <button onClick={() => applyPreset('glow')} className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"><Sparkles className="w-3 h-3 inline mr-1"/> Neon Glow</button>
          <button onClick={() => applyPreset('neumorphic')} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Neumorphic</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 font-sans">
            
            {/* 1. Multi-Layer Stack Manager */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Layers className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Shadow Layers Stack
                </h3>
                <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">{layers.length} / 6 Max</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {layers.map((_, index) => (
                  <div 
                    key={index}
                    onClick={() => setActiveLayer(index)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${activeLayer === index ? theme.borderLight + " " + theme.bgLight + " " + theme.textPri : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"}`}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">Layer {index + 1}</span>
                    {layers.length > 1 && (
                      <button onClick={(e) => removeLayer(e, index)} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <MinusCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {layers.length < 6 && (
                  <button 
                    onClick={addLayer}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all text-xs font-black uppercase tracking-widest"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add
                  </button>
                )}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Active Layer Properties */}
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Sliders className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Editing Layer {activeLayer + 1}
                </h3>
                
                {/* Inset Toggle */}
                <button 
                  onClick={() => updateLayer('inset', !layers[activeLayer].inset)}
                  className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors ${layers[activeLayer].inset ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"}`}
                >
                  Inset (Inner Shadow)
                </button>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {/* X Offset */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">X-Offset (Horizontal)</label>
                    <span className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{layers[activeLayer].x}px</span>
                  </div>
                  <input type="range" min="-100" max="100" value={layers[activeLayer].x} onChange={(e) => updateLayer('x', parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>

                {/* Y Offset */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Y-Offset (Vertical)</label>
                    <span className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{layers[activeLayer].y}px</span>
                  </div>
                  <input type="range" min="-100" max="100" value={layers[activeLayer].y} onChange={(e) => updateLayer('y', parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>

                {/* Blur */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Blur Radius</label>
                    <span className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{layers[activeLayer].blur}px</span>
                  </div>
                  <input type="range" min="0" max="150" value={layers[activeLayer].blur} onChange={(e) => updateLayer('blur', parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>

                {/* Spread */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Spread Radius</label>
                    <span className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{layers[activeLayer].spread}px</span>
                  </div>
                  <input type="range" min="-50" max="100" value={layers[activeLayer].spread} onChange={(e) => updateLayer('spread', parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
              </div>

              {/* Color & Opacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Shadow Color</label>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl">
                     <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                        <input type="color" value={layers[activeLayer].color} onChange={(e) => updateLayer('color', e.target.value)} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" />
                     </div>
                     <span className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">{layers[activeLayer].color}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Opacity / Alpha</label>
                    <span className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{Math.round(layers[activeLayer].opacity * 100)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" value={layers[activeLayer].opacity} onChange={(e) => updateLayer('opacity', parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-3" />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ================= RIGHT: PREVIEW & CODE ================= */}
        <div className="space-y-6 sticky top-6">
          
          {/* THE LIVE CANVAS */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col font-sans">
            <div className="rounded-[22px] p-6 h-64 sm:h-80 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500" style={{ backgroundColor: bgColor }}>
              
              {/* Context Tools (Bg & Box Color) */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-black/5 dark:bg-white/10 px-2 py-1 rounded backdrop-blur-sm">
                  Live Canvas
                </span>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1.5 rounded-lg shadow-sm">
                    <Maximize className="w-3 h-3 text-slate-400" />
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-4 h-4 rounded cursor-pointer border-0 p-0" title="Canvas Background" />
                  </div>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1.5 rounded-lg shadow-sm">
                    <Box className="w-3 h-3 text-slate-400" />
                    <input type="color" value={boxColor} onChange={(e) => setBoxColor(e.target.value)} className="w-4 h-4 rounded cursor-pointer border-0 p-0" title="Box Background" />
                  </div>
                </div>
              </div>

              {/* The Object being styled */}
              <div 
                className="w-32 h-32 sm:w-48 sm:h-48 rounded-2xl transition-all duration-300 flex items-center justify-center"
                style={{ backgroundColor: boxColor, boxShadow: results.cssValue }}
              >
              </div>

            </div>
          </div>

          {/* CODE EXPORT DASHBOARD */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col font-sans">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-3 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Code2 className={`w-4 h-4 ${theme.textPri}`} /> Export Code
                </span>
              </div>

              <div className="space-y-3">
                {/* Standard CSS */}
                <div className="flex flex-col bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex justify-between items-center px-4 py-2.5 bg-slate-100/50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Raw CSS</span>
                    <button onClick={() => handleCopy(results.cssCode, 'css')} className="text-slate-400 hover:text-indigo-500 transition-colors">
                      {copiedType === 'css' ? <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500"/> : <Copy className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                  <div className="p-3">
                    <pre className="text-[11px] break-all text-slate-800 dark:text-slate-300 leading-relaxed font-mono m-0 whitespace-pre-wrap">
                      <code>{results.cssCode}</code>
                    </pre>
                  </div>
                </div>

                {/* Tailwind Arbitrary */}
                <div className="flex flex-col bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/50 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex justify-between items-center px-4 py-2.5 bg-indigo-100/50 dark:bg-indigo-900/30 border-b border-indigo-200 dark:border-indigo-800/50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Tailwind JIT Class</span>
                    <button onClick={() => handleCopy(results.tailwindCode, 'tailwind')} className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
                      {copiedType === 'tailwind' ? <CheckCircle2 className="w-3.5 h-3.5"/> : <Copy className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                  <div className="p-3">
                    <pre className="text-[11px] break-all text-indigo-900 dark:text-indigo-200 leading-relaxed font-mono m-0 whitespace-pre-wrap">
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