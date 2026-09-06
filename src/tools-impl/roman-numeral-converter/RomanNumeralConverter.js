"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Hash, Calendar, BookOpen, Sparkles, ArrowRightLeft, Type, Info, AlertCircle } from "lucide-react";

const ROMAN_MAP = [
  { r: 'M', v: 1000 }, { r: 'CM', v: 900 }, { r: 'D', v: 500 }, { r: 'CD', v: 400 },
  { r: 'C', v: 100 }, { r: 'XC', v: 90 }, { r: 'L', v: 50 }, { r: 'XL', v: 40 },
  { r: 'X', v: 10 }, { r: 'IX', v: 9 }, { r: 'V', v: 5 }, { r: 'IV', v: 4 }, { r: 'I', v: 1 }
];

export default function RomanNumeralConverter() {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState("standard"); // standard, date
  
  // Standard Mode State
  const [inputValue, setInputValue] = useState("");
  const [standardResult, setStandardResult] = useState({ value: "", type: "", breakdown: [], error: null });

  // Date Mode State
  const [dateValue, setDateValue] = useState("");
  const [delimiter, setDelimiter] = useState(" • ");
  const [dateResult, setDateResult] = useState("");

  useEffect(() => {
    setIsMounted(true);
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setDateValue(today);
  }, []);

  // Pro Engine: Intelligent Parser (Number <-> Roman)
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
    if (mode === "standard") {
      const timeoutId = setTimeout(() => processStandardInput(inputValue), 300);
      return () => clearTimeout(timeoutId);
    }
  }, [inputValue, mode, processStandardInput]);

  // Date Converter Engine
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
    if (mode === "date" && dateValue) {
      const [year, month, day] = dateValue.split("-").map(Number);
      if (year && month && day) {
        const romanD = intToRomanSimple(day);
        const romanM = intToRomanSimple(month);
        const romanY = intToRomanSimple(year);
        setDateResult(`${romanD}${delimiter}${romanM}${delimiter}${romanY}`);
      }
    }
  }, [dateValue, delimiter, mode]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-amber-600" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Pro Roman Numeral Engine</h2>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setMode("standard")} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all ${mode === 'standard' ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-400 shadow-sm' : 'text-slate-500'}`}>
            <ArrowRightLeft className="w-3.5 h-3.5" /> Auto-Convert
          </button>
          <button onClick={() => setMode("date")} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all ${mode === 'date' ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-400 shadow-sm' : 'text-slate-500'}`}>
            <Calendar className="w-3.5 h-3.5" /> Date & Tattoo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* Input Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-xl shadow-sm space-y-8">
            
            {mode === "standard" ? (
              <div className="space-y-4 animate-in fade-in">
                <label className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-200">
                  <span className="flex items-center gap-2"><Hash className="w-4 h-4 text-amber-600"/> Enter Number or Roman Numeral</span>
                  <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded font-black uppercase tracking-wider">Auto-Detect</span>
                </label>
                <input 
                  type="text" 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)} 
                  className="w-full text-4xl font-black p-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100 transition-shadow uppercase placeholder:normal-case placeholder:text-slate-300 dark:placeholder:text-slate-600" 
                  placeholder="e.g., 2024 or MMXXIV" 
                  autoComplete="off"
                />
                
                {standardResult.error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{standardResult.error}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    <Calendar className="w-4 h-4 text-amber-600"/> Select Date
                  </label>
                  <input 
                    type="date" 
                    value={dateValue} 
                    onChange={(e) => setDateValue(e.target.value)} 
                    className="w-full text-xl font-bold p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100 transition-shadow" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tattoo / Engraving Separator</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: ' • ', label: 'Bullet (•)' },
                      { id: ' - ', label: 'Dash (-)' },
                      { id: '/', label: 'Slash (/)' },
                      { id: ' ', label: 'Space' },
                    ].map((sep) => (
                      <button 
                        key={sep.id}
                        onClick={() => setDelimiter(sep.id)}
                        className={`flex items-center justify-center p-3 rounded-lg border transition-all font-black text-lg ${delimiter === sep.id ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400 scale-[1.02] shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 hover:border-amber-200'}`}
                      >
                        {sep.label.match(/\((.*?)\)/)?.[1] || '␣'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl flex items-start gap-3 border border-amber-100 dark:border-amber-900/30">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs font-medium text-amber-800 dark:text-amber-400/80 leading-relaxed space-y-1">
                <p><strong className="text-amber-900 dark:text-amber-300">Quick Fact:</strong> The Romans didn't have a number for zero! It was introduced to Europe much later.</p>
                <p>A smaller numeral placed before a larger one means subtraction (e.g., IX = 9). Placed after means addition (e.g., XI = 11).</p>
              </div>
            </div>

          </div>
        </div>

        {/* Output Dashboard */}
        <div className="flex flex-col gap-6 h-full sticky top-6">
          
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-xl shadow-sm text-center relative overflow-hidden min-h-[200px] flex flex-col justify-center">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-900 to-slate-900 pointer-events-none"></div>
             
             <div className="z-10 relative">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                 <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 
                 {mode === "standard" ? "Conversion Result" : "Engraving Preview"}
               </h3>
               
               <div className={`break-all transition-all ${
                 (mode === "standard" && standardResult.type === "roman") || mode === "date" 
                   ? "font-serif text-5xl md:text-6xl text-amber-400 tracking-widest leading-tight drop-shadow-md" 
                   : "font-sans text-6xl md:text-7xl font-black text-white tracking-tighter"
               }`}>
                 {isMounted ? (
                   mode === "standard" ? (standardResult.value || "—") : (dateResult || "—")
                 ) : "—"}
               </div>
             </div>
          </div>

          {/* Educational Breakdown Engine */}
          {mode === "standard" && standardResult.breakdown.length > 0 && !standardResult.error && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <Type className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Step-by-Step Logic</h3>
              </div>
              
              <div className="space-y-2">
                {standardResult.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-xl font-serif font-bold text-amber-600 dark:text-amber-400 tracking-wider w-16 text-center">{item.roman}</span>
                      <div className="flex-grow flex items-center justify-center">
                         <div className="h-px w-full bg-slate-200 dark:bg-slate-700 border-dashed border-t border-slate-300 dark:border-slate-600 mx-4"></div>
                      </div>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300 w-16 text-right">+{item.val}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center px-3">
                 <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Value</span>
                 <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {standardResult.breakdown.reduce((sum, item) => sum + item.val, 0)}
                 </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}