"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Layers, Sliders, Copy, CheckCircle2, 
  PlusCircle, MinusCircle, Sparkles, Code2,
  PaintBucket, Maximize
} from "lucide-react";

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

  const [layers, setLayers] = useState([
    { x: 0, y: 10, blur: 25, spread: -5, color: "#000000", opacity: 0.1, inset: false }
  ]);
  const [activeLayer, setActiveLayer] = useState(0);
  
  const [bgColor, setBgColor] = useState("#f8fafc");
  const [boxColor, setBoxColor] = useState("#ffffff");
  
  const [copiedType, setCopiedType] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const results = useMemo(() => {
    const shadowStrings = layers.map(layer => {
      const rgb = hexToRgb(layer.color);
      const prefix = layer.inset ? "inset " : "";
      return `${prefix}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px rgba(${rgb}, ${layer.opacity})`;
    });
    
    const cssValue = shadowStrings.join(", ");
    const cssCode = `box-shadow: ${cssValue};`;

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

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <Box className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Depth & Shadow Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Multi-layer box-shadow generator.
            </p>
          </div>
        </div>

        {/* Presets Menu */}
        <div className="flex flex-wrap gap-1.5 shrink-0">
          <button type="button" onClick={() => applyPreset('soft')} className="px-3 py-1.5 rounded-xl border border-line bg-surface text-[10px] font-black uppercase tracking-wider text-muted hover:text-ink transition-colors">Soft Drop</button>
          <button type="button" onClick={() => applyPreset('glow')} className="px-3 py-1.5 rounded-xl border border-brand/30 bg-brand/10 text-[10px] font-black uppercase tracking-wider text-brand hover:opacity-80 transition-opacity"><Sparkles className="w-3 h-3 inline mr-1"/> Neon Glow</button>
          <button type="button" onClick={() => applyPreset('neumorphic')} className="px-3 py-1.5 rounded-xl border border-line bg-surface text-[10px] font-black uppercase tracking-wider text-muted hover:text-ink transition-colors">Neumorphic</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: CONFIGURATION ENGINE */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border font-sans">
            
            {/* 1. Multi-Layer Stack Manager */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand" /> 1. Shadow Layers Stack
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider bg-surface text-muted px-2 py-0.5 rounded-lg border border-line">{layers.length} / 6 Max</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {layers.map((_, index) => (
                  <div 
                    key={index}
                    onClick={() => setActiveLayer(index)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${activeLayer === index ? 'border-brand bg-brand/10 text-brand' : 'border-line text-muted hover:border-brand/50 bg-surface'}`}
                  >
                    <span className="text-xs font-black uppercase tracking-wider">Layer {index + 1}</span>
                    {layers.length > 1 && (
                      <button type="button" onClick={(e) => removeLayer(e, index)} className="text-muted hover:text-[#fb7185] transition-colors p-0.5">
                        <MinusCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {layers.length < 6 && (
                  <button 
                    type="button"
                    onClick={addLayer}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-dashed border-line text-muted hover:border-brand hover:text-brand transition-all text-xs font-black uppercase tracking-wider bg-surface"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add
                  </button>
                )}
              </div>
            </div>

            <hr className="border-line" />

            {/* 2. Active Layer Properties */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-brand" /> 2. Editing Layer {activeLayer + 1}
                </h3>
                
                <button 
                  type="button"
                  onClick={() => updateLayer('inset', !layers[activeLayer].inset)}
                  className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl border transition-colors ${layers[activeLayer].inset ? "bg-brand/10 text-brand border-brand/30" : "bg-surface text-muted border-line hover:text-ink"}`}
                >
                  Inset (Inner Shadow)
                </button>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted">X-Offset</label>
                    <span className="text-xs font-black tabular-nums text-ink bg-surface px-2 py-0.5 rounded-lg border border-line">{layers[activeLayer].x}px</span>
                  </div>
                  <input type="range" min="-100" max="100" value={layers[activeLayer].x} onChange={(e) => updateLayer('x', parseInt(e.target.value))} className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted">Y-Offset</label>
                    <span className="text-xs font-black tabular-nums text-ink bg-surface px-2 py-0.5 rounded-lg border border-line">{layers[activeLayer].y}px</span>
                  </div>
                  <input type="range" min="-100" max="100" value={layers[activeLayer].y} onChange={(e) => updateLayer('y', parseInt(e.target.value))} className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted">Blur Radius</label>
                    <span className="text-xs font-black tabular-nums text-ink bg-surface px-2 py-0.5 rounded-lg border border-line">{layers[activeLayer].blur}px</span>
                  </div>
                  <input type="range" min="0" max="150" value={layers[activeLayer].blur} onChange={(e) => updateLayer('blur', parseInt(e.target.value))} className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted">Spread Radius</label>
                    <span className="text-xs font-black tabular-nums text-ink bg-surface px-2 py-0.5 rounded-lg border border-line">{layers[activeLayer].spread}px</span>
                  </div>
                  <input type="range" min="-50" max="100" value={layers[activeLayer].spread} onChange={(e) => updateLayer('spread', parseInt(e.target.value))} className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand" />
                </div>
              </div>

              {/* Color & Opacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Shadow Color</label>
                  <div className="flex items-center gap-2.5 bg-surface border border-line p-2 rounded-xl">
                     <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-line shrink-0 cursor-pointer">
                        <input type="color" value={layers[activeLayer].color} onChange={(e) => updateLayer('color', e.target.value)} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0" />
                        <div className="absolute inset-0" style={{ backgroundColor: layers[activeLayer].color }}></div>
                     </div>
                     <span className="text-xs font-mono font-bold uppercase text-ink tabular-nums">{layers[activeLayer].color}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted">Opacity / Alpha</label>
                    <span className="text-xs font-black tabular-nums text-ink bg-surface px-2 py-0.5 rounded-lg border border-line">{Math.round(layers[activeLayer].opacity * 100)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" value={layers[activeLayer].opacity} onChange={(e) => updateLayer('opacity', parseFloat(e.target.value))} className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand mt-3" />
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* RIGHT: PREVIEW & CODE */}
        <div className="space-y-4 sm:space-y-6 w-full">
          
          {/* THE LIVE CANVAS */}
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Box className="w-4 h-4 text-brand" /> Live Preview Canvas
              </span>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 bg-surface border border-line px-2 py-1 rounded-lg shadow-sm">
                  <Maximize className="w-3 h-3 text-muted" />
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent" title="Canvas Background" />
                </div>
                <div className="flex items-center gap-1.5 bg-surface border border-line px-2 py-1 rounded-lg shadow-sm">
                  <Box className="w-3 h-3 text-muted" />
                  <input type="color" value={boxColor} onChange={(e) => setBoxColor(e.target.value)} className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent" title="Box Background" />
                </div>
              </div>
            </div>

            <div className="rounded-xl p-6 h-56 sm:h-64 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500 border border-line" style={{ backgroundColor: bgColor }}>
              <div 
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl transition-all duration-300 flex items-center justify-center"
                style={{ backgroundColor: boxColor, boxShadow: results.cssValue }}
              ></div>
            </div>
          </div>

          {/* CODE EXPORT DASHBOARD */}
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
              {/* Standard CSS */}
              <div className="flex flex-col bg-surface border border-line rounded-xl overflow-hidden shadow-sm">
                <div className="flex justify-between items-center px-3.5 py-2.5 bg-surface border-b border-line">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted">Raw CSS</span>
                  <button type="button" onClick={() => handleCopy(results.cssCode, 'css')} className="text-muted hover:text-brand transition-colors p-1">
                    {copiedType === 'css' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5"/>}
                  </button>
                </div>
                <div className="p-3.5">
                  <pre className="text-xs break-all text-ink leading-relaxed font-mono m-0 whitespace-pre-wrap tabular-nums">
                    <code>{results.cssCode}</code>
                  </pre>
                </div>
              </div>

              {/* Tailwind Arbitrary */}
              <div className="flex flex-col bg-brand/10 border border-brand/30 rounded-xl overflow-hidden shadow-sm">
                <div className="flex justify-between items-center px-3.5 py-2.5 bg-brand/10 border-b border-brand/30">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand">Tailwind JIT Class</span>
                  <button type="button" onClick={() => handleCopy(results.tailwindCode, 'tailwind')} className="text-brand hover:opacity-80 transition-opacity p-1">
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