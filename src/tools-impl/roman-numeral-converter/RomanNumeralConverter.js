"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Hash, Calendar, BookOpen, Sparkles, 
  ArrowRightLeft, Type, Info, AlertCircle, 
  Copy, Check 
} from "lucide-react";

const ROMAN_MAP = [
  { r: 'M', v: 1000 }, { r: 'CM', v: 900 }, { r: 'D', v: 500 }, { r: 'CD', v: 400 },
  { r: 'C', v: 100 }, { r: 'XC', v: 90 }, { r: 'L', v: 50 }, { r: 'XL', v: 40 },
  { r: 'X', v: 10 }, { r: 'IX', v: 9 }, { r: 'V', v: 5 }, { r: 'IV', v: 4 }, { r: 'I', v: 1 }
];

export default function RomanNumeralConverter() {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState("standard");
  const [copied, setCopied] = useState(false);
  
  const [inputValue, setInputValue] = useState("");
  const [standardResult, setStandardResult] = useState({ value: "", type: "", breakdown: [], error: null });

  const [dateValue, setDateValue] = useState("");
  const [delimiter, setDelimiter] = useState(" • ");
  const [dateResult, setDateResult] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const today = new Date().toISOString().split('T')[0];
    setDateValue(today);
  }, []);

  const processStandardInput = useCallback((val) => {
    const cleanVal = val.trim().toUpperCase();
    if (!cleanVal) {
      setStandardResult({ value: "", type: "", breakdown: [], error: null });
      return;
    }

    const isNumeric = /^[0-9]+$/.test(cleanVal);
    const isRoman = /^[IVXLCDM]+$/.test(cleanVal);

    if (isNumeric) {
      const num = parseInt(cleanVal, 10);
      if (num < 1 || num > 3999) {
        setStandardResult({ value: "", type: "number", breakdown: [], error: "Standard Roman numerals only support numbers from 1 to 3,999." });
        return;
      }
      
      let n = num;
      let resStr = "";
      let bd = [];
      for (let i = 0; i < ROMAN_MAP.length; i++) {
        while (n >= ROMAN_MAP[i].v) {
          resStr += ROMAN_MAP[i].r;
          bd.push({ roman: ROMAN_MAP[i].r, val: ROMAN_MAP[i].v });
          n -= ROMAN_MAP[i].v;
        }
      }
      setStandardResult({ value: resStr, type: "roman", breakdown: bd, error: null });
      
    } else if (isRoman) {
      let temp = cleanVal;
      let total = 0;
      let bd = [];
      
      for (let i = 0; i < ROMAN_MAP.length; i++) {
        while (temp.indexOf(ROMAN_MAP[i].r) === 0) {
          total += ROMAN_MAP[i].v;
          bd.push({ roman: ROMAN_MAP[i].r, val: ROMAN_MAP[i].v });
          temp = temp.slice(ROMAN_MAP[i].r.length);
        }
      }
      
      if (temp.length > 0) {
        setStandardResult({ value: "", type: "roman", breakdown: [], error: "Invalid Roman numeral sequence." });
      } else {
        setStandardResult({ value: total.toString(), type: "number", breakdown: bd, error: null });
      }
    } else {
      setStandardResult({ value: "", type: "unknown", breakdown: [], error: "Please enter a valid number or Roman numeral (I, V, X, L, C, D, M)." });
    }
  }, []);

  useEffect(() => {
    if (isMounted && mode === "standard") {
      const timeoutId = setTimeout(() => processStandardInput(inputValue), 300);
      return () => clearTimeout(timeoutId);
    }
  }, [inputValue, mode, processStandardInput, isMounted]);

  const intToRomanSimple = (num) => {
    if (num < 1 || num > 3999) return num.toString();
    let n = num;
    let res = "";
    for (let i = 0; i < ROMAN_MAP.length; i++) {
      while (n >= ROMAN_MAP[i].v) {
        res += ROMAN_MAP[i].r;
        n -= ROMAN_MAP[i].v;
      }
    }
    return res;
  };

  useEffect(() => {
    if (isMounted && mode === "date" && dateValue) {
      const parts = dateValue.split("-").map(Number);
      if (parts.length === 3) {
        const [year, month, day] = parts;
        if (year && month && day) {
          const romanD = intToRomanSimple(day);
          const romanM = intToRomanSimple(month);
          const romanY = intToRomanSimple(year);
          setDateResult(`${romanD}${delimiter}${romanM}${delimiter}${romanY}`);
        }
      }
    }
  }, [dateValue, delimiter, mode, isMounted]);

  const copyResult = async () => {
    const textToCopy = mode === "standard" ? standardResult.value : dateResult;
    if (!textToCopy) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }
    } catch (error) {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-slate-800 dark:text-slate-100">
      
      {/* MAIN WRAPPER SHELL */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 min-w-0">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-amber-500 shrink-0" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
              Pro Roman Numeral Engine
            </h2>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-lg shrink-0">
            <button 
              type="button" 
              onClick={() => setMode("standard")} 
              className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'standard' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500'}`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" /> Auto-Convert
            </button>
            <button 
              type="button" 
              onClick={() => setMode("date")} 
              className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'date' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500'}`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" /> Date & Tattoo
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] items-start gap-6 md:gap-8 min-w-0">
          
          {/* INPUT PANEL */}
          <div className="flex flex-col gap-6 md:gap-8 min-w-0">
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-5 md:p-7 rounded-xl space-y-6 md:space-y-8 min-w-0">
              
              {mode === "standard" ? (
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center justify-between min-w-0">
                    <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-500 truncate">
                      <Hash className="w-4 h-4 md:w-5 md:h-5 text-amber-500 shrink-0"/> Number or Roman Numeral
                    </label>
                    <span className="text-[9px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0">Auto-Detect</span>
                  </div>
                  <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    className="w-full text-2xl sm:text-3xl font-black p-4 md:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all uppercase placeholder:normal-case placeholder:text-slate-400 min-w-0" 
                    placeholder="e.g., 2024 or MMXXIV" 
                    autoComplete="off"
                  />
                  
                  {standardResult.error && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                      <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-relaxed">{standardResult.error}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 min-w-0">
                  <div className="space-y-2 min-w-0">
                    <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-500 truncate">
                      <Calendar className="w-4 h-4 md:w-5 md:h-5 text-amber-500 shrink-0"/> Select Date
                    </label>
                    <input 
                      type="date" 
                      value={dateValue} 
                      onChange={(e) => setDateValue(e.target.value)} 
                      className="w-full text-base md:text-lg font-bold p-3.5 md:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all min-w-0" 
                    />
                  </div>

                  <div className="space-y-2.5 min-w-0">
                    <label className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-500 block truncate">Tattoo / Engraving Separator</label>
                    <div className="grid grid-cols-4 gap-2 min-w-0">
                      {[
                        { id: ' • ', label: 'Bullet (•)', disp: '•' },
                        { id: ' - ', label: 'Dash (-)', disp: '-' },
                        { id: '/', label: 'Slash (/)', disp: '/' },
                        { id: ' ', label: 'Space', disp: '␣' },
                      ].map((sep) => {
                        const isActive = delimiter === sep.id;
                        return (
                          <button 
                            key={sep.id}
                            type="button"
                            onClick={() => setDelimiter(sep.id)}
                            className={`flex items-center justify-center p-3 rounded-lg border transition-all font-black text-base truncate ${
                              isActive 
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 shadow-sm' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-500/30'
                            }`}
                          >
                            {sep.disp}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg flex items-start gap-3 border border-slate-200 dark:border-slate-700 min-w-0">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
                  <p><strong className="text-slate-800 dark:text-slate-200">Quick Fact:</strong> The Romans didn't have a number for zero! It was introduced later.</p>
                  <p>Smaller numeral before larger = subtraction (IX = 9). After = addition (XI = 11).</p>
                </div>
              </div>

            </div>
          </div>

          {/* Output Dashboard */}
          <div className="flex flex-col gap-6 h-full min-w-0">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6 rounded-xl shadow-sm text-center relative overflow-hidden min-h-[180px] flex flex-col justify-between min-w-0">
               <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5 mb-4 min-w-0">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 truncate">
                   <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" /> 
                   {mode === "standard" ? "Conversion Result" : "Engraving Preview"}
                 </h3>
                 <button
                   type="button"
                   onClick={copyResult}
                   className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-colors shrink-0"
                 >
                   {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5 text-slate-400" /> Copy</>}
                 </button>
               </div>
               
               <div className="z-10 relative my-2 min-w-0">
                 <div className={`break-all transition-all ${
                   (mode === "standard" && standardResult.type === "roman") || mode === "date" 
                     ? "font-serif text-3xl sm:text-4xl md:text-5xl text-amber-600 dark:text-amber-400 tracking-wider font-bold" 
                     : "font-sans text-4xl sm:text-5xl md:text-6xl font-black"
                 }`}>
                   {isMounted ? (
                     mode === "standard" ? (standardResult.value || "—") : (dateResult || "—")
                   ) : "—"}
                 </div>
               </div>
               <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest pt-2 border-t border-slate-100 dark:border-slate-800">Ready for export / copy</div>
            </div>

            {/* Educational Breakdown Engine */}
            {isMounted && mode === "standard" && standardResult.breakdown.length > 0 && !standardResult.error && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6 rounded-xl shadow-sm min-w-0">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3.5 mb-4 min-w-0">
                    <Type className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 shrink-0" />
                    <h3 className="text-sm md:text-base font-bold truncate">Step-by-Step Logic</h3>
                </div>
                
                <div className="space-y-2 min-w-0">
                  {standardResult.breakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-xs min-w-0">
                        <span className="text-base font-serif font-bold text-amber-600 dark:text-amber-400 tracking-wider w-16 text-center shrink-0">{item.roman}</span>
                        <div className="flex-grow flex items-center justify-center px-3 min-w-0">
                           <div className="h-px w-full border-t border-dashed border-slate-300 dark:border-slate-700"></div>
                        </div>
                        <span className="text-xs sm:text-sm font-black w-16 text-right shrink-0">+{item.val}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center px-1 min-w-0">
                   <span className="text-xs font-black uppercase tracking-widest text-slate-400 truncate">Total Value</span>
                   <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                      {standardResult.breakdown.reduce((sum, item) => sum + item.val, 0)}
                   </span>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}