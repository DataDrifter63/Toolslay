"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Droplet, Activity, Sun, GlassWater, 
  Clock, Info, Minus, Plus, Copy, Check 
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

const WaterIntakeCalculator = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [system, setSystem] = useState("metric"); 

  // Core Inputs
  const [weightKg, setWeightKg] = useState(70);
  const [weightLbs, setWeightLbs] = useState(154);
  const [exerciseMins, setExerciseMins] = useState(30);

  // Advanced Factors
  const [climate, setClimate] = useState("normal"); 
  const [condition, setCondition] = useState("none"); 

  // Results
  const [results, setResults] = useState({
    targetMl: 0,
    targetOz: 0,
    glasses: 0, 
    schedule: {
      morning: 0,
      afternoon: 0,
      evening: 0
    }
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSystemSwitch = (newSystem) => {
    if (newSystem === "imperial" && system === "metric") {
      setWeightLbs(Math.round((Number(weightKg) || 0) * 2.20462));
    } else if (newSystem === "metric" && system === "imperial") {
      setWeightKg(Math.round((Number(weightLbs) || 0) / 2.20462));
    }
    setSystem(newSystem);
  };

  const calculateIntake = useCallback(() => {
    let wKg = system === "metric" ? (Number(weightKg) || 0) : (Number(weightLbs) || 0) / 2.20462;
    let exercise = Number(exerciseMins) || 0;

    if (wKg <= 0) return;

    let baseMl = wKg * 33;
    let exerciseAddition = (exercise / 30) * 350;
    let totalMl = baseMl + exerciseAddition;

    if (climate === "hot") totalMl *= 1.1; 
    else if (climate === "extreme") totalMl *= 1.2; 

    if (condition === "pregnant") totalMl += 300; 
    else if (condition === "breastfeeding") totalMl += 700;

    if (totalMl > 8000) totalMl = 8000;

    const totalOz = totalMl / 29.5735;
    const standardGlassMl = 250;

    setResults({
      targetMl: Math.round(totalMl),
      targetOz: Math.round(totalOz),
      glasses: Math.round(totalMl / standardGlassMl),
      schedule: {
        morning: Math.round(totalMl * 0.40), 
        afternoon: Math.round(totalMl * 0.40), 
        evening: Math.round(totalMl * 0.20) 
      }
    });

  }, [system, weightKg, weightLbs, exerciseMins, climate, condition]);

  useEffect(() => {
    calculateIntake();
  }, [calculateIntake]);

  const copyResult = async () => {
    if (results.targetMl <= 0) return;
    const targetFormatted = system === 'metric' ? `${(results.targetMl / 1000).toFixed(1)} Liters` : `${results.targetOz} oz`;
    const text = 
      `Smart Hydration Target Summary\n` +
      `Daily Target Intake: ${targetFormatted} (~${results.glasses} glasses)\n\n` +
      `Optimal Hydration Schedule:\n` +
      `- Morning - Lunch (40%): ${system === 'metric' ? `${(results.schedule.morning / 1000).toFixed(1)} L` : `${Math.round(results.schedule.morning / 29.5735)} oz`}\n` +
      `- Lunch - Dinner (40%): ${system === 'metric' ? `${(results.schedule.afternoon / 1000).toFixed(1)} L` : `${Math.round(results.schedule.afternoon / 29.5735)} oz`}\n` +
      `- Evening - Bed (20%): ${system === 'metric' ? `${(results.schedule.evening / 1000).toFixed(1)} L` : `${Math.round(results.schedule.evening / 29.5735)} oz`}`;

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

  const getFormat = (ml) => {
    return system === "metric" 
      ? `${(ml / 1000).toFixed(1)} L` 
      : `${Math.round(ml / 29.5735)} oz`;
  };

  const baseSelectStyle = "w-full min-w-0 h-11 md:h-12 pl-3 sm:pl-4 pr-10 bg-surface border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold cursor-pointer";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      
      {/* MAIN WRAPPER SHELL */}
      <div className="rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 min-w-0">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Droplet className="w-6 h-6 md:w-7 md:h-7 text-brand shrink-0" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink truncate">
              Smart Hydration Engine
            </h2>
          </div>
          <div className="flex bg-paper border border-line p-1 rounded-lg shrink-0">
            <button 
              type="button" 
              onClick={() => handleSystemSwitch("metric")} 
              className={`px-3 md:px-4 py-1.5 text-xs font-bold rounded-md transition-all ${system === 'metric' ? 'bg-surface text-brand shadow-sm border border-line' : 'text-muted'}`}
            >
              Metric (kg/ml)
            </button>
            <button 
              type="button" 
              onClick={() => handleSystemSwitch("imperial")} 
              className={`px-3 md:px-4 py-1.5 text-xs font-bold rounded-md transition-all ${system === 'imperial' ? 'bg-surface text-brand shadow-sm border border-line' : 'text-muted'}`}
            >
              Imperial (lbs/oz)
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] items-start gap-6 md:gap-8 min-w-0">
          
          {/* INPUT FORM PANEL */}
          <div className="flex flex-col gap-6 md:gap-8 min-w-0">
            <div className="bg-surface border border-line p-5 md:p-7 rounded-xl space-y-6 md:space-y-8 min-w-0">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 min-w-0">
                <div className="space-y-2 min-w-0">
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wide text-muted block truncate">
                    Body Weight
                  </label>
                  {system === 'metric' ? (
                    <StepperInput value={weightKg} min={20} max={300} onChange={setWeightKg} unit="kg" />
                  ) : (
                    <StepperInput value={weightLbs} min={40} max={600} onChange={setWeightLbs} unit="lbs" />
                  )}
                </div>

                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted truncate">
                    <Activity className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0"/> Daily Exercise
                  </label>
                  <StepperInput value={exerciseMins} min={0} max={300} onChange={setExerciseMins} unit="mins" step={15} />
                </div>
              </div>

              <div className="pt-6 border-t border-line space-y-6 min-w-0">
                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted truncate">
                    <Sun className="w-4 h-4 md:w-5 md:h-5 text-amber-500 shrink-0"/> Local Climate
                  </label>
                  <div className="grid grid-cols-3 gap-2.5 min-w-0">
                    {[
                      { id: 'normal', label: 'Normal', desc: 'Moderate' },
                      { id: 'hot', label: 'Hot', desc: 'Summer' },
                      { id: 'extreme', label: 'Extreme', desc: 'Humid' }
                    ].map((c) => {
                      const isActive = climate === c.id;
                      return (
                        <button 
                          key={c.id}
                          type="button"
                          onClick={() => setClimate(c.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                            isActive 
                              ? 'bg-brand/10 border-brand/30 text-brand shadow-sm' 
                              : 'bg-surface border-line text-muted hover:text-ink hover:border-brand/30'
                          }`}
                        >
                          <span className="font-bold text-xs sm:text-sm truncate">{c.label}</span>
                          <span className="text-[10px] uppercase font-semibold opacity-75 mt-0.5 truncate">{c.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wide text-muted block truncate">Maternal Health (Optional)</label>
                  <select value={condition} onChange={(e) => setCondition(e.target.value)} className={baseSelectStyle}>
                    <option value="none">Not Applicable</option>
                    <option value="pregnant">Pregnant (+300 ml)</option>
                    <option value="breastfeeding">Breastfeeding (+700 ml)</option>
                  </select>
                </div>
              </div>

              <div className="bg-paper p-4 rounded-lg flex items-start gap-3 border border-line">
                <Info className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-muted leading-relaxed">
                  Coffee, tea, and alcohol are diuretics and don't count fully towards your hydration. If you consume them, consider adding an extra glass of water to offset the loss.
                </p>
              </div>

            </div>
          </div>

          {/* OUTPUT DASHBOARD PANEL */}
          <div className="flex flex-col gap-6 h-full min-w-0">
            
            <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card text-center relative overflow-hidden min-w-0">
               <div className="flex items-center justify-between border-b border-line pb-4 mb-5 min-w-0">
                 <h3 className="text-base md:text-lg font-bold text-ink truncate">Hydration Target</h3>
                 <button
                   type="button"
                   onClick={copyResult}
                   className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border border-line bg-surface hover:bg-line text-ink text-xs font-semibold transition-colors shrink-0"
                 >
                   {copied ? <><Check className="w-3.5 h-3.5 text-teal" /> Copied</> : <><Copy className="w-3.5 h-3.5 text-muted" /> Copy</>}
                 </button>
               </div>
               
               <div className="z-10 relative my-3 min-w-0">
                 <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5 truncate">Daily Target Intake</h4>
                 <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-ink mb-2 truncate">
                   {isMounted && results.targetMl > 0 ? (system === 'metric' ? (results.targetMl / 1000).toFixed(1) : results.targetOz) : "0"} <span className="text-base sm:text-lg font-sans font-semibold text-muted">{system === 'metric' ? "L" : "oz"}</span>
                 </div>
                 <div className="text-xs font-semibold text-brand uppercase tracking-wider truncate">
                   {system === 'metric' ? "Liters per day" : "Ounces per day"}
                 </div>
               </div>

               <div className="mt-6 pt-5 border-t border-line min-w-0">
                 <div className="flex items-center justify-center gap-1.5 mb-2.5">
                     <GlassWater className="w-4 h-4 text-muted shrink-0"/>
                     <h4 className="text-xs font-bold text-muted uppercase tracking-widest truncate">Visual Equivalent</h4>
                 </div>
                 <div className="text-xl sm:text-2xl font-black text-ink truncate">
                   ~{isMounted ? results.glasses : 0} Glasses
                 </div>
                 <div className="text-[10px] font-bold text-muted uppercase mt-0.5 truncate">Based on standard 250ml (8oz) cup</div>
                 
                 <div className="flex flex-wrap justify-center gap-1 mt-4 min-w-0">
                   {Array.from({ length: Math.min(results.glasses, 30) }).map((_, i) => (
                     <div key={i} className="w-2.5 h-3.5 bg-brand/30 border border-brand/50 rounded-xs"></div>
                   ))}
                   {results.glasses > 30 && <span className="text-xs text-brand font-bold ml-1">+</span>}
                 </div>
               </div>
            </div>

            {results.targetMl > 0 && (
              <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card min-w-0">
                <div className="flex items-center gap-2 border-b border-line pb-3.5 mb-3 min-w-0">
                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0" />
                    <h3 className="text-sm md:text-base font-bold text-ink truncate">Optimal Hydration Schedule</h3>
                </div>
                <p className="text-xs text-muted mb-4 font-medium leading-relaxed">
                  Avoid chugging water all at once. Spread your intake to maintain energy levels and prevent hyponatremia.
                </p>

                <div className="space-y-2.5 min-w-0">
                   <div className="flex justify-between items-center p-3 rounded-lg bg-surface border border-line min-w-0">
                       <div className="flex flex-col min-w-0 pr-2">
                           <span className="text-xs font-black text-ink uppercase truncate">Morning - Lunch</span>
                           <span className="text-[10px] font-bold text-muted truncate">40% of Daily Intake</span>
                       </div>
                       <span className="text-base sm:text-lg font-black text-ink shrink-0">
                          {isMounted ? getFormat(results.schedule.morning) : "0"}
                       </span>
                   </div>
                   
                   <div className="flex justify-between items-center p-3 rounded-lg bg-surface border border-line min-w-0">
                       <div className="flex flex-col min-w-0 pr-2">
                           <span className="text-xs font-black text-ink uppercase truncate">Lunch - Dinner</span>
                           <span className="text-[10px] font-bold text-muted truncate">40% of Daily Intake</span>
                       </div>
                       <span className="text-base sm:text-lg font-black text-ink shrink-0">
                          {isMounted ? getFormat(results.schedule.afternoon) : "0"}
                       </span>
                   </div>
                   
                   <div className="flex justify-between items-center p-3 rounded-lg bg-surface border border-line min-w-0">
                       <div className="flex flex-col min-w-0 pr-2">
                           <span className="text-xs font-black text-ink uppercase truncate">Evening - Bed</span>
                           <span className="text-[10px] font-bold text-muted truncate">20% (Minimize night trips)</span>
                       </div>
                       <span className="text-base sm:text-lg font-black text-ink shrink-0">
                          {isMounted ? getFormat(results.schedule.evening) : "0"}
                       </span>
                   </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default WaterIntakeCalculator;