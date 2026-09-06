"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Droplet, Activity, Sun, GlassWater, Clock, Info, Minus, Plus } from "lucide-react";

// ✅ 100% Safe Top-Level Component (Fixes the Next.js Object Error)
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
    <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500 transition-shadow">
      <button onClick={handleDec} className="p-4 text-slate-500 hover:text-cyan-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
        <Minus className="w-4 h-4" />
      </button>
      <input 
        type="number" 
        value={value} 
        onChange={handleChange}
        className="w-full text-center text-xl font-bold bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
      />
      <button onClick={handleInc} className="p-4 text-slate-500 hover:text-cyan-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
        <Plus className="w-4 h-4" />
      </button>
      {unit && <span className="pr-4 font-black text-slate-400 select-none uppercase text-xs tracking-widest">{unit}</span>}
    </div>
  );
};

const WaterIntakeCalculator = () => {
  const [isMounted, setIsMounted] = useState(false);
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

  const getFormat = (ml) => {
    return system === "metric" 
      ? `${(ml / 1000).toFixed(1)} L` 
      : `${Math.round(ml / 29.5735)} oz`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Droplet className="w-6 h-6 text-cyan-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Smart Hydration Engine</h2>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={() => handleSystemSwitch("metric")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${system === 'metric' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-500'}`}>Metric (kg/ml)</button>
          <button onClick={() => handleSystemSwitch("imperial")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${system === 'imperial' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-500'}`}>Imperial (lbs/oz)</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-xl shadow-sm space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  Body Weight
                </label>
                {system === 'metric' ? (
                  <StepperInput value={weightKg} min={20} max={300} onChange={setWeightKg} unit="kg" />
                ) : (
                  <StepperInput value={weightLbs} min={40} max={600} onChange={setWeightLbs} unit="lbs" />
                )}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-500"/> Daily Exercise
                </label>
                <StepperInput value={exerciseMins} min={0} max={300} onChange={setExerciseMins} unit="mins" step={15} />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500"/> Local Climate
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'normal', label: 'Normal', desc: 'Moderate' },
                    { id: 'hot', label: 'Hot', desc: 'Summer/Sunny' },
                    { id: 'extreme', label: 'Extreme', desc: 'Humid/Very Hot' }
                  ].map((c) => (
                    <button 
                      key={c.id}
                      onClick={() => setClimate(c.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${climate === c.id ? 'bg-cyan-50 border-cyan-300 text-cyan-700 dark:bg-cyan-900/30 dark:border-cyan-700 dark:text-cyan-400 scale-[1.02] shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 hover:border-cyan-200'}`}
                    >
                      <span className="font-black text-sm">{c.label}</span>
                      <span className="text-[10px] uppercase font-bold opacity-70 mt-1">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Maternal Health (Optional)</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full text-sm font-bold p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-100 cursor-pointer appearance-none">
                  <option value="none">Not Applicable</option>
                  <option value="pregnant">Pregnant (+300 ml)</option>
                  <option value="breastfeeding">Breastfeeding (+700 ml)</option>
                </select>
              </div>
            </div>

            <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg flex items-start gap-3 border border-sky-100 dark:border-sky-800/50">
              <Info className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-sky-700 dark:text-sky-300 leading-relaxed">
                Coffee, tea, and alcohol are diuretics and don't count fully towards your hydration. If you consume them, consider adding an extra glass of water to offset the loss.
              </p>
            </div>

          </div>
        </div>

        <div className="flex flex-col gap-6 h-full sticky top-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm text-center relative overflow-hidden">
             
             <div className="z-10 relative">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Daily Target Intake</h3>
               <div className="text-6xl md:text-7xl font-black tracking-tighter text-cyan-400 mb-2 drop-shadow-md">
                 {isMounted && results.targetMl > 0 ? (system === 'metric' ? (results.targetMl / 1000).toFixed(1) : results.targetOz) : "0"}
               </div>
               <div className="text-sm font-semibold text-cyan-500/80 uppercase tracking-widest">
                 {system === 'metric' ? "Liters per day" : "Ounces per day"}
               </div>
             </div>

             <div className="mt-8 pt-6 border-t border-slate-800">
               <div className="flex items-center justify-center gap-2 mb-3">
                   <GlassWater className="w-5 h-5 text-slate-400"/>
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visual Equivalent</h4>
               </div>
               <div className="text-2xl font-black text-white">
                 ~{isMounted ? results.glasses : 0} Glasses
               </div>
               <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Based on standard 250ml (8oz) cup</div>
               
               <div className="flex flex-wrap justify-center gap-1 mt-4">
                 {Array.from({ length: Math.min(results.glasses, 30) }).map((_, i) => (
                   <div key={i} className="w-3 h-4 bg-cyan-500/20 border border-cyan-500/50 rounded-sm"></div>
                 ))}
                 {results.glasses > 30 && <span className="text-xs text-cyan-500 font-bold ml-1">+</span>}
               </div>
             </div>
          </div>

          {results.targetMl > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Optimal Hydration Schedule</h3>
              </div>
              <p className="text-[11px] text-slate-500 mb-5 font-bold leading-relaxed">
                Avoid chugging water all at once. Spread your intake to maintain energy levels and prevent hyponatremia.
              </p>

              <div className="space-y-3">
                 <div className="flex justify-between items-center p-3 rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/30">
                     <div className="flex flex-col">
                         <span className="text-xs font-black text-sky-700 dark:text-sky-400 uppercase">Morning - Lunch</span>
                         <span className="text-[10px] font-bold text-slate-400">40% of Daily Intake</span>
                     </div>
                     <span className="text-lg font-black text-sky-600 dark:text-sky-300">
                        {isMounted ? getFormat(results.schedule.morning) : "0"}
                     </span>
                 </div>
                 
                 <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                     <div className="flex flex-col">
                         <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase">Lunch - Dinner</span>
                         <span className="text-[10px] font-bold text-slate-400">40% of Daily Intake</span>
                     </div>
                     <span className="text-lg font-black text-blue-600 dark:text-blue-300">
                        {isMounted ? getFormat(results.schedule.afternoon) : "0"}
                     </span>
                 </div>
                 
                 <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
                     <div className="flex flex-col">
                         <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase">Evening - Bed</span>
                         <span className="text-[10px] font-bold text-slate-400">20% (Minimize night trips)</span>
                     </div>
                     <span className="text-lg font-black text-indigo-600 dark:text-indigo-300">
                        {isMounted ? getFormat(results.schedule.evening) : "0"}
                     </span>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ STRICT EXPORT (Solves Object Error)
export default WaterIntakeCalculator;