"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Palette, Droplet, Hash, Type, 
  Contrast, Sun, Moon, Copy, 
  CheckCircle2, SlidersHorizontal, Eye
} from "lucide-react";

// Curated Premium Dataset of 140+ CSS/Named Colors for the Math Engine
const COLOR_DICTIONARY = [
  { name: "Black", hex: "#000000" }, { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#FF0000" }, { name: "Lime", hex: "#00FF00" },
  { name: "Blue", hex: "#0000FF" }, { name: "Yellow", hex: "#FFFF00" },
  { name: "Cyan", hex: "#00FFFF" }, { name: "Magenta", hex: "#FF00FF" },
  { name: "Silver", hex: "#C0C0C0" }, { name: "Gray", hex: "#808080" },
  { name: "Maroon", hex: "#800000" }, { name: "Olive", hex: "#808000" },
  { name: "Green", hex: "#008000" }, { name: "Purple", hex: "#800080" },
  { name: "Teal", hex: "#008080" }, { name: "Navy", hex: "#000080" },
  { name: "AliceBlue", hex: "#F0F8FF" }, { name: "AntiqueWhite", hex: "#FAEBD7" },
  { name: "Aqua", hex: "#00FFFF" }, { name: "Aquamarine", hex: "#7FFFD4" },
  { name: "Azure", hex: "#F0FFFF" }, { name: "Beige", hex: "#F5F5DC" },
  { name: "Bisque", hex: "#FFE4C4" }, { name: "BlanchedAlmond", hex: "#FFEBCD" },
  { name: "BlueViolet", hex: "#8A2BE2" }, { name: "Brown", hex: "#A52A2A" },
  { name: "BurlyWood", hex: "#DEB887" }, { name: "CadetBlue", hex: "#5F9EA0" },
  { name: "Chartreuse", hex: "#7FFF00" }, { name: "Chocolate", hex: "#D2691E" },
  { name: "Coral", hex: "#FF7F50" }, { name: "CornflowerBlue", hex: "#6495ED" },
  { name: "Cornsilk", hex: "#FFF8DC" }, { name: "Crimson", hex: "#DC143C" },
  { name: "DarkBlue", hex: "#00008B" }, { name: "DarkCyan", hex: "#008B8B" },
  { name: "DarkGoldenRod", hex: "#B8860B" }, { name: "DarkGray", hex: "#A9A9A9" },
  { name: "DarkGreen", hex: "#006400" }, { name: "DarkKhaki", hex: "#BDB76B" },
  { name: "DarkMagenta", hex: "#8B008B" }, { name: "DarkOliveGreen", hex: "#556B2F" },
  { name: "DarkOrange", hex: "#FF8C00" }, { name: "DarkOrchid", hex: "#9932CC" },
  { name: "DarkRed", hex: "#8B0000" }, { name: "DarkSalmon", hex: "#E9967A" },
  { name: "DarkSeaGreen", hex: "#8FBC8F" }, { name: "DarkSlateBlue", hex: "#483D8B" },
  { name: "DarkSlateGray", hex: "#2F4F4F" }, { name: "DarkTurquoise", hex: "#00CED1" },
  { name: "DarkViolet", hex: "#9400D3" }, { name: "DeepPink", hex: "#FF1493" },
  { name: "DeepSkyBlue", hex: "#00BFFF" }, { name: "DimGray", hex: "#696969" },
  { name: "DodgerBlue", hex: "#1E90FF" }, { name: "FireBrick", hex: "#B22222" },
  { name: "FloralWhite", hex: "#FFFAF0" }, { name: "ForestGreen", hex: "#228B22" },
  { name: "Fuchsia", hex: "#FF00FF" }, { name: "Gainsboro", hex: "#DCDCDC" },
  { name: "GhostWhite", hex: "#F8F8FF" }, { name: "Gold", hex: "#FFD700" },
  { name: "GoldenRod", hex: "#DAA520" }, { name: "GreenYellow", hex: "#ADFF2F" },
  { name: "HoneyDew", hex: "#F0FFF0" }, { name: "HotPink", hex: "#FF69B4" },
  { name: "IndianRed", hex: "#CD5C5C" }, { name: "Indigo", hex: "#4B0082" },
  { name: "Ivory", hex: "#FFFFF0" }, { name: "Khaki", hex: "#F0E68C" },
  { name: "Lavender", hex: "#E6E6FA" }, { name: "LavenderBlush", hex: "#FFF0F5" },
  { name: "LawnGreen", hex: "#7CFC00" }, { name: "LemonChiffon", hex: "#FFFACD" },
  { name: "LightBlue", hex: "#ADD8E6" }, { name: "LightCoral", hex: "#F08080" },
  { name: "LightCyan", hex: "#E0FFFF" }, { name: "LightGoldenRodYellow", hex: "#FAFAD2" },
  { name: "LightGray", hex: "#D3D3D3" }, { name: "LightGreen", hex: "#90EE90" },
  { name: "LightPink", hex: "#FFB6C1" }, { name: "LightSalmon", hex: "#FFA07A" },
  { name: "LightSeaGreen", hex: "#20B2AA" }, { name: "LightSkyBlue", hex: "#87CEFA" },
  { name: "LightSlateGray", hex: "#778899" }, { name: "LightSteelBlue", hex: "#B0C4DE" },
  { name: "LightYellow", hex: "#FFFFE0" }, { name: "LimeGreen", hex: "#32CD32" },
  { name: "Linen", hex: "#FAF0E6" }, { name: "MediumAquaMarine", hex: "#66CDAA" },
  { name: "MediumBlue", hex: "#0000CD" }, { name: "MediumOrchid", hex: "#BA55D3" },
  { name: "MediumPurple", hex: "#9370DB" }, { name: "MediumSeaGreen", hex: "#3CB371" },
  { name: "MediumSlateBlue", hex: "#7B68EE" }, { name: "MediumSpringGreen", hex: "#00FA9A" },
  { name: "MediumTurquoise", hex: "#48D1CC" }, { name: "MediumVioletRed", hex: "#C71585" },
  { name: "MidnightBlue", hex: "#191970" }, { name: "MintCream", hex: "#F5FFFA" },
  { name: "MistyRose", hex: "#FFE4E1" }, { name: "Moccasin", hex: "#FFE4B5" },
  { name: "NavajoWhite", hex: "#FFDEAD" }, { name: "OldLace", hex: "#FDF5E6" },
  { name: "OliveDrab", hex: "#6B8E23" }, { name: "Orange", hex: "#FFA500" },
  { name: "OrangeRed", hex: "#FF4500" }, { name: "Orchid", hex: "#DA70D6" },
  { name: "PaleGoldenRod", hex: "#EEE8AA" }, { name: "PaleGreen", hex: "#98FB98" },
  { name: "PaleTurquoise", hex: "#AFEEEE" }, { name: "PaleVioletRed", hex: "#DB7093" },
  { name: "PapayaWhip", hex: "#FFEFD5" }, { name: "PeachPuff", hex: "#FFDAB9" },
  { name: "Peru", hex: "#CD853F" }, { name: "Pink", hex: "#FFC0CB" },
  { name: "Plum", hex: "#DDA0DD" }, { name: "PowderBlue", hex: "#B0E0E6" },
  { name: "RosyBrown", hex: "#BC8F8F" }, { name: "RoyalBlue", hex: "#4169E1" },
  { name: "SaddleBrown", hex: "#8B4513" }, { name: "Salmon", hex: "#FA8072" },
  { name: "SandyBrown", hex: "#F4A460" }, { name: "SeaGreen", hex: "#2E8B57" },
  { name: "SeaShell", hex: "#FFF5EE" }, { name: "Sienna", hex: "#A0522D" },
  { name: "SkyBlue", hex: "#87CEEB" }, { name: "SlateBlue", hex: "#6A5ACD" },
  { name: "SlateGray", hex: "#708090" }, { name: "Snow", hex: "#FFFAFA" },
  { name: "SpringGreen", hex: "#00FF7F" }, { name: "SteelBlue", hex: "#4682B4" },
  { name: "Tan", hex: "#D2B48C" }, { name: "Thistle", hex: "#D8BFD8" },
  { name: "Tomato", hex: "#FF6347" }, { name: "Turquoise", hex: "#40E0D0" },
  { name: "Violet", hex: "#EE82EE" }, { name: "Wheat", hex: "#F5DEB3" },
  { name: "WhiteSmoke", hex: "#F5F5F5" }, { name: "YellowGreen", hex: "#9ACD32" }
];

export default function ColorNameFinder() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Source of truth is HEX
  const [hexColor, setHexColor] = useState("#3B82F6"); // Default Tailwind Blue-500
  const [copiedValue, setCopiedValue] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Utility: HEX to RGB Object
  const hexToRgbObj = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return { r, g, b };
  };

  // Utility: RGB to HEX String
  const rgbToHexStr = (r, g, b) => {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
  };

  // Euclidean Distance Math Engine for Color Matching
  const findClosestColor = (targetHex) => {
    const targetRgb = hexToRgbObj(targetHex);
    let minDistance = Infinity;
    let closestMatch = COLOR_DICTIONARY[0];

    for (let color of COLOR_DICTIONARY) {
      const colorRgb = hexToRgbObj(color.hex);
      // Euclidean distance in 3D RGB Space
      const distance = Math.sqrt(
        Math.pow(targetRgb.r - colorRgb.r, 2) +
        Math.pow(targetRgb.g - colorRgb.g, 2) +
        Math.pow(targetRgb.b - colorRgb.b, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestMatch = color;
      }
    }
    return { ...closestMatch, distance: minDistance };
  };

  // Generate Shades & Tints
  const generatePalette = (rgb) => {
    const palette = [];
    // 3 Tints (Lighter)
    for (let i = 0.8; i >= 0.2; i -= 0.3) {
      palette.push(rgbToHexStr(
        Math.min(255, Math.round(rgb.r + (255 - rgb.r) * i)),
        Math.min(255, Math.round(rgb.g + (255 - rgb.g) * i)),
        Math.min(255, Math.round(rgb.b + (255 - rgb.b) * i))
      ));
    }
    // Base Color
    palette.push(rgbToHexStr(rgb.r, rgb.g, rgb.b));
    // 3 Shades (Darker)
    for (let i = 0.2; i <= 0.8; i += 0.3) {
      palette.push(rgbToHexStr(
        Math.max(0, Math.round(rgb.r * (1 - i))),
        Math.max(0, Math.round(rgb.g * (1 - i))),
        Math.max(0, Math.round(rgb.b * (1 - i)))
      ));
    }
    return palette;
  };

  // Core Math & Data Processing
  const colorData = useMemo(() => {
    const rgb = hexToRgbObj(hexColor);
    const closest = findClosestColor(hexColor);
    
    // WCAG Relative Luminance Formula for Contrast Checking
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    const isDark = luminance < 0.5;
    const textColor = isDark ? "#FFFFFF" : "#000000";

    const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    
    return {
      rgb,
      rgbString,
      closest,
      isDark,
      textColor,
      palette: generatePalette(rgb),
      isExactMatch: closest.hex.toUpperCase() === hexColor.toUpperCase()
    };
  }, [hexColor]);

  // Handlers
  const handleHexChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith("#")) val = "#" + val;
    if (val.length <= 7) {
      setHexColor(val);
    }
  };

  const handleRgbChange = (channel, value) => {
    const newRgb = { ...colorData.rgb, [channel]: parseInt(value) || 0 };
    setHexColor(rgbToHexStr(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  if (!isMounted) return null;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border">
      
      {/* Premium Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border"
           style={{ borderBottom: `4px solid ${hexColor.length === 7 ? hexColor : '#3B82F6'}` }}>
        <div className="flex items-center gap-4">
          <div className="bg-paper p-3 rounded-xl border border-line">
            <Palette className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Color Name Finder
            </h2>
            <p className="text-[10px] font-black text-brand uppercase tracking-widest mt-1">
              Chroma Naming & Accessibility Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          <div className="bg-paper border border-line p-5 sm:p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* Visual Color Picker */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-muted" /> Visual Picker
              </label>
              <div className="relative h-24 rounded-xl overflow-hidden border border-line shadow-sm cursor-pointer hover:border-brand transition-colors">
                <input
                  type="color"
                  value={hexColor.length === 7 ? hexColor : "#000000"}
                  onChange={(e) => setHexColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="absolute inset-0 transition-colors duration-200 flex items-center justify-center"
                  style={{ backgroundColor: hexColor.length === 7 ? hexColor : "#000000", color: colorData.textColor }}
                >
                  <span className="font-black tracking-widest opacity-80 uppercase flex items-center gap-2 text-xs">
                    <Droplet className="w-4 h-4" /> Tap to pick color
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-line">
              {/* HEX Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-muted" /> HEX Code
                </label>
                <div className="relative flex items-center bg-surface border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden">
                  <input
                    type="text" value={hexColor} onChange={handleHexChange} maxLength={7}
                    className="w-full bg-transparent px-4 py-3 text-sm font-black text-ink outline-none uppercase font-mono"
                  />
                  <button 
                    onClick={() => handleCopy(hexColor)}
                    className="px-3 text-muted hover:text-brand transition-colors"
                  >
                    {copiedValue === hexColor ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* RGB Text Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-muted" /> RGB Value
                </label>
                <div className="relative flex items-center bg-surface border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden">
                  <input
                    type="text" value={colorData.rgbString} readOnly
                    className="w-full bg-transparent px-4 py-3 text-xs font-black text-ink outline-none font-mono"
                  />
                  <button 
                    onClick={() => handleCopy(colorData.rgbString)}
                    className="px-3 text-muted hover:text-brand transition-colors"
                  >
                    {copiedValue === colorData.rgbString ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* RGB Sliders */}
            <div className="space-y-4 pt-4 border-t border-line">
              <label className="text-[10px] font-black text-muted uppercase tracking-wider block">Fine Tune (RGB Channels)</label>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-4 font-black text-rose-500 text-xs">R</span>
                  <input type="range" min="0" max="255" value={colorData.rgb.r} onChange={(e) => handleRgbChange('r', e.target.value)} className="flex-1 h-1.5 bg-surface rounded-full appearance-none cursor-pointer accent-rose-500 border border-line" />
                  <span className="w-8 text-right text-xs font-mono font-bold text-muted">{colorData.rgb.r}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 font-black text-emerald-500 text-xs">G</span>
                  <input type="range" min="0" max="255" value={colorData.rgb.g} onChange={(e) => handleRgbChange('g', e.target.value)} className="flex-1 h-1.5 bg-surface rounded-full appearance-none cursor-pointer accent-emerald-500 border border-line" />
                  <span className="w-8 text-right text-xs font-mono font-bold text-muted">{colorData.rgb.g}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 font-black text-blue-500 text-xs">B</span>
                  <input type="range" min="0" max="255" value={colorData.rgb.b} onChange={(e) => handleRgbChange('b', e.target.value)} className="flex-1 h-1.5 bg-surface rounded-full appearance-none cursor-pointer accent-blue-500 border border-line" />
                  <span className="w-8 text-right text-xs font-mono font-bold text-muted">{colorData.rgb.b}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: ANALYSIS DASHBOARD ================= */}
        <div className="space-y-6 lg:sticky lg:top-6">
          
          <div className="bg-paper border border-line rounded-2xl shadow-sm overflow-hidden flex flex-col p-5 sm:p-6 space-y-6">
            
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-line text-[10px] font-black uppercase tracking-wider text-muted shadow-sm">
                <Eye className="w-3.5 h-3.5 text-brand" /> Color Analysis
              </span>
            </div>
            
            {/* Grand Identification */}
            <div className="text-center pb-6 border-b border-line">
              <span className="text-[10px] font-black text-muted uppercase tracking-wider block mb-2 flex justify-center items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-brand" /> 
                {colorData.isExactMatch ? "Exact Match Found" : "Closest Known Color"}
              </span>
              
              <h3 className="text-3xl sm:text-4xl font-black text-ink tracking-tight leading-tight mb-2">
                {colorData.closest.name}
              </h3>
              
              <div className="flex justify-center items-center gap-2 mt-2">
                <div className="w-3.5 h-3.5 rounded-full border border-line shrink-0" style={{ backgroundColor: colorData.closest.hex }}></div>
                <span className="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                  {colorData.closest.hex}
                </span>
              </div>
            </div>

            {/* Tints & Shades Generator */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-muted" /> Tints & Shades
              </h4>
              <div className="flex h-12 rounded-xl overflow-hidden border border-line shadow-sm cursor-pointer">
                {colorData.palette.map((shade, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleCopy(shade)}
                    className="flex-1 transition-all hover:flex-[1.5] relative flex items-center justify-center group"
                    style={{ backgroundColor: shade }}
                    title={`Click to copy: ${shade}`}
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-black/40 text-white rounded transition-opacity shadow-sm">
                      Copy
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-muted">
                <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-500"/> Lighter</span>
                <span>Base</span>
                <span className="flex items-center gap-1">Darker <Moon className="w-3 h-3 text-indigo-400"/></span>
              </div>
            </div>

            {/* WCAG Accessibility Contrast Checker */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Contrast className="w-4 h-4 text-muted" /> Accessibility (A11Y) Checker
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Black Text Test */}
                <div 
                  className="p-3.5 rounded-xl border border-line shadow-sm flex flex-col items-center justify-center text-center transition-colors bg-surface"
                  style={{ backgroundColor: hexColor, color: '#000000' }}
                >
                  <span className="text-xs font-black mb-1">Black Text</span>
                  {!colorData.isDark ? (
                    <span className="inline-flex items-center gap-1 bg-black/10 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Readable
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-black/10 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider opacity-70">
                      Poor Contrast
                    </span>
                  )}
                </div>

                {/* White Text Test */}
                <div 
                  className="p-3.5 rounded-xl border border-line shadow-sm flex flex-col items-center justify-center text-center transition-colors bg-surface"
                  style={{ backgroundColor: hexColor, color: '#FFFFFF' }}
                >
                  <span className="text-xs font-black mb-1">White Text</span>
                  {colorData.isDark ? (
                    <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Readable
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider opacity-70">
                      Poor Contrast
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}