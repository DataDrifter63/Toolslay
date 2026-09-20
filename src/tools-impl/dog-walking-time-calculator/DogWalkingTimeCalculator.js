"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Clock, Activity, Thermometer, Heart, AlertTriangle, 
  Sun, Snowflake, Footprints, ShieldCheck, Info, CheckCircle2
} from "lucide-react";

const ENERGY_LEVELS = [
  { id: "low", name: "Low Energy / Toy", examples: "Pug, Bulldog, Shih Tzu", baseMinutes: 30, color: "bg-blue-100 text-blue-700 border-blue-500" },
  { id: "moderate", name: "Moderate Energy", examples: "Beagle, Poodle, Spaniel", baseMinutes: 60, color: "bg-emerald-100 text-emerald-700 border-emerald-500" },
  { id: "high", name: "High Energy / Working", examples: "Labrador, Golden, Boxer", baseMinutes: 90, color: "bg-amber-100 text-amber-700 border-amber-500" },
  { id: "extreme", name: "Extreme / Herding", examples: "Husky, Border Collie", baseMinutes: 120, color: "bg-rose-100 text-rose-700 border-rose-500" }
];

const HEALTH_STATUS = [
  { id: "healthy", label: "Healthy & Fit", multiplier: 1.0 },
  { id: "overweight", label: "Overweight", multiplier: 1.0 }, // Time same, but divided into more frequent short walks
  { id: "joint_issues", label: "Joint Issues / Arthritis", multiplier: 0.5 }
];

