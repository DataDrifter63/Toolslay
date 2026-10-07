"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Calculator, Cat, Activity, HeartPulse, 
  Info, ShieldCheck, AlertCircle, Home, Trees
} from "lucide-react";

const LIFE_STAGES = [
  { maxMonths: 6, stage: "Kitten", color: "text-pink-500", bg: "bg-pink-100 dark:bg-pink-900/30", border: "border-pink-200 dark:border-pink-800", tip: "Critical growth phase. Requires high-calorie kitten food, core vaccinations, and extensive socialization." },
  { maxMonths: 24, stage: "Junior", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-200 dark:border-purple-800", tip: "Full physical maturity. Transition to adult food and ensure regular playtime to burn off adolescent energy." },
  { maxMonths: 72, stage: "Prime", color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30", border: "border-indigo-200 dark:border-indigo-800", tip: "Peak health years. Focus on weight management, dental care, and routine annual vet exams." },
  { maxMonths: 120, stage: "Mature", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-200 dark:border-blue-800", tip: "Metabolism slows down. Monitor for early signs of kidney issues or arthritis. Adjust diet if gaining weight." },
  { maxMonths: 168, stage: "Senior", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-800", tip: "Schedule bi-annual vet visits. Screen for hyperthyroidism and chronic kidney disease. Keep food and litter boxes easily accessible." },
  { maxMonths: 9999, stage: "Geriatric", color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-900/30", border: "border-rose-200 dark:border-rose-800", tip: "Prioritize ultimate comfort. Watch for cognitive dysfunction and ensure they stay hydrated. Gentle grooming is appreciated." }
];

const ENVIRONMENTS = [
  { id: "indoor", name: "Strictly Indoor", icon: Home, advice: "Ensure plenty of environmental enrichment (scratching posts, interactive toys) to prevent obesity and boredom." },
  { id: "outdoor", name: "Outdoor / Mixed", icon: Trees, advice: "Requires strict adherence to flea/tick/heartworm prevention and regular checks for injuries or parasites." }
];

export default function CatAgeCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [catName, setCatName] = useState("");
  const [years, setYears] = useState(3);
  const [months, setMonths] = useState(0);
  const [environment, setEnvironment] = useState(ENVIRONMENTS[0]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scientific AAHA Feline Age Conversion
  const { humanAge, totalMonths } = useMemo(() => {
    const y = parseInt(years) || 0;
    const m = parseInt(months) || 0;
    const tMonths = y * 12 + m;

    if (tMonths === 0) return { humanAge: 0, totalMonths: 0 };

    let calcAge = 0;
    
    // Smooth interpolation for the first 2 years
    if (tMonths <= 1) {
      calcAge = tMonths; // 1 month = 1 human year
    } else if (tMonths <= 3) {
      calcAge = 1 + ((tMonths - 1) / 2) * 3; // 3 months = 4 human years
    } else if (tMonths <= 6) {
      calcAge = 4 + ((tMonths - 3) / 3) * 6; // 6 months = 10 human years
    } else if (tMonths <= 12) {
      calcAge = 10 + ((tMonths - 6) / 6) * 5; // 12 months = 15 human years
    } else if (tMonths <= 24) {
      calcAge = 15 + ((tMonths - 12) / 12) * 9; // 24 months = 24 human years
    } else {
      // After 2 years, every cat year = 4 human years
      calcAge = 24 + ((tMonths - 24) / 12) * 4;
    }

    return { 
      humanAge: parseFloat(calcAge.toFixed(1)), 
      totalMonths: tMonths 
    };
  }, [years, months]);

  // Determine Life Stage based on actual months
  const currentStage = useMemo(() => {
    if (totalMonths === 0) return LIFE_STAGES[0];
    return LIFE_STAGES.find(s => totalMonths <= s.maxMonths) || LIFE_STAGES[LIFE_STAGES.length - 1];
  }, [totalMonths]);

  // Visual scale capping around 100 human years for the progress bar
  const progressPercent = Math.min((humanAge / 100) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-xl shadow-inner">
            <Cat className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Cat Age to Human Years
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Scientific Feline Maturation Standard
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
              <Activity className="w-4 h-4 text-purple-500" /> Feline Profile
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Cat's Name (Optional)</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Luna, Oliver"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Years</label>
                  <input
                    type="number"
                    min="0"
                    max="35"
                    value={years}
                    onChange={(e) => setYears(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500 transition-colors"
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Environment Selector */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Home className="w-4 h-4 text-purple-500" /> Lifestyle & Environment
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ENVIRONMENTS.map((env) => (
                <div
                  key={env.id}
                  onClick={() => setEnvironment(env)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    environment.id === env.id
                      ? "bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-extrabold flex items-center gap-1.5 ${environment.id === env.id ? 'text-purple-700 dark:text-purple-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      <env.icon className="w-4 h-4" /> {env.name}
                    </span>
                    {environment.id === env.id && <ShieldCheck className="w-4 h-4 text-purple-500" />}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 flex gap-3 items-start">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
                <strong>Science Note:</strong> Cats mature incredibly fast. A 1-year-old cat is roughly equivalent to a 15-year-old human teenager!
              </p>
            </div>
          </div>

        </div>

        {/* ================= RIGHT: RESULT PANEL ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-inner text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-400 to-indigo-500"></div>
            
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              {catName ? `${catName}'s Human Age` : "Calculated Human Age"}
            </h3>
            
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <span className="text-6xl md:text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                {humanAge}
              </span>
              <span className="text-xl font-bold text-slate-400">Years</span>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border ${currentStage.bg} ${currentStage.border} ${currentStage.color} text-xs font-black uppercase tracking-widest shadow-sm`}>
              <HeartPulse className="w-4 h-4" /> {currentStage.stage} Phase
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
                  className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Actionable Health Insight */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4 space-y-4">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <HeartPulse className="w-4 h-4 text-purple-500" /> Life Stage Care Advice
              </h3>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentStage.tip}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-3.5 h-3.5" /> Environment Tip ({environment.name})
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                {environment.advice}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}