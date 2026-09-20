"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Snowflake, Thermometer, Box, Timer, AlertCircle, 
  Info, CheckCircle2, Droplets, Coffee, Bone, 
  Croissant, Apple, ShieldAlert
} from "lucide-react";

// Scientific Baseline Data (Approx Hours per Inch of thickness at -18°C)
const CATEGORIES = [
  { id: "meat", name: "Raw Meat & Poultry", icon: Bone, baseHrsPerInch: 4.5, shelfLife: "3 - 12 Months", desc: "Beef, Chicken, Fish, Pork" },
  { id: "liquid", name: "Soups & Liquids", icon: Droplets, baseHrsPerInch: 6.0, shelfLife: "2 - 3 Months", desc: "Broth, Sauces, Curries" },
  { id: "beverage", name: "Beverages (Cans/Bottles)", icon: Coffee, baseHrsPerInch: 3.0, shelfLife: "Not Recommended", desc: "Soda, Beer, Wine (Chill Mode)" },
  { id: "produce", name: "Fruits & Veggies", icon: Apple, baseHrsPerInch: 3.5, shelfLife: "8 - 12 Months", desc: "Berries, Peas, Blanched Veggies" },
  { id: "baked", name: "Baked Goods", icon: Croissant, baseHrsPerInch: 1.5, shelfLife: "3 - 6 Months", desc: "Bread, Muffins, Dough" }
];

const PACKAGING = [
  { id: "bare", name: "Bare / Uncovered", multiplier: 0.9, desc: "Fastest cooling, high risk of freezer burn" },
  { id: "ziploc", name: "Thin Plastic / Ziploc", multiplier: 1.0, desc: "Standard household freezing" },
  { id: "vacuum", name: "Vacuum Sealed", multiplier: 1.05, desc: "Best for longevity, slight insulation" },
  { id: "tupperware", name: "Thick Plastic Container", multiplier: 1.3, desc: "Slows freezing significantly" },
  { id: "glass", name: "Glass Jar", multiplier: 1.5, desc: "High insulation (Leave headspace for liquids!)" }
];

