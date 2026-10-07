"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  GraduationCap, Baby, TrendingUp, DollarSign, 
  School, Landmark, ShieldCheck, PiggyBank,
  PieChart, AlertCircle, CheckCircle2, Building2
} from "lucide-react";

export default function CollegeSavingsCalculator() {
  const [isMounted, setIsMounted] = useState(false);

  const [childAge, setChildAge] = useState("5");
  const [collegeAge, setCollegeAge] = useState("18");

  const [initialBalance, setInitialBalance] = useState("10000");
  const [monthlyContribution, setMonthlyContribution] = useState("300");
  const [expectedReturn, setExpectedReturn] = useState("7");

  const [collegeType, setCollegeType] = useState("in-state");
  const [currentTuitionCost, setCurrentTuitionCost] = useState("105000");
  const [tuitionInflation, setTuitionInflation] = useState("5");

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

    const futureCost = baseCost * Math.pow(1 + (inflationRate / 100), yearsToCollege);

    let futureSavings = initial;
    let totalPrincipal = initial + (monthly * months);
    let totalInterest = 0;

    if (annualRate > 0) {
      const r = annualRate / 100 / 12;
      const compoundPrincipal = initial * Math.pow(1 + r, months);
      const compoundContributions = monthly > 0 ? (monthly * (Math.pow(1 + r, months) - 1)) / r : 0;
      
      futureSavings = compoundPrincipal + compoundContributions;
      totalInterest = futureSavings - totalPrincipal;
    } else {
      futureSavings = totalPrincipal;
    }

    const taxDragRate = 0.15;
    const taxableAccountInterest = totalInterest * (1 - taxDragRate);
    const taxSavingsBy529 = totalInterest - taxableAccountInterest;

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

  const baseInputStyle = "w-full min-w-0 bg-paper border border-line rounded-xl px-3.5 py-3 text-base font-bold text-ink outline-none focus:border-brand tabular-nums";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              529 Education Planner
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              College Savings & Tax Shield Optimizer
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start min-w-0">
        
        {/* CONFIGURATION ENGINE */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* Timeline */}
            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between border-b border-line pb-2 min-w-0">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 truncate">
                  <Baby className="w-3.5 h-3.5 text-brand shrink-0" /> 1. Timeline
                </h3>
                <span className="text-[9px] font-bold text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0">
                  {calculations.yearsToCollege} Yrs to Grow
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 min-w-0">
                <div className="min-w-0">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1.5 block truncate">Child Age</label>
                  <div className="relative flex items-center min-w-0">
                    <input type="text" value={childAge} onChange={(e) => handleNumInput(setChildAge, e.target.value, 18)} className={`${baseInputStyle} pr-10 text-center`} />
                    <span className="pr-3 text-[10px] font-bold text-muted uppercase pointer-events-none absolute right-0">Yrs</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1.5 block truncate">Enroll Age</label>
                  <div className="relative flex items-center min-w-0">
                    <input type="text" value={collegeAge} onChange={(e) => handleNumInput(setCollegeAge, e.target.value, 30)} className={`${baseInputStyle} pr-10 text-center`} />
                    <span className="pr-3 text-[10px] font-bold text-muted uppercase pointer-events-none absolute right-0">Yrs</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-line" />

            {/* College Cost Projection */}
            <div className="space-y-3 min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <School className="w-3.5 h-3.5 text-teal shrink-0" /> 2. College Goal (4-Yr Total)
              </h3>
              
              <div className="grid grid-cols-3 gap-2 min-w-0">
                <button type="button" onClick={() => handleCollegeTypeSelect("in-state")} className={`p-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 min-w-0 truncate ${collegeType === "in-state" ? "bg-surface border-brand text-brand shadow-sm" : "bg-paper border-line text-muted hover:text-ink"}`}>
                  <Landmark className="w-3.5 h-3.5 shrink-0" /> <span className="truncate w-full text-center">In-State</span>
                </button>
                <button type="button" onClick={() => handleCollegeTypeSelect("out-state")} className={`p-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 min-w-0 truncate ${collegeType === "out-state" ? "bg-surface border-brand text-brand shadow-sm" : "bg-paper border-line text-muted hover:text-ink"}`}>
                  <Building2 className="w-3.5 h-3.5 shrink-0" /> <span className="truncate w-full text-center">Out-State</span>
                </button>
                <button type="button" onClick={() => handleCollegeTypeSelect("private")} className={`p-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 min-w-0 truncate ${collegeType === "private" ? "bg-surface border-brand text-brand shadow-sm" : "bg-paper border-line text-muted hover:text-ink"}`}>
                  <School className="w-3.5 h-3.5 shrink-0" /> <span className="truncate w-full text-center">Private</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0 pt-1">
                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Today's Total Cost</label>
                  <div className="relative flex items-center min-w-0">
                    <span className="pl-3 text-xs font-black text-muted pointer-events-none">$</span>
                    <input type="text" value={currentTuitionCost} onChange={(e) => handleNumInput(setCurrentTuitionCost, e.target.value)} className={`${baseInputStyle} pl-7`} />
                  </div>
                </div>
                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Tuition Inflation / Yr</label>
                  <div className="relative flex items-center min-w-0">
                    <input type="text" value={tuitionInflation} onChange={(e) => handleNumInput(setTuitionInflation, e.target.value, 15)} className={`${baseInputStyle} pr-7 text-right`} />
                    <span className="pr-3 pl-1 text-xs font-black text-muted pointer-events-none absolute right-0">%</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-line" />

            {/* Savings Plan */}
            <div className="space-y-3 p-4 rounded-xl bg-paper border border-line min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-teal flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <PiggyBank className="w-3.5 h-3.5 shrink-0" /> 3. Funding & Contributions
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Current Savings</label>
                  <div className="relative flex items-center min-w-0">
                    <span className="pl-2.5 text-xs font-bold text-muted">$</span>
                    <input type="text" value={initialBalance} onChange={(e) => handleNumInput(setInitialBalance, e.target.value)} className={`${baseInputStyle} pl-6`} />
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-teal uppercase tracking-widest mb-1 block truncate">Monthly Contribution</label>
                  <div className="relative flex items-center min-w-0">
                    <span className="pl-2.5 text-xs font-bold text-teal">$</span>
                    <input type="text" value={monthlyContribution} onChange={(e) => handleNumInput(setMonthlyContribution, e.target.value)} className={`${baseInputStyle} pl-6 border-teal/40`} />
                  </div>
                </div>
              </div>
              
              <div className="w-full sm:w-1/2 min-w-0 pt-1">
                <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Est. Return Rate</label>
                <div className="relative flex items-center min-w-0">
                  <input type="text" value={expectedReturn} onChange={(e) => handleNumInput(setExpectedReturn, e.target.value, 20)} className={`${baseInputStyle} pr-7 text-right`} />
                  <span className="pr-2.5 text-xs font-bold text-muted pointer-events-none absolute right-0">%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[500px] min-w-0">
            
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <PieChart className="w-4 h-4 text-brand shrink-0" /> College Readiness
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0">
                Age {collegeAge}
              </span>
            </div>

            {calculations.taxSavingsBy529 > 0 && (
              <div className="bg-teal/10 border border-teal/30 p-2.5 rounded-xl flex items-start gap-2 mb-4 shrink-0 min-w-0">
                <ShieldCheck className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-teal truncate">529 Tax Advantage</span>
                  <p className="text-[9px] font-medium text-muted mt-0.5 truncate">Saving ~{calculations.formatCurrency(calculations.taxSavingsBy529)} in cap gains tax.</p>
                </div>
              </div>
            )}

            {/* PROGRESS HERO */}
            <div className="text-center bg-paper border border-line py-5 px-4 rounded-xl shadow-sm mb-4 relative overflow-hidden shrink-0 min-w-0">
              
              <div className="flex justify-between items-end mb-3 px-1 min-w-0">
                <div className="text-left min-w-0 truncate pr-2">
                  <span className="block text-[8px] font-bold text-muted uppercase tracking-wider truncate">Future Cost</span>
                  <span className="text-sm sm:text-base font-black text-ink tabular-nums truncate block">{calculations.formatCurrency(calculations.futureCost)}</span>
                </div>
                <div className="text-right min-w-0 truncate pl-2">
                  <span className="block text-[8px] font-bold text-teal uppercase tracking-wider truncate">Future Savings</span>
                  <span className="text-lg sm:text-xl font-black text-teal tabular-nums truncate block">{calculations.formatCurrency(calculations.futureSavings)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-line h-5 rounded-full overflow-hidden relative shadow-inner">
                <div 
                  style={{ width: `${Math.min(100, calculations.percentCovered)}%` }} 
                  className={`h-full transition-all duration-500 ${calculations.percentCovered >= 100 ? 'bg-teal' : 'bg-brand'}`}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-surface drop-shadow-sm truncate px-2">
                  {calculations.percentCovered.toFixed(0)}% Funded
                </span>
              </div>

              {calculations.percentCovered >= 100 ? (
                <span className="text-[10px] font-black text-teal flex items-center justify-center gap-1 mt-2.5 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0"/> Fully Funded!
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#e11d48] flex items-center justify-center gap-1 mt-2.5 truncate">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0"/> Shortfall: {calculations.formatCurrency(calculations.fundingGap)}
                </span>
              )}
            </div>

            {/* DETAILED GROWTH BREAKDOWN */}
            <div className="flex-1 flex flex-col min-h-0 bg-paper rounded-xl border border-line p-2.5 shadow-sm min-w-0 text-xs">
              
              <h4 className="text-[9px] font-black uppercase tracking-widest text-muted mb-2 flex items-center gap-1 border-b border-line pb-1.5 px-1 truncate">
                <TrendingUp className="w-3 h-3 shrink-0" /> Savings Composition
              </h4>

              <div className="flex-1 space-y-2 pt-1 min-w-0">
                
                <div className="flex items-center justify-between p-2.5 bg-surface rounded-lg min-w-0">
                  <div className="min-w-0 truncate pr-2">
                    <span className="font-bold text-ink block truncate">Total Cash Invested</span>
                    <span className="text-[8px] font-bold text-muted truncate block">Principal out-of-pocket</span>
                  </div>
                  <span className="font-black tabular-nums text-ink shrink-0">{calculations.formatCurrency(calculations.totalPrincipal)}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-teal/10 rounded-lg min-w-0">
                  <div className="min-w-0 truncate pr-2">
                    <span className="font-black text-teal block truncate">Compound Growth</span>
                    <span className="text-[8px] font-bold text-teal/80 truncate block">Tax-free earnings</span>
                  </div>
                  <span className="font-black tabular-nums text-teal shrink-0">+{calculations.formatCurrency(calculations.totalInterest)}</span>
                </div>

                <div className="mt-2 pt-2 border-t border-line/60 flex items-start gap-1.5 min-w-0">
                  <School className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
                  <span className="text-[9px] font-medium text-muted leading-tight truncate block">
                    At {tuitionInflation}% inflation, 4-yr degree hitting <strong>{calculations.formatCurrency(calculations.futureCost)}</strong>.
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}