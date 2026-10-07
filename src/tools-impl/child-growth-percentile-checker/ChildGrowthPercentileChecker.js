"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Activity, Ruler, Weight, Baby, 
  TrendingUp, Stethoscope, Info,
  CheckCircle2, AlertCircle, ArrowRight
} from "lucide-react";

// WHO/CDC Approximate Growth Data (Mean and Standard Deviation)
// Key milestones: 0, 6, 12, 24, 36, 48, 60 months
const GROWTH_DATA = {
  boy: {
    weight: [
      { m: 0, mu: 3.3, sig: 0.5 }, { m: 6, mu: 7.9, sig: 0.9 },
      { m: 12, mu: 9.6, sig: 1.1 }, { m: 24, mu: 12.2, sig: 1.3 },
      { m: 36, mu: 14.3, sig: 1.5 }, { m: 48, mu: 16.3, sig: 1.7 },
      { m: 60, mu: 18.3, sig: 1.9 }
    ],
    height: [
      { m: 0, mu: 49.9, sig: 1.9 }, { m: 6, mu: 67.6, sig: 2.2 },
      { m: 12, mu: 75.7, sig: 2.6 }, { m: 24, mu: 87.8, sig: 3.2 },
      { m: 36, mu: 96.1, sig: 3.6 }, { m: 48, mu: 103.3, sig: 4.0 },
      { m: 60, mu: 110.0, sig: 4.3 }
    ]
  },
  girl: {
    weight: [
      { m: 0, mu: 3.2, sig: 0.5 }, { m: 6, mu: 7.3, sig: 0.8 },
      { m: 12, mu: 8.9, sig: 1.0 }, { m: 24, mu: 11.5, sig: 1.3 },
      { m: 36, mu: 13.9, sig: 1.6 }, { m: 48, mu: 16.1, sig: 1.8 },
      { m: 60, mu: 18.2, sig: 2.1 }
    ],
    height: [
      { m: 0, mu: 49.1, sig: 1.8 }, { m: 6, mu: 65.7, sig: 2.1 },
      { m: 12, mu: 74.0, sig: 2.5 }, { m: 24, mu: 86.4, sig: 3.1 },
      { m: 36, mu: 95.1, sig: 3.6 }, { m: 48, mu: 102.7, sig: 4.1 },
      { m: 60, mu: 109.4, sig: 4.5 }
    ]
  }
};

// Math: Error Function for Normal Distribution (Z-Score to Percentile)
const erf = (x) => {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
};

const zScoreToPercentile = (z) => {
  const prob = 0.5 * (1 + erf(z / Math.sqrt(2)));
  let percentile = Math.round(prob * 100);
  if (percentile <= 0) percentile = 1;
  if (percentile >= 100) percentile = 99;
  return percentile;
};

