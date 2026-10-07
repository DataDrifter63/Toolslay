"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Calculator, Dog, Activity, HeartPulse, 
  Info, Calendar, ArrowRight, ShieldCheck, 
  Bone, AlertCircle
} from "lucide-react";

const SIZES = [
  { id: "small", name: "Small", weight: "Under 20 lbs", examples: "Chihuahua, Pomeranian", multiplier: 4 },
  { id: "medium", name: "Medium", weight: "21 - 50 lbs", examples: "Beagle, Bulldog", multiplier: 5 },
  { id: "large", name: "Large", weight: "51 - 100 lbs", examples: "Golden Retriever, Lab", multiplier: 6 },
  { id: "giant", name: "Giant", weight: "Over 100 lbs", examples: "Great Dane, Mastiff", multiplier: 7 }
];

const LIFE_STAGES = [
  { maxHumanAge: 14, stage: "Puppy", color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30", border: "border-emerald-200 dark:border-emerald-800", tip: "Focus on foundational training, socialization, and high-protein puppy food for rapid growth." },
  { maxHumanAge: 29, stage: "Young Adult", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-200 dark:border-blue-800", tip: "Peak physical energy. Ensure regular vigorous exercise and transition to adult maintenance diet." },
  { maxHumanAge: 55, stage: "Adult", color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30", border: "border-indigo-200 dark:border-indigo-800", tip: "Monitor weight carefully. Metabolism slows down, so adjust food intake and maintain routine dental care." },
  { maxHumanAge: 75, stage: "Senior", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-800", tip: "Switch to a senior diet. Consider joint supplements (Glucosamine) and schedule bi-annual vet checkups." },
  { maxHumanAge: 999, stage: "Geriatric", color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-900/30", border: "border-rose-200 dark:border-rose-800", tip: "Prioritize comfort and accessibility. Watch for cognitive changes, and keep exercise gentle and low-impact." }
];

export default function DogAgeCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [dogName, setDogName] = useState("");
  const [years, setYears] = useState(2);
  const [months, setMonths] = useState(0);
  const [selectedSize, setSelectedSize] = useState(SIZES[1]); // Default Medium

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Advanced AKC Standard Calculation Logic
  const humanAge = useMemo(() => {
    const totalDogYears = Number(years) + (Number(months) / 12);
    if (totalDogYears <= 0) return 0;

    let calculatedHumanAge = 0;

    // Year 1: Rapid maturation (15 human years)
    if (totalDogYears <= 1) {
      calculatedHumanAge = totalDogYears * 15;
    } 
    // Year 2: Matures another 9 years (Total 24 human years)
    else if (totalDogYears <= 2) {
      calculatedHumanAge = 15 + ((totalDogYears - 1) * 9);
    } 
    // Years 3+: Aging depends strictly on breed size
    else {
      const baseAge = 24; // Age at 2 years
      const remainingYears = totalDogYears - 2;
      calculatedHumanAge = baseAge + (remainingYears * selectedSize.multiplier);
    }

    return parseFloat(calculatedHumanAge.toFixed(1));
  }, [years, months, selectedSize]);

  // Determine Life Stage based on Human Age Equivalent
  const currentStage = useMemo(() => {
    if (humanAge === 0) return LIFE_STAGES[0];
    return LIFE_STAGES.find(s => humanAge <= s.maxHumanAge) || LIFE_STAGES[LIFE_STAGES.length - 1];
  }, [humanAge]);

  // Progress Bar Calculation (Maxed at 100 human years for visual scale)
  const progressPercent = Math.min((humanAge / 100) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-xl shadow-inner">
            <Calculator className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Dog Age to Human Years
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Veterinary Standard Size-Based Calculator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
          
          {/* Pet Details */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Dog className="w-4 h-4 text-amber-500" /> Dog's Profile
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Dog's Name (Optional)</label>
                <input
                  type="text"
                  value={dogName}
                  onChange={(e) => setDogName(e.target.value)}
                  placeholder="e.g. Max, Bella"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Years</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={years}
                    onChange={(e) => setYears(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Months</label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={months}
                    onChange={(e) => setMonths(Math.min(11, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Activity className="w-4 h-4 text-amber-500" /> Breed Size
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SIZES.map((size) => (
                <div
                  key={size.id}
                  onClick={() => setSelectedSize(size)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedSize.id === size.id
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-500 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-extrabold ${selectedSize.id === size.id ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {size.name}
                    </span>
                    {selectedSize.id === size.id && <ShieldCheck className="w-4 h-4 text-amber-500" />}
                  </div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {size.weight}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                    e.g. {size.examples}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 flex gap-3 items-start">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
                <strong>Why size matters:</strong> Small dogs mature faster initially but age slower in later years. Large and giant breeds age much faster after their second year.
              </p>
            </div>
          </div>

        </div>

        {/* ================= RIGHT: RESULT PANEL ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-inner text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
            
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              {dogName ? `${dogName}'s Human Age` : "Calculated Human Age"}
            </h3>
            
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <span className="text-6xl md:text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                {humanAge}
              </span>
              <span className="text-xl font-bold text-slate-400">Years</span>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border ${currentStage.bg} ${currentStage.border} ${currentStage.color} text-xs font-black uppercase tracking-widest shadow-sm`}>
              <HeartPulse className="w-4 h-4" /> {currentStage.stage} Stage
            </div>

            {/* Visual Milestone Timeline */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                <span>0</span>
                <span>Life Journey</span>
                <span>100+</span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Actionable Health Insight */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Bone className="w-4 h-4 text-amber-500" /> Veterinary Care Advice
            </h3>
            
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentStage.tip}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}