"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Coffee, Droplets, Scale, Timer, Settings, 
  Activity, Info, FlaskConical, ChevronRight, CheckCircle2
} from "lucide-react";

// Professional Barista Standards Database
const BREW_METHODS = [
  { id: "pourover", name: "Pour Over (V60)", ratio: 16, grind: "Medium-Fine", time: "3 - 4 mins", temp: "92-96°C", icon: Droplets, desc: "Clean, clear, and highlights delicate flavor notes." },
  { id: "frenchpress", name: "French Press", ratio: 12, grind: "Coarse", time: "4 - 5 mins", temp: "93-96°C", icon: Coffee, desc: "Full-bodied, heavy, and rich coffee." },
  { id: "aeropress", name: "AeroPress", ratio: 11, grind: "Medium-Fine", time: "2 mins", temp: "85-92°C", icon: FlaskConical, desc: "Smooth, versatile, and concentrated." },
  { id: "espresso", name: "Espresso", ratio: 2, grind: "Extra Fine", time: "25 - 30 secs", temp: "90-96°C", icon: Settings, desc: "Intense, syrupy, and highly concentrated." },
  { id: "coldbrew", name: "Cold Brew", ratio: 8, grind: "Extra Coarse", time: "12 - 24 hrs", temp: "Cold/Room Temp", icon: Timer, desc: "Low acidity, smooth, sweet ready-to-drink brew." }
];

