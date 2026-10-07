"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Flame, Clock, Scale, Activity, TrendingUp,
  AlertCircle, ShieldCheck, HeartPulse, Info,
  Monitor, Calendar
} from "lucide-react";

// Lucide React doesn't have a specific 'PersonStanding' or 'PersonSitting' in all older versions,
// so using Monitor (Desk) and Activity (Standing) as semantic equivalents.

export default function StandingVsSittingCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [weight, setWeight] = useState(70);
  const [unit, setUnit] = useState("kg");
  const [totalHours, setTotalHours] = useState(8);
  const [standingHours, setStandingHours] = useState(3.5); // Default split

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scientific Calorie Burn Engine (Using MET values)
  const calculations = useMemo(() => {
    const weightNum = parseFloat(weight) || 0;
    if (weightNum <= 0 || totalHours <= 0) {
      return { sittingCals: 0, standingCals: 0, total: 0, extraCals: 0, yearlyFatLbs: 0 };
    }

    const weightKg = unit === "lbs" ? weightNum / 2.20462 : weightNum;
    
    // Ensure standing hours don't exceed total hours if total hours changes
    const actualStandingHours = Math.min(standingHours, totalHours);
    const sittingHours = totalHours - actualStandingHours;

    // MET Values
    const MET_SITTING = 1.3;
    const MET_STANDING = 1.8;

    // Formula: (MET * Weight in kg * 3.5) / 200 = Calories per minute
    // Multiply by 60 for Calories per hour
    const hourlySitting = ((MET_SITTING * weightKg * 3.5) / 200) * 60;
    const hourlyStanding = ((MET_STANDING * weightKg * 3.5) / 200) * 60;

    const sittingCals = hourlySitting * sittingHours;
    const standingCals = hourlyStanding * actualStandingHours;
    
    const totalCals = sittingCals + standingCals;
    
    // Baseline: If they sat the ENTIRE time
    const baselineCals = hourlySitting * totalHours;
    const extraCals = totalCals - baselineCals;

    // Projection: 250 work days in a year. 3500 calories = ~1 lb of fat
    const yearlyExtraCals = extraCals * 250;
    const yearlyFatLbs = yearlyExtraCals / 3500;

    // Ergonomic Advice Logic
    let advice = {};
    if (actualStandingHours === 0) {
      advice = { type: "danger", title: "Sedentary Risk", text: "Sitting all day increases cardiovascular risks. Try adding just 30 mins of standing.", color: "rose" };
    } else if (sittingHours === 0) {
      advice = { type: "warning", title: "Joint Stress", text: "Standing all day without breaks can cause varicose veins and joint pain. Use an anti-fatigue mat.", color: "amber" };
    } else if (actualStandingHours / totalHours >= 0.3 && actualStandingHours / totalHours <= 0.6) {
      advice = { type: "optimal", title: "Perfect Balance", text: "Excellent sit-stand ratio! You're boosting metabolism without overstressing your joints.", color: "emerald" };
    } else {
      advice = { type: "info", title: "Good Effort", text: "Remember to shift your weight frequently while standing, and stretch when sitting.", color: "blue" };
    }

    return {
      sittingHours,
      standingHours: actualStandingHours,
      sittingCals: Math.round(sittingCals),
      standingCals: Math.round(standingCals),
      total: Math.round(totalCals),
      extraCals: Math.round(extraCals),
      yearlyFatLbs: yearlyFatLbs.toFixed(1),
      hourlySitting: Math.round(hourlySitting),
      hourlyStanding: Math.round(hourlyStanding),
      advice
    };
  }, [weight, unit, totalHours, standingHours]);

  // Adjust standing slider if total hours drops below current standing hours
  useEffect(() => {
    if (standingHours > totalHours) {
      setStandingHours(totalHours);
    }
  }, [totalHours, standingHours]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 dark:bg-teal-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-teal-100 dark:bg-teal-900/50 p-3 rounded-xl shadow-inner">
            <Activity className="w-7 h-7 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Standing vs Sitting Calorie Burn
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Workday Desk Ergonomics & Burn Calculator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            {/* User Body Profile */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Scale className="w-4 h-4 text-teal-500" /> Your Body Metrics
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center pl-1 pr-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Weight</label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                    <button onClick={() => setUnit("kg")} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${unit === "kg" ? "bg-white dark:bg-slate-700 text-teal-600 shadow-sm" : "text-slate-500"}`}>KG</button>
                    <button onClick={() => setUnit("lbs")} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${unit === "lbs" ? "bg-white dark:bg-slate-700 text-teal-600 shadow-sm" : "text-slate-500"}`}>LBS</button>
                  </div>
                </div>
                <input
                  type="number"
                  min="10"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            {/* Workday Planner */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Clock className="w-4 h-4 text-teal-500" /> Workday Planner
              </h3>
              
              <div className="space-y-6">
                {/* Total Hours Input */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Shift / Work Hours</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={totalHours}
                      onChange={(e) => setTotalHours(Math.max(1, Math.min(24, parseFloat(e.target.value) || 1)))}
                      className="w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-center text-sm font-black text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500"
                    />
                    <span className="text-xs font-bold text-slate-400">hrs</span>
                  </div>
                </div>

                {/* Sit vs Stand Split Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="text-left">
                      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1"><Monitor className="w-3.5 h-3.5"/> Sitting</span>
                      <span className="text-xl font-black text-slate-800 dark:text-slate-200">{calculations.sittingHours}h</span>
                    </div>
                    <div className="text-right">
                      <span className="flex items-center justify-end gap-1.5 text-[10px] font-black uppercase tracking-widest text-teal-500 mb-1"><Activity className="w-3.5 h-3.5"/> Standing</span>
                      <span className="text-xl font-black text-slate-800 dark:text-slate-200">{calculations.standingHours}h</span>
                    </div>
                  </div>
                  
                  <div className="relative pt-2 pb-6">
                    <input 
                      type="range" 
                      min="0" 
                      max={totalHours} 
                      step="0.5"
                      value={standingHours} 
                      onChange={(e) => setStandingHours(parseFloat(e.target.value))} 
                      className="w-full h-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg appearance-none cursor-pointer relative z-10"
                      style={{
                        background: `linear-gradient(to right, #6366f1 ${((totalHours - calculations.standingHours) / totalHours) * 100}%, #14b8a6 ${((totalHours - calculations.standingHours) / totalHours) * 100}%)`
                      }}
                    />
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 uppercase px-1">
                      <span>100% Sit</span>
                      <span>50/50 Split</span>
                      <span>100% Stand</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Science Tip */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 flex gap-3 items-start">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
                <strong>Did you know?</strong> Standing burns approximately 30-50% more calories than sitting because it constantly engages your core and leg muscles to maintain balance.
              </p>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-inner text-center relative overflow-hidden">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-500`}></div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" /> Total Workday Burn
            </div>
            
            <div className="flex flex-col items-center justify-center mb-6">
              <span className="text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                {calculations.total}
              </span>
              <span className="text-lg font-bold text-slate-400 uppercase tracking-widest mt-1">kcal</span>
            </div>

            {/* Extra Burn Context */}
            {calculations.extraCals > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl flex items-center justify-between text-left shadow-sm">
                <div>
                  <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">+{calculations.extraCals} kcal</span>
                  <span className="text-[10px] font-bold text-emerald-700/70 dark:text-emerald-400/70 uppercase tracking-widest">Extra vs 100% Sitting</span>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-300 dark:text-emerald-700 opacity-50" />
              </div>
            )}
          </div>

          {/* Long Term Projection */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Calendar className="w-4 h-4 text-teal-500" /> Yearly Projection (250 Days)
            </h3>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div>
                <span className="block text-sm font-bold text-slate-600 dark:text-slate-300">Potential Fat Loss</span>
                <span className="text-[10px] font-medium text-slate-400">Just from standing at work</span>
              </div>
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{calculations.yearlyFatLbs} <span className="text-sm">lbs</span></span>
            </div>
          </div>

          {/* Dynamic Ergonomic Advice */}
          {calculations.advice && (
            <div className={`p-5 rounded-2xl border flex items-start gap-3 shadow-sm ${
              calculations.advice.color === 'emerald' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300' :
              calculations.advice.color === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300' :
              calculations.advice.color === 'rose' ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300' :
              'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
            }`}>
              {calculations.advice.color === 'emerald' ? <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" /> : 
               calculations.advice.color === 'blue' ? <HeartPulse className="w-5 h-5 shrink-0 mt-0.5" /> : 
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest mb-1">{calculations.advice.title}</h4>
                <p className="text-xs font-medium leading-relaxed opacity-90">{calculations.advice.text}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}