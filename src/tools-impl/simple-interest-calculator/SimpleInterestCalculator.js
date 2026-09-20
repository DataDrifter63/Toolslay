"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  PiggyBank, Landmark, TrendingUp, Wallet, 
  Percent, CalendarDays, ArrowRightLeft, 
  PieChart, Activity, DollarSign, AlertCircle,
  Clock
} from "lucide-react";

export default function SimpleInterestCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Modes: 'investment' or 'loan'
  const [mode, setMode] = useState("investment");
  
  // Inputs
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("5.5");
  const [time, setTime] = useState("3");
  const [timeUnit, setTimeUnit] = useState("years"); // 'years', 'months', 'days'

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNumInput = (setter, value) => {
    if (value === "") {
      setter("");
      return;
    }
    if (/^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  // --- CORE FINANCIAL ENGINE ---
  const calculations = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(rate) || 0;
    let tValue = parseFloat(time) || 0;

    // Convert time to years for standard formula (P * R * T / 100)
    let tInYears = 0;
    if (timeUnit === "years") tInYears = tValue;
    else if (timeUnit === "months") tInYears = tValue / 12;
    else if (timeUnit === "days") tInYears = tValue / 365;

    // Standard Simple Interest
    const interest = (p * r * tInYears) / 100;
    const totalAmount = p + interest;

    // Visual Bar Ratios
    const pctPrincipal = totalAmount > 0 ? (p / totalAmount) * 100 : 0;
    const pctInterest = totalAmount > 0 ? (interest / totalAmount) * 100 : 0;

    // Wealth Velocity (Breakdown of interest accumulation)
    // Only calculate if there's actual time
    const yearlyInterest = tInYears > 0 ? interest / tInYears : 0;
    const monthlyInterest = yearlyInterest / 12;
    const dailyInterest = yearlyInterest / 365;

    // Time to double (Simple Interest rule: 100 / r)
    const timeToDouble = r > 0 ? (100 / r).toFixed(1) : "∞";

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return {
      interest, totalAmount, p,
      pctPrincipal, pctInterest,
      yearlyInterest, monthlyInterest, dailyInterest,
      timeToDouble,
      formatCurrency
    };
  }, [principal, rate, time, timeUnit]);

  if (!isMounted) return null;

  // Theme Configurator based on Mode
  const theme = {
    gradient: mode === "investment" ? "from-emerald-100 via-teal-50 to-transparent dark:from-emerald-900/30 dark:via-teal-900/10" : "from-rose-100 via-orange-50 to-transparent dark:from-rose-900/30 dark:via-orange-900/10",
    iconBg: mode === "investment" ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-rose-500 to-orange-600",
    textPri: mode === "investment" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
    bgLight: mode === "investment" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20",
    borderLight: mode === "investment" ? "border-emerald-200 dark:border-emerald-800" : "border-rose-200 dark:border-rose-800",
    MainIcon: mode === "investment" ? PiggyBank : Landmark,
    actionText: mode === "investment" ? "Interest Earned" : "Interest Cost"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500`}>
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.iconBg} p-3.5 rounded-2xl shadow-md transition-all duration-500`}>
            <theme.MainIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Simple Interest Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Deposit & Loan Analytics
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner">
              <button 
                onClick={() => setMode("investment")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${mode === "investment" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <TrendingUp className="w-4 h-4" /> Deposit / Investment
              </button>
              <button 
                onClick={() => setMode("loan")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${mode === "loan" ? "bg-white dark:bg-slate-700 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <Landmark className="w-4 h-4" /> Loan / Borrowing
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="space-y-6">
              
              {/* Principal Amount */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <Wallet className={`w-3.5 h-3.5 ${theme.textPri}`} /> 
                  Principal Amount (Initial {mode === "investment" ? "Deposit" : "Loan"})
                </label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-slate-400 transition-all overflow-hidden">
                  <span className="pl-6 text-2xl font-black text-slate-400">$</span>
                  <input
                    type="text" value={principal} onChange={(e) => handleNumInput(setPrincipal, e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent px-3 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Interest Rate */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Percent className={`w-3.5 h-3.5 ${theme.textPri}`} /> Annual Interest Rate
                  </label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-slate-400 transition-all overflow-hidden">
                    <input
                      type="text" value={rate} onChange={(e) => handleNumInput(setRate, e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-transparent px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums text-right"
                    />
                    <span className="pr-4 pl-2 text-lg font-black text-slate-400">%</span>
                  </div>
                </div>

                {/* Time Period */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <CalendarDays className={`w-3.5 h-3.5 ${theme.textPri}`} /> Time Period
                  </label>
                  <div className="flex items-stretch bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-slate-400 transition-all overflow-hidden">
                    <input
                      type="text" value={time} onChange={(e) => handleNumInput(setTime, e.target.value)}
                      placeholder="0"
                      className="w-1/2 bg-transparent px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums text-center border-r border-slate-200 dark:border-slate-700"
                    />
                    <select 
                      value={timeUnit} onChange={(e) => setTimeUnit(e.target.value)}
                      className="w-1/2 bg-transparent px-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
                    >
                      <option value="years">Years</option>
                      <option value="months">Months</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Smart Context Alert */}
            <div className={`p-4 rounded-2xl flex items-start gap-3 transition-colors ${theme.bgLight} ${theme.borderLight} border`}>
              <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${theme.textPri}`} />
              <div>
                <span className={`block text-xs font-black uppercase tracking-widest ${theme.textPri}`}>
                  Simple Interest Only
                </span>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                  This calculation does not compound. Interest is calculated solely on the initial principal amount. For stock market or savings accounts, a Compound Interest Calculator is usually more accurate.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <PieChart className={`w-4 h-4 ${theme.textPri}`} /> Financial Summary
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                  {timeUnit} Scale
                </span>
              </div>

              {/* HERO METRICS */}
              <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-8 px-4 rounded-3xl shadow-sm mb-6 relative overflow-hidden shrink-0">
                <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                  Total Maturity Amount
                </span>
                <span className="text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums leading-none">
                  {calculations.formatCurrency(calculations.totalAmount)}
                </span>
                
                {/* Visual Ratio Bar */}
                {calculations.totalAmount > 0 && (
                  <div className="w-4/5 mx-auto mt-8">
                    <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <div style={{ width: `${calculations.pctPrincipal}%` }} className="bg-slate-300 dark:bg-slate-600 transition-all duration-1000"></div>
                      <div style={{ width: `${calculations.pctInterest}%` }} className={`${theme.iconBg} transition-all duration-1000`}></div>
                    </div>
                    <div className="flex justify-between mt-2 px-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <span>Principal ({calculations.pctPrincipal.toFixed(0)}%)</span>
                      <span className={theme.textPri}>Interest ({calculations.pctInterest.toFixed(0)}%)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* BREAKDOWN RECEIPT */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-2 shadow-sm mb-4">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  
                  <div className="flex items-center justify-between px-4 py-4 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initial Principal</span>
                    <span className="text-sm font-black tabular-nums text-slate-800 dark:text-slate-100">{calculations.formatCurrency(calculations.p)}</span>
                  </div>
                  
                  <div className={`flex items-center justify-between px-4 py-4 ${theme.bgLight}`}>
                    <span className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${theme.textPri}`}>
                      <Activity className="w-3.5 h-3.5" /> {theme.actionText}
                    </span>
                    <span className={`text-sm font-black tabular-nums ${theme.textPri}`}>
                      +{calculations.formatCurrency(calculations.interest)}
                    </span>
                  </div>

                </div>
              </div>

              {/* WEALTH VELOCITY (Accumulation Speed) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Clock className="w-3.5 h-3.5" /> Interest Velocity Breakdown
                </h4>
                
                <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100 dark:divide-slate-800">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Yearly</span>
                    <span className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-200">{calculations.formatCurrency(calculations.yearlyInterest)}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly</span>
                    <span className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-200">{calculations.formatCurrency(calculations.monthlyInterest)}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Daily</span>
                    <span className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-200">{calculations.formatCurrency(calculations.dailyInterest)}</span>
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