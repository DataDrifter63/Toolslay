"use client";

import React, { useState, useEffect } from "react";
import { Settings, Droplet, Type, PaintBucket, AlertTriangle, Check, X, LayoutTemplate, Wand2 } from "lucide-react";

// --- Safe Math Helpers ---
const hexToRgb = (hex) => {
  if (!hex) return null;
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
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

// ✅ Safely Exported Component
export default function ColorContrastChecker() {
  const [isMounted, setIsMounted] = useState(false);
  const [fgColor, setFgColor] = useState("#FFFFFF");
  const [bgColor, setBgColor] = useState("#4F46E5");
  const [ratio, setRatio] = useState(0);
  const [showSettings, setShowSettings] = useState(true);

  // Prevent SSR Hydration crashes
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Safe Calculation
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
    
    // Fail-safe loop (max 100 iterations)
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
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Droplet className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Color Contrast Studio</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-pink-500 hover:text-pink-600 transition-all">
            <Settings className="w-4 h-4" /> {showSettings ? "Hide Preview" : "Show Preview"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 items-start">
        <div className="flex flex-col gap-6 flex-grow">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-6">
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                        <Type className="w-4 h-4 text-pink-500"/> Foreground (Text)
                    </label>
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value.toUpperCase())} className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent" />
                        <input type="text" value={fgColor} onChange={(e) => handleHexChange(e, setFgColor)} className="flex-grow bg-transparent font-mono text-lg font-bold text-slate-800 dark:text-slate-100 focus:outline-none" maxLength={7} />
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                        <PaintBucket className="w-4 h-4 text-pink-500"/> Background
                    </label>
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value.toUpperCase())} className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent" />
                        <input type="text" value={bgColor} onChange={(e) => handleHexChange(e, setBgColor)} className="flex-grow bg-transparent font-mono text-lg font-bold text-slate-800 dark:text-slate-100 focus:outline-none" maxLength={7} />
                    </div>
                </div>

                {!isPass && (
                    <button onClick={handleAutoFix} className="w-full flex items-center justify-center gap-2 bg-pink-100 hover:bg-pink-200 dark:bg-pink-900/40 dark:hover:bg-pink-900/60 text-pink-700 dark:text-pink-300 py-3 rounded-lg font-bold transition-all border border-pink-200 dark:border-pink-800">
                        <Wand2 className="w-5 h-5"/> Auto-Fix Contrast
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                <div className={`absolute inset-0 opacity-10 ${isPass ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest z-10 mb-2">Contrast Ratio</h3>
                <div className="flex items-baseline gap-1 z-10">
                    <span className={`text-6xl md:text-7xl font-black tracking-tighter ${isPass ? 'text-emerald-500' : 'text-red-500'}`}>
                        {ratioDisplay}
                    </span>
                    <span className="text-2xl font-bold text-slate-400">: 1</span>
                </div>
                <div className={`mt-4 px-6 py-2 rounded-full font-bold text-sm z-10 flex items-center gap-2 ${isPass ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                    {isPass ? <Check className="w-4 h-4"/> : <X className="w-4 h-4"/>}
                    {isPass ? "WCAG Pass" : "WCAG Fail"}
                </div>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="space-y-6 lg:w-80 lg:max-w-80 flex flex-col h-full">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <LayoutTemplate className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Live Preview</h3>
              </div>
              
              <div className="p-6 rounded-lg transition-colors border shadow-inner text-center space-y-4" style={{ backgroundColor: bgColor, borderColor: fgColor + '33' }}>
                  <h4 style={{ color: fgColor }} className="text-lg font-bold">Header Text</h4>
                  <p style={{ color: fgColor }} className="text-sm opacity-90 leading-relaxed">
                      This represents how your paragraphs will look on this background.
                  </p>
                  <div className="pt-2">
                      <button style={{ backgroundColor: fgColor, color: bgColor }} className="px-5 py-2 rounded font-bold shadow-md text-sm">
                          Call to Action
                      </button>
                  </div>
              </div>
              
              {!isPass && (
                  <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 p-3 rounded-lg mt-4">
                      <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5"/>
                      <p className="text-xs text-orange-700 dark:text-orange-400 leading-relaxed">
                          Low contrast is hard to read. Use the Auto-Fix button to correct it instantly.
                      </p>
                  </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}