export default function CoffeeWaterRatioCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [activeMethod, setActiveMethod] = useState(BREW_METHODS[0]);
  const [waterUnit, setWaterUnit] = useState("cups"); // 'cups' or 'ml'
  const [waterValue, setWaterValue] = useState(1); // 1 cup = 250ml
  const [customRatio, setCustomRatio] = useState(BREW_METHODS[0].ratio);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync ratio when method changes
  useEffect(() => {
    setCustomRatio(activeMethod.ratio);
  }, [activeMethod]);

  // Core Math Engine
  const calculations = useMemo(() => {
    let waterMl = 0;
    const val = parseFloat(waterValue) || 0;

    if (waterUnit === "cups") {
      waterMl = val * 250; // Standard metric cup
    } else {
      waterMl = val; // Direct ML
    }

    // Safety checks
    if (waterMl <= 0 || customRatio <= 0) {
      return { coffeeG: 0, coffeeTbsp: 0, waterMl: 0, yieldMl: 0, strength: "Balanced" };
    }

    // Calculation: Coffee = Water / Ratio
    const coffeeGrams = waterMl / customRatio;
    
    // Roughly 1 rounded tablespoon of coffee is ~5.3 grams
    const coffeeTbsp = coffeeGrams / 5.3;

    // Absorption Physics: Coffee grounds retain ~2x their weight in water
    const retainedWater = coffeeGrams * 2;
    const liquidYield = Math.max(0, waterMl - retainedWater);

    // Determine Strength Profile
    let strengthStr = "Golden Ratio";
    const diff = customRatio - activeMethod.ratio;
    if (diff > 1.5) strengthStr = "Mild & Light";
    else if (diff < -1.5) strengthStr = "Strong & Bold";
    else if (diff < 0) strengthStr = "Slightly Strong";
    else if (diff > 0) strengthStr = "Slightly Mild";

    return {
      coffeeG: coffeeGrams.toFixed(1),
      coffeeTbsp: coffeeTbsp.toFixed(1),
      waterMl: waterMl.toFixed(0),
      yieldMl: liquidYield.toFixed(0),
      strength: strengthStr,
      retained: retainedWater.toFixed(0)
    };
  }, [waterValue, waterUnit, customRatio, activeMethod]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-900/10 dark:bg-amber-900/20 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-amber-100 dark:bg-[#3e2723] p-3 rounded-xl shadow-inner">
            <Coffee className="w-7 h-7 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Coffee Ratio Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Barista-Grade Measurements & Yield Estimation
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            {/* Brew Methods */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <FlaskConical className="w-4 h-4 text-amber-600" /> Select Brew Method
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BREW_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setActiveMethod(method)}
                      className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col items-start gap-2 ${
                        activeMethod.id === method.id
                          ? "bg-amber-50 dark:bg-[#3e2723]/30 border-amber-500 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-amber-300"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${activeMethod.id === method.id ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                      <div>
                        <span className={`block text-xs font-black ${activeMethod.id === method.id ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                          {method.name}
                        </span>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          1:{method.ratio} Ratio
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Amount */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4 text-amber-600" /> Amount of Water</span>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                  <button onClick={() => setWaterUnit("cups")} className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition-colors ${waterUnit === "cups" ? "bg-white dark:bg-slate-700 text-amber-600 shadow-sm" : "text-slate-500"}`}>Cups</button>
                  <button onClick={() => setWaterUnit("ml")} className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition-colors ${waterUnit === "ml" ? "bg-white dark:bg-slate-700 text-amber-600 shadow-sm" : "text-slate-500"}`}>Exact ML</button>
                </div>
              </h3>
              
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0.1"
                  step={waterUnit === "cups" ? "1" : "10"}
                  value={waterValue}
                  onChange={(e) => setWaterValue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-2xl font-black text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 transition-colors"
                />
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest w-16">
                  {waterUnit === "cups" ? "Cups" : "ML"}
                </span>
              </div>
              {waterUnit === "cups" && (
                <p className="text-[10px] font-medium text-slate-400 mt-2 ml-1">Assumes 1 standard metric cup = 250ml.</p>
              )}
            </div>

            {/* Strength Tuner (Ratio Slider) */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-amber-600" /> Fine-Tune Strength</span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  Ratio 1 : {customRatio}
                </span>
              </h3>
              
              <div className="px-1">
                <input
                  type="range"
                  min={Math.max(1, activeMethod.ratio - 5)}
                  max={activeMethod.ratio + 5}
                  step="0.5"
                  value={customRatio}
                  onChange={(e) => setCustomRatio(parseFloat(e.target.value))}
                  className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-600 border border-black/5 dark:border-white/5"
                />
                <div className="flex justify-between text-[9px] font-bold mt-2 uppercase tracking-widest">
                  <span className="text-slate-600 dark:text-slate-300">Stronger</span>
                  <span className="text-amber-500">Golden Range</span>
                  <span className="text-slate-400">Milder</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden flex flex-col min-h-[500px]">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600 to-[#3e2723]`}></div>
            
            <div className="flex items-center justify-between mb-8 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                <Scale className="w-3.5 h-3.5 text-amber-600" /> The Perfect Brew
              </span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                {calculations.strength}
              </span>
            </div>
            
            {/* Main Result: Coffee & Water */}
            <div className="grid grid-cols-2 gap-4 mb-8 border-b border-slate-200 dark:border-slate-700 pb-8">
              <div className="text-center">
                <span className="block text-4xl lg:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter mb-1">
                  {calculations.coffeeG}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-center items-center gap-1">
                  <Coffee className="w-3 h-3" /> Grams Coffee
                </span>
                <span className="block text-[9px] font-medium text-slate-400 mt-1">
                  ~ {calculations.coffeeTbsp} Tbsp
                </span>
              </div>
              <div className="text-center">
                <span className="block text-4xl lg:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter mb-1">
                  {calculations.waterMl}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-center items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-400" /> ML Water
                </span>
                <span className="block text-[9px] font-medium text-slate-400 mt-1">
                  (Poured over)
                </span>
              </div>
            </div>

            {/* Smart Yield Estimator */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Coffee className="w-16 h-16" />
              </div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Liquid Yield</span>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-black text-amber-600 dark:text-amber-500">{calculations.yieldMl}</span>
                <span className="text-sm font-bold text-slate-400 mb-1">ml in your cup</span>
              </div>
              <p className="text-[9px] font-medium text-slate-500 leading-relaxed max-w-[85%]">
                <Info className="w-3 h-3 inline mr-1 text-blue-400" />
                Coffee grounds absorb water. You poured {calculations.waterMl}ml, but the grounds held back ~{calculations.retained}ml!
              </p>
            </div>

            {/* Barista Guide for the Selected Method */}
            <div className="mt-auto pt-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-amber-600" /> {activeMethod.name} Guidelines
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Grind Size</span>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200">{activeMethod.grind}</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Brew Time</span>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200">{activeMethod.time}</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 col-span-2 flex justify-between items-center">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Water Temp</span>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1"><Activity className="w-3 h-3 text-rose-400"/> {activeMethod.temp}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}