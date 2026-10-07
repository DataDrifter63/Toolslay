"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard, UploadCloud, Download, Trash2, Move, ZoomIn, 
  Square, Smartphone, Monitor, CheckCircle2, AlertTriangle, X, 
  Maximize, LayoutTemplate, Shuffle, Wand2
} from "lucide-react";

const ASPECT_RATIOS = [
  { id: "1/1", name: "Square (IG)", icon: Square, width: 1080, height: 1080 },
  { id: "9/16", name: "Story / Reel", icon: Smartphone, width: 1080, height: 1920 },
  { id: "16/9", name: "Thumbnail", icon: Monitor, width: 1920, height: 1080 },
  { id: "4/3", name: "Classic", icon: Maximize, width: 1440, height: 1080 }
];

const FILTERS = [
  { id: "none", name: "Normal", value: "none" },
  { id: "bw", name: "B&W", value: "grayscale(100%)" },
  { id: "sepia", name: "Sepia", value: "sepia(80%)" },
  { id: "vintage", name: "Vintage", value: "sepia(40%) contrast(120%) saturate(120%)" },
  { id: "contrast", name: "Punchy", value: "contrast(130%) saturate(130%)" }
];

const LAYOUT_TEMPLATES = {
  1: [{ id: '1-1', name: 'Full', gridClass: 'grid-cols-1 grid-rows-1', items: [''] }],
  2: [
    { id: '2-1', name: 'Split Vertical', gridClass: 'grid-cols-2 grid-rows-1', items: ['',''] },
    { id: '2-2', name: 'Split Horizontal', gridClass: 'grid-cols-1 grid-rows-2', items: ['',''] }
  ],
  3: [
    { id: '3-1', name: 'Focus Left', gridClass: 'grid-cols-2 grid-rows-2', items: ['row-span-2', '', ''] },
    { id: '3-2', name: 'Focus Top', gridClass: 'grid-cols-2 grid-rows-2', items: ['col-span-2', '', ''] },
    { id: '3-3', name: 'Columns', gridClass: 'grid-cols-3 grid-rows-1', items: ['','',''] },
    { id: '3-4', name: 'Rows', gridClass: 'grid-cols-1 grid-rows-3', items: ['','',''] }
  ],
  4: [
    { id: '4-1', name: 'Grid 2x2', gridClass: 'grid-cols-2 grid-rows-2', items: ['','','',''] },
    { id: '4-2', name: 'Hero Top', gridClass: 'grid-cols-3 grid-rows-2', items: ['col-span-3', '', '', ''] },
    { id: '4-3', name: 'Hero Left', gridClass: 'grid-cols-2 grid-rows-3', items: ['row-span-3', '', '', ''] },
    { id: '4-4', name: 'Strips', gridClass: 'grid-cols-4 grid-rows-1', items: ['','','',''] }
  ],
  5: [
    { id: '5-1', name: 'Bricks', gridClass: 'grid-cols-6 grid-rows-2', items: ['col-span-2','col-span-2','col-span-2','col-span-3','col-span-3'] },
    { id: '5-2', name: 'Hero Top', gridClass: 'grid-cols-4 grid-rows-3', items: ['col-span-4 row-span-2', '', '', '', ''] },
    { id: '5-3', name: 'Hero Left', gridClass: 'grid-cols-3 grid-rows-4', items: ['col-span-2 row-span-4', '', '', '', ''] }
  ],
  6: [
    { id: '6-1', name: 'Grid 3x2', gridClass: 'grid-cols-3 grid-rows-2', items: ['','','','','',''] },
    { id: '6-2', name: 'Hero Top', gridClass: 'grid-cols-5 grid-rows-3', items: ['col-span-5 row-span-2', '', '', '', '', ''] }
  ],
  7: [
    { id: '7-1', name: 'Hero Top', gridClass: 'grid-cols-6 grid-rows-3', items: ['col-span-6 row-span-2', '', '', '', '', '', ''] }
  ],
  8: [
    { id: '8-1', name: 'Grid 4x2', gridClass: 'grid-cols-4 grid-rows-2', items: ['','','','','','','',''] },
    { id: '8-2', name: 'Hero Top', gridClass: 'grid-cols-7 grid-rows-3', items: ['col-span-7 row-span-2', '', '', '', '', '', '', ''] }
  ],
  9: [
    { id: '9-1', name: 'Grid 3x3', gridClass: 'grid-cols-3 grid-rows-3', items: ['','','','','','','','',''] }
  ]
};

