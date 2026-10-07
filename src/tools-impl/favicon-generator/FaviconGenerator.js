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
    
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 32;
    tempCanvas.height = 32;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(canvasRef.current, 0, 0, 32, 32);
    
    tempCanvas.toBlob(async (blob) => {
      const arrayBuffer = await blob.arrayBuffer();
      const pngBytes = new Uint8Array(arrayBuffer);
      
      const icoHeader = new Uint8Array([
        0, 0,          // Reserved
        1, 0,          // ICO type (1 = Icon)
        1, 0,          // Number of images
        32, 32,        // Width, Height
        0, 0,          // Color count, Reserved
        1, 0,          // Color planes
        32, 0,         // Bits per pixel
        (pngBytes.length & 0xff), ((pngBytes.length >> 8) & 0xff), 
        ((pngBytes.length >> 16) & 0xff), ((pngBytes.length >> 24) & 0xff), // Size of image data
        22, 0, 0, 0    // Offset to image data (22 bytes header)
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

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Premium Favicon Studio
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 truncate">
              Text, Emoji & Image to Multi-Platform ICO
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6 items-start">
        
        {/* ================= LEFT CONTROLS ================= */}
        <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-1 custom-scrollbar pb-10 min-w-0">
          
          {/* Mode Selector */}
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-2.5">
              <Layout className="w-3.5 h-3.5 text-brand" /> Generator Mode
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "text", label: "Text", icon: Type },
                { id: "emoji", label: "Emoji", icon: Smile },
                { id: "image", label: "Image", icon: ImageIcon }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    mode === m.id
                      ? "bg-brand text-surface border-brand shadow-sm"
                      : "bg-surface text-muted border-line hover:border-brand"
                  }`}
                >
                  <m.icon className="w-4 h-4 shrink-0" /> {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Specific Settings */}
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-2.5">
              <Settings className="w-3.5 h-3.5 text-brand" /> Configuration
            </h3>

            {mode === "text" && (
              <div className="space-y-4">
                <input
                  type="text"
                  maxLength={2}
                  value={textMode.text}
                  onChange={(e) => setTextMode(p => ({ ...p, text: e.target.value.toUpperCase() }))}
                  placeholder="e.g. M"
                  className="w-full text-center text-2xl font-bold p-3 bg-surface border border-line rounded-xl outline-none focus:border-brand text-ink shadow-inner"
                />
                <select
                  value={textMode.font}
                  onChange={(e) => setTextMode(p => ({ ...p, font: e.target.value }))}
                  className="w-full text-xs font-bold p-2.5 bg-surface border border-line rounded-xl outline-none focus:border-brand text-ink cursor-pointer"
                >
                  {FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <div className="flex items-center justify-between p-2.5 bg-surface rounded-xl border border-line">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted">Text Color</span>
                  <input type="color" value={textMode.color} onChange={(e) => setTextMode(p => ({ ...p, color: e.target.value }))} className="w-7 h-7 rounded-lg cursor-pointer border border-line p-0 bg-transparent shrink-0" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-muted">
                    <span>Font Size</span>
                    <span className="font-mono text-brand font-black">{textMode.size}%</span>
                  </div>
                  <input type="range" min="20" max="120" value={textMode.size} onChange={(e) => setTextMode(p => ({ ...p, size: parseInt(e.target.value) }))} className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-brand border border-line" />
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
                  className="w-full text-center text-4xl p-3 bg-surface border border-line rounded-xl outline-none focus:border-brand shadow-inner"
                />
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-muted">
                    <span>Emoji Size</span>
                    <span className="font-mono text-brand font-black">{emojiMode.size}%</span>
                  </div>
                  <input type="range" min="20" max="120" value={emojiMode.size} onChange={(e) => setEmojiMode(p => ({ ...p, size: parseInt(e.target.value) }))} className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-brand border border-line" />
                </div>
              </div>
            )}

            {mode === "image" && (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-surface border-2 border-dashed border-line rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand transition-colors"
                >
                  <UploadCloud className="w-6 h-6 text-brand shrink-0" />
                  <span className="text-xs font-bold text-ink truncate text-center">
                    {imgUrl ? "Change Image" : "Upload Logo/Icon"}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                </div>
                {imgUrl && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-muted">
                      <span>Image Scale</span>
                      <span className="font-mono text-brand font-black">{imgScale}%</span>
                    </div>
                    <input type="range" min="10" max="150" value={imgScale} onChange={(e) => setImgScale(parseInt(e.target.value))} className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-brand border border-line" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Background Styling */}
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-2.5">
              <Palette className="w-3.5 h-3.5 text-brand" /> Container Styling
            </h3>
            
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted block mb-2">Background Shape</span>
              <div className="grid grid-cols-2 gap-2">
                {SHAPES.map((shape) => (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => setBgShape(shape.id)}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center border transition-all cursor-pointer ${
                      bgShape === shape.id
                        ? "bg-brand text-surface border-brand shadow-sm"
                        : "bg-surface text-muted border-line hover:border-brand"
                    }`}
                  >
                    {shape.name}
                  </button>
                ))}
              </div>
            </div>

            {bgShape !== "transparent" && (
              <div className="flex items-center justify-between p-2.5 bg-surface rounded-xl border border-line">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">Container Color</span>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border border-line p-0 bg-transparent shrink-0" />
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT PREVIEW & EXPORT ================= */}
        <div className="space-y-6 min-w-0 flex flex-col lg:sticky lg:top-6">
          
          {/* Live Context Mockups */}
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
            
            <h3 className="text-[10px] font-black uppercase tracking-wider text-muted text-center">
              Live Mockups
            </h3>

            {/* Browser Mockup */}
            <div className="w-full max-w-sm mx-auto bg-surface rounded-t-xl overflow-hidden shadow-inner border border-line">
              <div className="flex items-center gap-2 px-3 pt-2 pb-1 bg-paper border-b border-line">
                <div className="flex gap-1.5 mb-1 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-t-lg min-w-[140px] border-b-2 border-brand truncate">
                  {previewUrl && <img src={previewUrl} alt="tab-icon" className="w-4 h-4 object-contain rounded-sm shrink-0" />}
                  <span className="text-xs font-semibold text-ink truncate">My App</span>
                </div>
              </div>
              <div className="p-4 bg-paper min-h-[80px] flex items-center justify-center">
                <Monitor className="w-6 h-6 text-muted opacity-40" />
              </div>
            </div>

            {/* App Icon Mockup */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-sm border border-line bg-surface bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZTVlNWY3Ij48L3JlY3Q+CjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNlNWU1ZjciPjwvcmVjdD4KPC9zdmc+')]">
                {previewUrl && <img src={previewUrl} alt="app-icon" className="w-full h-full object-contain drop-shadow-md" />}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted">
                <Smartphone className="w-3.5 h-3.5 shrink-0" /> iOS Touch Icon
              </div>
            </div>
            
            {/* Hidden Master Canvas */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Export Panel */}
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-2.5">
              <Download className="w-3.5 h-3.5 text-emerald-500" /> Download & Integration
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={downloadIco}
                className="flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-xl bg-brand text-surface font-black text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
              >
                <span>favicon.ico</span>
                <span className="text-[9px] font-mono opacity-80">32x32</span>
              </button>
              
              <button
                type="button"
                onClick={downloadPng}
                className="flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-xl bg-surface border border-line hover:border-brand text-ink font-black text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                <span>apple-touch-icon.png</span>
                <span className="text-[9px] font-mono opacity-80">512x512 Hi-Res</span>
              </button>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">Add to HTML &lt;head&gt;</span>
                <button type="button" onClick={copyHtml} className="text-[10px] font-black uppercase tracking-wider text-brand flex items-center gap-1 hover:opacity-80 cursor-pointer">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className="text-[10px] font-mono p-3 bg-surface text-ink rounded-xl border border-line overflow-x-auto custom-scrollbar">
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