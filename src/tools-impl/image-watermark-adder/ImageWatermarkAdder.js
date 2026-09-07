"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Stamp,
  UploadCloud,
  Download,
  Trash2,
  CheckCircle2,
  Type,
  Image as ImageIcon,
  Grid,
  Sliders,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Move,
  MousePointer2,
  AlertTriangle,
  X
} from "lucide-react";

const FONTS = [
  { id: "Impact, sans-serif", name: "Impact (Bold)" },
  { id: "Arial, sans-serif", name: "Arial Clean" },
  { id: "'Montserrat', sans-serif", name: "Montserrat Modern" },
  { id: "'Courier New', monospace", name: "Courier Tech" },
  { id: "'Georgia', serif", name: "Georgia Classic" },
  { id: "'Comic Sans MS', cursive", name: "Playful" }
];

export default function ImageWatermarkAdder() {
  const [isMounted, setIsMounted] = useState(false);

  const [imageList, setImageList] = useState([]);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const [watermarkMode, setWatermarkMode] = useState("both"); 
  const [wmText, setWmText] = useState("© YOUR BRAND");
  const [fontFamily, setFontFamily] = useState(FONTS[0].id);
  const [textColor, setTextColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [useStroke, setUseStroke] = useState(true);

  const [logoUrl, setLogoUrl] = useState(null);

  const [baseImgObj, setBaseImgObj] = useState(null);
  const [logoImgObj, setLogoImgObj] = useState(null);

  const [layoutStyle, setLayoutStyle] = useState("single"); 
  const [opacity, setOpacity] = useState(80);
  const [sizeScale, setSizeScale] = useState(20); 
  const [rotation, setRotation] = useState(0); 
  const [gridSpacing, setGridSpacing] = useState(150);
  
  const [textPos, setTextPos] = useState({ x: 50, y: 65 });
  const [logoPos, setLogoPos] = useState({ x: 50, y: 35 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [draggingTarget, setDraggingTarget] = useState(null); 

  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const activeUrls = useRef({ images: [], logo: null });

  useEffect(() => {
    setIsMounted(true);
    return () => {
      activeUrls.current.images.forEach(u => URL.revokeObjectURL(u));
      if (activeUrls.current.logo) URL.revokeObjectURL(activeUrls.current.logo);
    };
  }, []);

  useEffect(() => {
    const currentImgData = imageList[activeImgIndex];
    if (!currentImgData) {
      setBaseImgObj(null);
      return;
    }
    const img = new Image();
    img.onload = () => setBaseImgObj(img);
    img.onerror = () => setError("Failed to render background image.");
    img.src = currentImgData.url;
  }, [imageList, activeImgIndex]);

  useEffect(() => {
    if (!logoUrl) {
      setLogoImgObj(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setLogoImgObj(img);
      setError(null);
    };
    img.onerror = () => setError("Failed to render logo image.");
    img.src = logoUrl;
  }, [logoUrl]);

  const handleBatchImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newImages = files.map((file, idx) => {
      const url = URL.createObjectURL(file);
      activeUrls.current.images.push(url);
      return { id: `${Date.now()}-${idx}`, file, url, name: file.name };
    });

    setImageList((prev) => [...prev, ...newImages]);
    if (e.target) e.target.value = "";
    setError(null);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (activeUrls.current.logo) URL.revokeObjectURL(activeUrls.current.logo);
    const url = URL.createObjectURL(file);
    activeUrls.current.logo = url;
    
    setLogoUrl(url);
    setError(null);
  };

  const removeSingleImage = (id, index) => {
    const updated = imageList.filter((img) => img.id !== id);
    setImageList(updated);
    if (activeImgIndex >= updated.length) {
      setActiveImgIndex(Math.max(0, updated.length - 1));
    }
  };

  const clearAll = () => {
    activeUrls.current.images.forEach(u => URL.revokeObjectURL(u));
    if (activeUrls.current.logo) URL.revokeObjectURL(activeUrls.current.logo);
    activeUrls.current.images = [];
    activeUrls.current.logo = null;
    
    setImageList([]);
    setLogoUrl(null);
    setLogoImgObj(null);
    setBaseImgObj(null);
    setActiveImgIndex(0);
    setError(null);
  };

  const drawWatermarkToContext = useCallback((ctx, width, height) => {
    ctx.save();
    ctx.globalAlpha = opacity / 100;

    const baseUnit = Math.min(width, height);
    const calculatedFontSize = Math.max(16, (baseUnit * (sizeScale / 100)) / 2);
    ctx.font = `900 ${calculatedFontSize}px ${fontFamily}`;

    let logoDrawWidth = 0;
    let logoDrawHeight = 0;

    if (logoImgObj) {
      const aspect = logoImgObj.width / logoImgObj.height;
      logoDrawHeight = calculatedFontSize * 1.5;
      logoDrawWidth = logoDrawHeight * aspect;
    }

    const drawText = (x, y) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (useStroke) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = Math.max(3, calculatedFontSize / 8);
        ctx.lineJoin = "round";
        ctx.strokeText(wmText, 0, 0);
      }
      ctx.fillStyle = textColor;
      ctx.fillText(wmText, 0, 0);
      ctx.restore();
    };

    const drawLogo = (x, y) => {
      if (!logoImgObj) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(logoImgObj, -logoDrawWidth / 2, -logoDrawHeight / 2, logoDrawWidth, logoDrawHeight);
      ctx.restore();
    };

    if (layoutStyle === "grid") {
      const stepX = Math.max(100, (width * gridSpacing) / 500);
      const stepY = Math.max(100, (height * gridSpacing) / 500);
      
      if (watermarkMode === "text" || watermarkMode === "both") {
        const startX = ((width * textPos.x) / 100) % stepX;
        const startY = ((height * textPos.y) / 100) % stepY;
        for (let x = startX - stepX; x < width + stepX; x += stepX) {
          for (let y = startY - stepY; y < height + stepY; y += stepY) {
            drawText(x, y);
          }
        }
      }

      if (watermarkMode === "logo" || watermarkMode === "both") {
        const startX = ((width * logoPos.x) / 100) % stepX;
        const startY = ((height * logoPos.y) / 100) % stepY;
        for (let x = startX - stepX; x < width + stepX; x += stepX) {
          for (let y = startY - stepY; y < height + stepY; y += stepY) {
            drawLogo(x, y);
          }
        }
      }
    } else {
      if (watermarkMode === "text" || watermarkMode === "both") {
        drawText((width * textPos.x) / 100, (height * textPos.y) / 100);
      }
      if (watermarkMode === "logo" || watermarkMode === "both") {
        drawLogo((width * logoPos.x) / 100, (height * logoPos.y) / 100);
      }
    }

    ctx.restore();
  }, [opacity, sizeScale, fontFamily, watermarkMode, wmText, logoImgObj, useStroke, strokeColor, textColor, rotation, layoutStyle, gridSpacing, textPos, logoPos]);

  const renderCanvas = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !baseImgObj) return;

    const ctx = canvas.getContext("2d");
    canvas.width = baseImgObj.width;
    canvas.height = baseImgObj.height;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImgObj, 0, 0);
    drawWatermarkToContext(ctx, canvas.width, canvas.height);
  }, [baseImgObj, drawWatermarkToContext]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handlePointerDown = (e) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const clickX = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const clickY = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    let target = "text";
    
    if (watermarkMode === "both") {
      const distText = Math.hypot(clickX - textPos.x, clickY - textPos.y);
      const distLogo = Math.hypot(clickX - logoPos.x, clickY - logoPos.y);
      target = distText < distLogo ? "text" : "logo";
    } else if (watermarkMode === "logo") {
      target = "logo";
    }

    setDraggingTarget(target);
    setIsDragging(true);
    updatePositionFromEvent(clientX, clientY, target);
  };

  const updatePositionFromEvent = (clientX, clientY, target) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    
    if (target === "text") setTextPos({ x, y });
    if (target === "logo") setLogoPos({ x, y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !draggingTarget) return;
    if (e.cancelable) e.preventDefault(); 
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    updatePositionFromEvent(clientX, clientY, draggingTarget);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDraggingTarget(null);
  };

  const handleExportAll = async () => {
    if (!imageList.length) return;
    setIsExporting(true);
    setError(null);

    try {
      for (let i = 0; i < imageList.length; i++) {
        const imgData = imageList[i];
        const tempCanvas = document.createElement("canvas");
        const ctx = tempCanvas.getContext("2d");
        
        await new Promise((resolve, reject) => {
          const baseImg = new Image();
          baseImg.onload = () => {
            tempCanvas.width = baseImg.width;
            tempCanvas.height = baseImg.height;
            ctx.drawImage(baseImg, 0, 0);
            
            drawWatermarkToContext(ctx, tempCanvas.width, tempCanvas.height);
            
            try {
              const dataUrl = tempCanvas.toDataURL("image/jpeg", 0.95);
              const link = document.createElement("a");
              link.download = `watermarked_${imgData.name.replace(/\.[^/.]+$/, "")}.jpg`;
              link.href = dataUrl;
              link.click();
              resolve();
            } catch (err) {
              reject(new Error("Browser blocked export. Ensure images are valid formats."));
            }
          };
          baseImg.onerror = () => reject(new Error(`Failed to load image for export: ${imgData.name}`));
          baseImg.src = imgData.url;
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An unknown error occurred during export.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
            <Stamp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
              Pro Watermark Studio
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Dual-Engine Drag & Batch Processing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {imageList.length > 0 && (
            <button onClick={clearAll} className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors pr-4 border-r border-slate-200 dark:border-slate-800">
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Private
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1 font-medium">{error}</p>
          <button onClick={() => setError(null)} className="shrink-0 opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6 items-start">
        
        <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Layers className="w-4 h-4 text-indigo-500" /> Elements Engine
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "text", label: "Text Only", icon: Type },
                { id: "logo", label: "Logo Only", icon: ImageIcon },
                { id: "both", label: "Use Both", icon: Sparkles }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setWatermarkMode(item.id)}
                  className={`py-2 rounded-lg text-[10px] font-extrabold flex flex-col items-center justify-center gap-1 border transition-all ${
                    watermarkMode === item.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                  }`}
                >
                  <item.icon className="w-4 h-4" /> {item.label}
                </button>
              ))}
            </div>

            {(watermarkMode === "text" || watermarkMode === "both") && (
              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  value={wmText}
                  onChange={(e) => setWmText(e.target.value)}
                  placeholder="Enter watermark text..."
                  className="w-full text-xs font-bold p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200"
                />
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200"
                >
                  {FONTS.map((font) => (
                    <option key={font.id} value={font.id}>{font.name}</option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Text Color</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <input type="checkbox" checked={useStroke} onChange={(e) => setUseStroke(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
                    <input type="color" disabled={!useStroke} value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent disabled:opacity-30" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Stroke</span>
                  </div>
                </div>
              </div>
            )}

            {(watermarkMode === "logo" || watermarkMode === "both") && (
              <div className="pt-2">
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:border-indigo-400 transition-colors"
                >
                  <UploadCloud className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {logoUrl ? "Change Graphic Logo" : "Upload Logo (PNG)"}
                  </span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} ref={logoInputRef} className="hidden" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
             <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Grid className="w-4 h-4 text-indigo-500" /> Layout Style
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={() => setLayoutStyle("single")} className={`py-2 px-3 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1.5 border transition-all ${layoutStyle === "single" ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}>
                <Move className="w-3.5 h-3.5" /> Interactive Drag
              </button>
              <button onClick={() => setLayoutStyle("grid")} className={`py-2 px-3 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1.5 border transition-all ${layoutStyle === "grid" ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}>
                <Grid className="w-3.5 h-3.5" /> Full Tile Pattern
              </button>
            </div>

            {layoutStyle === "grid" && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span>Grid Density Gap</span><span>{gridSpacing}px</span></div>
                <input type="range" min="50" max="400" value={gridSpacing} onChange={(e) => setGridSpacing(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span>Global Scale</span><span>{sizeScale}%</span></div>
                <input type="range" min="2" max="100" value={sizeScale} onChange={(e) => setSizeScale(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span>Transparency</span><span>{opacity}%</span></div>
                <input type="range" min="5" max="100" value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span>Rotation</span><span>{rotation}°</span></div>
                <input type="range" min="-180" max="180" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 min-w-0 flex flex-col sticky top-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm flex flex-col items-center min-h-[420px]">
            {!imageList.length ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square md:aspect-[4/3] bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer group"
              >
                <div className="bg-white dark:bg-slate-900 p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform"><UploadCloud className="w-8 h-8 text-indigo-500" /></div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Upload Source Images</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Batch upload fully supported</p>
                <input type="file" multiple accept="image/*" onChange={handleBatchImageUpload} ref={fileInputRef} className="hidden" />
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4">
                
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
                  {imageList.map((img, idx) => (
                    <div key={img.id} onClick={() => setActiveImgIndex(idx)} className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${activeImgIndex === idx ? "border-indigo-600 shadow-md scale-105" : "border-transparent opacity-60 hover:opacity-100"}`}>
                      <img src={img.url} alt="thumb" className="w-full h-full object-cover" />
                      <button onClick={(e) => { e.stopPropagation(); removeSingleImage(img.id, idx); }} className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl hover:scale-110"><Trash2 className="w-2.5 h-2.5" /></button>
                    </div>
                  ))}
                  
                  <label className="shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-500 text-xl font-light cursor-pointer hover:bg-slate-200 transition-colors">
                    +
                    <input type="file" multiple accept="image/*" onChange={handleBatchImageUpload} className="hidden" />
                  </label>
                </div>

                {/* PREMIUM INTERACTIVE CANVAS WITH FIXED HEIGHT & FULL CONTAINMENT */}
                <div className="relative w-full h-[500px] rounded-xl overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZmZmZiI+PC9yZWN0Pgo8cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU1ZjciPjwvcmVjdD4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU1ZjciPjwvcmVjdD4KPC9zdmc+')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzBkMTExNyI+PC9yZWN0Pgo8cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMxNjFkMjciPjwvcmVjdD4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMxNjFkMjciPjwvcmVjdD4KPC9zdmc+')] border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-inner">
                  
                  {layoutStyle === 'single' && (
                    <div className="absolute top-3 left-3 z-10 bg-slate-900/70 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none shadow-lg">
                      <MousePointer2 className="w-3.5 h-3.5 text-indigo-400" /> Click & Drag to Position Elements
                    </div>
                  )}

                  <canvas
                    ref={previewCanvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    className={`max-w-full max-h-full object-contain drop-shadow-2xl touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleExportAll}
            disabled={!imageList.length || isExporting}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-lg font-black transition-all shadow-xl ${
              !imageList.length || isExporting
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-[1.01] active:scale-[0.98] shadow-indigo-500/25 border border-indigo-500/50"
            }`}
          >
            {isExporting ? <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <><Download className="w-5 h-5" /> Export {imageList.length > 1 ? `All Images (${imageList.length})` : 'Image'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}