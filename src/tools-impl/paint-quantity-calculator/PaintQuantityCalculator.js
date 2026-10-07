"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  PaintRoller, Ruler, DoorOpen, LayoutGrid, 
  Droplet, DollarSign, Calculator, Info, 
  AlertCircle, CheckCircle2, Maximize
} from "lucide-react";

export default function PaintQuantityCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Localization & System
  const [system, setSystem] = useState("imperial"); // imperial (feet/gallons) or metric (meters/liters)
  const [currency, setCurrency] = useState("$");

  // Room Dimensions
  const [length, setLength] = useState(12);
  const [width, setWidth] = useState(12);
  const [height, setHeight] = useState(8);
  const [includeCeiling, setIncludeCeiling] = useState(false);

  // Exclusions
  const [doors, setDoors] = useState(1);
  const [windows, setWindows] = useState(1);

  // Paint Specs
  const [coats, setCoats] = useState(2);
  const [quality, setQuality] = useState("premium"); // budget, standard, premium
  const [pricePerUnit, setPricePerUnit] = useState(45); // Price per Gallon or Liter

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Quality Change Handler (Dynamic Pricing Fix)
  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
    
    // Auto-adjust price to reflect reality when quality changes
    if (system === "imperial") {
      if (newQuality === "premium") setPricePerUnit(45);
      else if (newQuality === "standard") setPricePerUnit(35);
      else setPricePerUnit(22); // Budget
    } else {
      if (newQuality === "premium") setPricePerUnit(15);
      else if (newQuality === "standard") setPricePerUnit(11);
      else setPricePerUnit(7); // Budget
    }
  };

  // System Toggle Handler
  const handleSystemChange = (newSystem) => {
    if (newSystem === system) return;
    setSystem(newSystem);
    
    // Rough conversions for sensible defaults
    if (newSystem === "metric") {
      setLength(Math.round(length * 0.3048));
      setWidth(Math.round(width * 0.3048));
      setHeight(Math.round(height * 0.3048));
      setCurrency("£");
      // Apply correct metric price for current quality
      if (quality === "premium") setPricePerUnit(15);
      else if (quality === "standard") setPricePerUnit(11);
      else setPricePerUnit(7);
    } else {
      setLength(Math.round(length / 0.3048) || 12);
      setWidth(Math.round(width / 0.3048) || 12);
      setHeight(Math.round(height / 0.3048) || 8);
      setCurrency("$");
      // Apply correct imperial price for current quality
      if (quality === "premium") setPricePerUnit(45);
      else if (quality === "standard") setPricePerUnit(35);
      else setPricePerUnit(22);
    }
  };

  // Core Math Engine
  const calculations = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const dCount = parseInt(doors) || 0;
    const wCount = parseInt(windows) || 0;
    const cCount = parseInt(coats) || 1;

    // 1. Calculate Gross Area
    let wallArea = 2 * (l * h) + 2 * (w * h);
    let ceilingArea = includeCeiling ? (l * w) : 0;
    let grossArea = wallArea + ceilingArea;

    // 2. Standard Exclusions
    // Imperial: Door ~21 sq ft, Window ~15 sq ft
    // Metric: Door ~2 sq m, Window ~1.4 sq m
    const doorArea = system === "imperial" ? 21 : 2.0;
    const windowArea = system === "imperial" ? 15 : 1.4;
    
    const exclusionArea = (dCount * doorArea) + (wCount * windowArea);
    
    // 3. Net Paintable Area (clamp to 0 to prevent negative areas)
    let netArea = Math.max(0, grossArea - exclusionArea);

    // 4. Coverage Rates based on Quality
    // Imperial (sq ft per Gallon): Budget 300, Standard 350, Premium 400
    // Metric (sq m per Liter): Budget 8, Standard 10, Premium 12
    let coverageRate = 0;
    if (system === "imperial") {
      coverageRate = quality === "premium" ? 400 : quality === "standard" ? 350 : 300;
    } else {
      coverageRate = quality === "premium" ? 12 : quality === "standard" ? 10 : 8;
    }

    // 5. Volume Needed
    const totalAreaToPaint = netArea * cCount;
    const exactVolume = totalAreaToPaint > 0 ? (totalAreaToPaint / coverageRate) : 0;
    
    // Practical Buying Amount (Round up to nearest whole unit)
    const recommendedVolume = Math.ceil(exactVolume);

    // 6. Cost
    const estCost = recommendedVolume * (parseFloat(pricePerUnit) || 0);

    return {
      grossArea: parseFloat(grossArea.toFixed(1)),
      exclusionArea: parseFloat(exclusionArea.toFixed(1)),
      netArea: parseFloat(netArea.toFixed(1)),
      exactVolume: parseFloat(exactVolume.toFixed(2)),
      recommendedVolume,
      estCost: parseFloat(estCost.toFixed(2)),
      coverageRate,
      isInvalid: grossArea > 0 && netArea === 0
    };
  }, [length, width, height, includeCeiling, doors, windows, coats, quality, pricePerUnit, system]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl shadow-inner">
            <PaintRoller className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Paint Quantity Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Contractor-Grade Estimations & Exclusions
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            {/* System Toggle */}
            <div className="flex justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button onClick={() => handleSystemChange("imperial")} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${system === "imperial" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500"}`}>US (Feet / Gallon)</button>
                <button onClick={() => handleSystemChange("metric")} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${system === "metric" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500"}`}>Metric (Meters / Liter)</button>
              </div>
            </div>

            {/* Room Dimensions */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between pb-4">
                <span className="flex items-center gap-1.5"><Ruler className="w-4 h-4 text-blue-500" /> Room Dimensions</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">In {system === "imperial" ? "Feet (ft)" : "Meters (m)"}</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Length</label>
                  <input
                    type="number" min="1" value={length} onChange={(e) => setLength(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Width</label>
                  <input
                    type="number" min="1" value={width} onChange={(e) => setWidth(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Height</label>
                  <input
                    type="number" min="1" value={height} onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors text-center"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  includeCeiling ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                }`}>
                  <input type="checkbox" checked={includeCeiling} onChange={(e) => setIncludeCeiling(e.target.checked)} className="mt-0.5 accent-blue-600 w-4 h-4" />
                  <div>
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">Include Ceiling</span>
                    <span className="block text-[10px] font-medium text-slate-500">Adds ceiling area to the total calculation</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Smart Exclusions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between pb-4 pt-4">
                <span className="flex items-center gap-1.5"><DoorOpen className="w-4 h-4 text-indigo-500" /> Exclusions</span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">Don't buy extra paint</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Doors</span>
                  <input
                    type="number" min="0" value={doors} onChange={(e) => setDoors(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-center font-black outline-none"
                  />
                </div>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Windows</span>
                  <input
                    type="number" min="0" value={windows} onChange={(e) => setWindows(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-center font-black outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Paint Specifications */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pb-4 pt-4">
                <Droplet className="w-4 h-4 text-blue-500" /> Paint Specifications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">No. of Coats</label>
                  <input
                    type="number" min="1" max="5" value={coats} onChange={(e) => setCoats(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-sm font-black text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 text-center"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Paint Quality</label>
                  <select
                    value={quality} onChange={(e) => handleQualityChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="premium">Premium (High Coverage)</option>
                    <option value="standard">Standard / Average</option>
                    <option value="budget">Budget (Low Coverage)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex justify-between">
                    <span>Price / {system === "imperial" ? "Gal" : "Ltr"}</span>
                  </label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-blue-500 transition-colors">
                    <span className="shrink-0 w-8 text-center font-bold text-slate-400 text-sm">{currency}</span>
                    <input
                      type="number" min="0" step="1" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)}
                      className="w-full bg-transparent px-2 py-3 text-sm font-black text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden flex flex-col min-h-[500px]">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${calculations.isInvalid ? 'from-rose-400 to-red-500' : 'from-blue-400 to-indigo-500'}`}></div>
            
            <div className="flex items-center justify-between mb-6 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                <Calculator className="w-3.5 h-3.5 text-blue-500" /> Estimation Dashboard
              </span>
            </div>
            
            {/* Warning if Exclusions > Gross Area */}
            {calculations.isInvalid && (
              <div className="p-4 mb-6 bg-rose-50 border border-rose-200 dark:bg-rose-900/10 dark:border-rose-900/50 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="text-xs font-bold text-rose-700 dark:text-rose-400">
                  Your doors and windows take up more space than the actual walls! Please check your measurements.
                </p>
              </div>
            )}

            {/* Volume Needed */}
            <div className="text-center mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Recommended to Buy</span>
              <div className="flex justify-center items-end gap-2">
                <span className="text-6xl lg:text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                  {calculations.recommendedVolume}
                </span>
                <span className="text-lg font-bold text-slate-400 mb-2 uppercase">{system === "imperial" ? "Gallons" : "Liters"}</span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 mt-2 block">
                Exact calculated volume: {calculations.exactVolume} {system === "imperial" ? "Gal" : "Ltr"}
              </span>
            </div>

            {/* Estimated Cost */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-blue-200 dark:border-blue-900/50 shadow-sm text-center mb-6 animate-in zoom-in-95">
              <DollarSign className="w-5 h-5 mx-auto text-emerald-500 mb-2" />
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Estimated Paint Cost</span>
              <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {currency}{calculations.estCost.toLocaleString("en-US", {minimumFractionDigits: 2})}
              </span>
            </div>

            {/* Surface Area Breakdown */}
            <div className="space-y-3 mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Area Breakdown</h4>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Surface Area</span>
                <span className="text-sm font-black text-slate-700 dark:text-slate-300">{calculations.grossArea} {system === "imperial" ? "sq ft" : "m²"}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 shadow-sm">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Total Exclusions</span>
                <span className="text-sm font-black text-rose-700 dark:text-rose-400">- {calculations.exclusionArea} {system === "imperial" ? "sq ft" : "m²"}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 shadow-sm">
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Net Paintable Area</span>
                <span className="text-sm font-black text-blue-700 dark:text-blue-400">{calculations.netArea} {system === "imperial" ? "sq ft" : "m²"}</span>
              </div>
            </div>

            {/* Info Tip */}
            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed pr-2">
                  Based on <strong>{calculations.coverageRate} {system === "imperial" ? "sq ft/gal" : "m²/liter"}</strong> coverage for {quality} quality paint. Porous surfaces like new drywall may require an additional coat of primer.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}