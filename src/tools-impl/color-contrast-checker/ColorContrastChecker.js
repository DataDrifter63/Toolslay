"use client";

import React, { useState, useEffect } from "react";
import { Settings, Droplet, Type, PaintBucket, AlertTriangle, Check, X, LayoutTemplate, Wand2 } from "lucide-react";

// --- Safe Math Helpers ---
const hexToRgb = (hex) => {
  if (!hex) return null;
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};

const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const getLuminance = (r, g, b) => {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getContrastRatio = (hex1, hex2) => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

const adjustColorLightness = (hex, percent) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.max(0, Math.min(255, rgb.r + (255 * (percent / 100))));
  const g = Math.max(0, Math.min(255, rgb.g + (255 * (percent / 100))));
  const b = Math.max(0, Math.min(255, rgb.b + (255 * (percent / 100))));
  return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
};

export default function ColorContrastChecker() {
  const [isMounted, setIsMounted] = useState(false);
  const [fgColor, setFgColor] = useState("#FFFFFF");
  const [bgColor, setBgColor] = useState("#4F46E5");
  const [ratio, setRatio] = useState(0);
  const [showSettings, setShowSettings] = useState(true); // Default true so preview is visible initially

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const isValidHex = (hex) => /^#([0-9A-F]{3}){1,2}$/i.test(hex);
    if (isValidHex(fgColor) && isValidHex(bgColor)) {
      setRatio(getContrastRatio(fgColor, bgColor));
    }
  }, [fgColor, bgColor]);

  const handleAutoFix = () => {
    let currentRatio = getContrastRatio(fgColor, bgColor);
    if (currentRatio >= 4.5) return;
    
    const bgRgb = hexToRgb(bgColor);
    if (!bgRgb) return;

    const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const isBgDark = bgLum < 0.5;
    
    let testFg = fgColor;
    const step = isBgDark ? 2 : -2;
    
    for (let i = 0; i < 100; i++) {
        testFg = adjustColorLightness(testFg, step);
        if (getContrastRatio(testFg, bgColor) >= 4.5) {
            setFgColor(testFg);
            break;
        }
    }
  };

  const handleHexChange = (e, setter) => {
    let val = e.target.value;
    if (val && !val.startsWith('#')) {
      val = '#' + val;
    }
    setter(val);
  };

  const isPass = ratio >= 4.5;
  const ratioDisplay = isMounted ? ratio.toFixed(2) : "0.00";

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border">
      
      {/* HEADER BAR */}
      <div className="bg-surface border border-line p-4 sm:p-8 rounded-2xl shadow-card space-y-4 sm:space-y-6 w-full box-border">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4 sm:pb-5 w-full">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-lg sm:text-xl font-black shrink-0">
              <Droplet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-brand uppercase mb-0.5 sm:mb-1">
                WEB DESIGN UTILITY
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-ink tracking-tight truncate">
                Color Contrast Studio
              </h2>
              <p className="text-[10px] sm:text-[11px] font-bold text-muted mt-0.5 truncate">
                Check WCAG contrast ratios and preview text visibility instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-line bg-paper text-ink hover:border-brand text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all shrink-0"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" /> {showSettings ? "Hide Preview" : "Preview"}
            </button>
          </div>
        </div>

        {/* WORK AREA GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 sm:gap-6 items-start w-full">
          
          <div className="flex flex-col gap-4 sm:gap-6 flex-grow min-w-0">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              
              {/* Controls Panel */}
              <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 sm:space-y-6 w-full box-border">
                <div>
                    <label className="flex items-center gap-2 text-xs font-black text-ink uppercase tracking-wider mb-2">
                        <Type className="w-4 h-4 text-brand"/> Foreground (Text)
                    </label>
                    <div className="flex items-center gap-3 bg-surface p-2 rounded-xl border border-line">
                        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value.toUpperCase())} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent shrink-0" />
                        <input type="text" value={fgColor} onChange={(e) => handleHexChange(e, setFgColor)} className="w-full bg-transparent font-mono text-sm sm:text-base font-bold text-ink outline-none uppercase tabular-nums" maxLength={7} />
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-xs font-black text-ink uppercase tracking-wider mb-2">
                        <PaintBucket className="w-4 h-4 text-brand"/> Background
                    </label>
                    <div className="flex items-center gap-3 bg-surface p-2 rounded-xl border border-line">
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value.toUpperCase())} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent shrink-0" />
                        <input type="text" value={bgColor} onChange={(e) => handleHexChange(e, setBgColor)} className="w-full bg-transparent font-mono text-sm sm:text-base font-bold text-ink outline-none uppercase tabular-nums" maxLength={7} />
                    </div>
                </div>

                {!isPass && (
                    <button type="button" onClick={handleAutoFix} className="w-full flex items-center justify-center gap-2 bg-brand/10 hover:bg-brand/20 text-brand py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border border-brand/30 shadow-sm">
                        <Wand2 className="w-4 h-4"/> Auto-Fix Contrast
                    </button>
                )}
              </div>

              {/* Ratio Score Card */}
              <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center relative overflow-hidden w-full box-border min-h-[220px]">
                <div className={`absolute inset-0 opacity-10 ${isPass ? 'bg-emerald-500' : 'bg-[#fb7185]'}`}></div>
                <h3 className="text-[10px] font-black text-muted uppercase tracking-widest z-10 mb-2">Contrast Ratio</h3>
                <div className="flex items-baseline gap-1 z-10">
                    <span className={`text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter tabular-nums ${isPass ? 'text-emerald-500' : 'text-[#fb7185]'}`}>
                        {ratioDisplay}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-muted">: 1</span>
                </div>
                <div className={`mt-4 px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider z-10 flex items-center gap-1.5 ${isPass ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-[#fb7185]/10 text-[#fb7185] border border-[#fb7185]/30'}`}>
                    {isPass ? <Check className="w-3.5 h-3.5"/> : <X className="w-3.5 h-3.5"/>}
                    {isPass ? "WCAG Pass" : "WCAG Fail"}
                </div>
              </div>

            </div>

          </div>

          {/* SIDEBAR PREVIEW (Controlled strictly by showSettings state) */}
          {showSettings && (
            <div className="space-y-4 sm:space-y-6 w-full">
              <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl space-y-4 w-full box-border">
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <LayoutTemplate className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                  <h3 className="text-xs font-black text-ink uppercase tracking-wider">Live Preview</h3>
                </div>
                
                <div className="p-5 rounded-xl transition-colors border shadow-inner text-center space-y-3" style={{ backgroundColor: bgColor, borderColor: fgColor + '33' }}>
                    <h4 style={{ color: fgColor }} className="text-base sm:text-lg font-bold">Header Text</h4>
                    <p style={{ color: fgColor }} className="text-xs sm:text-sm opacity-90 leading-relaxed font-medium">
                        This represents how your paragraphs will look on this background.
                    </p>
                    <div className="pt-2">
                        <button type="button" style={{ backgroundColor: fgColor, color: bgColor }} className="px-4 py-2 rounded-lg font-bold shadow-sm text-xs uppercase tracking-wider">
                            Call to Action
                        </button>
                    </div>
                </div>
                
                {!isPass && (
                    <div className="flex items-start gap-2 bg-[#fb7185]/10 border border-[#fb7185]/30 p-3 rounded-xl mt-4">
                        <AlertTriangle className="w-4 h-4 text-[#fb7185] shrink-0 mt-0.5"/>
                        <p className="text-[11px] text-[#fb7185] font-medium leading-relaxed">
                            Low contrast is hard to read. Use the Auto-Fix button to correct it instantly.
                        </p>
                    </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}