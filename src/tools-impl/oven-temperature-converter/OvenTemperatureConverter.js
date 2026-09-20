"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Thermometer, Flame, ChefHat, Fan, 
  Mountain, Activity, CheckCircle2,
  Settings2, ArrowRightLeft, AlertCircle
} from "lucide-react";

// Gas Mark Lookup Table (Standard Culinary Guide)
const GAS_MARKS = [
  { mark: "1/4", c: 110, f: 225, label: "Very Slow" },
  { mark: "1/2", c: 120, f: 250, label: "Very Slow" },
  { mark: "1", c: 140, f: 275, label: "Slow" },
  { mark: "2", c: 150, f: 300, label: "Slow" },
  { mark: "3", c: 160, f: 325, label: "Moderate" },
  { mark: "4", c: 180, f: 350, label: "Moderate" },
  { mark: "5", c: 190, f: 375, label: "Moderately Hot" },
  { mark: "6", c: 200, f: 400, label: "Moderately Hot" },
  { mark: "7", c: 220, f: 425, label: "Hot" },
  { mark: "8", c: 230, f: 450, label: "Hot" },
  { mark: "9", c: 240, f: 475, label: "Very Hot" },
  { mark: "10", c: 260, f: 500, label: "Extremely Hot" }
];

// Dynamic Presets based on Unit
const PRESETS = {
  f: ["300", "350", "375", "400", "425", "450"],
  c: ["150", "180", "190", "200", "220", "240"],
  gas: ["2", "4", "5", "6", "7", "9"]
};