export default function GrowthPercentileChecker() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [system, setSystem] = useState("imperial"); // metric | imperial
  const [gender, setGender] = useState("boy"); // boy | girl
  const [ageYears, setAgeYears] = useState(2);
  const [ageMonths, setAgeMonths] = useState(6);
  
  // Inputs (Raw string to allow empty state editing)
  const [weightInput, setWeightInput] = useState("30"); // lbs default
  const [heightInput, setHeightInput] = useState("36"); // inches default

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // System Toggle Handler with Auto-Conversion
  const handleSystemChange = (newSys) => {
    if (newSys === system) return;
    let w = parseFloat(weightInput);
    let h = parseFloat(heightInput);
    
    if (newSys === "metric") {
      if (!isNaN(w)) setWeightInput((w * 0.453592).toFixed(1));
      if (!isNaN(h)) setHeightInput((h * 2.54).toFixed(1));
    } else {
      if (!isNaN(w)) setWeightInput((w / 0.453592).toFixed(1));
      if (!isNaN(h)) setHeightInput((h / 2.54).toFixed(1));
    }
    setSystem(newSys);
  };

  // Linear Interpolation helper to get exact Mean(mu) and StdDev(sig) for any month
  const interpolateLMS = (dataArr, targetMonth) => {
    targetMonth = Math.max(0, Math.min(60, targetMonth)); // Cap at 5 years (60m)
    for (let i = 0; i < dataArr.length - 1; i++) {
      if (targetMonth >= dataArr[i].m && targetMonth <= dataArr[i + 1].m) {
        const t = (targetMonth - dataArr[i].m) / (dataArr[i + 1].m - dataArr[i].m);
        const mu = dataArr[i].mu + t * (dataArr[i + 1].mu - dataArr[i].mu);
        const sig = dataArr[i].sig + t * (dataArr[i + 1].sig - dataArr[i].sig);
        return { mu, sig };
      }
    }
    return { mu: dataArr[dataArr.length-1].mu, sig: dataArr[dataArr.length-1].sig };
  };

  // Core Math Engine
  const calculations = useMemo(() => {
    const totalMonths = (parseInt(ageYears) || 0) * 12 + (parseInt(ageMonths) || 0);
    let w = parseFloat(weightInput) || 0;
    let h = parseFloat(heightInput) || 0;
    const isEmpty = w === 0 || h === 0;

    // Convert everything to Metric for internal calculations
    const weightKg = system === "imperial" ? w * 0.453592 : w;
    const heightCm = system === "imperial" ? h * 2.54 : h;

    // Get interpolated stats
    const weightStats = interpolateLMS(GROWTH_DATA[gender].weight, totalMonths);
    const heightStats = interpolateLMS(GROWTH_DATA[gender].height, totalMonths);

    // Calculate Z-Scores
    const weightZ = weightKg > 0 ? (weightKg - weightStats.mu) / weightStats.sig : 0;
    const heightZ = heightCm > 0 ? (heightCm - heightStats.mu) / heightStats.sig : 0;

    // Calculate Percentiles
    const weightPercentile = zScoreToPercentile(weightZ);
    const heightPercentile = zScoreToPercentile(heightZ);

    // Dynamic Suffix (st, nd, rd, th)
    const getSuffix = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };

    // UI Status Helpers
    const getStatus = (p) => {
      if (p < 5) return { label: "Underweight / Short", color: "text-amber-500", bar: "bg-amber-500" };
      if (p > 95) return { label: "Overweight / Tall", color: "text-purple-500", bar: "bg-purple-500" };
      return { label: "Healthy Range", color: "text-emerald-500", bar: "bg-emerald-500" };
    };

    return {
      isEmpty,
      totalMonths,
      weightPercentile,
      heightPercentile,
      weightSuffix: getSuffix(weightPercentile),
      heightSuffix: getSuffix(heightPercentile),
      weightStatus: getStatus(weightPercentile),
      heightStatus: getStatus(heightPercentile),
      avgWeight: system === "imperial" ? (weightStats.mu / 0.453592) : weightStats.mu,
      avgHeight: system === "imperial" ? (heightStats.mu / 2.54) : heightStats.mu
    };
  }, [system, gender, ageYears, ageMonths, weightInput, heightInput]);

  // Theme configuration based on gender
  const theme = gender === "boy" 
    ? { pri: "sky", bgLight: "bg-sky-50 dark:bg-sky-900/20", borderPri: "border-sky-500", textPri: "text-sky-600 dark:text-sky-400", bgPri: "bg-sky-500" }
    : { pri: "rose", bgLight: "bg-rose-50 dark:bg-rose-900/20", borderPri: "border-rose-500", textPri: "text-rose-600 dark:text-rose-400", bgPri: "bg-rose-500" };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500`}>
        <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-${theme.pri}-100 to-transparent dark:from-${theme.pri}-900/20 rounded-bl-full -z-10 opacity-70 transition-colors duration-500`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgLight} p-3.5 rounded-2xl transition-colors duration-500`}>
            <TrendingUp className={`w-6 h-6 ${theme.textPri}`} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Child Growth Percentile Checker
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              WHO/CDC Clinical Standards Evaluator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Top Toolbar: System & Gender Selection */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              
              <div className="space-y-2 w-full sm:w-auto">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Biological Gender</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-full sm:w-auto">
                  <button 
                    onClick={() => setGender("boy")} 
                    className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all duration-300 ${gender === "boy" ? "bg-white dark:bg-slate-700 text-sky-600 shadow-sm" : "text-slate-500"}`}
                  >
                    Boy
                  </button>
                  <button 
                    onClick={() => setGender("girl")} 
                    className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all duration-300 ${gender === "girl" ? "bg-white dark:bg-slate-700 text-rose-600 shadow-sm" : "text-slate-500"}`}
                  >
                    Girl
                  </button>
                </div>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shrink-0">
                <button onClick={() => handleSystemChange("imperial")} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${system === "imperial" ? `bg-white dark:bg-slate-700 ${theme.textPri} shadow-sm` : "text-slate-500"}`}>Imperial</button>
                <button onClick={() => handleSystemChange("metric")} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${system === "metric" ? `bg-white dark:bg-slate-700 ${theme.textPri} shadow-sm` : "text-slate-500"}`}>Metric</button>
              </div>

            </div>

            {/* Age Input */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Baby className="w-4 h-4 text-slate-400" /> Child's Age (0-5 Years)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className={`relative flex flex-col bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:${theme.borderPri} focus-within:ring-4 focus-within:ring-${theme.pri}-50 dark:focus-within:ring-${theme.pri}-900/20 transition-all px-4 py-3`}>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Years</span>
                  <input
                    type="number" min="0" max="5" value={ageYears} onChange={(e) => setAgeYears(e.target.value)}
                    className="w-full bg-transparent text-xl font-black text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className={`relative flex flex-col bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:${theme.borderPri} focus-within:ring-4 focus-within:ring-${theme.pri}-50 dark:focus-within:ring-${theme.pri}-900/20 transition-all px-4 py-3`}>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Months</span>
                  <input
                    type="number" min="0" max="11" value={ageMonths} onChange={(e) => setAgeMonths(e.target.value)}
                    className="w-full bg-transparent text-xl font-black text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Metrics Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Weight className="w-4 h-4 text-slate-400" /> Current Weight
                </label>
                <div className={`relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:${theme.borderPri} focus-within:ring-4 focus-within:ring-${theme.pri}-50 dark:focus-within:ring-${theme.pri}-900/20 transition-all overflow-hidden`}>
                  <input
                    type="number" min="0" step="0.1" value={weightInput} onChange={(e) => setWeightInput(e.target.value)}
                    className="w-full bg-transparent px-5 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none"
                  />
                  <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 border-l border-slate-200 dark:border-slate-700 px-5 py-4 h-full shrink-0">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{system === "imperial" ? "Lbs" : "Kg"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-slate-400" /> Current Height
                </label>
                <div className={`relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:${theme.borderPri} focus-within:ring-4 focus-within:ring-${theme.pri}-50 dark:focus-within:ring-${theme.pri}-900/20 transition-all overflow-hidden`}>
                  <input
                    type="number" min="0" step="0.1" value={heightInput} onChange={(e) => setHeightInput(e.target.value)}
                    className="w-full bg-transparent px-5 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none"
                  />
                  <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 border-l border-slate-200 dark:border-slate-700 px-5 py-4 h-full shrink-0">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{system === "imperial" ? "Inches" : "Cm"}</span>
                  </div>
                </div>
              </div>

            </div>

            {calculations.totalMonths > 60 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl flex items-start gap-3 border border-amber-200 dark:border-amber-900/50 animate-in zoom-in-95">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-amber-700 dark:text-amber-400">Age Limit Exceeded</span>
                  <p className="text-[10px] font-medium text-amber-600/80 dark:text-amber-300/80 leading-relaxed mt-0.5">
                    This specific algorithm is optimized for early childhood (0 to 5 years / 60 months) using WHO parameters. Calculations for older children may be less accurate.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ================= RIGHT: PERCENTILE DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px] transition-colors duration-500">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-8">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm`}>
                  <Activity className={`w-3.5 h-3.5 ${theme.textPri}`} /> Growth Percentiles
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Age: {calculations.totalMonths} Months
                </span>
              </div>
              
              {!calculations.isEmpty ? (
                <div className="space-y-6 flex-1">
                  
                  {/* Weight Percentile Card */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                          <Weight className="w-4 h-4 text-slate-400" /> Weight Percentile
                        </h4>
                        <span className={`text-[10px] font-bold mt-1 block ${calculations.weightStatus.color}`}>
                          {calculations.weightStatus.label}
                        </span>
                      </div>
                      <div className="flex items-start text-slate-800 dark:text-slate-100">
                        <span className="text-5xl font-black tabular-nums tracking-tighter">{calculations.weightPercentile}</span>
                        <span className="text-sm font-bold mt-1">{calculations.weightSuffix}</span>
                      </div>
                    </div>
                    
                    {/* Visual Bar */}
                    <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-6">
                      <div className="absolute top-1/2 -translate-y-1/2 left-[5%] w-[90%] h-full">
                        {/* Zones */}
                        <div className="absolute left-0 w-[5%] h-full bg-amber-200 dark:bg-amber-900/40 rounded-l-full"></div>
                        <div className="absolute left-[5%] w-[90%] h-full bg-emerald-100 dark:bg-emerald-900/20"></div>
                        <div className="absolute right-0 w-[5%] h-full bg-purple-200 dark:bg-purple-900/40 rounded-r-full"></div>
                        
                        {/* Marker */}
                        <div 
                          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md ${calculations.weightStatus.bar} transition-all duration-700`}
                          style={{ left: `${Math.max(0, Math.min(100, calculations.weightPercentile))}%`, transform: 'translate(-50%, -50%)' }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold mt-2 uppercase tracking-widest text-slate-400">
                      <span>1st</span>
                      <span>50th (Average)</span>
                      <span>99th</span>
                    </div>
                  </div>

                  {/* Height Percentile Card */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                          <Ruler className="w-4 h-4 text-slate-400" /> Height Percentile
                        </h4>
                        <span className={`text-[10px] font-bold mt-1 block ${calculations.heightStatus.color}`}>
                          {calculations.heightStatus.label}
                        </span>
                      </div>
                      <div className="flex items-start text-slate-800 dark:text-slate-100">
                        <span className="text-5xl font-black tabular-nums tracking-tighter">{calculations.heightPercentile}</span>
                        <span className="text-sm font-bold mt-1">{calculations.heightSuffix}</span>
                      </div>
                    </div>
                    
                    {/* Visual Bar */}
                    <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-6">
                      <div className="absolute top-1/2 -translate-y-1/2 left-[5%] w-[90%] h-full">
                        {/* Zones */}
                        <div className="absolute left-0 w-[5%] h-full bg-amber-200 dark:bg-amber-900/40 rounded-l-full"></div>
                        <div className="absolute left-[5%] w-[90%] h-full bg-emerald-100 dark:bg-emerald-900/20"></div>
                        <div className="absolute right-0 w-[5%] h-full bg-purple-200 dark:bg-purple-900/40 rounded-r-full"></div>
                        
                        {/* Marker */}
                        <div 
                          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md ${calculations.heightStatus.bar} transition-all duration-700`}
                          style={{ left: `${Math.max(0, Math.min(100, calculations.heightPercentile))}%`, transform: 'translate(-50%, -50%)' }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold mt-2 uppercase tracking-widest text-slate-400">
                      <span>1st</span>
                      <span>50th (Average)</span>
                      <span>99th</span>
                    </div>
                  </div>

                  {/* The Doctor's Translation (Premium Feature) */}
                  <div className={`mt-auto ${theme.bgLight} border border-transparent p-5 rounded-2xl relative transition-colors duration-500`}>
                    <h4 className={`text-[10px] font-black uppercase tracking-widest ${theme.textPri} mb-3 flex items-center gap-1.5`}>
                      <Stethoscope className="w-4 h-4" /> The Doctor's Translation
                    </h4>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      If there were <strong>100</strong> healthy {gender}s exactly this age standing in a room:
                    </p>
                    <ul className="mt-3 space-y-2">
                      <li className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <ArrowRight className={`w-3.5 h-3.5 mt-0.5 ${theme.textPri}`} />
                        <span>Your child is taller than <strong>{calculations.heightPercentile}</strong> of them.</span>
                      </li>
                      <li className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <ArrowRight className={`w-3.5 h-3.5 mt-0.5 ${theme.textPri}`} />
                        <span>Your child is heavier than <strong>{calculations.weightPercentile}</strong> of them.</span>
                      </li>
                    </ul>
                    <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Exact Average Weight: {calculations.avgWeight.toFixed(1)} {system === "imperial" ? "lbs" : "kg"}</span>
                      <span>Average Height: {calculations.avgHeight.toFixed(1)} {system === "imperial" ? "in" : "cm"}</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-3">
                  <Activity className="w-12 h-12 text-slate-400" />
                  <p className="text-sm font-bold text-slate-500">Enter weight and height to view percentiles</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}