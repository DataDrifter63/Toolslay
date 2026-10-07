"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  UploadCloud, Download, Trash2, Settings, Image as ImageIcon, 
  Layers, Maximize, Droplets, CheckCircle2, AlertTriangle, X, 
  FileImage, Monitor
} from "lucide-react";

const FORMATS = [
  { id: "image/png", ext: "png", name: "PNG (Transparent)" },
  { id: "image/webp", ext: "webp", name: "WEBP (Next-Gen)" },
  { id: "image/jpeg", ext: "jpg", name: "JPG (Solid BG)" }
];

const SCALES = [
  { id: 1, label: "1x (Original)" },
  { id: 2, label: "2x (Retina)" },
  { id: 4, label: "4x (Ultra HD)" },
  { id: 8, label: "8x (Print Quality)" },
  { id: 16, label: "16x (Max Detail)" }
];

export default function SvgToPngConverter() {
  const [isMounted, setIsMounted] = useState(false);

  // Data States
  const [svgs, setSvgs] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // Conversion Settings
  const [scaleMultiplier, setScaleMultiplier] = useState(4);
  const [format, setFormat] = useState(FORMATS[0]);
  const [isTransparent, setIsTransparent] = useState(true);
  const [bgColor, setBgColor] = useState("#ffffff");

  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      svgs.forEach(s => URL.revokeObjectURL(s.url));
    };
  }, [svgs]);

  // Handle Upload & Extract Dimensions
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []).filter(f => f.type === "image/svg+xml" || f.name.endsWith(".svg"));
    if (!files.length) {
      setError("Please select valid SVG files.");
      return;
    }

    if (svgs.length + files.length > 20) {
      setError("Max 20 SVGs allowed at once for batch processing.");
      return;
    }

    setError(null);
    
    const newItems = await Promise.all(files.map(async (file, idx) => {
      const url = URL.createObjectURL(file);
      const dimensions = await getSvgDimensions(url);
      return {
        id: `${Date.now()}-${idx}`,
        file,
        url,
        name: file.name,
        width: dimensions.width,
        height: dimensions.height
      };
    }));

    setSvgs(prev => {
      const updated = [...prev, ...newItems];
      if (!activeId && updated.length > 0) setActiveId(updated[0].id);
      return updated;
    });

    if (e.target) e.target.value = "";
  };

  // Helper to accurately get SVG intrinsic bounds
  const getSvgDimensions = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Fallback to 512x512 if SVG lacks viewBox/dimensions
        const w = img.naturalWidth || 512;
        const h = img.naturalHeight || 512;
        resolve({ width: w, height: h, imgObj: img });
      };
      img.onerror = () => resolve({ width: 512, height: 512, imgObj: null });
      img.src = url;
    });
  };

  const removeSvg = (id) => {
    setSvgs(prev => {
      const updated = prev.filter(s => s.id !== id);
      if (activeId === id) setActiveId(updated.length > 0 ? updated[0].id : null);
      return updated;
    });
  };

  const clearAll = () => {
    svgs.forEach(s => URL.revokeObjectURL(s.url));
    setSvgs([]);
    setActiveId(null);
    setError(null);
  };

  // Prevent transparency for JPEG
  useEffect(() => {
    if (format.ext === "jpg" && isTransparent) {
      setIsTransparent(false);
    }
  }, [format, isTransparent]);

  // Core Rendering & Export Engine
  const exportImage = async (svgItem) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Load Image Object securely
    const imgObj = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = svgItem.url;
    });

    const targetWidth = svgItem.width * scaleMultiplier;
    const targetHeight = svgItem.height * scaleMultiplier;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Apply Background if not transparent or if JPEG
    if (!isTransparent || format.ext === "jpg") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    // Draw SVG scaled up
    ctx.drawImage(imgObj, 0, 0, targetWidth, targetHeight);

    // Export
    return new Promise((resolve, reject) => {
      try {
        const dataUrl = canvas.toDataURL(format.id, format.ext === "jpg" ? 0.95 : 1.0);
        const link = document.createElement("a");
        link.download = `${svgItem.name.replace(".svg", "")}_${scaleMultiplier}x.${format.ext}`;
        link.href = dataUrl;
        link.click();
        
        // Small delay to prevent browser from blocking multi-downloads
        setTimeout(resolve, 300);
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleExportAll = async () => {
    if (!svgs.length) return;
    setIsExporting(true);
    setError(null);

    try {
      for (const svg of svgs) {
        await exportImage(svg);
      }
    } catch (err) {
      console.error(err);
      setError("Export failed. The SVG might contain blocked external resources.");
    } finally {
      setIsExporting(false);
    }
  };

  const activeSvg = svgs.find(s => s.id === activeId);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 dark:bg-teal-900/50 p-2 rounded-lg">
            <Layers className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
              Pro SVG Converter
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Infinite Vector Scaling & Batch Export
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {svgs.length > 0 && (
            <button onClick={clearAll} className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors pr-4 border-r border-slate-200 dark:border-slate-800">
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Secure Local Processing
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1 font-medium">{error}</p>
          <button onClick={() => setError(null)} className="shrink-0 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-6 items-start">
        
        {/* ================= LEFT CONTROLS ================= */}
        <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Settings className="w-4 h-4 text-teal-500" /> Output Settings
            </h3>

            {/* Resolution Scaling */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Maximize className="w-3.5 h-3.5" /> Vector Scale Multiplier</span>
              </span>
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                {SCALES.map((scale) => (
                  <button
                    key={scale.id}
                    onClick={() => setScaleMultiplier(scale.id)}
                    className={`py-1.5 rounded text-[10px] font-extrabold transition-all ${
                      scaleMultiplier === scale.id
                        ? "bg-teal-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                    title={scale.label}
                  >
                    {scale.id}x
                  </button>
                ))}
              </div>
              {activeSvg && (
                <div className="mt-2 text-[10px] font-mono text-slate-500 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-center">
                  Output Resolution: <strong className="text-teal-600 dark:text-teal-400">{activeSvg.width * scaleMultiplier} x {activeSvg.height * scaleMultiplier} px</strong>
                </div>
              )}
            </div>

            {/* Format Selection */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><FileImage className="w-3.5 h-3.5" /> Export Format</span>
              </span>
              <div className="space-y-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f)}
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-between border transition-all ${
                      format.id === f.id
                        ? "bg-teal-50 dark:bg-teal-900/20 border-teal-500 text-teal-700 dark:text-teal-400"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-300"
                    }`}
                  >
                    <span>{f.name}</span>
                    {format.id === f.id && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Matting */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5" /> Background Matte</span>
              </span>
              
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${isTransparent && format.ext !== "jpg" ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'} ${format.ext === "jpg" ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input 
                    type="radio" 
                    name="bgMode" 
                    checked={isTransparent && format.ext !== "jpg"} 
                    onChange={() => setIsTransparent(true)}
                    disabled={format.ext === "jpg"}
                    className="accent-teal-600 w-4 h-4" 
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Keep Transparent</span>
                </label>

                <div className={`p-3 rounded-lg border transition-all ${!isTransparent || format.ext === "jpg" ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input 
                      type="radio" 
                      name="bgMode" 
                      checked={!isTransparent || format.ext === "jpg"} 
                      onChange={() => setIsTransparent(false)}
                      className="accent-teal-600 w-4 h-4" 
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Solid Color Fill</span>
                  </label>
                  
                  <div className={`flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 transition-opacity ${(!isTransparent || format.ext === "jpg") ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Matte Color</span>
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent" />
                  </div>
                </div>
              </div>
              {format.ext === "jpg" && (
                <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-2 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> JPEG does not support transparency.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT WORKSPACE ================= */}
        <div className="space-y-6 min-w-0 flex flex-col sticky top-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm flex flex-col items-center min-h-[500px]">
            
            {!svgs.length ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full min-h-[460px] bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-400 cursor-pointer group"
              >
                <div className="bg-white dark:bg-slate-900 p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 text-teal-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Upload SVGs to Convert</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Batch upload up to 20 files</p>
                <input type="file" multiple accept=".svg, image/svg+xml" onChange={handleUpload} ref={fileInputRef} className="hidden" />
              </div>
            ) : (
              <div className="w-full flex flex-col h-full">
                
                {/* SVG Thumbnails Bar */}
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 shrink-0">
                  {svgs.map((svg) => (
                    <div 
                      key={svg.id} 
                      onClick={() => setActiveId(svg.id)} 
                      className={`relative shrink-0 w-14 h-14 bg-white dark:bg-slate-800 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${activeId === svg.id ? "border-teal-500 shadow-md scale-105" : "border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100"}`}
                      title={svg.name}
                    >
                      {/* Using a checkerboard background for the thumbnails */}
                      <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZTVlNWY3Ij48L3JlY3Q+CjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNlNWU1ZjciPjwvcmVjdD4KPC9zdmc+')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMTYxZDI3Ij48L3JlY3Q+CjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMxNjFkMjciPjwvcmVjdD4KPC9zdmc+')]">
                        <img src={svg.url} alt="svg-thumb" className="w-full h-full object-contain p-2" />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeSvg(svg.id); }} className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl hover:scale-110"><Trash2 className="w-2.5 h-2.5" /></button>
                    </div>
                  ))}
                  
                  <label className="shrink-0 w-14 h-14 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-teal-500 hover:border-teal-400 cursor-pointer transition-colors">
                    <span className="text-xl font-light">+</span>
                    <input type="file" multiple accept=".svg, image/svg+xml" onChange={handleUpload} className="hidden" />
                  </label>
                </div>

                {/* Main Preview Container */}
                {activeSvg && (
                  <div className="flex-1 w-full flex flex-col">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[60%]">{activeSvg.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        Native: {activeSvg.width}x{activeSvg.height}
                      </span>
                    </div>

                    <div className="relative flex-1 w-full min-h-[300px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner flex items-center justify-center">
                      
                      {/* Dynamic Background Preview */}
                      <div 
                        className="absolute inset-0 z-0 transition-colors duration-300"
                        style={{
                          backgroundColor: (!isTransparent || format.ext === "jpg") ? bgColor : 'transparent',
                          backgroundImage: (isTransparent && format.ext !== "jpg") 
                            ? `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+CjxyZWN0IHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iI2ZmZmZmZiI+PC9yZWN0Pgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZTVlNWY3Ij48L3JlY3Q+CjxyZWN0IHg9IjgiIHk9IjgiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNlNWU1ZjciPjwvcmVjdD4KPC9zdmc+'), url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+CjxyZWN0IHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iIzBkMTExNyI+PC9yZWN0Pgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMTYxZDI3Ij48L3JlY3Q+CjxyZWN0IHg9IjgiIHk9IjgiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxNjFkMjciPjwvcmVjdD4KPC9zdmc+')` 
                            : 'none',
                          backgroundSize: '16px 16px'
                        }}
                      />
                      
                      {/* SVG Image (Visual Only, Real rendering happens on invisible canvas) */}
                      <img 
                        src={activeSvg.url} 
                        alt="preview" 
                        className="relative z-10 max-w-[90%] max-h-[90%] object-contain drop-shadow-2xl"
                      />

                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleExportAll}
            disabled={!svgs.length || isExporting}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-lg font-black transition-all shadow-xl ${
              !svgs.length || isExporting
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:scale-[1.01] active:scale-[0.98] shadow-teal-500/25 border border-teal-500/50"
            }`}
          >
            {isExporting ? <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <><Download className="w-5 h-5" /> Export {svgs.length > 1 ? `Batch (${svgs.length} files)` : 'Image'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}