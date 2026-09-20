"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  PiggyBank, Briefcase, TrendingUp, DollarSign, 
  Percent, AlertCircle, CheckCircle2, PieChart, 
  LineChart, AlertTriangle, ShieldCheck
} from "lucide-react";

export default function FourOhOneKCalculator() {
  const [isMounted, setIsMounted] = useState(false);

  // 1. Personal & Salary
  const [currentAge, setCurrentAge] = useState("30");
  const [retireAge, setRetireAge] = useState("65");
  const [currentSalary, setCurrentSalary] = useState("85000");
  const [annualRaise, setAnnualRaise] = useState("3"); // 3% yearly raise
  const [currentBalance, setCurrentBalance] = useState("25000");

  // 2. Contributions
  const [contributionPercent, setContributionPercent] = useState("8"); // User puts in 8%
  
  // 3. Employer Match
  const [employerMatchLimit, setEmployerMatchLimit] = useState("5"); // Employer matches up to 5%
  const [employerMatchPercent, setEmployerMatchPercent] = useState("100"); // 100% match of that 5%

  // 4. Market 
  const [annualReturn, setAnnualReturn] = useState("7"); // 7% average market return

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNumInput = (setter, value, max = null) => {
    if (value === "") {
      setter("");
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && (!max || num <= max)) {
      setter(value);
    }
  };

  // --- CORE WEALTH ENGINE ---
  const calculations = useMemo(() => {
    const age = parseInt(currentAge) || 0;
    const rAge = parseInt(retireAge) || 0;
    let salary = parseFloat(currentSalary) || 0;
    const raise = parseFloat(annualRaise) || 0;
    const startBalance = parseFloat(currentBalance) || 0;
    
    const contPct = parseFloat(contributionPercent) || 0;
    const empMatchLim = parseFloat(employerMatchLimit) || 0;
    const empMatchPct = parseFloat(employerMatchPercent) || 0;
    const retRate = parseFloat(annualReturn) || 0;

    let totalUserContributions = 0;
    let totalEmployerContributions = 0;
    let totalInterest = 0;
    let currentBal = startBalance;
    
    let hitIrsLimit = false;
    let missedMatch = false;

    // IRS Limits (Approx 2024 limits)
    const baseIrsLimit = 23000;
    const catchUpLimit = 7500; // For age 50+

    // Check if leaving money on table (Day 1 check)
    if (contPct < empMatchLim && empMatchLim > 0) {
      missedMatch = true;
    }

    const yearsToGrow = Math.max(0, rAge - age);

    for (let i = 0; i < yearsToGrow; i++) {
      let currentYearAge = age + i;
      
      // IRS Limit logic
      let currentIrsLimit = currentYearAge >= 50 ? (baseIrsLimit + catchUpLimit) : baseIrsLimit;
      
      // User Contribution
      let plannedContribution = salary * (contPct / 100);
      let actualContribution = plannedContribution;
      
      if (plannedContribution > currentIrsLimit) {
        actualContribution = currentIrsLimit;
        hitIrsLimit = true;
      }
      
      // Employer Match (Calculated on matchable salary up to limits)
      let matchablePct = Math.min(contPct, empMatchLim);
      let actualMatch = salary * (matchablePct / 100) * (empMatchPct / 100);

      // Growth Calculation (Assuming contributions made evenly throughout year, rough compound)
      let interestEarned = (currentBal + (actualContribution + actualMatch) / 2) * (retRate / 100);

      // Add to running totals
      currentBal += actualContribution + actualMatch + interestEarned;
      totalUserContributions += actualContribution;
      totalEmployerContributions += actualMatch;
      totalInterest += interestEarned;
      
      // Salary increases for next year
      salary = salary * (1 + (raise / 100));
    }

    const finalBalance = startBalance + totalUserContributions + totalEmployerContributions + totalInterest;

    // Percentages for Progress Bar
    const pctStart = finalBalance > 0 ? (startBalance / finalBalance) * 100 : 0;
    const pctUser = finalBalance > 0 ? (totalUserContributions / finalBalance) * 100 : 0;
    const pctEmployer = finalBalance > 0 ? (totalEmployerContributions / finalBalance) * 100 : 0;
    const pctInterest = finalBalance > 0 ? (totalInterest / finalBalance) * 100 : 0;

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return {
      yearsToGrow, finalBalance,
      startBalance, totalUserContributions, totalEmployerContributions, totalInterest,
      pctStart, pctUser, pctEmployer, pctInterest,
      hitIrsLimit, missedMatch,
      formatCurrency
    };
  }, [currentAge, retireAge, currentSalary, annualRaise, currentBalance, contributionPercent, employerMatchLimit, employerMatchPercent, annualReturn]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100 via-purple-50 to-transparent dark:from-indigo-900/30 dark:via-purple-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3.5 rounded-2xl shadow-md">
            <LineChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              401(k) Growth Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Retirement Wealth & Match Optimizer
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Basic Info */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> 1. Personal & Income
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Current Salary</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-indigo-500 transition-all overflow-hidden">
                    <span className="pl-4 text-lg font-black text-slate-400">$</span>
                    <input
                      type="text" value={currentSalary} onChange={(e) => handleNumInput(setCurrentSalary, e.target.value)}
                      className="w-full bg-transparent px-3 py-3 text-lg font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Current 401(k) Balance</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-indigo-500 transition-all overflow-hidden">
                    <span className="pl-4 text-lg font-black text-slate-400">$</span>
                    <input
                      type="text" value={currentBalance} onChange={(e) => handleNumInput(setCurrentBalance, e.target.value)}
                      className="w-full bg-transparent px-3 py-3 text-lg font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Current Age</label>
                  <input type="text" value={currentAge} onChange={(e) => handleNumInput(setCurrentAge, e.target.value, 100)} className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base font-black text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 text-center tabular-nums" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Retire Age</label>
                  <input type="text" value={retireAge} onChange={(e) => handleNumInput(setRetireAge, e.target.value, 100)} className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base font-black text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 text-center tabular-nums" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Annual Raise</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-indigo-500 transition-all overflow-hidden">
                    <input type="text" value={annualRaise} onChange={(e) => handleNumInput(setAnnualRaise, e.target.value, 20)} className="w-full bg-transparent px-3 py-3 text-base font-black text-slate-800 dark:text-slate-100 outline-none text-center tabular-nums" />
                    <span className="pr-3 text-sm font-black text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Contributions & Match */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <PiggyBank className="w-3.5 h-3.5 text-purple-500" /> 2. Contributions & Employer Match
              </h3>
              
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/50">
                <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center justify-between mb-3">
                  <span>Your Contribution</span>
                  <span className="bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded">Percent of Salary</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range" min="0" max="30" step="1"
                    value={contributionPercent} onChange={(e) => setContributionPercent(e.target.value)}
                    className="flex-1 h-2 bg-indigo-200 dark:bg-indigo-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="relative w-24">
                    <input
                      type="text" value={contributionPercent} onChange={(e) => handleNumInput(setContributionPercent, e.target.value, 100)}
                      className="w-full bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl px-3 py-2 text-lg font-black text-indigo-700 dark:text-indigo-400 text-center outline-none tabular-nums"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-indigo-400">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Employer Matches Up To</label>
                  <div className="relative flex items-center">
                    <input type="text" value={employerMatchLimit} onChange={(e) => handleNumInput(setEmployerMatchLimit, e.target.value, 100)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-base font-black outline-none focus:border-purple-500 tabular-nums" />
                    <span className="absolute right-3 text-xs font-bold text-slate-400">% of salary</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Match Amount</label>
                  <div className="relative flex items-center">
                    <input type="text" value={employerMatchPercent} onChange={(e) => handleNumInput(setEmployerMatchPercent, e.target.value, 200)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-base font-black outline-none focus:border-purple-500 tabular-nums" />
                    <span className="absolute right-3 text-xs font-bold text-slate-400">%</span>
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1">Usually 50% or 100%.</p>
                </div>
              </div>
            </div>

            {/* 3. Market */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> 3. Market Growth
              </h3>
              <div className="w-full sm:w-1/2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Est. Annual Return</label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-emerald-500 transition-all overflow-hidden">
                  <input type="text" value={annualReturn} onChange={(e) => handleNumInput(setAnnualReturn, e.target.value, 30)} className="w-full bg-transparent px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums text-right" />
                  <span className="pr-4 pl-2 text-sm font-black text-slate-400">%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD / ORACLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[700px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <PieChart className="w-4 h-4 text-indigo-500" /> Future Wealth Projection
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                  In {calculations.yearsToGrow} Years
                </span>
              </div>

              {/* SMART ALERTS */}
              <div className="space-y-2 mb-4 shrink-0">
                {calculations.missedMatch && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Leaving Money on the table!</span>
                      <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-0.5">Your employer matches up to {employerMatchLimit}%, but you are only contributing {contributionPercent}%. Increase it to get the full free match.</p>
                    </div>
                  </div>
                )}
                {calculations.hitIrsLimit && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-xl flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">IRS Limit Reached</span>
                      <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-0.5">Your planned contributions exceed the IRS annual limits. We have automatically capped your inputs to the legal max (including 50+ catch-up if applicable) for accuracy.</p>
                    </div>
                  </div>
                )}
                {!calculations.missedMatch && !calculations.hitIrsLimit && parseFloat(contributionPercent) >= parseFloat(employerMatchLimit) && parseFloat(employerMatchLimit) > 0 && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 p-3 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Maximizing Employer Match!</span>
                  </div>
                )}
              </div>

              {/* HERO METRIC */}
              <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-8 px-4 rounded-3xl shadow-sm mb-6 relative overflow-hidden shrink-0">
                <span className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Estimated Balance at Age {retireAge}
                </span>
                <span className="text-5xl sm:text-6xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter tabular-nums leading-none block">
                  {calculations.formatCurrency(calculations.finalBalance)}
                </span>
                
                {/* Visual Ratio Bar */}
                {calculations.finalBalance > 0 && (
                  <div className="w-11/12 mx-auto mt-8">
                    <div className="flex h-3.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner">
                      {calculations.pctStart > 0 && <div style={{ width: `${calculations.pctStart}%` }} className="bg-slate-400 dark:bg-slate-600"></div>}
                      {calculations.pctUser > 0 && <div style={{ width: `${calculations.pctUser}%` }} className="bg-indigo-500"></div>}
                      {calculations.pctEmployer > 0 && <div style={{ width: `${calculations.pctEmployer}%` }} className="bg-purple-400"></div>}
                      {calculations.pctInterest > 0 && <div style={{ width: `${calculations.pctInterest}%` }} className="bg-emerald-400"></div>}
                    </div>
                  </div>
                )}
              </div>

              {/* DETAILED RECEIPT */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-2 shadow-sm">
                
                <div className="flex text-[9px] font-black uppercase tracking-widest text-slate-400 px-4 pb-2 pt-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex-1">Wealth Source Breakdown</div>
                  <div className="w-1/3 text-right">Amount</div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pt-1">
                  
                  {/* Start Balance */}
                  <div className="flex items-center px-4 py-4 border-b border-slate-50 dark:border-slate-800/50">
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm bg-slate-400 dark:bg-slate-600"></div>
                      <div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Starting Balance</span>
                      </div>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-bold tabular-nums text-slate-600 dark:text-slate-300">{calculations.formatCurrency(calculations.startBalance)}</span>
                    </div>
                  </div>

                  {/* Your Contributions */}
                  <div className="flex items-center px-4 py-4 border-b border-slate-50 dark:border-slate-800/50">
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></div>
                      <div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Your Contributions</span>
                      </div>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-bold tabular-nums text-indigo-600 dark:text-indigo-400">{calculations.formatCurrency(calculations.totalUserContributions)}</span>
                    </div>
                  </div>

                  {/* Employer Match */}
                  <div className="flex items-center px-4 py-4 border-b border-slate-50 dark:border-slate-800/50">
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm bg-purple-400"></div>
                      <div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Employer Match (Free Money)</span>
                      </div>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-bold tabular-nums text-purple-600 dark:text-purple-400">{calculations.formatCurrency(calculations.totalEmployerContributions)}</span>
                    </div>
                  </div>

                  {/* Interest */}
                  <div className="flex items-center px-4 py-4 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-b-xl">
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></div>
                      <div>
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block">Compound Growth (Interest)</span>
                      </div>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-black tabular-nums text-emerald-600 dark:text-emerald-400">+{calculations.formatCurrency(calculations.totalInterest)}</span>
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