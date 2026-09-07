"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Wand2, Layout, Type, Smile, Image as ImageIcon, Download, 
  Copy, CheckCircle2, Monitor, Smartphone, Settings, Palette,
  UploadCloud
} from "lucide-react";

const FONTS = [
  { id: "Impact, sans-serif", name: "Impact" },
  { id: "Arial, sans-serif", name: "Arial Clean" },
  { id: "'Montserrat', sans-serif", name: "Montserrat" },
  { id: "'Courier New', monospace", name: "Courier Tech" },
  { id: "'Georgia', serif", name: "Georgia Serif" }
];

const SHAPES = [
  { id: "square", name: "Square" },
  { id: "rounded", name: "Rounded" },
  { id: "circle", name: "Circle" },
  { id: "transparent", name: "Transparent" }
];

export default function FaviconGenerator() {
  const [isMounted, setIsMounted] = useState(false);

  // Active Mode: 'text', 'emoji', 'image'
  const [mode, setMode] = useState("text");

  // State configurations
  const [textMode, setTextMode] = useState({ text: "M", font: FONTS[0].id, color: "#ffffff", size: 60 });
  const [emojiMode, setEmojiMode] = useState({ emoji: "🚀", size: 60 });
  
  const [imgUrl, setImgUrl] = useState(null);
  const [imgObj, setImgObj] = useState(null);
  const [imgScale, setImgScale] = useState(80);

  // Global Settings
  const [bgShape, setBgShape] = useState("rounded");
  const [bgColor, setBgColor] = useState("#4f46e5");

  // Output
  const [previewUrl, setPreviewUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (imgUrl) URL.revokeObjectURL(imgUrl);
    };
  }, [imgUrl]);

  // Load Image Object
  useEffect(() => {
    if (!imgUrl) {
      setImgObj(null);
      return;
    }
    const img = new Image();
    img.onload = () => setImgObj(img);
    img.src = imgUrl;
  }, [imgUrl]);

  // Core Rendering Engine
  const renderFavicon = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const size = 512; // High-res master canvas
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Draw Background Shape
    if (bgShape !== "transparent") {
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      if (bgShape === "circle") {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      } else if (bgShape === "rounded") {
        const r = size * 0.22; // iOS style ~22% radius
        ctx.moveTo(r, 0);
        ctx.lineTo(size - r, 0);
        ctx.quadraticCurveTo(size, 0, size, r);
        ctx.lineTo(size, size - r);
        ctx.quadraticCurveTo(size, size, size - r, size);
        ctx.lineTo(r, size);
        ctx.quadraticCurveTo(0, size, 0, size - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
      } else {
        ctx.rect(0, 0, size, size);
      }
      ctx.closePath();
      ctx.fill();
      ctx.clip(); // Clip contents to shape
    }

    // Draw Contents
    if (mode === "text") {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = textMode.color;
      const fontSize = (size * textMode.size) / 100;
      ctx.font = `bold ${fontSize}px ${textMode.font}`;
      // Slight vertical offset correction for fonts
      ctx.fillText(textMode.text.substring(0, 2), size / 2, size / 2 + (fontSize * 0.05));
    } 
    else if (mode === "emoji") {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const fontSize = (size * emojiMode.size) / 100;
      ctx.font = `${fontSize}px Arial`;
      ctx.fillText(emojiMode.emoji.substring(0, 2), size / 2, size / 2 + (fontSize * 0.05));
    } 
    else if (mode === "image" && imgObj) {
      const drawSize = (size * imgScale) / 100;
      const offset = (size - drawSize) / 2;
      ctx.drawImage(imgObj, offset, offset, drawSize, drawSize);
    }

    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [mode, textMode, emojiMode, imgObj, imgScale, bgShape, bgColor]);

  // Trigger render when any setting changes
  useEffect(() => {
    renderFavicon();
  }, [renderFavicon]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setImgUrl(URL.createObjectURL(file));
    setMode("image");
  };

  // Pure JS .ico file encoder
  const downloadIco = async () => {
    if (!canvasRef.current) return;
    
    // Create 32x32 version for ICO
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 32;
    tempCanvas.height = 32;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(canvasRef.current, 0, 0, 32, 32);
    
    tempCanvas.toBlob(async (blob) => {
      const arrayBuffer = await blob.arrayBuffer();
      const pngBytes = new Uint8Array(arrayBuffer);
      
      // 22-byte ICO Header wrapping the PNG
      const icoHeader = new Uint8Array([
        0, 0,           // Reserved
        1, 0,           // ICO type (1 = Icon)
        1, 0,           // Number of images
        32, 32,         // Width, Height
        0, 0,           // Color count, Reserved
        1, 0,           // Color planes
        32, 0,          // Bits per pixel
        (pngBytes.length & 0xff), ((pngBytes.length >> 8) & 0xff), 
        ((pngBytes.length >> 16) & 0xff), ((pngBytes.length >> 24) & 0xff), // Size of image data
        22, 0, 0, 0     // Offset to image data (22 bytes header)
      ]);

      const icoBlob = new Blob([icoHeader, pngBytes], { type: "image/x-icon" });
      triggerDownload(icoBlob, "favicon.ico");
    }, "image/png");
  };

  const downloadPng = () => {
    if (!previewUrl) return;
    fetch(previewUrl)
      .then(res => res.blob())
      .then(blob => triggerDownload(blob, "apple-touch-icon.png"));
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyHtml = () => {
    const htmlCode = `<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`;
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
            <Wand2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
              Premium Favicon Studio
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Text, Emoji & Image to Multi-Platform ICO
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6 items-start">
        
        {/* ================= LEFT CONTROLS ================= */}
        <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
          
          {/* Mode Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Layout className="w-4 h-4 text-blue-500" /> Generator Mode
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "text", label: "Text", icon: Type },
                { id: "emoji", label: "Emoji", icon: Smile },
                { id: "image", label: "Image", icon: ImageIcon }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`py-2.5 rounded-lg text-[10px] font-extrabold flex flex-col items-center justify-center gap-1.5 border transition-all ${
                    mode === m.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300"
                  }`}
                >
                  <m.icon className="w-4 h-4" /> {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Specific Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Settings className="w-4 h-4 text-blue-500" /> Configuration
            </h3>

            {mode === "text" && (
              <div className="space-y-4">
                <input
                  type="text"
                  maxLength={2}
                  value={textMode.text}
                  onChange={(e) => setTextMode(p => ({ ...p, text: e.target.value.toUpperCase() }))}
                  placeholder="e.g. M"
                  className="w-full text-center text-2xl font-bold p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
                <select
                  value={textMode.font}
                  onChange={(e) => setTextMode(p => ({ ...p, font: e.target.value }))}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                >
                  {FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Text Color</span>
                  <input type="color" value={textMode.color} onChange={(e) => setTextMode(p => ({ ...p, color: e.target.value }))} className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>Font Size</span><span>{textMode.size}%</span></div>
                  <input type="range" min="20" max="120" value={textMode.size} onChange={(e) => setTextMode(p => ({ ...p, size: parseInt(e.target.value) }))} className="w-full accent-blue-600" />
                </div>
              </div>
            )}

            {mode === "emoji" && (
              <div className="space-y-4">
                <input
                  type="text"
                  maxLength={2}
                  value={emojiMode.emoji}
                  onChange={(e) => setEmojiMode(p => ({ ...p, emoji: e.target.value }))}
                  placeholder="🚀"
                  className="w-full text-center text-4xl p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500"
                />
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>Emoji Size</span><span>{emojiMode.size}%</span></div>
                  <input type="range" min="20" max="120" value={emojiMode.size} onChange={(e) => setEmojiMode(p => ({ ...p, size: parseInt(e.target.value) }))} className="w-full accent-blue-600" />
                </div>
              </div>
            )}

            {mode === "image" && (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <UploadCloud className="w-6 h-6 text-blue-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {imgUrl ? "Change Image" : "Upload Logo/Icon"}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                </div>
                {imgUrl && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>Image Scale</span><span>{imgScale}%</span></div>
                    <input type="range" min="10" max="150" value={imgScale} onChange={(e) => setImgScale(parseInt(e.target.value))} className="w-full accent-blue-600" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Background Styling */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Palette className="w-4 h-4 text-blue-500" /> Container Styling
            </h3>
            
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">Background Shape</span>
              <div className="grid grid-cols-2 gap-2">
                {SHAPES.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => setBgShape(shape.id)}
                    className={`py-2 rounded-lg text-[10px] font-extrabold flex items-center justify-center border transition-all ${
                      bgShape === shape.id
                        ? "bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {shape.name}
                  </button>
                ))}
              </div>
            </div>

            {bgShape !== "transparent" && (
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Container Color</span>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent" />
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT PREVIEW & EXPORT ================= */}
        <div className="space-y-6 min-w-0 flex flex-col sticky top-6">
          
          {/* Live Context Mockups */}
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner space-y-6">
            
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">
              Live Mockups
            </h3>

            {/* Browser Mockup */}
            <div className="w-full max-w-sm mx-auto bg-slate-200 dark:bg-[#161b22] rounded-t-xl overflow-hidden shadow-lg border border-slate-300 dark:border-slate-700">
              <div className="flex items-center gap-2 px-3 pt-2 pb-1 bg-slate-300 dark:bg-[#010409]">
                <div className="flex gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 dark:bg-[#161b22] rounded-t-lg min-w-[140px] border-b-2 border-blue-500">
                  {previewUrl && <img src={previewUrl} alt="tab-icon" className="w-4 h-4 object-contain rounded-sm" />}
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">My App</span>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-[#0d1117] min-h-[80px] flex items-center justify-center border-t border-slate-200 dark:border-slate-700">
                <Monitor className="w-6 h-6 text-slate-300 dark:text-slate-700" />
              </div>
            </div>

            {/* App Icon Mockup */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZTVlNWY3Ij48L3JlY3Q+CjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNlNWU1ZjciPjwvcmVjdD4KPC9zdmc+')]">
                {previewUrl && <img src={previewUrl} alt="app-icon" className="w-full h-full object-contain drop-shadow-md" />}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                <Smartphone className="w-3.5 h-3.5" /> iOS Touch Icon
              </div>
            </div>
            
            {/* Hidden Master Canvas */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Export Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Download className="w-4 h-4 text-emerald-500" /> Download & Integration
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={downloadIco}
                className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
              >
                <span>favicon.ico</span>
                <span className="text-[9px] font-medium opacity-80 font-mono">32x32</span>
              </button>
              
              <button
                onClick={downloadPng}
                className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors shadow-md"
              >
                <span>apple-touch-icon.png</span>
                <span className="text-[9px] font-medium opacity-80 font-mono">512x512 Hi-Res</span>
              </button>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Add to HTML &lt;head&gt;</span>
                <button onClick={copyHtml} className="text-[10px] font-bold text-blue-500 flex items-center gap-1 hover:text-blue-600">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className="text-[10px] font-mono p-3 bg-slate-50 dark:bg-[#0d1117] text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
{`<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}