"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon, Download, Copy, Settings2, 
  Type, Maximize, Palette, CheckCircle2,
  Code2, Zap, Activity
} from "lucide-react";

export default function PlaceholderImageGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  const canvasRef = useRef(null);

  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);
  const [text, setText] = useState("");
  
  const [bgColor, setBgColor] = useState("#e2e8f0");
  const [textColor, setTextColor] = useState("#475569");
  
  const [pattern, setPattern] = useState("solid");
  const [format, setFormat] = useState("png");

  const [dataUrl, setDataUrl] = useState("");
  const [copiedType, setCopiedType] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !canvasRef.current) return;
    
    const w = Math.max(1, parseInt(width) || 800);
    const h = Math.max(1, parseInt(height) || 400);

    const canvas = canvasRef.current;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    if (pattern === "solid") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
    } 
    else if (pattern === "gradient") {
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, bgColor);
      gradient.addColorStop(1, textColor + "33");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }
    else if (pattern === "grid") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
      
      ctx.strokeStyle = textColor + "22";
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
      
      ctx.fillStyle = textColor + "33";
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

    const displayText = text.trim() ? text : `${w} × ${h}`;
    
    let fontSize = Math.min(w, h) / 5;
    if (displayText.length > 10) {
      fontSize = Math.min(w, h) / (displayText.length * 0.6);
    }
    fontSize = Math.max(12, Math.min(fontSize, 300));

    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
    
    ctx.fillText(displayText, w / 2, h / 2);

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

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Mockup Image Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Client-side canvas image generator.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: CONFIGURATION ENGINE */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border font-sans">
            
            {/* 1. Dimensions */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Maximize className="w-3.5 h-3.5 text-brand" /> 1. Dimensions (px)
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Width</label>
                  <div className="relative flex items-center bg-surface border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden">
                    <input type="number" min="10" max="4000" value={width} onChange={(e) => setWidth(e.target.value)} className="w-full bg-surface px-3.5 py-2.5 text-base font-bold text-ink outline-none tabular-nums" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Height</label>
                  <div className="relative flex items-center bg-surface border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden">
                    <input type="number" min="10" max="4000" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-surface px-3.5 py-2.5 text-base font-bold text-ink outline-none tabular-nums" />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-line" />

            {/* 2. Visuals & Typography */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Palette className="w-3.5 h-3.5 text-brand" /> 2. Aesthetics & Content
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Background Color</label>
                  <div className="flex items-center gap-2.5 bg-surface border border-line p-2 rounded-xl">
                     <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-line shrink-0 cursor-pointer">
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0" />
                        <div className="absolute inset-0" style={{ backgroundColor: bgColor }}></div>
                     </div>
                     <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="bg-transparent text-xs font-mono font-bold uppercase text-ink outline-none w-full tabular-nums" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Text Color</label>
                  <div className="flex items-center gap-2.5 bg-surface border border-line p-2 rounded-xl">
                     <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-line shrink-0 cursor-pointer">
                        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0" />
                        <div className="absolute inset-0" style={{ backgroundColor: textColor }}></div>
                     </div>
                     <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="bg-transparent text-xs font-mono font-bold uppercase text-ink outline-none w-full tabular-nums" />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Custom Text (Optional)</label>
                  <div className="relative flex items-center bg-surface border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden">
                    <Type className="w-4 h-4 text-muted absolute left-3.5" />
                    <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Hero Banner" className="w-full bg-surface pl-10 pr-3.5 py-2.5 text-xs font-bold text-ink outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-line" />

            {/* 3. Textures & Formats */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Settings2 className="w-3.5 h-3.5 text-brand" /> 3. Rendering Engine Options
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Background Pattern</label>
                  <div className="flex bg-surface rounded-xl p-1 shadow-sm border border-line">
                    {['solid', 'gradient', 'grid', 'dots'].map((pat) => (
                      <button 
                        type="button"
                        key={pat} onClick={() => setPattern(pat)}
                        className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${pattern === pat ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
                      >
                        {pat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Export Format</label>
                  <select 
                    value={format} onChange={(e) => setFormat(e.target.value)}
                    className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none appearance-none cursor-pointer"
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

        {/* RIGHT: PREVIEW & CODE */}
        <div className="space-y-4 sm:space-y-6 w-full">
          
          <canvas ref={canvasRef} className="hidden" />

          {/* THE LIVE PREVIEW DASHBOARD */}
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Activity className="w-4 h-4 text-brand" /> Live Emulator
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-xl border border-brand/30 flex items-center gap-1">
                <Zap className="w-3 h-3"/> 0ms Latency
              </span>
            </div>

            <div className="w-full h-56 sm:h-64 rounded-xl border border-line shadow-inner flex items-center justify-center overflow-hidden" 
                 style={{ backgroundImage: 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}
            >
              {dataUrl && (
                <img 
                  src={dataUrl} 
                  alt="Placeholder Output" 
                  className="max-w-full max-h-full shadow-md object-contain"
                />
              )}
            </div>

            <div className="pt-1">
              <button 
                type="button"
                onClick={handleDownload}
                className="w-full py-2.5 px-4 bg-brand text-surface rounded-xl text-xs font-black uppercase tracking-wider transition-opacity hover:opacity-90 flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" /> Download {format.toUpperCase()}
              </button>
            </div>
          </div>

          {/* DATA URI EXPORT PANEL */}
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Code2 className="w-4 h-4 text-brand" /> Base64 Injector
              </span>
            </div>

            <div className="space-y-3">
              {/* Img Tag Copy */}
              <div className="flex flex-col bg-surface border border-line rounded-xl overflow-hidden shadow-sm">
                <div className="flex justify-between items-center px-3.5 py-2.5 bg-surface border-b border-line">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted">HTML Image Tag</span>
                  <button type="button" onClick={() => handleCopy(`<img src="${dataUrl}" alt="placeholder" width="${width}" height="${height}" />`, 'html')} className="text-muted hover:text-brand transition-colors p-1">
                    {copiedType === 'html' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5"/>}
                  </button>
                </div>
                <div className="p-3.5">
                  <pre className="text-xs text-ink font-mono truncate cursor-pointer hover:opacity-70 transition-opacity m-0 tabular-nums" onClick={() => handleCopy(`<img src="${dataUrl}" alt="placeholder" width="${width}" height="${height}" />`, 'html')}>
                    <code>&lt;img src="data:image/{format};base64,..." /&gt;</code>
                  </pre>
                </div>
              </div>

              {/* Raw URI Copy */}
              <div className="flex flex-col bg-brand/10 border border-brand/30 rounded-xl overflow-hidden shadow-sm">
                <div className="flex justify-between items-center px-3.5 py-2.5 bg-brand/10 border-b border-brand/30">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand">Raw Data URI string</span>
                  <button type="button" onClick={() => handleCopy(dataUrl, 'uri')} className="text-brand hover:opacity-80 transition-opacity p-1">
                    {copiedType === 'uri' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5"/>}
                  </button>
                </div>
                <div className="p-3.5">
                  <pre className="text-xs text-ink font-mono truncate cursor-pointer hover:opacity-70 transition-opacity m-0 tabular-nums" onClick={() => handleCopy(dataUrl, 'uri')}>
                    <code>{dataUrl.substring(0, 45)}...</code>
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