"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Image as ImageIcon, Download, Copy, Settings2, 
  Type, Maximize, Palette, LayoutGrid, CheckCircle2,
  Code2, CheckSquare, Zap, Activity
} from "lucide-react";

export default function PlaceholderImageGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  const canvasRef = useRef(null);

  // States
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);
  const [text, setText] = useState("");
  
  const [bgColor, setBgColor] = useState("#e2e8f0");
  const [textColor, setTextColor] = useState("#475569");
  
  const [pattern, setPattern] = useState("solid"); // solid, gradient, grid, dots
  const [format, setFormat] = useState("png"); // png, jpeg, webp

  const [dataUrl, setDataUrl] = useState("");
  const [copiedType, setCopiedType] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- CORE HTML5 CANVAS RENDER ENGINE ---
  useEffect(() => {
    if (!isMounted || !canvasRef.current) return;
    
    // Prevent rendering zero/negative sizes
    const w = Math.max(1, parseInt(width) || 800);
    const h = Math.max(1, parseInt(height) || 400);

    const canvas = canvasRef.current;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    // 1. Draw Background
    if (pattern === "solid") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
    } 
    else if (pattern === "gradient") {
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, bgColor);
      // Create a slightly darker shade for gradient
      gradient.addColorStop(1, textColor + "33"); // Adding 20% opacity of text color to create a unique gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }
    else if (pattern === "grid") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
      
      ctx.strokeStyle = textColor + "22"; // 13% opacity
      ctx.lineWidth = 2;
      const gridSize = Math.max(20, Math.min(w, h) / 10);
      
      for (let x = 0; x <= w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y <= h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    }
    else if (pattern === "dots") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
      
      ctx.fillStyle = textColor + "33"; // 20% opacity
      const spacing = Math.max(20, Math.min(w, h) / 15);
      const radius = spacing * 0.15;

      for (let x = spacing/2; x < w; x += spacing) {
        for (let y = spacing/2; y < h; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Draw Typography
    const displayText = text.trim() ? text : `${w} × ${h}`;
    
    // Dynamic Font Scaling Logic
    let fontSize = Math.min(w, h) / 5;
    if (displayText.length > 10) {
      fontSize = Math.min(w, h) / (displayText.length * 0.6);
    }
    // Limit font size extremes
    fontSize = Math.max(12, Math.min(fontSize, 300));

    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
    
    ctx.fillText(displayText, w / 2, h / 2);

    // 3. Export to Base64 State
    try {
      const url = canvas.toDataURL(`image/${format}`, 0.9);
      setDataUrl(url);
    } catch (e) {
      console.error("Canvas export failed");
    }

  }, [width, height, text, bgColor, textColor, pattern, format, isMounted]);

  const handleCopy = (content, type) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `muxair-placeholder-${width}x${height}.${format}`;
    a.click();
  };

  if (!isMounted) return null;

  // Premium Indigo & Cyan Theme
  const theme = {
    gradient: "from-indigo-200 via-cyan-100 to-transparent dark:from-indigo-900/30 dark:via-cyan-900/20",
    bgIcon: "bg-gradient-to-br from-indigo-500 to-cyan-500",
    textPri: "text-indigo-600 dark:text-indigo-400",
    textSec: "text-cyan-600 dark:text-cyan-400",
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
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Mockup Image Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Client-Side Canvas Image Generator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8 font-sans">
            
            {/* 1. Dimensions */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Maximize className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Dimensions (px)
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Width</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-indigo-500 transition-all overflow-hidden">
                    <input type="number" min="10" max="4000" value={width} onChange={(e) => setWidth(e.target.value)} className="w-full bg-transparent px-4 py-3 text-base font-bold text-slate-800 dark:text-slate-100 outline-none tabular-nums" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Height</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-indigo-500 transition-all overflow-hidden">
                    <input type="number" min="10" max="4000" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-transparent px-4 py-3 text-base font-bold text-slate-800 dark:text-slate-100 outline-none tabular-nums" />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Visuals & Typography */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Palette className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Aesthetics & Content
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Background Color</label>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl">
                     <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" />
                     </div>
                     <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="bg-transparent text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 outline-none w-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Text Color</label>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl">
                     <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" />
                     </div>
                     <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="bg-transparent text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 outline-none w-full" />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Custom Text (Optional)</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-indigo-500 transition-all overflow-hidden">
                    <Type className="w-4 h-4 text-slate-400 absolute left-4" />
                    <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Hero Banner" className="w-full bg-transparent pl-10 pr-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 3. Textures & Formats */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Settings2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 3. Rendering Engine Options
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Background Pattern</label>
                  <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 shadow-inner border border-slate-200 dark:border-slate-700">
                    {['solid', 'gradient', 'grid', 'dots'].map((pat) => (
                      <button 
                        key={pat} onClick={() => setPattern(pat)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${pattern === pat ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                      >
                        {pat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Export Format</label>
                  <select 
                    value={format} onChange={(e) => setFormat(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none appearance-none cursor-pointer"
                  >
                    <option value="png">High-Res PNG</option>
                    <option value="jpeg">Compressed JPEG</option>
                    <option value="webp">WebP (Next.js Opt)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: PREVIEW & CODE ================= */}
        <div className="space-y-6 sticky top-6">
          
          {/* Hidden Canvas (Used for Rendering) */}
          <canvas ref={canvasRef} className="hidden" />

          {/* THE LIVE PREVIEW DASHBOARD */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col font-sans">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 flex flex-col relative overflow-hidden transition-colors duration-500">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-3 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Live Emulator
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.textPri} bg-white dark:bg-[#0d1117] px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-1`}>
                  <Zap className="w-3 h-3"/> 0ms Latency
                </span>
              </div>

              {/* Checkboard Background for transparent visibility & The Output Image */}
              <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 shadow-inner flex items-center justify-center overflow-hidden" 
                   style={{ backgroundImage: 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}
              >
                {dataUrl && (
                  // Using an img tag dynamically fed by canvas Base64 state so it scales gracefully in the UI without breaking layout
                  <img 
                    src={dataUrl} 
                    alt="Placeholder Output" 
                    className="max-w-full max-h-full shadow-lg object-contain"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-3">
                <button 
                  onClick={handleDownload}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" /> Download {format.toUpperCase()}
                </button>
              </div>

            </div>
          </div>

          {/* DATA URI EXPORT PANEL */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col font-sans">
            <div className="bg-white dark:bg-[#161b22] rounded-[22px] p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-3 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Code2 className={`w-4 h-4 ${theme.textPri}`} /> Base64 Injector
                </span>
              </div>

              <div className="space-y-4">
                {/* Img Tag Copy */}
                <div className="flex flex-col bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex justify-between items-center px-4 py-2.5 bg-slate-100/50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">HTML Image Tag</span>
                    <button onClick={() => handleCopy(`<img src="${dataUrl}" alt="placeholder" width="${width}" height="${height}" />`, 'html')} className="text-slate-400 hover:text-indigo-500 transition-colors">
                      {copiedType === 'html' ? <CheckCircle2 className="w-4 h-4 text-indigo-500"/> : <Copy className="w-4 h-4"/>}
                    </button>
                  </div>
                  <div className="p-3">
                    <pre className="text-xs text-slate-800 dark:text-slate-300 font-mono truncate cursor-pointer hover:opacity-70 transition-opacity" onClick={() => handleCopy(`<img src="${dataUrl}" alt="placeholder" width="${width}" height="${height}" />`, 'html')}>
                      <code>&lt;img src="data:image/{format};base64,..." /&gt;</code>
                    </pre>
                  </div>
                </div>

                {/* Raw URI Copy */}
                <div className="flex flex-col bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-800/50 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex justify-between items-center px-4 py-2.5 bg-cyan-100/50 dark:bg-cyan-900/30 border-b border-cyan-200 dark:border-cyan-800/50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Raw Data URI string</span>
                    <button onClick={() => handleCopy(dataUrl, 'uri')} className="text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                      {copiedType === 'uri' ? <CheckCircle2 className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                    </button>
                  </div>
                  <div className="p-3">
                    <pre className="text-xs text-cyan-900 dark:text-cyan-200 font-mono truncate cursor-pointer hover:opacity-70 transition-opacity" onClick={() => handleCopy(dataUrl, 'uri')}>
                      <code>{dataUrl.substring(0, 50)}...</code>
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