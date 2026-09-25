"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  HeartPulse, Activity, Flame, Zap, 
  Target, Minus, Plus, Settings, Timer, 
  Copy, Check 
} from "lucide-react";

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
    <div className="flex items-center bg-surface border border-line rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand/25 transition-all h-12 md:h-14 min-w-0">
      <button 
        type="button" 
        onClick={handleDec} 
        className="w-12 h-full flex items-center justify-center text-muted hover:text-ink hover:bg-paper transition-colors text-lg shrink-0"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input 
        type="number" 
        value={value} 
        onChange={handleChange}
        className="w-full text-center text-base md:text-lg font-bold bg-transparent focus:outline-none text-ink [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0" 
      />
      <button 
        type="button" 
        onClick={handleInc} 
        className="w-12 h-full flex items-center justify-center text-muted hover:text-ink hover:bg-paper transition-colors text-lg shrink-0"
      >
        <Plus className="w-4 h-4" />
      </button>
      {unit && <span className="pr-4 font-bold text-muted select-none uppercase text-xs tracking-widest shrink-0">{unit}</span>}
    </div>
  );
};

const HeartRateZoneCalculator = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [copied, setCopied] = useState(false);

  // Core Inputs
  const [age, setAge] = useState(30);
  const [rhr, setRhr] = useState(60); 
  const [formula, setFormula] = useState("karvonen"); 
  const [goal, setGoal] = useState("fat-loss"); 

  // Results
  const [results, setResults] = useState({
    mhr: 179,
    hrr: 119,
    zones: [
      { id: 1, name: "Warm Up / Active Recovery", minPct: 50, maxPct: 60, minBpm: 120, maxBpm: 131, color: "slate", icon: Activity, desc: "Improves overall health & helps recovery." },
      { id: 2, name: "Fat Burn / Base Endurance", minPct: 60, maxPct: 70, minBpm: 132, maxBpm: 143, color: "sky", icon: Flame, desc: "Builds endurance. Burns fat as primary fuel." },
      { id: 3, name: "Aerobic / Cardio", minPct: 70, maxPct: 80, minBpm: 144, maxBpm: 155, color: "emerald", icon: HeartPulse, desc: "Improves blood circulation & aerobic capacity." },
      { id: 4, name: "Anaerobic / Hard", minPct: 80, maxPct: 90, minBpm: 156, maxBpm: 167, color: "amber", icon: Zap, desc: "Increases lactic acid tolerance & speed." },
      { id: 5, name: "VO2 Max / Peak", minPct: 90, maxPct: 100, minBpm: 168, maxBpm: 179, color: "rose", icon: Target, desc: "Develops max performance & speed (Short bursts)." }
    ]
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateZones = useCallback(() => {
    const currentAge = Number(age) || 0;
    const currentRhr = Number(rhr) || 0;

    if (currentAge <= 0) return;

    let mhr = 0;
    if (formula === "fox") {
      mhr = 220 - currentAge; 
    } else {
      mhr = 208 - (0.7 * currentAge); 
    }
    
    mhr = Math.round(mhr);
    const hrr = Math.max(0, mhr - currentRhr); 

    const getZoneBound = (percent) => {
      if (formula === "karvonen" && currentRhr > 0) {
        return Math.round((hrr * percent) + currentRhr);
      }
      return Math.round(mhr * percent);
    };

    const zonesData = [
      { id: 1, name: "Warm Up / Active Recovery", minPct: 50, maxPct: 60, minBpm: getZoneBound(0.50), maxBpm: getZoneBound(0.60), color: "slate", icon: Activity, desc: "Improves overall health & helps recovery." },
      { id: 2, name: "Fat Burn / Base Endurance", minPct: 60, maxPct: 70, minBpm: getZoneBound(0.60), maxBpm: getZoneBound(0.70), color: "sky", icon: Flame, desc: "Builds endurance. Burns fat as primary fuel." },
      { id: 3, name: "Aerobic / Cardio", minPct: 70, maxPct: 80, minBpm: getZoneBound(0.70), maxBpm: getZoneBound(0.80), color: "emerald", icon: HeartPulse, desc: "Improves blood circulation & aerobic capacity." },
      { id: 4, name: "Anaerobic / Hard", minPct: 80, maxPct: 90, minBpm: getZoneBound(0.80), maxBpm: getZoneBound(0.90), color: "amber", icon: Zap, desc: "Increases lactic acid tolerance & speed." },
      { id: 5, name: "VO2 Max / Peak", minPct: 90, maxPct: 100, minBpm: getZoneBound(0.90), maxBpm: getZoneBound(1.00), color: "rose", icon: Target, desc: "Develops max performance & speed (Short bursts)." }
    ];

    setResults({ mhr, hrr, zones: zonesData });
  }, [age, rhr, formula]);

  useEffect(() => {
    if (isMounted) {
      calculateZones();
    }
  }, [calculateZones, isMounted]);

  const copyResult = async () => {
    if (results.mhr <= 0) return;
    const zonesText = results.zones.map(z => `- Zone ${z.id} (${z.name}): ${z.minBpm}-${z.maxBpm} BPM (${z.minPct}-${z.maxPct}%)`).join('\n');
    const text = 
      `Heart Rate Training Zones Summary (${formula.toUpperCase()}, Goal: ${goal.toUpperCase()})\n` +
      `Max Heart Rate (MHR): ${results.mhr} BPM\n` +
      (formula === 'karvonen' ? `Heart Rate Reserve (HRR): ${results.hrr} BPM\n\n` : '\n') +
      `Training Zones:\n${zonesText}`;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }
    } catch (error) {
      setCopied(false);
    }
  };

  const getHighlightZone = () => {
    if (goal === "fat-loss") return 2;
    if (goal === "endurance") return 3;
    if (goal === "hiit") return 4;
    return 2;
  };

  const highlightId = getHighlightZone();
  const baseSelectStyle = "w-full min-w-0 h-11 md:h-12 pl-3 sm:pl-4 pr-10 bg-surface border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold cursor-pointer";

  // Prevent SSR/CSR text mismatch on dynamic values by rendering fallback or safe shell
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      <div className="rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 min-w-0">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <HeartPulse className="w-6 h-6 md:w-7 md:h-7 text-brand shrink-0" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink truncate">
              Pro HR Zone Engine
            </h2>
          </div>
          <button 
            type="button" 
            onClick={() => setShowAdvanced(!showAdvanced)} 
            className="flex items-center gap-2 text-xs md:text-sm font-semibold bg-paper border border-line text-ink px-3.5 py-2.5 rounded-lg hover:bg-brand/10 hover:border-brand/30 transition-colors whitespace-nowrap shrink-0"
          >
            <Settings className="w-4 h-4 text-brand shrink-0" /> {showAdvanced ? "Basic Mode" : "Pro Settings (Karvonen)"}
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] items-start gap-6 md:gap-8 min-w-0">
          
          {/* INPUT FORM PANEL */}
          <div className="flex flex-col gap-6 md:gap-8 min-w-0">
            <div className="bg-surface border border-line p-5 md:p-7 rounded-xl space-y-6 md:space-y-8 min-w-0">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 min-w-0">
                <div className="space-y-2 min-w-0">
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wide text-muted block truncate">
                    Age
                  </label>
                  <StepperInput value={age} min={10} max={100} onChange={setAge} unit="Yrs" />
                </div>

                <div className="space-y-2 min-w-0">
                  <div className="flex justify-between items-center min-w-0">
                    <label className="text-xs sm:text-sm font-bold uppercase tracking-wide text-muted truncate">Resting HR (RHR)</label>
                    <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-extrabold uppercase shrink-0">Crucial</span>
                  </div>
                  <StepperInput value={rhr} min={30} max={120} onChange={setRhr} unit="BPM" />
                </div>
              </div>

              <div className="pt-6 border-t border-line space-y-6 min-w-0">
                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted truncate">
                    <Target className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0"/> Primary Training Goal
                  </label>
                  <div className="grid grid-cols-3 gap-2.5 min-w-0">
                    {[
                      { id: 'fat-loss', label: 'Fat Loss', desc: 'Zone 2' },
                      { id: 'endurance', label: 'Endurance', desc: 'Zone 3' },
                      { id: 'hiit', label: 'HIIT / Peak', desc: 'Zone 4-5' }
                    ].map((g) => {
                      const isActive = goal === g.id;
                      return (
                        <button 
                          key={g.id}
                          type="button"
                          onClick={() => setGoal(g.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                            isActive 
                              ? 'bg-brand/10 border-brand/30 text-brand shadow-sm' 
                              : 'bg-surface border-line text-muted hover:text-ink hover:border-brand/30'
                          }`}
                        >
                          <span className="font-bold text-xs sm:text-sm truncate">{g.label}</span>
                          <span className="text-[10px] uppercase font-semibold opacity-75 mt-0.5 truncate">{g.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {showAdvanced && (
                <div className="pt-6 border-t border-line space-y-4 animate-in fade-in slide-in-from-top-2 min-w-0">
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wide text-muted block truncate">
                    Algorithm Engine
                  </label>
                  <select value={formula} onChange={(e) => setFormula(e.target.value)} className={baseSelectStyle}>
                    <option value="karvonen">Karvonen Method (Pro/Athlete - Uses RHR)</option>
                    <option value="tanaka">Tanaka Formula (Modern Standard)</option>
                    <option value="fox">Fox Formula (220 - Age, Outdated)</option>
                  </select>
                  {formula === "karvonen" && (
                      <p className="text-[11px] text-muted font-medium leading-relaxed">
                          The Karvonen formula calculates your <strong className="text-ink">Heart Rate Reserve ({isMounted ? results.hrr : '...'} BPM)</strong> by subtracting your resting heart rate from your max heart rate. This provides highly personalized training zones.
                      </p>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* OUTPUT DASHBOARD PANEL */}
          <div className="flex flex-col gap-6 h-full min-w-0">
            
            <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card text-center relative overflow-hidden min-w-0">
               <div className="flex items-center justify-between border-b border-line pb-4 mb-5 min-w-0">
                 <h3 className="text-base md:text-lg font-bold text-ink truncate">HRZ Projection</h3>
                 <button
                   type="button"
                   onClick={copyResult}
                   className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border border-line bg-surface hover:bg-line text-ink text-xs font-semibold transition-colors shrink-0"
                 >
                   {copied ? <><Check className="w-3.5 h-3.5 text-teal" /> Copied</> : <><Copy className="w-3.5 h-3.5 text-muted" /> Copy</>}
                 </button>
               </div>
               
               <div className="z-10 relative my-3 min-w-0">
                 <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5 truncate">Max Heart Rate (MHR)</h4>
                 <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-ink mb-2 truncate">
                   {results.mhr > 0 ? results.mhr : "0"} <span className="text-base sm:text-lg font-sans font-semibold text-muted">BPM</span>
                 </div>
                 <div className="text-xs font-semibold text-brand uppercase tracking-wider flex justify-center items-center gap-1.5 truncate">
                   Beats Per Minute <HeartPulse className="w-4 h-4 shrink-0 animate-pulse"/>
                 </div>
               </div>
            </div>

            <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card min-w-0">
              <div className="flex items-center gap-2 border-b border-line pb-3.5 mb-4 min-w-0">
                  <Timer className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0" />
                  <h3 className="text-sm md:text-base font-bold text-ink truncate">Your Personalized Zones</h3>
              </div>

              <div className="space-y-3 min-w-0">
                {results.zones.map((zone) => {
                  const isHighlight = zone.id === highlightId;
                  
                  const colorMap = {
                      slate: "bg-surface border-line text-muted",
                      sky: "bg-sky-500/10 border-sky-500/20 text-[#0284c7]",
                      emerald: "bg-teal/10 border-teal/20 text-teal",
                      amber: "bg-amber-500/10 border-amber-500/20 text-amber-600",
                      rose: "bg-[#fb7185]/10 border-[#fb7185]/20 text-[#e11d48]",
                  };

                  const activeMap = {
                      slate: "ring-2 ring-ink/30 shadow-sm",
                      sky: "ring-2 ring-[#0284c7]/50 shadow-sm",
                      emerald: "ring-2 ring-teal/50 shadow-sm",
                      amber: "ring-2 ring-amber-500/50 shadow-sm",
                      rose: "ring-2 ring-[#e11d48]/50 shadow-sm",
                  };

                  const Icon = zone.icon;

                  return (
                    <div key={zone.id} className={`flex flex-col p-3 rounded-lg border transition-all min-w-0 ${colorMap[zone.color]} ${isHighlight ? activeMap[zone.color] : ''}`}>
                        <div className="flex justify-between items-center mb-1 min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[10px] font-black uppercase tracking-wider opacity-80 shrink-0">Zone {zone.id}</span>
                                {isHighlight && <span className="text-[9px] bg-brand text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">Target Goal</span>}
                            </div>
                            <span className="text-xs font-bold opacity-80 shrink-0">{zone.minPct}% - {zone.maxPct}%</span>
                        </div>
                        
                        <div className="flex justify-between items-end min-w-0">
                            <div className="flex flex-col min-w-0 pr-2">
                                <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-ink truncate"><Icon className="w-4 h-4 shrink-0"/> <span className="truncate">{zone.name}</span></span>
                                <span className="text-[10px] font-medium text-muted mt-0.5 line-clamp-1">{zone.desc}</span>
                            </div>
                            <span className="text-base sm:text-lg font-black tracking-tight whitespace-nowrap text-ink shrink-0">
                                {zone.minBpm} - {zone.maxBpm} <span className="text-[10px] font-normal text-muted">BPM</span>
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
    </div>
  );
};

export default HeartRateZoneCalculator;