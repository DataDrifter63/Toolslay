"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Calculator, Dog, Cat, Activity, Scale, 
  Utensils, HeartPulse, Info, Bone, AlertCircle
} from "lucide-react";

const SPECIES = [
  { id: "dog", name: "Dog", icon: Dog, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-500" },
  { id: "cat", name: "Cat", icon: Cat, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-500" }
];

const ACTIVITY_LEVELS = {
  dog: [
    { id: "weight_loss", label: "Needs Weight Loss", multiplier: 1.0, desc: "Overweight, strictly dieting." },
    { id: "neutered", label: "Neutered / Spayed Adult", multiplier: 1.6, desc: "Normal adult, fixed, standard activity." },
    { id: "intact", label: "Intact Adult", multiplier: 1.8, desc: "Not fixed, normal adult activity." },
    { id: "active", label: "Highly Active / Working", multiplier: 2.5, desc: "Farm dogs, hunting, intense sports." },
    { id: "puppy", label: "Growing Puppy", multiplier: 3.0, desc: "Under 4-6 months old, rapid growth." }
  ],
  cat: [
    { id: "weight_loss", label: "Needs Weight Loss", multiplier: 0.8, desc: "Overweight, strictly dieting." },
    { id: "neutered", label: "Neutered / Spayed Adult", multiplier: 1.2, desc: "Normal adult, fixed, indoor lifestyle." },
    { id: "intact", label: "Intact Adult", multiplier: 1.4, desc: "Not fixed, normal adult activity." },
    { id: "active", label: "Highly Active / Outdoor", multiplier: 1.6, desc: "Very active, spends time outdoors." },
    { id: "kitten", label: "Growing Kitten", multiplier: 2.5, desc: "Under 6 months old, rapid growth." }
  ]
};

export default function PetCalorieCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Inputs
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState(SPECIES[0]);
  const [weight, setWeight] = useState(10);
  const [unit, setUnit] = useState("lbs");
  const [activity, setActivity] = useState(ACTIVITY_LEVELS.dog[1]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update activity options when species changes
  useEffect(() => {
    setActivity(ACTIVITY_LEVELS[species.id][1]);
  }, [species]);

  // Scientific Calorie Calculations
  const calculations = useMemo(() => {
    const weightNum = parseFloat(weight) || 0;
    if (weightNum <= 0) return { rer: 0, total: 0, treats: 0, meals: 0 };

    // Convert to kg for medical formula
    const weightKg = unit === "lbs" ? weightNum / 2.20462 : weightNum;
    
    // Resting Energy Requirement (RER): 70 * (Weight in kg)^0.75
    const rer = 70 * Math.pow(weightKg, 0.75);
    
    // Maintenance Energy Requirement (MER)
    const totalDailyCalories = rer * activity.multiplier;

    // 10% Treat Rule
    const treatAllowance = totalDailyCalories * 0.10;
    const mealCalories = totalDailyCalories - treatAllowance;

    return {
      rer: Math.round(rer),
      total: Math.round(totalDailyCalories),
      treats: Math.round(treatAllowance),
      meals: Math.round(mealCalories)
    };
  }, [weight, unit, activity]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 dark:bg-teal-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-teal-100 dark:bg-teal-900/50 p-3 rounded-xl shadow-inner">
            <Utensils className="w-7 h-7 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Pet Calorie Needs Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Veterinary Standard RER & MER Formula
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
          
          {/* Pet Details */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <HeartPulse className="w-4 h-4 text-teal-500" /> Pet Profile
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Pet's Name</label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="e.g. Buddy, Luna"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Species</label>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIES.map((sp) => (
                    <button
                      key={sp.id}
                      onClick={() => setSpecies(sp)}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                        species.id === sp.id
                          ? `${sp.bg} ${sp.border} ${sp.color} shadow-sm`
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <sp.icon className="w-4 h-4" /> {sp.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Weight & Body Context */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Scale className="w-4 h-4 text-teal-500" /> Physical Metrics
            </h3>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1 pr-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Weight</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                  <button onClick={() => setUnit("lbs")} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${unit === "lbs" ? "bg-white dark:bg-slate-700 text-teal-600 shadow-sm" : "text-slate-500"}`}>LBS</button>
                  <button onClick={() => setUnit("kg")} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${unit === "kg" ? "bg-white dark:bg-slate-700 text-teal-600 shadow-sm" : "text-slate-500"}`}>KG</button>
                </div>
              </div>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          {/* Activity Level / Life Stage */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Activity className="w-4 h-4 text-teal-500" /> Activity Level & Life Stage
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {ACTIVITY_LEVELS[species.id].map((act) => (
                <div
                  key={act.id}
                  onClick={() => setActivity(act)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    activity.id === act.id
                      ? "bg-teal-50 dark:bg-teal-900/20 border-teal-500 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-teal-300"
                  }`}
                >
                  <div>
                    <span className={`block text-sm font-extrabold ${activity.id === act.id ? 'text-teal-700 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {act.label}
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {act.desc}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-black font-mono ${activity.id === act.id ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                    x{act.multiplier}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-inner text-center relative overflow-hidden">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-500`}></div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
              <Calculator className="w-3.5 h-3.5" /> Recommended Daily Target
            </div>
            
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                {calculations.total}
              </span>
              <span className="text-xl font-bold text-slate-400">kcal/day</span>
            </div>
            <p className="text-xs font-bold text-slate-500">For {petName || `your ${species.name}`}</p>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="text-left bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1"><HeartPulse className="w-3 h-3 text-rose-500" /> RER</span>
                <span className="text-lg font-black text-slate-700 dark:text-slate-200">{calculations.rer} <span className="text-[10px] font-bold text-slate-400">kcal</span></span>
                <p className="text-[9px] text-slate-500 leading-tight mt-1">Calories needed just to exist (resting).</p>
              </div>
              <div className="text-left bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1"><Bone className="w-3 h-3 text-amber-500" /> Max Treats</span>
                <span className="text-lg font-black text-slate-700 dark:text-slate-200">{calculations.treats} <span className="text-[10px] font-bold text-slate-400">kcal</span></span>
                <p className="text-[9px] text-slate-500 leading-tight mt-1">Strict 10% limit to prevent obesity.</p>
              </div>
            </div>
          </div>

          {/* Meal Splitting Guide */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <span className="flex items-center gap-1.5"><Utensils className="w-4 h-4 text-teal-500" /> Meal Portion Guide</span>
              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">Excludes Treats</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">2 Meals / Day</span>
                <span className="text-sm font-black text-teal-600 dark:text-teal-400">{Math.round(calculations.meals / 2)} kcal <span className="text-[10px] text-slate-400 font-bold">each</span></span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">3 Meals / Day</span>
                <span className="text-sm font-black text-teal-600 dark:text-teal-400">{Math.round(calculations.meals / 3)} kcal <span className="text-[10px] text-slate-400 font-bold">each</span></span>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-[10px] font-medium text-slate-500 leading-relaxed bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <p>Check your pet food's packaging to convert kcal into cups or grams. Every brand has a different caloric density (kcal/cup).</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}