export default function DogWalkingTimeCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Inputs
  const [energyLevel, setEnergyLevel] = useState(ENERGY_LEVELS[1]);
  const [ageUnit, setAgeUnit] = useState("years");
  const [ageValue, setAgeValue] = useState(3);
  const [health, setHealth] = useState(HEALTH_STATUS[0]);
  const [temperature, setTemperature] = useState(20); // Celsius

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scientific Walk Calculation Engine
  const calculations = useMemo(() => {
    const age = parseInt(ageValue) || 0;
    if (age <= 0) return { totalMinutes: 0, warning: null, splits: [], intensity: "None" };

    let calculatedTime = energyLevel.baseMinutes;
    let warningMsg = null;
    let isPuppy = false;
    let isSenior = false;
    let splitCount = 2; // Default 2 walks (Morning/Evening)
    let intensity = "Brisk Walk";

    // 1. Age Modifier
    if (ageUnit === "months") {
      isPuppy = true;
      intensity = "Sniffari & Exploration (Gentle)";
      // The 5-minute rule for puppies: 5 mins per month of age, up to twice a day.
      const puppyTime = age * 5; 
      // Cap puppy time to the breed's standard base time
      calculatedTime = Math.min(puppyTime * 2, calculatedTime); 
    } else {
      // Senior Dog Modifier (7+ years generally)
      if (age >= 8) {
        isSenior = true;
        calculatedTime = calculatedTime * 0.6; // Reduce by 40%
        intensity = "Paced Walking (Let them sniff)";
      }
    }

    // 2. Health Modifier
    calculatedTime = calculatedTime * health.multiplier;
    if (health.id === "overweight") {
      splitCount = 3; // 3 shorter walks are better for weight loss
      intensity = "Steady Pace (Build stamina)";
    } else if (health.id === "joint_issues") {
      splitCount = 3;
      intensity = "Slow & Gentle (Avoid hills)";
    }

    // 3. Weather / Temperature Modifier (Crucial for safety)
    if (temperature > 30) {
      calculatedTime = 0;
      warningMsg = { type: "danger", text: "Too Hot! High risk of heatstroke and burned paws. Do not walk your dog. Opt for indoor mental stimulation." };
    } else if (temperature >= 26) {
      calculatedTime = calculatedTime * 0.5;
      warningMsg = { type: "warning", text: "Very Warm. Reduce walk time by 50%. Walk only early morning or late night." };
      intensity = "Slow pace in the shade";
    } else if (temperature >= 22) {
      calculatedTime = calculatedTime * 0.8;
      warningMsg = { type: "caution", text: "Warm. Bring water and take breaks. Check pavement heat with the back of your hand." };
    } else if (temperature < 0) {
      calculatedTime = calculatedTime * 0.6;
      warningMsg = { type: "cold", text: "Freezing. Protect paws from salt/ice. Consider a dog coat for short-haired breeds." };
    }

    // Rounding time to nearest 5
    calculatedTime = Math.round(calculatedTime / 5) * 5;

    // Calculate Splits
    let splits = [];
    if (calculatedTime > 0) {
      const perWalk = Math.round((calculatedTime / splitCount) / 5) * 5;
      if (splitCount === 3) {
        splits = [
          { label: "Morning", time: perWalk },
          { label: "Afternoon/Evening", time: perWalk },
          { label: "Night", time: calculatedTime - (perWalk * 2) }
        ];
      } else {
        splits = [
          { label: "Morning", time: perWalk },
          { label: "Evening", time: calculatedTime - perWalk }
        ];
      }
    }

    return {
      totalMinutes: calculatedTime,
      warning: warningMsg,
      splits: splits.filter(s => s.time > 0),
      intensity: intensity,
      isPuppy
    };

  }, [energyLevel, ageUnit, ageValue, health, temperature]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-xl shadow-inner">
            <Footprints className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Dog Walk Time Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Dynamic Activity & Safety Planner
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
          
          {/* Breed Energy Level */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Activity className="w-4 h-4 text-emerald-500" /> Breed Energy Group
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ENERGY_LEVELS.map((level) => (
                <div
                  key={level.id}
                  onClick={() => setEnergyLevel(level)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    energyLevel.id === level.id
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-extrabold ${energyLevel.id === level.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {level.name}
                    </span>
                    {energyLevel.id === level.id && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
                    e.g. {level.examples}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Age & Health */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Heart className="w-4 h-4 text-emerald-500" /> Age & Health Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center pl-1 pr-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age</label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                    <button onClick={() => setAgeUnit("months")} className={`px-2 py-1 text-[9px] font-bold rounded-md transition-colors ${ageUnit === "months" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500"}`}>Months</button>
                    <button onClick={() => setAgeUnit("years")} className={`px-2 py-1 text-[9px] font-bold rounded-md transition-colors ${ageUnit === "years" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500"}`}>Years</button>
                  </div>
                </div>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={ageValue}
                  onChange={(e) => setAgeValue(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Health Condition</label>
                <div className="space-y-2">
                  {HEALTH_STATUS.map(h => (
                    <button
                      key={h.id}
                      onClick={() => setHealth(h)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                        health.id === h.id
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300"
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current Weather / Temp */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <span className="flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-emerald-500" /> Current Temperature</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{temperature}°C</span>
            </h3>
            
            <div className="px-1">
              <input 
                type="range" 
                min="-10" 
                max="40" 
                value={temperature} 
                onChange={(e) => setTemperature(parseInt(e.target.value))} 
                className="w-full h-2 bg-gradient-to-r from-blue-300 via-emerald-400 to-rose-500 rounded-lg appearance-none cursor-pointer"
                style={{
                  accentColor: temperature > 30 ? '#ef4444' : temperature < 5 ? '#3b82f6' : '#10b981'
                }}
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 uppercase">
                <span className="flex items-center gap-1 text-blue-500"><Snowflake className="w-3 h-3"/> Freezing</span>
                <span className="text-emerald-500">Ideal</span>
                <span className="flex items-center gap-1 text-rose-500">Danger <Sun className="w-3 h-3"/></span>
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-inner text-center relative overflow-hidden">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500`}></div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
              <Clock className="w-3.5 h-3.5" /> Recommended Daily Total
            </div>
            
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className={`text-6xl font-black tracking-tighter ${calculations.totalMinutes === 0 ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>
                {calculations.totalMinutes}
              </span>
              <span className="text-xl font-bold text-slate-400">Mins / Day</span>
            </div>
            
            {calculations.isPuppy && (
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center justify-center gap-1">
                <Info className="w-3 h-3" /> Using "5-Minute Rule" for Puppies
              </p>
            )}

            {calculations.warning && (
              <div className={`mt-6 p-4 rounded-xl border text-left flex items-start gap-3 ${
                calculations.warning.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300' : 
                calculations.warning.type === 'cold' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' :
                'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300'
              }`}>
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs font-bold leading-relaxed">{calculations.warning.text}</p>
              </div>
            )}
          </div>

          {/* Walk Schedule & Intensity */}
          {calculations.totalMinutes > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <span className="flex items-center gap-1.5"><Footprints className="w-4 h-4 text-emerald-500" /> Walk Schedule Split</span>
              </h3>
              
              <div className="space-y-3">
                {calculations.splits.map((split, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {split.label}
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{split.time} mins</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Recommended Intensity</span>
                <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">{calculations.intensity}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}