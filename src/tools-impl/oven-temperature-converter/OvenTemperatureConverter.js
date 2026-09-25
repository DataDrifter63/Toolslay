"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Thermometer, Flame, ChefHat, Fan, 
  Mountain, Activity, CheckCircle2,
  Settings2, ArrowRightLeft
} from "lucide-react";

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

const PRESETS = {
  f: ["300", "350", "375", "400", "425", "450"],
  c: ["150", "180", "190", "200", "220", "240"],
  gas: ["2", "4", "5", "6", "7", "9"]
};

export default function OvenTemperatureConverter() {
  const [isMounted, setIsMounted] = useState(false);

  const [inputValue, setInputValue] = useState("350");
  const [inputUnit, setInputUnit] = useState("f");
  const [hasFanOven, setHasFanOven] = useState(true);
  const [highAltitude, setHighAltitude] = useState(false);

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

  const results = useMemo(() => {
    let baseC = 180; 
    const val = inputValue.trim().toLowerCase();

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
            const currVal = curr.mark.includes('/') ? parseFloat(curr.mark.split('/')[0])/parseFloat(curr.mark.split('/')) : parseFloat(curr.mark);
            const prevVal = prev.mark.includes('/') ? parseFloat(prev.mark.split('/')[0])/parseFloat(prev.mark.split('/')) : parseFloat(prev.mark);
            return Math.abs(currVal - num) < Math.abs(prevVal - num) ? curr : prev;
          });
          baseC = exactGas ? exactGas.c : 0;
        }
      }
    }

    const currentC = Math.round(baseC);
    const currentF = Math.round((baseC * (9 / 5)) + 32);
    const closestGas = GAS_MARKS.reduce((prev, curr) => Math.abs(curr.c - baseC) < Math.abs(prev.c - baseC) ? curr : prev);

    const fanC = Math.max(0, currentC - 20);
    const fanF = Math.max(0, currentF - 25);
    const altC = currentC + 8;
    const altF = currentF + 15;
    const bothC = fanC + 8;
    const bothF = fanF + 15;

    let heatLabel = "Moderate";
    let suggestions = [];

    if (currentC < 130) {
      heatLabel = "Very Slow / Cool";
      suggestions = ["Meringues", "Slow Roasting Meats", "Drying Herbs"];
    } else if (currentC < 160) {
      heatLabel = "Slow";
      suggestions = ["Rich Fruit Cakes", "Braising Meat", "Casseroles"];
    } else if (currentC < 190) {
      heatLabel = "Moderate";
      suggestions = ["Layer Cakes", "Cookies / Biscuits", "Baked Potatoes"];
    } else if (currentC < 220) {
      heatLabel = "Moderately Hot";
      suggestions = ["Roast Chicken", "Puff Pastry", "Cupcakes", "Scones"];
    } else if (currentC < 240) {
      heatLabel = "Hot";
      suggestions = ["Bread", "Pizzas", "Quick Roasting Veg", "Tarts"];
    } else {
      heatLabel = "Very Hot";
      suggestions = ["Flash Roasting", "Tandoori Meats", "Broiling/Grilling"];
    }

    const heatPercent = Math.min(100, Math.max(0, (currentC / 300) * 100));

    return {
      currentC, currentF, gasMark: closestGas.mark,
      fanC, fanF, altC, altF, bothC, bothF,
      heatLabel, suggestions, heatPercent
    };
  }, [inputValue, inputUnit]);

  if (!isMounted) return null;

  const baseInputStyle = "w-full min-w-0 bg-surface border border-line rounded-xl px-3.5 py-3 text-base font-bold text-ink outline-none focus:border-brand tabular-nums";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <Thermometer className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              Culinary Heat Oracle
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              Oven Temp, Fan & Altitude Adjuster
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start min-w-0">
        
        {/* CONFIGURATION ENGINE */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* 1. Primary Input */}
            <div className="space-y-3 min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <Settings2 className="w-3.5 h-3.5 text-brand shrink-0" /> 1. Recipe Requirement
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Enter Temperature</label>
                  <div className="relative flex items-center bg-paper border border-line rounded-xl focus-within:border-brand overflow-hidden min-w-0">
                    <div className="bg-surface px-3 py-3 flex items-center justify-center border-r border-line shrink-0">
                      <Flame className="w-5 h-5 text-brand" />
                    </div>
                    <input
                      type="text" value={inputValue} onChange={(e) => handleNumInput(e.target.value)}
                      placeholder={inputUnit === 'gas' ? "4 or 1/2" : "350"}
                      className="w-full min-w-0 bg-transparent px-3 py-2.5 text-2xl font-black text-ink outline-none tabular-nums"
                    />
                  </div>
                </div>
                
                <div className="w-full sm:w-28 shrink-0 min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Unit</label>
                  <select
                    value={inputUnit} onChange={(e) => handleUnitChange(e.target.value)}
                    className={`${baseInputStyle} h-[52px] cursor-pointer tracking-wider`}
                  >
                    <option value="f">°F</option>
                    <option value="c">°C</option>
                    <option value="gas">Gas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic Real-Time Presets */}
            <div className="space-y-2 min-w-0">
              <div className="flex items-center justify-between min-w-0">
                <span className="text-[8px] font-bold text-muted uppercase tracking-widest truncate">Presets</span>
                <span className="text-[8px] bg-paper px-2 py-0.5 rounded border border-line text-muted uppercase shrink-0">{inputUnit}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-w-0" key={inputUnit}>
                {PRESETS[inputUnit].map(temp => (
                  <button 
                    type="button"
                    key={temp} onClick={() => setInputValue(temp)}
                    className="px-3 py-1.5 bg-paper hover:bg-surface border border-line text-ink rounded-lg text-xs font-black transition-colors tabular-nums shrink-0"
                  >
                    {temp}{inputUnit === 'gas' ? '' : `°${inputUnit.toUpperCase()}`}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-line" />

            {/* 2. Pro Environmental Adjustments */}
            <div className="space-y-3 min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <ArrowRightLeft className="w-3.5 h-3.5 text-brand shrink-0" /> 2. Environmental Tuning
              </h3>
              
              <div className="space-y-2.5 min-w-0">
                {/* Fan Toggle */}
                <div className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all min-w-0 ${hasFanOven ? "border-brand/40 bg-brand/5" : "border-line bg-paper"}`}>
                  <div className="flex items-center gap-2.5 min-w-0 truncate">
                    <div className={`p-2 rounded-lg border shrink-0 ${hasFanOven ? "bg-surface border-brand text-brand" : "text-muted bg-surface border-line"}`}>
                      <Fan className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 truncate">
                      <span className="block text-xs font-black text-ink truncate">Fan / Convection</span>
                      <span className="text-[9px] text-muted block truncate">-20°C / -25°F</span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setHasFanOven(!hasFanOven)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 ${hasFanOven ? "bg-brand" : "bg-line"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-surface shadow-sm transition-transform ${hasFanOven ? "translate-x-6" : "translate-x-0"}`}></div>
                  </button>
                </div>

                {/* Altitude Toggle */}
                <div className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all min-w-0 ${highAltitude ? "border-brand/40 bg-brand/5" : "border-line bg-paper"}`}>
                  <div className="flex items-center gap-2.5 min-w-0 truncate">
                    <div className={`p-2 rounded-lg border shrink-0 ${highAltitude ? "bg-surface border-brand text-brand" : "text-muted bg-surface border-line"}`}>
                      <Mountain className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 truncate">
                      <span className="block text-xs font-black text-ink truncate">High Altitude (+3000ft)</span>
                      <span className="text-[9px] text-muted block truncate">+8°C / +15°F</span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setHighAltitude(!highAltitude)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 ${highAltitude ? "bg-brand" : "bg-line"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-surface shadow-sm transition-transform ${highAltitude ? "translate-x-6" : "translate-x-0"}`}></div>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD / ORACLE */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[500px] min-w-0">
            
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <Activity className="w-4 h-4 text-brand shrink-0" /> Precision Board
              </span>
              {(hasFanOven || highAltitude) && (
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/30 shrink-0">
                  Auto-Adjusted
                </span>
              )}
            </div>

            {/* HERO METRICS GRID */}
            <div className="text-center py-5 px-4 rounded-xl border border-line bg-paper shadow-sm mb-4 relative overflow-hidden shrink-0 min-w-0">
              <div className="flex justify-center items-center gap-3 min-w-0 truncate">
                <span className="text-3xl sm:text-4xl font-black text-brand tracking-tight tabular-nums truncate">
                  {hasFanOven && highAltitude ? results.bothF : hasFanOven ? results.fanF : highAltitude ? results.altF : results.currentF}°F
                </span>
                <span className="text-lg text-muted font-black shrink-0">/</span>
                <span className="text-3xl sm:text-4xl font-black text-brand tracking-tight tabular-nums truncate">
                  {hasFanOven && highAltitude ? results.bothC : hasFanOven ? results.fanC : highAltitude ? results.altC : results.currentC}°C
                </span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-muted mt-2 block truncate">
                Gas Mark {results.gasMark} (Base Equivalency)
              </span>
            </div>

            {/* APPLIED ADJUSTMENTS LIST */}
            {(hasFanOven || highAltitude) && (
              <div className="mb-4 space-y-1.5 shrink-0 min-w-0 text-xs">
                {hasFanOven && (
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted bg-paper p-2 rounded-lg border border-line min-w-0 truncate">
                    <span className="flex items-center gap-1.5 truncate"><Fan className="w-3 h-3 shrink-0" /> Fan Correction</span>
                    <span className="text-teal tabular-nums shrink-0">-25°F / -20°C</span>
                  </div>
                )}
                {highAltitude && (
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted bg-paper p-2 rounded-lg border border-line min-w-0 truncate">
                    <span className="flex items-center gap-1.5 truncate"><Mountain className="w-3 h-3 shrink-0" /> Altitude Correction</span>
                    <span className="text-[#fb7185] tabular-nums shrink-0">+15°F / +8°C</span>
                  </div>
                )}
              </div>
            )}

            {/* THE CULINARY ORACLE */}
            <div className="flex-1 flex flex-col min-h-0 bg-paper rounded-xl border border-line p-3 shadow-sm min-w-0 text-xs">
              
              {/* Heat Indicator Bar */}
              <div className="mb-3.5 min-w-0">
                <div className="flex justify-between items-center mb-1.5 min-w-0">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted truncate">Heat Profile</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-brand truncate">{results.heatLabel}</span>
                </div>
                <div className="w-full bg-surface border border-line h-2 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${results.heatPercent}%` }} 
                    className="h-full transition-all duration-500 bg-brand"
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-muted mb-2 border-b border-line pb-1.5 truncate">
                <ChefHat className="w-3 h-3 shrink-0 text-brand" /> Ideal For Baking
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 min-w-0">
                {results.suggestions.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-line min-w-0 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                    <span className="text-xs font-bold text-ink truncate">{item}</span>
                  </div>
                ))}
                {results.suggestions.length === 0 && (
                   <div className="text-[10px] font-medium text-muted p-2 truncate">Enter temperature...</div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}