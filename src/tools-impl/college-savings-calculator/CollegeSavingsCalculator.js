"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  GraduationCap, Baby, TrendingUp, DollarSign, 
  School, Landmark, ShieldCheck, PiggyBank,
  PieChart, AlertCircle, CheckCircle2, Building2
} from "lucide-react";

export default function CollegeSavingsCalculator() {
  const [isMounted, setIsMounted] = useState(false);

  // 1. Timeline Inputs
  const [childAge, setChildAge] = useState("5");
  const [collegeAge, setCollegeAge] = useState("18");

  // 2. Financial Inputs
  const [initialBalance, setInitialBalance] = useState("10000");
  const [monthlyContribution, setMonthlyContribution] = useState("300");
  const [expectedReturn, setExpectedReturn] = useState("7"); // 7% market return

  // 3. College Cost Inputs
  const [collegeType, setCollegeType] = useState("in-state"); // 'in-state', 'out-state', 'private'
  const [currentTuitionCost, setCurrentTuitionCost] = useState("105000"); // 4-year total current cost
  const [tuitionInflation, setTuitionInflation] = useState("5"); // Education inflation is usually 4-6%

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNumInput = (setter, value, max = null) => {
    if (value === "") {
      setter("");
      return;
    }
    if (/^\d*\.?\d*$/.test(value)) {
      const num = parseFloat(value);
      if (max && num > max) return;
      setter(value);
    }
  };

  const handleCollegeTypeSelect = (type) => {
    setCollegeType(type);
    if (type === "in-state") setCurrentTuitionCost("105000");
    if (type === "out-state") setCurrentTuitionCost("175000");
    if (type === "private") setCurrentTuitionCost("230000");
  };

  // --- CORE 529 GROWTH ENGINE ---
  const calculations = useMemo(() => {
    const age = parseInt(childAge) || 0;
    const enrollAge = parseInt(collegeAge) || 18;
    const yearsToCollege = Math.max(0, enrollAge - age);
    const months = yearsToCollege * 12;

    const initial = parseFloat(initialBalance) || 0;
    const monthly = parseFloat(monthlyContribution) || 0;
    const annualRate = parseFloat(expectedReturn) || 0;
    const inflationRate = parseFloat(tuitionInflation) || 0;
    const baseCost = parseFloat(currentTuitionCost) || 0;

    // 1. Future College Cost (Compound Inflation)
    const futureCost = baseCost * Math.pow(1 + (inflationRate / 100), yearsToCollege);

    // 2. Future Savings (Compound Interest with monthly contributions)
    let futureSavings = initial;
    let totalPrincipal = initial + (monthly * months);
    let totalInterest = 0;

    if (annualRate > 0) {
      const r = annualRate / 100 / 12;
      // Formula: FV = P(1+r/n)^(nt) + PMT * [((1+r/n)^(nt) - 1) / (r/n)]
      const compoundPrincipal = initial * Math.pow(1 + r, months);
      const compoundContributions = monthly > 0 ? (monthly * (Math.pow(1 + r, months) - 1)) / r : 0;
      
      futureSavings = compoundPrincipal + compoundContributions;
      totalInterest = futureSavings - totalPrincipal;
    } else {
      futureSavings = totalPrincipal;
    }

    // 3. Tax Advantage Calculator (Assuming 15% Long-Term Cap Gains tax on a normal taxable account)
    const taxDragRate = 0.15;
    const taxableAccountInterest = totalInterest * (1 - taxDragRate);
    const taxSavingsBy529 = totalInterest - taxableAccountInterest;

    // 4. Progress & Gaps
    const fundingGap = Math.max(0, futureCost - futureSavings);
    const percentCovered = futureCost > 0 ? Math.min(100, (futureSavings / futureCost) * 100) : 0;

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return {
      yearsToCollege,
      futureCost,
      futureSavings,
      totalPrincipal,
      totalInterest,
      taxSavingsBy529,
      fundingGap,
      percentCovered,
      formatCurrency
    };
  }, [childAge, collegeAge, initialBalance, monthlyContribution, expectedReturn, currentTuitionCost, tuitionInflation]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-cyan-100 via-blue-50 to-transparent dark:from-cyan-900/30 dark:via-blue-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3.5 rounded-2xl shadow-md">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              529 Education Planner
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              College Savings & Tax Shield Optimizer
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-cyan-500" /> 1. Timeline
                </h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {calculations.yearsToCollege} Years to Grow
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Child's Current Age</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-cyan-500 transition-all overflow-hidden">
                    <input type="text" value={childAge} onChange={(e) => handleNumInput(setChildAge, e.target.value, 18)} className="w-full bg-transparent px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums text-center" />
                    <span className="pr-4 text-xs font-bold text-slate-400 uppercase">Yrs</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Age at Enrollment</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-cyan-500 transition-all overflow-hidden">
                    <input type="text" value={collegeAge} onChange={(e) => handleNumInput(setCollegeAge, e.target.value, 30)} className="w-full bg-transparent px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums text-center" />
                    <span className="pr-4 text-xs font-bold text-slate-400 uppercase">Yrs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. College Cost Projection */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <School className="w-3.5 h-3.5 text-blue-500" /> 2. College Goal (4-Year Total)
              </h3>
              
              {/* Tiers */}
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleCollegeTypeSelect("in-state")} className={`p-2 rounded-lg border text-xs font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${collegeType === "in-state" ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"}`}>
                  <Landmark className="w-4 h-4" /> Public (In-State)
                </button>
                <button onClick={() => handleCollegeTypeSelect("out-state")} className={`p-2 rounded-lg border text-xs font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${collegeType === "out-state" ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"}`}>
                  <Building2 className="w-4 h-4" /> Public (Out-State)
                </button>
                <button onClick={() => handleCollegeTypeSelect("private")} className={`p-2 rounded-lg border text-xs font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${collegeType === "private" ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"}`}>
                  <School className="w-4 h-4" /> Private
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Today's Total Cost</label>
                  <div className="relative flex items-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500">
                    <span className="pl-3 text-sm font-black text-slate-400">$</span>
                    <input type="text" value={currentTuitionCost} onChange={(e) => handleNumInput(setCurrentTuitionCost, e.target.value)} className="w-full bg-transparent px-2 py-3 text-base font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Tuition Inflation / Yr</label>
                  <div className="relative flex items-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500">
                    <input type="text" value={tuitionInflation} onChange={(e) => handleNumInput(setTuitionInflation, e.target.value, 15)} className="w-full bg-transparent px-3 py-3 text-base font-black text-slate-800 dark:text-slate-100 outline-none text-right tabular-nums" />
                    <span className="pr-3 pl-1 text-sm font-black text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Savings Plan */}
            <div className="space-y-4 p-5 rounded-2xl bg-cyan-50/40 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-800/50">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5 border-b border-cyan-200/60 dark:border-cyan-800/60 pb-2">
                <PiggyBank className="w-3.5 h-3.5" /> 3. Funding & Contributions
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Current Savings</label>
                  <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:border-cyan-500">
                    <span className="pl-2.5 text-xs font-bold text-slate-400">$</span>
                    <input type="text" value={initialBalance} onChange={(e) => handleNumInput(setInitialBalance, e.target.value)} className="w-full bg-transparent px-2 py-2 text-sm font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-widest mb-1 block">Monthly Contribution</label>
                  <div className="relative flex items-center bg-white dark:bg-slate-900 border-2 border-cyan-300 dark:border-cyan-700 rounded-lg overflow-hidden focus-within:border-cyan-500">
                    <span className="pl-2.5 text-xs font-bold text-slate-400">$</span>
                    <input type="text" value={monthlyContribution} onChange={(e) => handleNumInput(setMonthlyContribution, e.target.value)} className="w-full bg-transparent px-2 py-2 text-sm font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Est. Investment Return</label>
                <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:border-cyan-500 w-1/2">
                  <input type="text" value={expectedReturn} onChange={(e) => handleNumInput(setExpectedReturn, e.target.value, 20)} className="w-full bg-transparent px-2 py-2 text-sm font-black text-slate-800 dark:text-slate-100 outline-none text-right tabular-nums" />
                  <span className="pr-2 pl-1 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[700px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <PieChart className="w-4 h-4 text-cyan-500" /> College Readiness
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                  At Age {collegeAge}
                </span>
              </div>

              {/* THE 529 TAX SHIELD ALERT (Wow Factor) */}
              {calculations.taxSavingsBy529 > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-xl flex items-start gap-3 mb-6 shrink-0 shadow-sm animate-in fade-in">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">The 529 Tax Advantage</span>
                    <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300 mt-1">
                      Because 529 plans grow tax-free, you are saving an estimated <strong>{calculations.formatCurrency(calculations.taxSavingsBy529)}</strong> in capital gains taxes compared to a standard brokerage account!
                    </p>
                  </div>
                </div>
              )}

              {/* PROGRESS HERO */}
              <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-6 px-4 rounded-3xl shadow-sm mb-6 relative overflow-hidden shrink-0">
                
                {/* Projected Goal vs Reality */}
                <div className="flex justify-between items-end mb-4 px-2">
                  <div className="text-left">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Future College Cost</span>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.formatCurrency(calculations.futureCost)}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] font-bold text-cyan-500 uppercase tracking-widest">Future Savings</span>
                    <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 tabular-nums">{calculations.formatCurrency(calculations.futureSavings)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-full overflow-hidden relative shadow-inner mb-2">
                  <div 
                    style={{ width: `${Math.min(100, calculations.percentCovered)}%` }} 
                    className={`h-full transition-all duration-1000 ${calculations.percentCovered >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-md">
                    {calculations.percentCovered.toFixed(0)}% Funded
                  </span>
                </div>

                {/* Status Message */}
                {calculations.percentCovered >= 100 ? (
                  <span className="text-xs font-black text-emerald-500 flex items-center justify-center gap-1 mt-3">
                    <CheckCircle2 className="w-4 h-4"/> Fully Funded!
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-500 flex items-center justify-center gap-1 mt-3">
                    <AlertCircle className="w-4 h-4"/> Shortfall: {calculations.formatCurrency(calculations.fundingGap)}
                  </span>
                )}
              </div>

              {/* DETAILED GROWTH BREAKDOWN */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 shadow-sm">
                
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-2 px-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Savings Composition
                </h4>

                <div className="flex-1 space-y-3 pt-1 px-1">
                  
                  {/* Total Contributions */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Total Cash Invested</span>
                      <span className="text-[9px] font-bold text-slate-400">Your out-of-pocket money</span>
                    </div>
                    <span className="text-sm font-black tabular-nums text-slate-700 dark:text-slate-300">
                      {calculations.formatCurrency(calculations.totalPrincipal)}
                    </span>
                  </div>

                  {/* Total Earnings */}
                  <div className="flex items-center justify-between p-3 bg-cyan-50/50 dark:bg-cyan-900/10 rounded-xl border border-cyan-100 dark:border-cyan-800/50">
                    <div>
                      <span className="text-xs font-black text-cyan-700 dark:text-cyan-400 block">Compound Earnings</span>
                      <span className="text-[9px] font-bold text-cyan-600/70 dark:text-cyan-500">Tax-free growth</span>
                    </div>
                    <span className="text-sm font-black tabular-nums text-cyan-600 dark:text-cyan-400">
                      +{calculations.formatCurrency(calculations.totalInterest)}
                    </span>
                  </div>

                  {/* Impact of Inflation */}
                  <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-start gap-2">
                    <School className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 leading-snug">
                        Due to {tuitionInflation}% annual education inflation, a 4-year degree that costs {calculations.formatCurrency(parseFloat(currentTuitionCost)||0)} today is projected to cost <strong>{calculations.formatCurrency(calculations.futureCost)}</strong> when your child enrolls.
                      </span>
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