export default function FreezingTimeEstimator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [thickness, setThickness] = useState(2);
  const [sizeUnit, setSizeUnit] = useState("inch"); // inch or cm
  const [activePackaging, setActivePackaging] = useState(PACKAGING[1]);
  
  const [startTemp, setStartTemp] = useState("fridge"); // room or fridge
  const [freezerTemp, setFreezerTemp] = useState("standard"); // standard (-18C) or deep (-24C)

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Time Formatting Helper
  const formatTime = (decimalHours) => {
    if (decimalHours <= 0) return "0 mins";
    if (decimalHours < 1) return `${Math.round(decimalHours * 60)} mins`;
    
    const hrs = Math.floor(decimalHours);
    const mins = Math.round((decimalHours - hrs) * 60);
    
    if (mins === 0) return `${hrs} hrs`;
    return `${hrs}h ${mins}m`;
  };

  // Thermodynamic Engine
  const calculations = useMemo(() => {
    const val = parseFloat(thickness) || 0;
    if (val <= 0) return { freezeTimeHrs: 0, chillTimeHrs: 0, warnings: [] };

    // Normalize thickness to inches for base math
    const thicknessInches = sizeUnit === "cm" ? val / 2.54 : val;
    
    // Core physics approximation: Time scales roughly to the power of 1.5 of thickness 
    // due to surface area-to-volume ratios in typical household shapes.
    let freezeTime = activeCategory.baseHrsPerInch * Math.pow(thicknessInches, 1.5);

    // Apply Packaging Insulation Multiplier
    freezeTime *= activePackaging.multiplier;

    // Apply Starting Temp Multiplier (Room temp takes ~25% longer than chilled)
    if (startTemp === "room") freezeTime *= 1.25;

    // Apply Target Temp Multiplier (Deep freeze is ~15% faster)
    if (freezerTemp === "deep") freezeTime *= 0.85;

    // Chill Time (Time to reach ~3°C / Ice Cold but not frozen)
    // Usually about 15-20% of the total freezing time
    const chillTime = freezeTime * 0.18;

    // Warning System
    const warnings = [];
    if (activeCategory.id === "liquid" && activePackaging.id === "glass") {
      warnings.push({ type: "danger", text: "Liquids expand by 9% when freezing. Leave at least 1-2 inches of headspace or the glass WILL shatter!" });
    }
    if (activeCategory.id === "beverage") {
      warnings.push({ type: "warning", text: "Carbonated drinks and closed bottles will explode if left past the 'Ice Cold' phase. Set a timer!" });
    }
    if (thicknessInches > 4 && activeCategory.id === "meat") {
      warnings.push({ type: "info", text: "Pro Tip: Thick cuts take excessively long. Cut meat into smaller portions or flatten in a bag to freeze 50% faster." });
    }

    return {
      freezeTimeHrs: freezeTime,
      chillTimeHrs: chillTime,
      warnings
    };
  }, [activeCategory, thickness, sizeUnit, activePackaging, startTemp, freezerTemp]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 dark:bg-cyan-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-cyan-100 dark:bg-cyan-900/40 p-3 rounded-xl shadow-inner">
            <Snowflake className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Freezing Time Estimator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Thermodynamic Calculator & Beverage Chiller
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            {/* Category Selector */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Box className="w-4 h-4 text-cyan-500" /> Food Category
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat)}
                      className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col items-start gap-2 ${
                        activeCategory.id === cat.id
                          ? "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-500 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-cyan-300"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${activeCategory.id === cat.id ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                      <div>
                        <span className={`block text-xs font-black ${activeCategory.id === cat.id ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                          {cat.name}
                        </span>
                        <span className="block text-[9px] font-medium text-slate-400 mt-0.5 line-clamp-1">
                          {cat.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thickness Input */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <span className="flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-cyan-500" /> Thickest Part of Item</span>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                  <button onClick={() => setSizeUnit("inch")} className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition-colors ${sizeUnit === "inch" ? "bg-white dark:bg-slate-700 text-cyan-600 shadow-sm" : "text-slate-500"}`}>Inches</button>
                  <button onClick={() => setSizeUnit("cm")} className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition-colors ${sizeUnit === "cm" ? "bg-white dark:bg-slate-700 text-cyan-600 shadow-sm" : "text-slate-500"}`}>CM</button>
                </div>
              </h3>
              
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0.1" step="0.5"
                  value={thickness}
                  onChange={(e) => setThickness(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-2xl font-black text-slate-800 dark:text-slate-200 outline-none focus:border-cyan-500 transition-colors"
                />
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest w-16">
                  {sizeUnit === "inch" ? "Inches" : "CM"}
                </span>
              </div>
            </div>

            {/* Packaging & Environment Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Box className="w-3 h-3 text-cyan-500" /> Packaging Type
                </label>
                <select 
                  value={activePackaging.id}
                  onChange={(e) => setActivePackaging(PACKAGING.find(p => p.id === e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-cyan-500 transition-colors"
                >
                  {PACKAGING.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <p className="text-[9px] font-medium text-slate-500 pl-1">{activePackaging.desc}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    Starting Temp
                  </label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button onClick={() => setStartTemp("fridge")} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-colors ${startTemp === "fridge" ? "bg-white dark:bg-slate-700 text-cyan-600 shadow-sm" : "text-slate-500"}`}>Chilled (4°C)</button>
                    <button onClick={() => setStartTemp("room")} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-colors ${startTemp === "room" ? "bg-white dark:bg-slate-700 text-cyan-600 shadow-sm" : "text-slate-500"}`}>Room Temp</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    Freezer Type
                  </label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button onClick={() => setFreezerTemp("standard")} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-colors ${freezerTemp === "standard" ? "bg-white dark:bg-slate-700 text-cyan-600 shadow-sm" : "text-slate-500"}`}>Standard (-18°C)</button>
                    <button onClick={() => setFreezerTemp("deep")} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-colors ${freezerTemp === "deep" ? "bg-white dark:bg-slate-700 text-cyan-600 shadow-sm" : "text-slate-500"}`}>Deep (-24°C)</button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden flex flex-col">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500`}></div>
            
            <div className="flex items-center justify-between mb-8 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                <Timer className="w-3.5 h-3.5 text-cyan-500" /> Estimation Engine
              </span>
            </div>
            
            {/* Primary Result: Solid Freeze Time */}
            <div className="text-center mb-8 border-b border-slate-200 dark:border-slate-700 pb-8 relative">
              
              {activeCategory.id === "beverage" && (
                <div className="absolute top-0 right-0 left-0 -mt-2 mb-4 flex justify-center">
                   <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-rose-200 dark:border-rose-800/50 flex items-center gap-1 shadow-sm">
                     <ShieldAlert className="w-3 h-3" /> Explosion Risk Point
                   </span>
                </div>
              )}

              <span className={`block text-5xl lg:text-6xl font-black tracking-tighter mb-2 ${activeCategory.id === 'beverage' ? 'text-rose-500 mt-6' : 'text-slate-800 dark:text-slate-100'}`}>
                {formatTime(calculations.freezeTimeHrs)}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex justify-center items-center gap-1">
                <Snowflake className="w-3 h-3 text-cyan-400" /> 
                {activeCategory.id === "beverage" ? "Until Frozen Solid / Explodes" : "Until Frozen Solid Core"}
              </span>
            </div>

            {/* Sub Result: Quick Chill Mode */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-cyan-200 dark:border-cyan-900/50 shadow-sm text-center mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Thermometer className="w-16 h-16 text-cyan-500" />
              </div>
              <span className="block text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">
                Quick Chill Phase (Ice Cold)
              </span>
              <div className="flex justify-center items-end gap-2 mb-1 relative z-10">
                <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                  {formatTime(calculations.chillTimeHrs)}
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 max-w-[90%] mx-auto relative z-10">
                Time required to drop internal temp to ~3°C. Perfect for fast-cooling drinks or soups before storage.
              </p>
            </div>

            {/* Smart Warnings & Tips */}
            {calculations.warnings.length > 0 && (
              <div className="space-y-3 mb-6">
                {calculations.warnings.map((warn, i) => (
                  <div key={i} className={`p-3 rounded-xl border flex items-start gap-2 shadow-sm ${
                    warn.type === 'danger' ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-900/50' :
                    warn.type === 'warning' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/50' :
                    'bg-sky-50 border-sky-200 dark:bg-sky-900/10 dark:border-sky-900/50'
                  }`}>
                    {warn.type === 'danger' ? <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /> : 
                     warn.type === 'warning' ? <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> : 
                     <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />}
                    <p className={`text-xs font-bold leading-relaxed ${
                      warn.type === 'danger' ? 'text-rose-700 dark:text-rose-400' :
                      warn.type === 'warning' ? 'text-amber-700 dark:text-amber-400' :
                      'text-sky-700 dark:text-sky-400'
                    }`}>
                      {warn.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Shelf Life Analyzer */}
            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Optimal Shelf Life</h4>
                  <p className="text-[9px] font-medium text-slate-400">For best quality & taste (Safe indefinitely)</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className={`text-xs font-black ${activeCategory.id === 'beverage' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {activeCategory.shelfLife}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}