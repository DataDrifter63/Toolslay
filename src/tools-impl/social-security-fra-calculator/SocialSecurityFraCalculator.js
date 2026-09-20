"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Award, Calendar, TrendingUp, AlertTriangle, 
  DollarSign, Clock, ShieldCheck, Scale, 
  Activity, CheckCircle2, PieChart, ArrowRight
} from "lucide-react";

export default function SocialSecurityFRACalculator() {
  const [isMounted, setIsMounted] = useState(false);

  // Inputs
  const [birthYear, setBirthYear] = useState("1965");
  const [birthMonth, setBirthMonth] = useState("1"); // January
  const [estimatedFraBenefit, setEstimatedFraBenefit] = useState("2000"); // Monthly $ at FRA
  const [claimAge, setClaimAge] = useState(67); // User's planned claim age
  const [lifeExpectancy, setLifeExpectancy] = useState("85"); // Life expectancy for break-even

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNumInput = (setter, value, max = null) => {
    if (value === "") {
      setter("");
      return;
    }
    if (/^\d*$/.test(value)) {
      const num = parseInt(value, 10);
      if (max && num > max) return;
      setter(value);
    }
  };

  // --- CORE SOCIAL SECURITY ENGINE ---
  const calculations = useMemo(() => {
    const year = parseInt(birthYear) || 1960;
    const month = parseInt(birthMonth) || 1;
    const baseBenefit = parseFloat(estimatedFraBenefit) || 0;
    const selectedAge = parseFloat(claimAge) || 67;
    const maxAge = parseInt(lifeExpectancy) || 85;

    // 1. Calculate Full Retirement Age (FRA)
    let fraYears = 67;
    let fraMonths = 0;

    if (year <= 1937) {
      fraYears = 65; fraMonths = 0;
    } else if (year >= 1938 && year <= 1942) {
      fraYears = 65; fraMonths = (year - 1937) * 2;
    } else if (year >= 1943 && year <= 1954) {
      fraYears = 66; fraMonths = 0;
    } else if (year >= 1955 && year <= 1959) {
      fraYears = 66; fraMonths = (year - 1954) * 2;
    } else {
      fraYears = 67; fraMonths = 0;
    }

    const totalFraMonths = (fraYears * 12) + fraMonths;
    const fraDecimalAge = fraYears + (fraMonths / 12);

    // Date when user reaches FRA
    const fraDate = new Date(year + fraYears, (month - 1) + fraMonths, 1);
    const fraDateString = fraDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // 2. Helper function to calculate monthly benefit multiplier for ANY claim age
    const getMultiplierForAge = (ageInYears) => {
      const claimTotalMonths = Math.round(ageInYears * 12);
      const diffMonths = claimTotalMonths - totalFraMonths;

      if (diffMonths === 0) return 1.0; // Exact FRA

      if (diffMonths < 0) {
        // Early Claiming Penalty
        const monthsEarly = Math.abs(diffMonths);
        let reduction = 0;

        if (monthsEarly <= 36) {
          reduction = monthsEarly * (5 / 900); // 5/9 of 1% per month
        } else {
          reduction = (36 * (5 / 900)) + ((monthsEarly - 36) * (5 / 1200)); // 5/12 of 1% for additional months
        }
        return Math.max(0, 1 - reduction);
      } else {
        // Delayed Retirement Credits (Up to age 70)
        const monthsDelayed = Math.min(diffMonths, (70 * 12) - totalFraMonths);
        const bonus = monthsDelayed * (8 / 1200); // 8% per year (2/3 of 1% per month)
        return 1 + Math.max(0, bonus);
      }
    };

    // Monthly Benefits
    const benefitAt62 = baseBenefit * getMultiplierForAge(62);
    const benefitAtFra = baseBenefit;
    const benefitAt70 = baseBenefit * getMultiplierForAge(70);
    const benefitAtSelected = baseBenefit * getMultiplierForAge(selectedAge);

    const selectedMultiplier = getMultiplierForAge(selectedAge);
    const percentDifference = ((selectedMultiplier - 1) * 100).toFixed(1);

    // 3. Lifetime Cumulative Benefits & Break-Even Analysis
    let cumulative62 = 0;
    let cumulative70 = 0;
    let breakEvenAge70vs62 = null;

    for (let age = 62; age <= maxAge; age++) {
      const monthsInYear = 12;
      cumulative62 += benefitAt62 * monthsInYear;
      
      if (age >= 70) {
        cumulative70 += benefitAt70 * monthsInYear;
      }

      if (breakEvenAge70vs62 === null && age >= 70 && cumulative70 > cumulative62) {
        breakEvenAge70vs62 = age;
      }
    }

    const lifetimeSelected = Math.max(0, (maxAge - selectedAge) * 12 * benefitAtSelected);

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return {
      fraYears, fraMonths, fraDecimalAge, fraDateString,
      benefitAt62, benefitAtFra, benefitAt70, benefitAtSelected,
      selectedMultiplier, percentDifference,
      breakEvenAge70vs62, lifetimeSelected,
      formatCurrency
    };
  }, [birthYear, birthMonth, estimatedFraBenefit, claimAge, lifeExpectancy]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-100 via-indigo-50 to-transparent dark:from-blue-900/30 dark:via-indigo-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3.5 rounded-2xl shadow-md">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Social Security FRA Oracle
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Full Retirement Age & Benefit Multiplier Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Birth Date Inputs */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Calendar className="w-3.5 h-3.5 text-blue-500" /> 1. Date of Birth
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Birth Year</label>
                  <input
                    type="text" value={birthYear} onChange={(e) => handleNumInput(setBirthYear, e.target.value, 2010)}
                    placeholder="1960"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 transition-all tabular-nums text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Birth Month</label>
                  <select
                    value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-black text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, idx) => (
                      <option key={idx} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* FRA RESULT BANNER */}
            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 block">Your Official FRA</span>
                <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
                  {calculations.fraYears} Years {calculations.fraMonths > 0 ? `& ${calculations.fraMonths} Months` : ""}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  You hit 100% full benefits in <strong>{calculations.fraDateString}</strong>
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50 text-center shrink-0">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Base Multiplier</span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">100%</span>
              </div>
            </div>

            {/* 2. Estimated Primary Insurance Amount (PIA) */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> 2. Estimated FRA Monthly Benefit
              </h3>
              
              <div className="relative flex items-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all overflow-hidden group">
                <div className="bg-slate-50 dark:bg-slate-800 px-5 py-4 flex items-center justify-center border-r border-slate-200 dark:border-slate-700">
                  <DollarSign className="w-6 h-6 text-slate-400 group-focus-within:text-emerald-500" />
                </div>
                <input
                  type="text" value={estimatedFraBenefit} onChange={(e) => handleNumInput(setEstimatedFraBenefit, e.target.value)}
                  placeholder="2000"
                  className="w-full bg-transparent px-5 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                />
                <span className="pr-6 text-xs font-bold text-slate-400 uppercase tracking-widest">/ month</span>
              </div>
            </div>

            {/* 3. Claiming Strategy Slider */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> Planned Claiming Age
                </label>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  Age {claimAge}
                </span>
              </div>

              <input
                type="range" min="62" max="70" step="1"
                value={claimAge} onChange={(e) => setClaimAge(parseInt(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />

              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">
                <span>Age 62 (Earliest)</span>
                <span>FRA ({calculations.fraYears})</span>
                <span>Age 70 (Max Bonus)</span>
              </div>
            </div>

            {/* 4. Life Expectancy */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" /> Life Expectancy (For Break-Even Math)
              </label>
              <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden w-full sm:w-1/2">
                <input
                  type="text" value={lifeExpectancy} onChange={(e) => handleNumInput(setLifeExpectancy, e.target.value, 110)}
                  className="w-full bg-transparent px-4 py-2.5 text-base font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                />
                <span className="pr-4 text-xs font-bold text-slate-400 uppercase">Years</span>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD / ORACLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[680px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <PieChart className="w-4 h-4 text-indigo-500" /> Benefit Projection
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                  Claiming at Age {claimAge}
                </span>
              </div>

              {/* HERO METRIC: MONTHLY AT PLANNED AGE */}
              <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-8 px-4 rounded-3xl shadow-sm mb-6 relative overflow-hidden shrink-0">
                <span className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Monthly Check at Age {claimAge}
                </span>
                <span className="text-5xl sm:text-6xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter tabular-nums leading-none block">
                  {calculations.formatCurrency(calculations.benefitAtSelected)}
                </span>
                
                {/* Penalty / Bonus Badge */}
                <div className="mt-4 flex justify-center">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                    parseFloat(calculations.percentDifference) < 0 
                      ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800" 
                      : parseFloat(calculations.percentDifference) > 0 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                      : "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                  }`}>
                    {parseFloat(calculations.percentDifference) < 0 ? `${calculations.percentDifference}% Early Penalty` : parseFloat(calculations.percentDifference) > 0 ? `+${calculations.percentDifference}% Delayed Credit` : "100% Full Unreduced Benefit"}
                  </span>
                </div>
              </div>

              {/* BREAK-EVEN ALERT */}
              {calculations.breakEvenAge70vs62 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3.5 rounded-2xl flex items-start gap-3 mb-6 shrink-0">
                  <Scale className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">The Age 70 Break-Even Point</span>
                    <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      If you delay until 70, your higher monthly check catches up and surpasses early claims at <strong>Age {calculations.breakEvenAge70vs62}</strong>. If you live past {calculations.breakEvenAge70vs62}, waiting pays off!
                    </p>
                  </div>
                </div>
              )}

              {/* DETAILED COMPARISON TABLE */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-2 shadow-sm">
                
                <div className="flex text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 pb-2 pt-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex-1">Claim Age Target</div>
                  <div className="w-1/3 text-right">Monthly Check</div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pt-1 space-y-1">
                  
                  {/* Age 62 */}
                  <div className={`flex items-center px-3 py-3 rounded-xl transition-colors ${claimAge === 62 ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                    <div className="flex-1">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Age 62 (Earliest)</span>
                      <span className="text-[9px] font-bold text-rose-500">Max Early Reduction</span>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-black tabular-nums text-slate-700 dark:text-slate-200">{calculations.formatCurrency(calculations.benefitAt62)}</span>
                    </div>
                  </div>

                  {/* FRA */}
                  <div className={`flex items-center px-3 py-3 rounded-xl transition-colors ${claimAge === Math.floor(calculations.fraDecimalAge) ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                    <div className="flex-1">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">FRA (Age {calculations.fraYears}y {calculations.fraMonths}m)</span>
                      <span className="text-[9px] font-bold text-blue-500">100% Full Benefit</span>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-black tabular-nums text-blue-600 dark:text-blue-400">{calculations.formatCurrency(calculations.benefitAtFra)}</span>
                    </div>
                  </div>

                  {/* Age 70 */}
                  <div className={`flex items-center px-3 py-3 rounded-xl transition-colors ${claimAge === 70 ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                    <div className="flex-1">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Age 70 (Maximum)</span>
                      <span className="text-[9px] font-bold text-emerald-500">Includes Delayed Credits</span>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-black tabular-nums text-emerald-600 dark:text-emerald-400">{calculations.formatCurrency(calculations.benefitAt70)}</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}