export default function PhotoCollageMaker() {
  const [isMounted, setIsMounted] = useState(false);

  const [images, setImages] = useState([]);
  
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [activeLayoutId, setActiveLayoutId] = useState(null);
  const [globalFilter, setGlobalFilter] = useState(FILTERS[0].value);
  
  const [gap, setGap] = useState(10);
  const [padding, setPadding] = useState(10);
  const [borderRadius, setBorderRadius] = useState(10);
  const [bgColor, setBgColor] = useState("#ffffff");

  const [activeImgId, setActiveImgId] = useState(null);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const collageRef = useRef(null);
  const activeUrls = useRef([]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      activeUrls.current.forEach(u => URL.revokeObjectURL(u));
    };
  }, []);

  useEffect(() => {
    const count = images.length;
    if (count > 0 && LAYOUT_TEMPLATES[count]) {
      const currentTemplates = LAYOUT_TEMPLATES[count];
      const templateExists = currentTemplates.find(t => t.id === activeLayoutId);
      if (!templateExists) {
        setActiveLayoutId(currentTemplates[0].id);
      }
    } else {
      setActiveLayoutId(null);
    }
  }, [images.length, activeLayoutId]);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > 9) {
      setError("Maximum 9 images allowed per collage.");
      return;
    }

    const newImages = files.map((file, idx) => {
      const url = URL.createObjectURL(file);
      activeUrls.current.push(url);
      return { id: `${Date.now()}-${idx}`, file, url, zoom: 1, panX: 50, panY: 50 };
    });

    setImages(prev => [...prev, ...newImages]);
    if (e.target) e.target.value = "";
    setError(null);
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (activeImgId === id) setActiveImgId(null);
  };

  const clearAll = () => {
    activeUrls.current.forEach(u => URL.revokeObjectURL(u));
    activeUrls.current = [];
    setImages([]);
    setActiveImgId(null);
    setError(null);
  };

  const shuffleImages = () => {
    setImages(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  };

  const updateImage = (id, updates) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  };

  const onDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.target.style.opacity = "0.5";
  };

  const onDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedIdx(null);
  };

  const onDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const newImages = [...images];
    const draggedImg = newImages[draggedIdx];
    newImages.splice(draggedIdx, 1);
    newImages.splice(targetIdx, 0, draggedImg);
    setImages(newImages);
  };

  const handlePointerDown = (e, imgId) => {
    setActiveImgId(imgId);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e, imgId) => {
    if (e.buttons !== 1 || activeImgId !== imgId) return;
    const target = e.target;
    const rect = target.getBoundingClientRect();
    const moveX = (e.movementX / rect.width) * 100;
    const moveY = (e.movementY / rect.height) * 100;
    
    const img = images.find(i => i.id === imgId);
    if (!img) return;

    const newPanX = Math.max(0, Math.min(100, img.panX - (moveX / img.zoom)));
    const newPanY = Math.max(0, Math.min(100, img.panY - (moveY / img.zoom)));
    updateImage(imgId, { panX: newPanX, panY: newPanY });
  };

  const handleExport = async () => {
    if (!images.length || !collageRef.current) return;
    setIsExporting(true);
    setError(null);

    try {
      const container = collageRef.current;
      const containerRect = container.getBoundingClientRect();
      const scale = aspectRatio.width / containerRect.width;
      
      const canvas = document.createElement("canvas");
      canvas.width = aspectRatio.width;
      canvas.height = containerRect.height * scale;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < images.length; i++) {
        const imgState = images[i];
        const cellNode = document.getElementById(`collage-cell-${imgState.id}`);
        if (!cellNode) continue;

        const cellRect = cellNode.getBoundingClientRect();
        const cX = (cellRect.left - containerRect.left) * scale;
        const cY = (cellRect.top - containerRect.top) * scale;
        const cW = cellRect.width * scale;
        const cH = cellRect.height * scale;
        const cRadius = borderRadius * scale;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cX + cRadius, cY);
        ctx.lineTo(cX + cW - cRadius, cY);
        ctx.quadraticCurveTo(cX + cW, cY, cX + cW, cY + cRadius);
        ctx.lineTo(cX + cW, cY + cH - cRadius);
        ctx.quadraticCurveTo(cX + cW, cY + cH, cX + cW - cRadius, cY + cH);
        ctx.lineTo(cX + cRadius, cY + cH);
        ctx.quadraticCurveTo(cX, cY + cH, cX, cY + cH - cRadius);
        ctx.lineTo(cX, cY + cRadius);
        ctx.quadraticCurveTo(cX, cY, cX + cRadius, cY);
        ctx.closePath();
        ctx.clip();

        ctx.filter = globalFilter;

        const htmlImg = new Image();
        await new Promise((resolve, reject) => {
          htmlImg.onload = resolve;
          htmlImg.onerror = reject;
          htmlImg.src = imgState.url;
        });

        const imgAspect = htmlImg.width / htmlImg.height;
        const cellAspect = cW / cH;
        let drawW, drawH;
        
        if (imgAspect > cellAspect) {
          drawH = cH * imgState.zoom;
          drawW = drawH * imgAspect;
        } else {
          drawW = cW * imgState.zoom;
          drawH = drawW / imgAspect;
        }

        const maxOffsetX = drawW - cW;
        const maxOffsetY = drawH - cH;
        const offsetX = (imgState.panX / 100) * maxOffsetX;
        const offsetY = (imgState.panY / 100) * maxOffsetY;

        ctx.drawImage(htmlImg, cX - offsetX, cY - offsetY, drawW, drawH);
        ctx.restore();
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
      const link = document.createElement("a");
      link.download = `pro_collage_${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
      
    } catch (err) {
      console.error(err);
      setError("Export blocked by browser security. Ensure files are valid.");
    } finally {
      setIsExporting(false);
    }
  };

  const currentLayout = activeLayoutId && LAYOUT_TEMPLATES[images.length] 
    ? LAYOUT_TEMPLATES[images.length].find(l => l.id === activeLayoutId) 
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-fuchsia-100 dark:bg-fuchsia-900/50 p-2 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
              Ultimate Pro Collage
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Smart Templates & Instant Previews
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {images.length > 0 && (
            <>
              <button onClick={shuffleImages} className="text-xs font-bold text-slate-400 hover:text-fuchsia-500 flex items-center gap-1 transition-colors px-3 border-r border-slate-200 dark:border-slate-800">
                <Shuffle className="w-3.5 h-3.5" /> Shuffle
              </button>
              <button onClick={clearAll} className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors px-3 border-r border-slate-200 dark:border-slate-800">
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </>
          )}
          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 ml-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 4K Ready
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
        
        <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="flex items-center gap-1.5"><UploadCloud className="w-4 h-4 text-fuchsia-500" /> Source Images</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${images.length === 9 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{images.length} / 9 Added</span>
            </h3>
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-fuchsia-400 transition-colors"
            >
              <UploadCloud className="w-6 h-6 text-fuchsia-500" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Add More Images</span>
              <input type="file" multiple accept="image/*" onChange={handleUpload} ref={fileInputRef} className="hidden" />
            </div>

            {images.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-2 pb-1">
                {images.map((img) => (
                  <div key={img.id} onClick={() => setActiveImgId(img.id)} className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${activeImgId === img.id ? "border-fuchsia-600 shadow-md scale-105" : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <img src={img.url} alt="thumb" className="w-full h-full object-cover" />
                    <button onClick={(e) => { e.stopPropagation(); removeImage(img.id); }} className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl hover:scale-110"><Trash2 className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
             <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <LayoutTemplate className="w-4 h-4 text-fuchsia-500" /> Smart Layouts
            </h3>
            
            {images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {LAYOUT_TEMPLATES[images.length]?.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setActiveLayoutId(tpl.id)}
                    className={`py-2 px-3 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1.5 border transition-all ${
                      activeLayoutId === tpl.id
                        ? "bg-fuchsia-600 text-white border-fuchsia-600 shadow-md"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-fuchsia-300"
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    {tpl.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-center">
                Upload images to unlock grid templates.
              </p>
            )}

            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-widest">Canvas Ratio</span>
              <div className="grid grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar)}
                    className={`py-2 rounded-lg text-[10px] font-extrabold flex flex-col items-center justify-center gap-1.5 border transition-all ${
                      aspectRatio.id === ar.id
                        ? "bg-fuchsia-600 text-white border-fuchsia-600 shadow-md"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-fuchsia-300"
                    }`}
                  >
                    <ar.icon className="w-4 h-4" />
                    {ar.id}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
             <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Wand2 className="w-4 h-4 text-fuchsia-500" /> Pro Styling
            </h3>

            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
              {FILTERS.map(f => (
                <button 
                  key={f.id}
                  onClick={() => setGlobalFilter(f.value)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-extrabold transition-all border ${globalFilter === f.value ? 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:border-fuchsia-700 dark:text-fuchsia-300' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700'}`}
                >
                  {f.name}
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span>Grid Gap</span><span>{gap}px</span></div>
                <input type="range" min="0" max="60" value={gap} onChange={(e) => setGap(parseInt(e.target.value))} className="w-full accent-fuchsia-600" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span>Corner Roundness</span><span>{borderRadius}px</span></div>
                <input type="range" min="0" max="100" value={borderRadius} onChange={(e) => setBorderRadius(parseInt(e.target.value))} className="w-full accent-fuchsia-600" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span>Outer Margin</span><span>{padding}px</span></div>
                <input type="range" min="0" max="80" value={padding} onChange={(e) => setPadding(parseInt(e.target.value))} className="w-full accent-fuchsia-600" />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Backdrop Color</span>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent" />
              </div>
            </div>
          </div>

          {activeImgId && (
            <div className="bg-white dark:bg-slate-900 border border-fuchsia-200 dark:border-fuchsia-900/50 p-5 rounded-xl shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-between border-b border-fuchsia-100 dark:border-fuchsia-900/30 pb-3">
                <span className="flex items-center gap-1.5"><ZoomIn className="w-4 h-4" /> Fine Tuning</span>
                <span className="text-[9px] bg-fuchsia-100 dark:bg-fuchsia-900 px-2 py-0.5 rounded text-fuchsia-700 dark:text-fuchsia-300">Drag image to Pan</span>
              </h3>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Zoom / Scale</span>
                  <span>{images.find(i => i.id === activeImgId)?.zoom}x</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="3" step="0.1" 
                  value={images.find(i => i.id === activeImgId)?.zoom || 1} 
                  onChange={(e) => updateImage(activeImgId, { zoom: parseFloat(e.target.value) })} 
                  className="w-full accent-fuchsia-600" 
                />
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT WORKSPACE ================= */}
        <div className="space-y-6 min-w-0 flex flex-col sticky top-6">
          
          <div className="bg-slate-100 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-inner flex flex-col items-center justify-center min-h-[500px] overflow-hidden">
            
            {!images.length ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="text-center space-y-3 opacity-60 hover:opacity-100 cursor-pointer transition-opacity p-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl"
              >
                <UploadCloud className="w-16 h-16 mx-auto text-fuchsia-500" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Click to Start Creating</p>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center transition-all duration-300">
                <div 
                  ref={collageRef}
                  className={`w-full relative shadow-2xl transition-all duration-300 grid ${currentLayout?.gridClass || ''}`}
                  style={{ 
                    aspectRatio: aspectRatio.id,
                    maxHeight: '70vh',
                    backgroundColor: bgColor, 
                    padding: `${padding}px`, 
                    gap: `${gap}px` 
                  }}
                >
                  {images.map((img, idx) => {
                    const itemClass = currentLayout?.items[idx] || '';
                    return (
                      <div
                        key={img.id}
                        id={`collage-cell-${img.id}`}
                        draggable
                        onDragStart={(e) => onDragStart(e, idx)}
                        onDragEnd={onDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => onDrop(e, idx)}
                        onClick={() => setActiveImgId(img.id)}
                        className={`relative overflow-hidden group transition-all duration-300 outline outline-0 outline-fuchsia-500 hover:outline-2 ${itemClass}`}
                        style={{ 
                          borderRadius: `${borderRadius}px`,
                          boxShadow: activeImgId === img.id ? 'inset 0 0 0 3px #d946ef' : 'none'
                        }}
                      >
                        <div className="absolute top-2 right-2 z-10 bg-black/50 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <Move className="w-3.5 h-3.5" />
                        </div>

                        <div 
                          className={`w-full h-full ${activeImgId === img.id ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                          onPointerDown={(e) => handlePointerDown(e, img.id)}
                          onPointerMove={(e) => handlePointerMove(e, img.id)}
                        >
                          <img 
                            src={img.url} 
                            alt="collage-part"
                            className="w-full h-full object-cover pointer-events-none transition-[filter]"
                            style={{
                              transform: `scale(${img.zoom})`,
                              objectPosition: `${img.panX}% ${img.panY}%`,
                              filter: globalFilter
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            disabled={!images.length || isExporting}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-lg font-black transition-all shadow-xl ${
              !images.length || isExporting
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:scale-[1.01] active:scale-[0.98] shadow-fuchsia-500/25 border border-fuchsia-500/50"
            }`}
          >
            {isExporting ? <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <><Download className="w-5 h-5" /> Export High-Res Collage</>}
          </button>
        </div>
      </div>
    </div>
  );
}