"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HeartPulse, Activity, Flame, Zap, Target, Minus, Plus, Settings, Timer } from "lucide-react";

// ✅ 100% Safe Top-Level Stepper Component
const StepperInput = ({ value, min, max, onChange, unit, step = 1 }) => {
  const handleDec = () => {
    let val = Number(value);
    if (isNaN(val)) val = min + step;
    if (val > min) onChange(val - step);
  };
  const handleInc = () => {
    let val = Number(value);
    if (isNaN(val)) val = min - step;
    if (val < max) onChange(val + step);
  };
  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '') onChange('');
    else onChange(Number(val));
  };

  return (
    <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-rose-500 transition-shadow">
      <button onClick={handleDec} className="p-4 text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
        <Minus className="w-4 h-4" />
      </button>
      <input 
        type="number" 
        value={value} 
        onChange={handleChange}
        className="w-full text-center text-xl font-bold bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
      />
      <button onClick={handleInc} className="p-4 text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
        <Plus className="w-4 h-4" />
      </button>
      {unit && <span className="pr-4 font-black text-slate-400 select-none uppercase text-xs tracking-widest">{unit}</span>}
    </div>
  );
};

const HeartRateZoneCalculator = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);

  // Core Inputs
  const [age, setAge] = useState(30);
  const [rhr, setRhr] = useState(60); // Resting Heart Rate
  const [formula, setFormula] = useState("karvonen"); // karvonen, tanaka, fox
  const [goal, setGoal] = useState("fat-loss"); // fat-loss, endurance, hiit

  // Results
  const [results, setResults] = useState({
    mhr: 0,
    hrr: 0,
    zones: []
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateZones = useCallback(() => {
    const currentAge = Number(age) || 0;
    const currentRhr = Number(rhr) || 0;

    if (currentAge <= 0) return;

    let mhr = 0;
    
    // Max Heart Rate (MHR) Calculation
    if (formula === "fox") {
      mhr = 220 - currentAge; // Standard old formula
    } else {
      mhr = 208 - (0.7 * currentAge); // Tanaka (More accurate)
    }
    
    mhr = Math.round(mhr);
    const hrr = Math.max(0, mhr - currentRhr); // Heart Rate Reserve

    // Function to calculate zone bounds
    const getZoneBound = (percent) => {
      if (formula === "karvonen" && currentRhr > 0) {
        return Math.round((hrr * percent) + currentRhr);
      }
      return Math.round(mhr * percent);
    };

    const zonesData = [
      {
        id: 1, name: "Warm Up / Active Recovery",
        minPct: 50, maxPct: 60,
        minBpm: getZoneBound(0.50), maxBpm: getZoneBound(0.60),
        color: "slate", icon: Activity,
        desc: "Improves overall health & helps recovery."
      },
      {
        id: 2, name: "Fat Burn / Base Endurance",
        minPct: 60, maxPct: 70,
        minBpm: getZoneBound(0.60), maxBpm: getZoneBound(0.70),
        color: "sky", icon: Flame,
        desc: "Builds endurance. Burns fat as primary fuel."
      },
      {
        id: 3, name: "Aerobic / Cardio",
        minPct: 70, maxPct: 80,
        minBpm: getZoneBound(0.70), maxBpm: getZoneBound(0.80),
        color: "emerald", icon: HeartPulse,
        desc: "Improves blood circulation & aerobic capacity."
      },
      {
        id: 4, name: "Anaerobic / Hard",
        minPct: 80, maxPct: 90,
        minBpm: getZoneBound(0.80), maxBpm: getZoneBound(0.90),
        color: "amber", icon: Zap,
        desc: "Increases lactic acid tolerance & speed."
      },
      {
        id: 5, name: "VO2 Max / Peak",
        minPct: 90, maxPct: 100,
        minBpm: getZoneBound(0.90), maxBpm: getZoneBound(1.00),
        color: "rose", icon: Target,
        desc: "Develops max performance & speed (Short bursts)."
      }
    ];

    setResults({ mhr, hrr, zones: zonesData });

  }, [age, rhr, formula]);

  useEffect(() => {
    calculateZones();
  }, [calculateZones]);

  // Determine Highlighted Zone based on Goal
  const getHighlightZone = () => {
    if (goal === "fat-loss") return 2;
    if (goal === "endurance") return 3;
    if (goal === "hiit") return 4;
    return 2;
  };

  const highlightId = getHighlightZone();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <HeartPulse className="w-6 h-6 text-rose-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Pro HR Zone Engine</h2>
        </div>
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 transition-colors">
          <Settings className="w-4 h-4" /> {showAdvanced ? "Basic Mode" : "Pro Settings (Karvonen)"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* Input Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-xl shadow-sm space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  Age
                </label>
                <StepperInput value={age} min={10} max={100} onChange={setAge} unit="Yrs" />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center justify-between">
                  <span>Resting HR (RHR)</span>
                  <span className="text-[9px] bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded">Crucial for Accuracy</span>
                </label>
                <StepperInput value={rhr} min={30} max={120} onChange={setRhr} unit="BPM" />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-500"/> Primary Training Goal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'fat-loss', label: 'Fat Loss', desc: 'Zone 2' },
                    { id: 'endurance', label: 'Endurance', desc: 'Zone 3' },
                    { id: 'hiit', label: 'HIIT / Peak', desc: 'Zone 4-5' }
                  ].map((g) => (
                    <button 
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${goal === g.id ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-400 scale-[1.02] shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 hover:border-rose-200'}`}
                    >
                      <span className="font-black text-sm">{g.label}</span>
                      <span className="text-[10px] uppercase font-bold opacity-70 mt-1">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {showAdvanced && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  Algorithm Engine
                </label>
                <select value={formula} onChange={(e) => setFormula(e.target.value)} className="w-full text-sm font-bold p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100 cursor-pointer appearance-none">
                  <option value="karvonen">Karvonen Method (Pro/Athlete - Uses RHR)</option>
                  <option value="tanaka">Tanaka Formula (Modern Standard)</option>
                  <option value="fox">Fox Formula (220 - Age, Outdated)</option>
                </select>
                {formula === "karvonen" && (
                    <p className="text-[11px] text-slate-500 font-medium">
                        The Karvonen formula calculates your <strong>Heart Rate Reserve ({results.hrr} BPM)</strong> by subtracting your resting heart rate from your max heart rate. This provides highly personalized training zones.
                    </p>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Output Dashboard */}
        <div className="flex flex-col gap-6 h-full sticky top-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm text-center relative overflow-hidden">
             
             <div className="z-10 relative">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Max Heart Rate (MHR)</h3>
               <div className="text-6xl md:text-7xl font-black tracking-tighter text-rose-500 mb-2 drop-shadow-md">
                 {isMounted && results.mhr > 0 ? results.mhr : "0"}
               </div>
               <div className="text-sm font-semibold text-rose-500/80 uppercase tracking-widest flex justify-center items-center gap-1">
                 Beats Per Minute <HeartPulse className="w-4 h-4 animate-pulse"/>
               </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Timer className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Your Personalized Zones</h3>
            </div>

            <div className="space-y-3">
              {results.zones.map((zone) => {
                const isHighlight = zone.id === highlightId;
                
                // Tailwind dynamic color classes workaround mapping
                const colorMap = {
                    slate: "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400",
                    sky: "bg-sky-50 dark:bg-sky-900/10 border-sky-200 dark:border-sky-900/50 text-sky-700 dark:text-sky-400",
                    emerald: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400",
                    amber: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400",
                    rose: "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400",
                };

                const activeMap = {
                    slate: "ring-2 ring-slate-400 shadow-md scale-[1.02]",
                    sky: "ring-2 ring-sky-400 shadow-md scale-[1.02]",
                    emerald: "ring-2 ring-emerald-400 shadow-md scale-[1.02]",
                    amber: "ring-2 ring-amber-400 shadow-md scale-[1.02]",
                    rose: "ring-2 ring-rose-400 shadow-md scale-[1.02]",
                };

                const Icon = zone.icon;

                return (
                  <div key={zone.id} className={`flex flex-col p-3 rounded-lg border transition-all ${colorMap[zone.color]} ${isHighlight ? activeMap[zone.color] : ''}`}>
                      <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Zone {zone.id}</span>
                              {isHighlight && <span className="text-[8px] bg-current text-white px-1.5 py-0.5 rounded-sm uppercase tracking-wider mix-blend-multiply dark:mix-blend-screen">Target Goal</span>}
                          </div>
                          <span className="text-xs font-bold opacity-80">{zone.minPct}% - {zone.maxPct}%</span>
                      </div>
                      
                      <div className="flex justify-between items-end">
                          <div className="flex flex-col">
                              <span className="font-black text-sm flex items-center gap-1.5"><Icon className="w-4 h-4"/> {zone.name}</span>
                              <span className="text-[10px] font-medium opacity-80 mt-0.5">{zone.desc}</span>
                          </div>
                          <span className="text-lg font-black tracking-tight whitespace-nowrap ml-2">
                              {isMounted ? `${zone.minBpm} - ${zone.maxBpm}` : "0 - 0"}
                          </span>
                      </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeartRateZoneCalculator;