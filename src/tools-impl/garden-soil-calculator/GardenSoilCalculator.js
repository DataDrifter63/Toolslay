"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Sprout, Calculator, Truck, ShoppingBag, 
  Layers, Droplet, CheckCircle2, AlertCircle, 
  Info, Leaf, Circle, Square
} from "lucide-react";

export default function GardenSoilCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Localization & System
  const [system, setSystem] = useState("imperial"); // imperial (ft/in/yd) or metric (m/cm/m3)
  const [currency, setCurrency] = useState("$");

  // Dimensions
  const [shape, setShape] = useState("rectangle"); // rectangle, round
  const [length, setLength] = useState(8); // feet or meters
  const [width, setWidth] = useState(4); // feet or meters
  const [diameter, setDiameter] = useState(3); // feet or meters
  const [depth, setDepth] = useState(6); // INCHES or CM (because depth is usually shallow)

  // Advanced Options
  const [includeSettling, setIncludeSettling] = useState(true);
  const [soilMix, setSoilMix] = useState("standard"); // standard, raised_bed

  // Pricing (Defaults set for US Market)
  const [bagPrice, setBagPrice] = useState(5.50);
  const [bagSize, setBagSize] = useState(1.5); // cu ft or 40 Liters
  const [bulkPrice, setBulkPrice] = useState(45.00); // per yard or m3
  const [bulkDeliveryFee, setBulkDeliveryFee] = useState(75.00);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handlers
  const handleSystemChange = (newSystem) => {
    if (newSystem === system) return;
    setSystem(newSystem);
    
    if (newSystem === "metric") {
      setCurrency("£");
      setLength(2.5); // ~8ft
      setWidth(1.2); // ~4ft
      setDiameter(1.0); // ~3ft
      setDepth(15); // ~6 inches to 15cm
      setBagSize(40); // 40 Liters standard metric bag
      setBagPrice(6.00);
      setBulkPrice(50.00);
      setBulkDeliveryFee(60.00);
    } else {
      setCurrency("$");
      setLength(8);
      setWidth(4);
      setDiameter(3);
      setDepth(6);
      setBagSize(1.5); // 1.5 cu ft standard US bag
      setBagPrice(5.50);
      setBulkPrice(45.00);
      setBulkDeliveryFee(75.00);
    }
  };

  // Core Landscaping Engine
  const calculations = useMemo(() => {
    // 1. Normalize depth to base unit (feet or meters)
    let depthInBase = 0;
    if (system === "imperial") {
      depthInBase = (parseFloat(depth) || 0) / 12; // inches to feet
    } else {
      depthInBase = (parseFloat(depth) || 0) / 100; // cm to meters
    }

    // 2. Calculate Base Volume
    let baseVolume = 0;
    if (shape === "rectangle") {
      const l = parseFloat(length) || 0;
      const w = parseFloat(width) || 0;
      baseVolume = l * w * depthInBase;
    } else {
      const d = parseFloat(diameter) || 0;
      const r = d / 2;
      baseVolume = Math.PI * (r * r) * depthInBase;
    }

    // 3. Apply Compaction / Settling (15% waste factor for soil)
    const settlingMultiplier = includeSettling ? 1.15 : 1.0;
    const finalVolumeBase = baseVolume * settlingMultiplier; // cubic feet OR cubic meters

    // 4. Conversions & Standardizations
    let totalYards = 0;
    let totalCubicFeet = 0;
    let totalCubicMeters = 0;
    let totalLiters = 0;

    if (system === "imperial") {
      totalCubicFeet = finalVolumeBase;
      totalYards = finalVolumeBase / 27; // 27 cu ft in a cubic yard
    } else {
      totalCubicMeters = finalVolumeBase;
      totalLiters = finalVolumeBase * 1000;
    }

    // 5. Bag vs Bulk Estimator
    let bagsNeeded = 0;
    if (system === "imperial") {
      bagsNeeded = Math.ceil(totalCubicFeet / (parseFloat(bagSize) || 1.5));
    } else {
      bagsNeeded = Math.ceil(totalLiters / (parseFloat(bagSize) || 40));
    }

    const bagTotalCost = bagsNeeded * (parseFloat(bagPrice) || 0);
    
    let bulkTotalCost = 0;
    let yardsOrM3Needed = 0;
    if (system === "imperial") {
      yardsOrM3Needed = Math.max(0.5, Math.ceil(totalYards * 2) / 2); // Bulk usually sold in 0.5 yard increments
    } else {
      yardsOrM3Needed = Math.max(0.5, Math.ceil(totalCubicMeters * 2) / 2);
    }
    
    // Add delivery fee only if bulk volume > 0
    bulkTotalCost = yardsOrM3Needed > 0 ? (yardsOrM3Needed * (parseFloat(bulkPrice) || 0)) + (parseFloat(bulkDeliveryFee) || 0) : 0;

    // Recommendation Engine
    let recommendedMethod = bagTotalCost < bulkTotalCost ? "Bags" : "Bulk";
    let savings = Math.abs(bagTotalCost - bulkTotalCost);
    if (bagsNeeded > 20) recommendedMethod = "Bulk"; // Nobody wants to carry 20+ bags even if slightly cheaper

    // 6. Pro Mix Breakdown (60% Topsoil, 30% Compost, 10% Aeration)
    const mix = {
      topsoil: finalVolumeBase * 0.60,
      compost: finalVolumeBase * 0.30,
      aeration: finalVolumeBase * 0.10
    };

    return {
      totalCubicFeet: parseFloat(totalCubicFeet.toFixed(1)),
      totalYards: parseFloat(totalYards.toFixed(2)),
      totalCubicMeters: parseFloat(totalCubicMeters.toFixed(2)),
      totalLiters: parseFloat(totalLiters.toFixed(0)),
      bagsNeeded,
      bagTotalCost,
      bulkTotalCost,
      yardsOrM3Needed,
      recommendedMethod,
      savings,
      mix,
      isZero: finalVolumeBase === 0
    };
  }, [shape, length, width, diameter, depth, includeSettling, system, bagSize, bagPrice, bulkPrice, bulkDeliveryFee]);

  const formatMoney = (val) => val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatVol = (val) => val.toLocaleString("en-US", { maximumFractionDigits: 1 });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-xl shadow-inner">
            <Sprout className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Garden Soil Volume Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Bag vs. Bulk Estimator & Raised Bed Mix Planner
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            {/* System Toggle & Shape */}
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button onClick={() => setShape("rectangle")} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${shape === "rectangle" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500"}`}>
                  <Square className="w-3.5 h-3.5" /> Rect
                </button>
                <button onClick={() => setShape("round")} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${shape === "round" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500"}`}>
                  <Circle className="w-3.5 h-3.5" /> Round
                </button>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button onClick={() => handleSystemChange("imperial")} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${system === "imperial" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500"}`}>Imperial</button>
                <button onClick={() => handleSystemChange("metric")} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${system === "metric" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500"}`}>Metric</button>
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between pb-4">
                <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-emerald-500" /> Bed Dimensions</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {shape === "rectangle" ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Length</label>
                      <div className="relative">
                        <input type="number" min="0" step="0.5" value={length} onChange={(e) => setLength(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors pr-8" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{system === "imperial" ? "FT" : "M"}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Width</label>
                      <div className="relative">
                        <input type="number" min="0" step="0.5" value={width} onChange={(e) => setWidth(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors pr-8" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{system === "imperial" ? "FT" : "M"}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Diameter (Width across)</label>
                    <div className="relative">
                      <input type="number" min="0" step="0.5" value={diameter} onChange={(e) => setDiameter(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors pr-8" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{system === "imperial" ? "FT" : "M"}</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Soil Depth</label>
                  <div className="relative">
                    <input type="number" min="0" step="0.5" value={depth} onChange={(e) => setDepth(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors pr-12" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 px-1 rounded">{system === "imperial" ? "INCH" : "CM"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                includeSettling ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              }`}>
                <input type="checkbox" checked={includeSettling} onChange={(e) => setIncludeSettling(e.target.checked)} className="mt-1 accent-emerald-600 w-4 h-4" />
                <div>
                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">Include Settling (15%)</span>
                  <span className="block text-[10px] font-medium text-slate-500 mt-0.5">Soil compacts after watering. Buy extra.</span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                soilMix === "raised_bed" ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              }`}>
                <input type="checkbox" checked={soilMix === "raised_bed"} onChange={(e) => setSoilMix(e.target.checked ? "raised_bed" : "standard")} className="mt-1 accent-emerald-600 w-4 h-4" />
                <div>
                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">Raised Bed Mix</span>
                  <span className="block text-[10px] font-medium text-slate-500 mt-0.5">Splits total into Soil, Compost & Aeration.</span>
                </div>
              </label>
            </div>

            {/* Local Market Pricing */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between pb-4 pt-2">
                <span className="flex items-center gap-1.5"><ShoppingBag className="w-4 h-4 text-emerald-500" /> Local Pricing (Optional)</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase pl-1">Bag Vol ({system === "imperial" ? "cu ft" : "L"})</label>
                  <input type="number" min="0.1" step="0.1" value={bagSize} onChange={(e) => setBagSize(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm font-bold outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase pl-1">Price/Bag</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{currency}</span>
                    <input type="number" min="0" step="0.5" value={bagPrice} onChange={(e) => setBagPrice(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-2 py-2 text-sm font-bold outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase pl-1">Price/{system === "imperial" ? "Yard" : "m³"}</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{currency}</span>
                    <input type="number" min="0" step="1" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-2 py-2 text-sm font-bold outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase pl-1">Bulk Delivery Fee</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{currency}</span>
                    <input type="number" min="0" step="1" value={bulkDeliveryFee} onChange={(e) => setBulkDeliveryFee(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-2 py-2 text-sm font-bold outline-none focus:border-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden flex flex-col min-h-[600px]">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${calculations.isZero ? 'from-slate-400 to-slate-500' : 'from-emerald-400 to-teal-500'}`}></div>
            
            <div className="flex items-center justify-between mb-8 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                <Calculator className="w-3.5 h-3.5 text-emerald-500" /> Soil Requirements
              </span>
            </div>
            
            {/* Primary Result */}
            <div className="text-center mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Total Volume Required</span>
              
              {system === "imperial" ? (
                <>
                  <div className="flex justify-center items-end gap-2">
                    <span className="text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                      {calculations.totalCubicFeet}
                    </span>
                    <span className="text-lg font-bold text-slate-400 mb-2 uppercase">Cubic Ft.</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-2 block bg-emerald-50 dark:bg-emerald-900/10 py-1 rounded w-fit mx-auto px-3 border border-emerald-100 dark:border-emerald-900/30">
                    Or {calculations.totalYards} Cubic Yards
                  </span>
                </>
              ) : (
                <>
                  <div className="flex justify-center items-end gap-2">
                    <span className="text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                      {calculations.totalLiters}
                    </span>
                    <span className="text-lg font-bold text-slate-400 mb-2 uppercase">Liters</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-2 block bg-emerald-50 dark:bg-emerald-900/10 py-1 rounded w-fit mx-auto px-3 border border-emerald-100 dark:border-emerald-900/30">
                    Or {calculations.totalCubicMeters} Cubic Meters (m³)
                  </span>
                </>
              )}
            </div>

            {/* Bag vs Bulk Recommendation */}
            {!calculations.isZero && (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Buy Recommendation</h4>
                  <span className="text-[9px] font-black uppercase bg-slate-800 text-white px-2 py-0.5 rounded">
                    Cheapest: {calculations.recommendedMethod}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border ${calculations.recommendedMethod === "Bags" ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700"}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShoppingBag className={`w-4 h-4 ${calculations.recommendedMethod === "Bags" ? "text-emerald-600" : "text-slate-400"}`} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Bagged</span>
                    </div>
                    <span className="block text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.bagsNeeded} Bags</span>
                    <span className="text-[10px] font-bold text-slate-500">Total: {currency}{formatMoney(calculations.bagTotalCost)}</span>
                  </div>
                  
                  <div className={`p-3 rounded-lg border ${calculations.recommendedMethod === "Bulk" ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700"}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Truck className={`w-4 h-4 ${calculations.recommendedMethod === "Bulk" ? "text-emerald-600" : "text-slate-400"}`} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Bulk Load</span>
                    </div>
                    <span className="block text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.yardsOrM3Needed} {system === "imperial" ? "Yards" : "m³"}</span>
                    <span className="text-[10px] font-bold text-slate-500">Total: {currency}{formatMoney(calculations.bulkTotalCost)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pro Mix Breakdown */}
            {soilMix === "raised_bed" && !calculations.isZero && (
              <div className="space-y-2 mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Pro Raised Bed Recipe</h4>
                
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">60% Topsoil</span>
                  <span className="text-xs font-black text-amber-700 dark:text-amber-400">{formatVol(calculations.mix.topsoil)} {system === "imperial" ? "cu ft" : "L"}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                  <span className="text-xs font-bold text-green-800 dark:text-green-300">30% Compost</span>
                  <span className="text-xs font-black text-green-700 dark:text-green-400">{formatVol(calculations.mix.compost)} {system === "imperial" ? "cu ft" : "L"}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/30">
                  <span className="text-xs font-bold text-sky-800 dark:text-sky-300">10% Aeration (Perlite/Peat)</span>
                  <span className="text-xs font-black text-sky-700 dark:text-sky-400">{formatVol(calculations.mix.aeration)} {system === "imperial" ? "cu ft" : "L"}</span>
                </div>
              </div>
            )}

            {/* Smart Tips */}
            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed pr-2">
                  {calculations.recommendedMethod === "Bulk" && calculations.bagsNeeded > 20
                    ? "Buying more than 20 bags means hauling heavy loads and generating massive plastic waste. A bulk delivery is highly recommended for this size!"
                    : "For small amounts, bagged soil is often sterilized and weed-free. Bulk soil is cheaper but may contain weed seeds. Always check your bulk supplier's reviews."}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}