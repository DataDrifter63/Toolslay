"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ImageIcon, Download, Type, Wand2, UploadCloud, Trash2, Plus, GripHorizontal, CheckCircle2, PaintBucket, LayoutTemplate } from "lucide-react";

const FONTS = [
  { id: "Impact, sans-serif", name: "Classic Impact" },
  { id: "'Bebas Neue', sans-serif", name: "Modern Bold" },
  { id: "'Comic Sans MS', cursive", name: "Sarcastic" },
  { id: "Montserrat, sans-serif", name: "Clean Montserrat" }
];

const FILTERS = [
  { id: "none", name: "Original", css: "none", canvas: "none" },
  { id: "deepfry", name: "Deep Fry", css: "contrast(200%) saturate(300%) brightness(120%)", canvas: "contrast(200%) saturate(300%) brightness(120%)" },
  { id: "grayscale", name: "Noir", css: "grayscale(100%)", canvas: "grayscale(100%)" },
  { id: "sepia", name: "Vintage", css: "sepia(80%)", canvas: "sepia(80%)" }
];

// Expanded Viral Template Library
const MEME_TEMPLATES = [
  { id: "drake", name: "Drake Hotline", url: "https://i.imgflip.com/30b1gx.jpg" },
  { id: "distracted", name: "Distracted BF", url: "https://i.imgflip.com/1ur9b0.jpg" },
  { id: "two-buttons", name: "Two Buttons", url: "https://i.imgflip.com/1g8my4.jpg" },
  { id: "change-mind", name: "Change My Mind", url: "https://i.imgflip.com/24y43o.jpg" },
  { id: "disaster-girl", name: "Disaster Girl", url: "https://i.imgflip.com/23ls.jpg" },
  { id: "cat-women", name: "Woman Yelling", url: "https://i.imgflip.com/345v97.jpg" },
  { id: "batman-slap", name: "Batman Slap", url: "https://i.imgflip.com/9ehk.jpg" },
  { id: "mocking", name: "Mocking Spongebob", url: "https://i.imgflip.com/1otk96.jpg" },
  { id: "roll-safe", name: "Roll Safe", url: "https://i.imgflip.com/1h7in3.jpg" },
  { id: "monkey-puppet", name: "Monkey Puppet", url: "https://i.imgflip.com/2gnnjh.jpg" },
  { id: "is-this-pigeon", name: "Is This Pigeon", url: "https://i.imgflip.com/28j0te.jpg" },
  { id: "sad-pablo", name: "Sad Pablo", url: "https://i.imgflip.com/1c1uej.jpg" }
];

