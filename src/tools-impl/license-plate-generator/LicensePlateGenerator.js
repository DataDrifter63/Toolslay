"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Car, Dices, Copy, CheckCircle2, 
  Type, Globe, Sparkles, Settings, 
  CalendarDays, ShieldCheck
} from "lucide-react";

// Premium Region Configurations
const REGIONS = [
  { 
    id: "california", 
    name: "California (Classic)", 
    format: "9AAA999", // 9 = number, A = letter
    desc: "Modern CA plate. 1 digit, 3 letters, 3 digits.",
    bg: "bg-white",
    text: "text-blue-800",
    border: "border-gray-300",
    header: "California",
    headerStyle: "text-red-600 font-serif italic text-xl sm:text-2xl",
    font: "font-mono font-bold"
  },
  { 
    id: "euro", 
    name: "Euro Standard", 
    format: "AA 999 AA", 
    desc: "Standard European Union format with blue country strip.",
    bg: "bg-white",
    text: "text-black",
    border: "border-black",
    header: "",
    font: "font-sans font-black tracking-widest",
    hasEuroStrip: true
  },
  { 
    id: "newyork", 
    name: "New York (Empire)", 
    format: "AAA-9999", 
    desc: "Classic NY Gold/Blue Empire State plate.",
    bg: "bg-yellow-500",
    text: "text-blue-900",
    border: "border-blue-900",
    header: "NEW YORK",
    headerStyle: "text-blue-900 font-black tracking-widest text-sm sm:text-base",
    font: "font-bold tracking-widest"
  },
  { 
    id: "cyberpunk", 
    name: "Cyberpunk 2077", 
    format: "NC-99-AA", 
    desc: "Neon glowing plate from Night City.",
    bg: "bg-slate-900",
    text: "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]",
    border: "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]",
    header: "NIGHT CITY",
    headerStyle: "text-pink-500 font-black tracking-widest text-xs sm:text-sm",
    font: "font-mono font-black tracking-widest"
  }
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomChar = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
const getRandomNum = () => Math.floor(Math.random() * 10).toString();

export default function LicensePlateGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Configuration States
  const [region, setRegion] = useState(REGIONS[0]);
  const [isCustom, setIsCustom] = useState(false);
  const [customText, setCustomText] = useState("MUXAIR");
  const [generatedText, setGeneratedText] = useState("");
  
  // Sticker States
  const [showStickers, setShowStickers] = useState(true);
  const [stickerMonth, setStickerMonth] = useState("OCT");
  const [stickerYear, setStickerYear] = useState("2026");
  
  // UI States
  const [copied, setCopied] = useState(false);

  // Initialize
  useEffect(() => {
    setIsMounted(true);
    generatePlate(REGIONS[0].format);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generatePlate = (formatMask) => {
    let result = "";
    for (let i = 0; i < formatMask.length; i++) {
      if (formatMask[i] === "A") result += getRandomChar();
      else if (formatMask[i] === "9") result += getRandomNum();
      else result += formatMask[i]; // hyphens, spaces
    }
    setGeneratedText(result);
    setStickerMonth(getRandomItem(MONTHS));
    setStickerYear((new Date().getFullYear() + Math.floor(Math.random() * 4)).toString());
  };

  const handleRegionChange = (reg) => {
    setRegion(reg);
    if (!isCustom) generatePlate(reg.format);
  };

  const handleCopy = () => {
    const textToCopy = isCustom ? customText.toUpperCase() : generatedText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) return null;

  const currentDisplay = isCustom ? customText.toUpperCase().slice(0, 8) : generatedText;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-100 to-transparent dark:from-blue-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3.5 rounded-2xl">
            <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              License Plate Forge
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Visual Simulator & Fiction Generator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: FORGE CONTROLS ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Style Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Globe className="w-4 h-4 text-blue-500" /> Regional Style
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REGIONS.map((r) => {
                  const isActive = region.id === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleRegionChange(r)}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-1.5 ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`block text-xs font-black uppercase tracking-widest ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {r.name}
                        </span>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                      </div>
                      <span className="block text-[10px] font-medium text-slate-500">
                        {r.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Mode Toggle & Config */}
            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              
              <div className="flex flex-col sm:flex-row gap-6 justify-between">
                
                {/* Input Mode */}
                <div className="space-y-2 flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5" /> Generation Mode
                  </label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button 
                      onClick={() => { setIsCustom(false); generatePlate(region.format); }} 
                      className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${!isCustom ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500"}`}
                    >
                      Randomize
                    </button>
                    <button 
                      onClick={() => setIsCustom(true)} 
                      className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${isCustom ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500"}`}
                    >
                      Vanity / Custom
                    </button>
                  </div>
                </div>

                {/* Optional Stickers Toggle */}
                <div className="space-y-2 sm:w-1/3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> Reg. Stickers
                  </label>
                  <button 
                    onClick={() => setShowStickers(!showStickers)}
                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors border-2 ${showStickers ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}
                  >
                    {showStickers ? "Stickers ON" : "Stickers OFF"}
                  </button>
                </div>

              </div>

              {/* Dynamic Input Area */}
              {isCustom ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-blue-500" /> Custom Vanity Text
                  </label>
                  <input
                    type="text" maxLength={8} value={customText} onChange={(e) => setCustomText(e.target.value.replace(/[^a-zA-Z0-9 -]/g, ''))}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none uppercase focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all"
                    placeholder="E.g. BATMAN"
                  />
                  <span className="text-[10px] font-medium text-slate-400">Max 8 characters. Alphanumeric, spaces, and hyphens only.</span>
                </div>
              ) : (
                <button
                  onClick={() => generatePlate(region.format)}
                  className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 animate-in fade-in"
                >
                  <Dices className="w-6 h-6" /> Re-Roll License Plate
                </button>
              )}
            </div>
            
          </div>
        </div>

        {/* ================= RIGHT: VISUALIZER ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[450px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col items-center justify-center">
              
              <div className="absolute top-6 left-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Live CSS Render
                </span>
              </div>

              {/* === THE VISUAL LICENSE PLATE === */}
              <div className="w-full max-w-[380px] mt-8 mb-12">
                
                {/* Plate Container */}
                <div className={`relative w-full aspect-[2/1] rounded-lg border-[3px] shadow-xl flex flex-col overflow-hidden ${region.bg} ${region.border} transition-colors duration-500`}>
                  
                  {/* Screws */}
                  <div className="absolute top-2 left-3 w-2 h-2 rounded-full bg-gray-400/80 shadow-inner z-20"></div>
                  <div className="absolute top-2 right-3 w-2 h-2 rounded-full bg-gray-400/80 shadow-inner z-20"></div>
                  <div className="absolute bottom-2 left-3 w-2 h-2 rounded-full bg-gray-400/80 shadow-inner z-20"></div>
                  <div className="absolute bottom-2 right-3 w-2 h-2 rounded-full bg-gray-400/80 shadow-inner z-20"></div>

                  {/* Optional Euro Strip */}
                  {region.hasEuroStrip && (
                    <div className="absolute left-0 top-0 bottom-0 w-[12%] bg-blue-700 flex flex-col items-center justify-between py-2 z-10 border-r border-black/20">
                      <div className="grid grid-cols-3 gap-0.5 px-1 mt-1">
                         {/* Fake stars */}
                         {[...Array(12)].map((_, i) => <div key={i} className="w-1 h-1 bg-yellow-400 rounded-full"></div>)}
                      </div>
                      <span className="text-white font-bold text-xs">EU</span>
                    </div>
                  )}

                  {/* Header / State Name */}
                  {!region.hasEuroStrip && region.header && (
                    <div className="h-1/4 w-full flex items-center justify-center pt-2 z-10 relative">
                       {/* Stickers (Top Corners usually) */}
                       {showStickers && region.id !== "euro" && (
                         <>
                           <div className="absolute top-1 left-8 bg-blue-100 border border-blue-300 w-8 h-5 rounded flex items-center justify-center shadow-sm transform -rotate-1">
                             <span className="text-[8px] font-black text-blue-800">{stickerMonth}</span>
                           </div>
                           <div className="absolute top-1 right-8 bg-red-100 border border-red-300 w-8 h-5 rounded flex items-center justify-center shadow-sm transform rotate-2">
                             <span className="text-[8px] font-black text-red-800">{stickerYear}</span>
                           </div>
                         </>
                       )}
                       <span className={`${region.headerStyle}`}>{region.header}</span>
                    </div>
                  )}

                  {/* Main Plate Text */}
                  <div className={`flex-1 flex items-center justify-center z-10 ${region.hasEuroStrip ? 'pl-[12%]' : ''}`}>
                    <span className={`text-4xl sm:text-5xl ${region.font} ${region.text} transition-all duration-300`}>
                      {currentDisplay || "---"}
                    </span>
                  </div>

                  {/* Footer (Empty for spacing on some plates) */}
                  {!region.hasEuroStrip && <div className="h-4 w-full"></div>}

                </div>
              </div>

              {/* Data Extraction & Copy */}
              <div className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                    Text Value
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">
                    Use in stories or designs
                  </span>
                </div>
                
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    copied 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {copied ? <><CheckCircle2 className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Text</>}
                </button>
              </div>

              {/* Meta Info */}
              <div className="w-full mt-4 flex items-start gap-2 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[9px] font-medium text-slate-500 leading-relaxed">
                  <strong>Lore Data:</strong> Format corresponds to actual regional structuring (e.g. {region.format}). These plates are purely fictional simulations intended for design mockups, RP (Roleplay) servers, or creative writing.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}