export default function OvenTemperatureConverter() {
  const [isMounted, setIsMounted] = useState(false);

  // Inputs
  const [inputValue, setInputValue] = useState("350");
  const [inputUnit, setInputUnit] = useState("f"); // 'f', 'c', 'gas'
  
  // Advanced Modifiers
  const [hasFanOven, setHasFanOven] = useState(true); // Convection (Needs less heat)
  const [highAltitude, setHighAltitude] = useState(false); // >3000ft (Needs more heat)

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNumInput = (value) => {
    if (value === "") {
      setInputValue("");
      return;
    }
    if (inputUnit === 'gas') {
       setInputValue(value); 
    } else if (/^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  // Smart Unit Swap Logic (Auto-converts existing value so user doesn't lose context)
  const handleUnitChange = (newUnit) => {
    if (!inputValue || newUnit === inputUnit) {
      setInputUnit(newUnit);
      return;
    }

    let baseC = 0;
    if (inputUnit === "f") baseC = (parseFloat(inputValue) - 32) * (5 / 9);
    else if (inputUnit === "c") baseC = parseFloat(inputValue);
    else if (inputUnit === "gas") {
      const gasObj = GAS_MARKS.find(g => g.mark === inputValue) || GAS_MARKS[5];
      baseC = gasObj.c;
    }

    let convertedVal = "";
    if (newUnit === "f") convertedVal = Math.round((baseC * 9/5) + 32).toString();
    else if (newUnit === "c") convertedVal = Math.round(baseC).toString();
    else if (newUnit === "gas") {
      const closestGas = GAS_MARKS.reduce((prev, curr) => Math.abs(curr.c - baseC) < Math.abs(prev.c - baseC) ? curr : prev);
      convertedVal = closestGas.mark;
    }

    setInputValue(convertedVal);
    setInputUnit(newUnit);
  };

  // --- CORE CULINARY ENGINE ---
  const results = useMemo(() => {
    let baseC = 180; 
    const val = inputValue.trim().toLowerCase();

    // 1. Convert Input to Base Celsius
    if (val) {
      if (inputUnit === "c") {
        baseC = parseFloat(val) || 0;
      } else if (inputUnit === "f") {
        const f = parseFloat(val) || 0;
        baseC = (f - 32) * (5 / 9);
      } else if (inputUnit === "gas") {
        let exactGas = GAS_MARKS.find(g => g.mark === val);
        if (exactGas) {
          baseC = exactGas.c;
        } else {
          const num = parseFloat(val) || 0;
          exactGas = GAS_MARKS.reduce((prev, curr) => {
            const currVal = curr.mark.includes('/') ? parseFloat(curr.mark.split('/')[0])/parseFloat(curr.mark.split('/')[1]) : parseFloat(curr.mark);
            const prevVal = prev.mark.includes('/') ? parseFloat(prev.mark.split('/')[0])/parseFloat(prev.mark.split('/')[1]) : parseFloat(prev.mark);
            return Math.abs(currVal - num) < Math.abs(prevVal - num) ? curr : prev;
          });
          baseC = exactGas ? exactGas.c : 0;
        }
      }
    }

    // 2. Generate Standard Conversions
    const currentC = Math.round(baseC);
    const currentF = Math.round((baseC * (9 / 5)) + 32);
    const closestGas = GAS_MARKS.reduce((prev, curr) => Math.abs(curr.c - baseC) < Math.abs(prev.c - baseC) ? curr : prev);

    // 3. Environmental Adjustments
    // Fan (-20C / -25F)
    const fanC = Math.max(0, currentC - 20);
    const fanF = Math.max(0, currentF - 25);
    
    // Altitude (+8C / +15F)
    const altC = currentC + 8;
    const altF = currentF + 15;

    // Both (Fan + Altitude)
    const bothC = fanC + 8;
    const bothF = fanF + 15;

    // 4. Culinary Context & Heat Theming
    let heatLabel = "Moderate";
    let themeColor = "amber";
    let suggestions = [];

    if (currentC < 130) {
      heatLabel = "Very Slow / Cool"; themeColor = "blue";
      suggestions = ["Meringues", "Slow Roasting Meats", "Drying Herbs"];
    } else if (currentC < 160) {
      heatLabel = "Slow"; themeColor = "emerald";
      suggestions = ["Rich Fruit Cakes", "Braising Meat", "Casseroles"];
    } else if (currentC < 190) {
      heatLabel = "Moderate"; themeColor = "amber";
      suggestions = ["Layer Cakes", "Cookies / Biscuits", "Baked Potatoes"];
    } else if (currentC < 220) {
      heatLabel = "Moderately Hot"; themeColor = "orange";
      suggestions = ["Roast Chicken", "Puff Pastry", "Cupcakes", "Scones"];
    } else if (currentC < 240) {
      heatLabel = "Hot"; themeColor = "rose";
      suggestions = ["Bread", "Pizzas", "Quick Roasting Veg", "Tarts"];
    } else {
      heatLabel = "Very Hot"; themeColor = "red";
      suggestions = ["Flash Roasting", "Tandoori Meats", "Broiling/Grilling"];
    }

    const heatPercent = Math.min(100, Math.max(0, (currentC / 300) * 100));

    return {
      currentC, currentF, gasMark: closestGas.mark,
      fanC, fanF, altC, altF, bothC, bothF,
      heatLabel, themeColor, suggestions, heatPercent
    };
  }, [inputValue, inputUnit]);

  if (!isMounted) return null;

  // Dynamic Theme Colors based on Heat
  const colorThemes = {
    blue: "from-blue-500 to-cyan-500 text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    emerald: "from-emerald-500 to-teal-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    amber: "from-amber-400 to-orange-500 text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    orange: "from-orange-500 to-rose-500 text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    rose: "from-rose-500 to-red-500 text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800",
    red: "from-red-600 to-rose-600 text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  };

  const activeTheme = colorThemes[results.themeColor];
  const gradientClasses = activeTheme.split(' ').slice(0, 2).join(' '); 
  const textClass = activeTheme.split(' ')[2];
  const bgLightClass = activeTheme.split(' ').slice(3, 5).join(' ');
  const borderClass = activeTheme.split(' ').slice(5, 7).join(' ');

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${gradientClasses} rounded-bl-full -z-10 opacity-20 dark:opacity-10 transition-all duration-1000`}></div>
        <div className="flex items-center gap-4">
          <div className={`bg-gradient-to-br ${gradientClasses} p-3.5 rounded-2xl shadow-md transition-all duration-500`}>
            <Thermometer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Culinary Heat Oracle
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Oven Temp, Fan & Altitude Adjuster
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Primary Input */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Settings2 className={`w-3.5 h-3.5 ${textClass}`} /> 1. Recipe Requirement
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Enter Temperature</label>
                  <div className={`relative flex items-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-500/10 transition-all overflow-hidden group`}>
                    <div className="bg-slate-50 dark:bg-slate-800 px-4 py-4 flex items-center justify-center border-r border-slate-200 dark:border-slate-700">
                      <Flame className={`w-6 h-6 ${textClass} transition-colors`} />
                    </div>
                    <input
                      type="text" value={inputValue} onChange={(e) => handleNumInput(e.target.value)}
                      placeholder={inputUnit === 'gas' ? "e.g. 4 or 1/2" : "350"}
                      className="w-full bg-transparent px-5 py-4 text-3xl font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                    />
                  </div>
                </div>
                
                <div className="w-full sm:w-32">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Unit</label>
                  <select
                    value={inputUnit} onChange={(e) => handleUnitChange(e.target.value)}
                    className="w-full h-[72px] bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-base font-black text-slate-800 dark:text-slate-100 outline-none cursor-pointer focus:border-slate-400 tracking-widest"
                  >
                    <option value="f">°F</option>
                    <option value="c">°C</option>
                    <option value="gas">Gas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic Real-Time Presets */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                <span>Common Presets</span>
                <span className="text-[8px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{inputUnit.toUpperCase()} MODE</span>
              </label>
              <div className="flex flex-wrap gap-2 animate-in fade-in duration-300" key={inputUnit}>
                {PRESETS[inputUnit].map(temp => (
                  <button 
                    key={temp} onClick={() => setInputValue(temp)}
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-black transition-colors tabular-nums"
                  >
                    {temp}{inputUnit === 'gas' ? '' : `°${inputUnit.toUpperCase()}`}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Pro Environmental Adjustments */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <ArrowRightLeft className={`w-3.5 h-3.5 ${textClass}`} /> 2. Environmental Tuning
              </h3>
              
              <div className="space-y-3">
                {/* Fan Toggle */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border ${hasFanOven ? borderClass + " " + bgLightClass : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"} transition-colors duration-500`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${hasFanOven ? `bg-white dark:bg-slate-800 shadow-sm ${textClass}` : "text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"}`}>
                      <Fan className={`w-5 h-5 ${hasFanOven ? "animate-spin-slow" : ""}`} />
                    </div>
                    <div>
                      <span className="block text-sm font-black text-slate-800 dark:text-slate-100">Fan / Convection Oven</span>
                      <span className="text-[10px] text-slate-500 block leading-snug">Requires ~20°C (25°F) lower temp</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setHasFanOven(!hasFanOven)}
                    className={`w-14 h-7 rounded-full transition-colors relative p-1 shrink-0 shadow-inner ${hasFanOven ? `bg-gradient-to-r ${gradientClasses}` : "bg-slate-300 dark:bg-slate-700"}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${hasFanOven ? "translate-x-7" : "translate-x-0"}`}></div>
                  </button>
                </div>

                {/* Altitude Toggle */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border ${highAltitude ? borderClass + " " + bgLightClass : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"} transition-colors duration-500`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${highAltitude ? `bg-white dark:bg-slate-800 shadow-sm ${textClass}` : "text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"}`}>
                      <Mountain className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-black text-slate-800 dark:text-slate-100">High Altitude (+3000ft)</span>
                      <span className="text-[10px] text-slate-500 block leading-snug">Requires ~8°C (15°F) higher temp</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setHighAltitude(!highAltitude)}
                    className={`w-14 h-7 rounded-full transition-colors relative p-1 shrink-0 shadow-inner ${highAltitude ? `bg-gradient-to-r ${gradientClasses}` : "bg-slate-300 dark:bg-slate-700"}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${highAltitude ? "translate-x-7" : "translate-x-0"}`}></div>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD / ORACLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[640px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${textClass}`} /> Precision Board
                </span>
              </div>

              {/* HERO METRICS GRID (Shows Target Temp) */}
              <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
                <div className={`col-span-2 text-center py-6 px-4 rounded-2xl border ${borderClass} ${bgLightClass} relative overflow-hidden transition-colors duration-500 shadow-sm`}>
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center px-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                      Target Heat
                    </span>
                    {(hasFanOven || highAltitude) && (
                       <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 ${textClass} border ${borderClass} shadow-sm`}>
                         Auto-Adjusted
                       </span>
                    )}
                  </div>
                  
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <span className={`text-5xl sm:text-6xl font-black ${textClass} tracking-tighter tabular-nums`}>
                      {hasFanOven && highAltitude ? results.bothF : hasFanOven ? results.fanF : highAltitude ? results.altF : results.currentF}°F
                    </span>
                    <span className="text-xl text-slate-300 dark:text-slate-600 font-black">/</span>
                    <span className={`text-5xl sm:text-6xl font-black ${textClass} tracking-tighter tabular-nums`}>
                      {hasFanOven && highAltitude ? results.bothC : hasFanOven ? results.fanC : highAltitude ? results.altC : results.currentC}°C
                    </span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${textClass} mt-3 block`}>
                    Gas Mark {results.gasMark} (Base)
                  </span>
                </div>
              </div>

              {/* SMART ALERTS FOR ADJUSTMENTS */}
              {(hasFanOven || highAltitude) && (
                <div className="mb-6 space-y-2 shrink-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">
                    Applied Adjustments
                  </div>
                  {hasFanOven && (
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="flex items-center gap-1.5"><Fan className="w-3.5 h-3.5" /> Fan Correction</span>
                      <span className="text-blue-500 tabular-nums">-25°F / -20°C</span>
                    </div>
                  )}
                  {highAltitude && (
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="flex items-center gap-1.5"><Mountain className="w-3.5 h-3.5" /> Altitude Correction</span>
                      <span className="text-rose-500 tabular-nums">+15°F / +8°C</span>
                    </div>
                  )}
                </div>
              )}

              {/* THE CULINARY ORACLE (What to bake) */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm relative overflow-hidden mt-auto">
                
                {/* Heat Indicator Bar */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Heat Profile</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${textClass}`}>{results.heatLabel}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${results.heatPercent}%` }} 
                      className={`h-full transition-all duration-1000 bg-gradient-to-r ${gradientClasses}`}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <ChefHat className="w-3.5 h-3.5" /> Ideal For Baking
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                  {results.suggestions.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700/50">
                      <CheckCircle2 className={`w-4 h-4 ${textClass}`} />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item}</span>
                    </div>
                  ))}
                  {results.suggestions.length === 0 && (
                     <div className="text-xs font-medium text-slate-400 p-2">Enter a valid temperature...</div>
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