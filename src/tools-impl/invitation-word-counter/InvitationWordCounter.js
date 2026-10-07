"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Type, FileText, Layout, Sparkles, 
  AlertCircle, CheckCircle2, DollarSign, 
  PenTool, Hash, Maximize, Copy
} from "lucide-react";

// Standard Stationery Sizes & Their Comfortable Character Limits (assuming 12pt elegant font)
const CARD_SIZES = [
  { id: "a7", name: "Classic A7 (5\" x 7\")", maxChars: 450, icon: Layout },
  { id: "a6", name: "Petite A6 (4.6\" x 6.2\")", maxChars: 280, icon: Layout },
  { id: "square", name: "Square (5\" x 5\")", maxChars: 220, icon: Maximize }
];

const PRINT_FINISHES = [
  { id: "digital", name: "Standard Flat Print", costPerChar: 0, setupFee: 0 },
  { id: "foil", name: "Gold/Silver Foil Press", costPerChar: 0.15, setupFee: 85 },
  { id: "letterpress", name: "Deep Letterpress", costPerChar: 0.20, setupFee: 120 }
];

export default function InvitationWordCounter() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [text, setText] = useState("");
  const [activeSize, setActiveSize] = useState(CARD_SIZES[0]);
  const [activeFinish, setActiveFinish] = useState(PRINT_FINISHES[0]);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handlers
  const handleCopy = () => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Core Math & Regex Engine
  const calculations = useMemo(() => {
    const trimmedText = text.trim();
    
    // 1. Basic Metrics
    const words = trimmedText ? trimmedText.split(/\s+/).length : 0;
    const charsTotal = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const lines = trimmedText ? text.split(/\r\n|\r|\n/).length : 0;

    // 2. Space Capacity Engine
    const capacityPercent = Math.min(150, (charsTotal / activeSize.maxChars) * 100);
    
    let capacityStatus = { msg: "Perfect spacing", color: "text-emerald-600 bg-emerald-50 border-emerald-200", bar: "bg-emerald-500", icon: CheckCircle2 };
    if (capacityPercent > 100) {
      capacityStatus = { msg: "Overcrowded! Font size must be reduced drastically.", color: "text-rose-600 bg-rose-50 border-rose-200", bar: "bg-rose-500", icon: AlertCircle };
    } else if (capacityPercent > 85) {
      capacityStatus = { msg: "Getting tight. Might look cluttered.", color: "text-amber-600 bg-amber-50 border-amber-200", bar: "bg-amber-500", icon: AlertCircle };
    } else if (capacityPercent === 0) {
      capacityStatus = { msg: "Awaiting text...", color: "text-slate-500 bg-slate-50 border-slate-200", bar: "bg-slate-300", icon: FileText };
    }

    // 3. Etiquette Scanner
    const etiquetteTips = [];
    if (/\d/.test(text)) {
      etiquetteTips.push("Formal invitations spell out numbers (e.g., 'Two Thousand Twenty-Four' instead of '2024').");
    }
    if (/\b(?:am|pm|AM|PM)\b/.test(text)) {
      etiquetteTips.push("Instead of AM/PM, use 'in the morning', 'in the afternoon', or 'in the evening' for elegance.");
    }
    if (/\b(?:st|nd|rd|th)\b/i.test(text) && /\d/.test(text)) {
      etiquetteTips.push("Avoid 'st', 'nd', 'rd', 'th' with dates (use 'October twenty-fourth' instead of 'October 24th').");
    }

    // 4. Premium Print Cost Estimator
    const premiumCost = activeFinish.setupFee + (charsNoSpaces * activeFinish.costPerChar);

    return {
      words,
      charsTotal,
      charsNoSpaces,
      lines,
      capacityPercent,
      capacityStatus,
      etiquetteTips,
      premiumCost,
      isEmpty: charsTotal === 0
    };
  }, [text, activeSize, activeFinish]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-fuchsia-100 to-transparent dark:from-fuchsia-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-fuchsia-50 dark:bg-fuchsia-900/30 p-3.5 rounded-2xl">
            <PenTool className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Invitation Word Counter
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
              Typography Sizing, Etiquette & Foil Estimator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: EDITOR PANEL ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Stationery Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Layout className="w-4 h-4 text-slate-400" /> Card Dimensions
                </label>
                <select 
                  value={activeSize.id}
                  onChange={(e) => setActiveSize(CARD_SIZES.find(s => s.id === e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-fuchsia-500 transition-colors"
                >
                  {CARD_SIZES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-slate-400" /> Print Finish
                </label>
                <select 
                  value={activeFinish.id}
                  onChange={(e) => setActiveFinish(PRINT_FINISHES.find(s => s.id === e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-fuchsia-500 transition-colors"
                >
                  {PRINT_FINISHES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

            </div>

            {/* Smart Textarea Editor */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-slate-400" /> Invitation Text
                </label>
                <button 
                  onClick={handleCopy}
                  className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-900/20 px-3 py-1.5 rounded-lg hover:bg-fuchsia-100 transition-colors flex items-center gap-1.5"
                >
                  {isCopied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {isCopied ? "Copied!" : "Copy Text"}
                </button>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-400 to-indigo-500 rounded-2xl opacity-0 group-focus-within:opacity-20 transition duration-300 blur"></div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Together with their families...&#10;Request the honor of your presence..."
                  className="relative w-full h-80 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center text-lg font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-fuchsia-400 resize-none leading-relaxed transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }} // Adds that premium invitation feel
                />
              </div>
            </div>

            {/* Etiquette Scanner Results */}
            {calculations.etiquetteTips.length > 0 && !calculations.isEmpty && (
              <div className="pt-2">
                <div className="p-4 rounded-xl border bg-indigo-50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-900/50 space-y-3 animate-in zoom-in-95">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
                      Formal Etiquette Scanner
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {calculations.etiquetteTips.map((tip, idx) => (
                      <li key={idx} className="text-[11px] font-medium text-indigo-800/80 dark:text-indigo-300/80 flex items-start gap-2">
                        <span className="mt-1 w-1 h-1 rounded-full bg-indigo-400 shrink-0"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ================= RIGHT: STATIONERY METRICS ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                  <FileText className="w-3.5 h-3.5 text-fuchsia-500" /> Copy Details
                </span>
              </div>
              
              {/* Core Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
                  <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.words}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Words</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
                  <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.lines}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Lines</span>
                </div>
                <div className="col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-fuchsia-500" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Characters (Total)</span>
                  </div>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.charsTotal}</span>
                </div>
                <div className="col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Characters (No Spaces)</span>
                  </div>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.charsNoSpaces}</span>
                </div>
              </div>

              {/* Space Capacity Visualizer */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-end">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Sizing Reality Check
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    {activeSize.name}
                  </span>
                </div>
                
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden">
                  <div 
                    style={{ width: `${Math.min(100, calculations.capacityPercent)}%` }} 
                    className={`h-full ${calculations.capacityStatus.bar} transition-all duration-500`}
                  ></div>
                </div>

                <div className={`p-3 rounded-lg border flex items-center gap-2.5 ${calculations.capacityStatus.color} transition-colors`}>
                  {React.createElement(calculations.capacityStatus.icon, { className: "w-4 h-4 shrink-0" })}
                  <span className="text-[10px] font-bold leading-tight">
                    {calculations.capacityStatus.msg}
                  </span>
                </div>
              </div>
              
              {/* Premium Print Cost */}
              {activeFinish.id !== "digital" && !calculations.isEmpty && (
                <div className="mt-auto animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-black p-5 rounded-xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles className="w-16 h-16 text-yellow-400" />
                    </div>
                    
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      {activeFinish.name} Surcharge
                    </span>
                    <div className="flex items-start gap-1">
                      <span className="text-lg font-bold text-slate-400 mt-1">$</span>
                      <span className="text-4xl font-black text-white tabular-nums">
                        {calculations.premiumCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </div>
                    <p className="text-[9px] font-medium text-slate-400 mt-2">
                      Est. die-cast fee based on {calculations.charsNoSpaces} characters + base setup. Actual printer costs may vary.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}