export default function MemeGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  
  const [image, setImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const [texts, setTexts] = useState([
    { id: 1, text: "TOP TEXT", x: 50, y: 15, isDragging: false },
    { id: 2, text: "BOTTOM TEXT", x: 50, y: 85, isDragging: false }
  ]);
  const [draggedId, setDraggedId] = useState(null);
  const previewRef = useRef(null);

  const [activeFont, setActiveFont] = useState(FONTS[0]);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(10); 
  const [strokeWidth, setStrokeWidth] = useState(15); 
  
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    loadTemplate(MEME_TEMPLATES[1]);
  }, []);

  const loadTemplate = (template) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; 
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImage(template.url);
    };
    img.src = template.url;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        setImage(event.target.result);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Completely resets all states to default
  const handleClearAll = () => {
    setImage(null);
    setTexts([]);
    setActiveFilter(FILTERS[0]);
    setActiveFont(FONTS[0]);
    setFontSize(10);
    setStrokeWidth(15);
    setTextColor("#FFFFFF");
    setStrokeColor("#000000");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePointerDown = (e, id) => {
    e.preventDefault();
    setDraggedId(id);
    setTexts(texts.map(t => t.id === id ? { ...t, isDragging: true } : t));
  };

  const handlePointerMove = useCallback((e) => {
    if (draggedId === null || !previewRef.current) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = previewRef.current.getBoundingClientRect();
    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;

    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    setTexts(prev => prev.map(t => t.id === draggedId ? { ...t, x, y } : t));
  }, [draggedId]);

  const handlePointerUp = useCallback(() => {
    if (draggedId !== null) {
      setTexts(prev => prev.map(t => {
        if (t.id === draggedId) return { ...t, isDragging: false };
        return t;
      }));
      setDraggedId(null);
    }
  }, [draggedId]);

  useEffect(() => {
    if (draggedId !== null) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [draggedId, handlePointerMove, handlePointerUp]);

  const addTextLayer = () => {
    const newId = texts.length > 0 ? Math.max(...texts.map(t => t.id)) + 1 : 1;
    setTexts([...texts, { id: newId, text: "NEW TEXT", x: 50, y: 50, isDragging: false }]);
  };

  const removeTextLayer = (id) => {
    setTexts(texts.filter(t => t.id !== id));
  };

  const updateTextContent = (id, newText) => {
    setTexts(texts.map(t => t.id === id ? { ...t, text: newText } : t));
  };

  const exportMeme = () => {
    if (!image) return;
    setIsExporting(true);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      canvas.width = imageDimensions.width;
      canvas.height = imageDimensions.height;

      ctx.filter = activeFilter.canvas;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";

      const baseSize = (canvas.height * fontSize) / 100;
      ctx.font = `900 ${baseSize}px ${activeFont.id}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle"; 
      ctx.fillStyle = textColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = (baseSize * strokeWidth) / 100;
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;

      texts.forEach(t => {
        if (!t.text) return;
        const xPx = (t.x / 100) * canvas.width;
        const yPx = (t.y / 100) * canvas.height;
        const lines = t.text.toUpperCase().split('\n');
        
        const totalHeight = lines.length * (baseSize * 1.1);
        const startY = yPx - (totalHeight / 2) + (baseSize / 2);

        lines.forEach((line, i) => {
          const lineY = startY + (i * baseSize * 1.1);
          ctx.strokeText(line, xPx, lineY);
          ctx.fillText(line, xPx, lineY);
        });
      });

      try {
        const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
        const link = document.createElement("a");
        link.download = `pro_meme_${Date.now()}.jpg`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        alert("Export blocked by browser CORS policy (usually happens with external template URLs on local dev). Upload an image manually to fix.");
      }
      setIsExporting(false);
    };
    img.src = image;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@900&display=swap" rel="stylesheet" />
      
      {/* SCOPED CSS FIX: Only targets this specific tool's preview container, fixing the global header bug */}
      <style>{`.meme-preview-container { container-type: inline-size; }`}</style>
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
            <LayoutTemplate className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 leading-tight">Pro Meme Studio 3.1</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Drag & Drop Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleClearAll} className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors pr-4 border-r border-slate-200 dark:border-slate-800">
             <Trash2 className="w-3.5 h-3.5" /> Clear All
           </button>
           <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
             <CheckCircle2 className="w-3.5 h-3.5"/> Free Export
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[450px,1fr] gap-6 items-start">
        
        <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
          
          {/* Templates */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm space-y-3">
             <div className="flex items-center justify-between">
               <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                 <Wand2 className="w-4 h-4 text-indigo-500" /> Quick Templates
               </label>
               <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1 transition-colors">
                 <UploadCloud className="w-3 h-3"/> Upload Custom
               </button>
               <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
             </div>
             <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
               {MEME_TEMPLATES.map(temp => (
                 <button 
                   key={temp.id} 
                   onClick={() => loadTemplate(temp)}
                   className="shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-colors shadow-sm"
                   title={temp.name}
                 >
                   <img src={temp.url} alt={temp.name} className="w-full h-full object-cover" />
                 </button>
               ))}
             </div>
          </div>

          {/* New Clean UI for Text Layers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
             <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
               <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                 <Type className="w-4 h-4 text-rose-500" /> Text Layers
               </h3>
               <button onClick={addTextLayer} className="text-[10px] font-bold text-white bg-rose-500 hover:bg-rose-600 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm shadow-rose-500/20">
                 <Plus className="w-3 h-3"/> Add Text
               </button>
             </div>

             <div className="space-y-3">
               {texts.length === 0 && <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">No text layers. Click 'Add Text' to create one.</p>}
               {texts.map((t, index) => (
                 <div key={t.id} className="relative group bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 pt-7 transition-all focus-within:border-indigo-400 focus-within:shadow-sm">
                   <div className="absolute top-2 left-3 flex items-center gap-1.5">
                     <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-[9px] font-black flex items-center justify-center">{index + 1}</span>
                     <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Layer</span>
                   </div>
                   <button onClick={() => removeTextLayer(t.id)} className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                     <Trash2 className="w-3.5 h-3.5" />
                   </button>
                   <textarea 
                     value={t.text} 
                     onChange={(e) => updateTextContent(t.id, e.target.value)}
                     placeholder={`Enter text...`}
                     className="w-full text-sm font-bold bg-transparent outline-none text-slate-800 dark:text-slate-100 uppercase resize-none placeholder:text-slate-400 placeholder:font-medium leading-relaxed" 
                     rows="2" 
                   />
                 </div>
               ))}
             </div>
          </div>

          {/* Global Styles */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
             <div className="space-y-5">
               <div>
                 <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase tracking-widest">Global Font Family</label>
                 <div className="grid grid-cols-2 gap-2">
                   {FONTS.map(font => (
                     <button key={font.id} onClick={() => setActiveFont(font)} className={`p-2.5 text-[10px] font-bold rounded-lg border transition-all ${activeFont.id === font.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`}>
                       {font.name}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span>Global Size</span> <span>{fontSize}%</span></div>
                    <input type="range" min="2" max="25" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-indigo-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span>Outline</span> <span>{strokeWidth}%</span></div>
                    <input type="range" min="0" max="40" value={strokeWidth} onChange={(e) => setStrokeWidth(parseInt(e.target.value))} className="w-full accent-indigo-600" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest"><PaintBucket className="w-3 h-3"/> Fill Color</label>
                   <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                     <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border-none p-0" />
                     <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{textColor}</span>
                   </div>
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest"><PaintBucket className="w-3 h-3"/> Outline Color</label>
                   <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                     <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border-none p-0" />
                     <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{strokeColor}</span>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: INTERACTIVE PREVIEW ================= */}
        <div className="space-y-6 min-w-0 flex flex-col sticky top-6">
           
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 sm:p-4 rounded-2xl shadow-sm flex flex-col items-center min-h-[400px]">
              {!image ? (
                <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-square md:aspect-[4/3] bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-300 cursor-pointer group">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform"><UploadCloud className="w-8 h-8 text-indigo-500" /></div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Click to Upload Meme Base</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Or select a template from the left</p>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="w-full flex justify-between items-center px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex items-center gap-1.5">
                      <GripHorizontal className="w-3.5 h-3.5" /> Drag text to position
                    </span>
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto custom-scrollbar">
                      {FILTERS.map(f => (
                        <button key={f.id} onClick={() => setActiveFilter(f)} className={`text-[9px] font-bold px-2.5 py-1 rounded whitespace-nowrap transition-colors ${activeFilter.id === f.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-700'}`}>
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PREVIEW CONTAINER: Fixed Black Borders & Global Header Glitch */}
                  <div 
                    ref={previewRef}
                    className="meme-preview-container relative w-full rounded-lg shadow-xl flex items-center justify-center select-none touch-none bg-transparent overflow-hidden" 
                  >
                    <img src={image} alt="Base" className="w-full h-auto block pointer-events-none rounded-lg" style={{ filter: activeFilter.css }} />
                    
                    {texts.map(t => (
                      <div 
                        key={t.id}
                        onPointerDown={(e) => handlePointerDown(e, t.id)}
                        className={`absolute flex items-center justify-center cursor-move text-center uppercase font-black whitespace-pre-wrap leading-[1.1] break-words p-1 border-2 transition-colors duration-100 ${t.isDragging ? 'border-rose-500 border-dashed bg-white/5' : 'border-transparent hover:border-white/50 hover:border-dashed'}`}
                        style={{
                          left: `${t.x}%`,
                          top: `${t.y}%`,
                          transform: 'translate(-50%, -50%)',
                          fontFamily: activeFont.id,
                          fontSize: `${fontSize}cqw`, 
                          color: textColor,
                          WebkitTextStroke: `${(fontSize * strokeWidth) / 80}px ${strokeColor}`,
                          textShadow: `2px 2px 0 ${strokeColor}, -1px -1px 0 ${strokeColor}, 1px -1px 0 ${strokeColor}, -1px 1px 0 ${strokeColor}`,
                          touchAction: 'none', 
                          zIndex: t.isDragging ? 50 : 10,
                          minWidth: 'max-content'
                        }}
                      >
                        {t.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
           </div>

           <button onClick={exportMeme} disabled={!image || isExporting} className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-lg font-black transition-all shadow-xl ${!image ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-[1.01] active:scale-[0.98] shadow-indigo-500/25 border border-indigo-500/50'}`}>
             {isExporting ? <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Download className="w-5 h-5" /> Export Final Meme</>}
           </button>
        </div>
      </div>
    </div>
  );
}