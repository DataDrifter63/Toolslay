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
  const [mode, setMode] = useState("investment");
  
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("5.5");
  const [time, setTime] = useState("3");
  const [timeUnit, setTimeUnit] = useState("years");

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

  const calculations = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(rate) || 0;
    const tValue = parseFloat(time) || 0;

    let tInYears = 0;
    if (timeUnit === "years") tInYears = tValue;
    else if (timeUnit === "months") tInYears = tValue / 12;
    else if (timeUnit === "days") tInYears = tValue / 365;

    const interest = (p * r * tInYears) / 100;
    const totalAmount = p + interest;

    const pctPrincipal = totalAmount > 0 ? (p / totalAmount) * 100 : 0;
    const pctInterest = totalAmount > 0 ? (interest / totalAmount) * 100 : 0;

    const yearlyInterest = tInYears > 0 ? interest / tInYears : 0;
    const monthlyInterest = yearlyInterest / 12;
    const dailyInterest = yearlyInterest / 365;

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return {
      interest, totalAmount, p,
      pctPrincipal, pctInterest,
      yearlyInterest, monthlyInterest, dailyInterest,
      formatCurrency
    };
  }, [principal, rate, time, timeUnit]);

  if (!isMounted) return null;

  const isInvestment = mode === "investment";
  const MainIcon = isInvestment ? PiggyBank : Landmark;
  const actionText = isInvestment ? "Interest Earned" : "Interest Cost";

  const baseInputStyle = "w-full min-w-0 bg-paper border border-line rounded-xl px-3 py-2.5 text-base font-bold text-ink outline-none focus:border-brand tabular-nums";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <MainIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              Simple Interest Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              Deposit & Loan Analytics
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start min-w-0">
        
        {/* CONFIGURATION */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* Mode Toggle */}
            <div className="flex bg-paper rounded-xl p-1 border border-line min-w-0 gap-1">
              <button 
                type="button"
                onClick={() => setMode("investment")}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2.5 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all min-w-0 truncate ${isInvestment ? "bg-surface text-brand shadow-sm border border-line" : "text-muted hover:text-ink"}`}
              >
                <TrendingUp className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Deposit / Investment</span>
              </button>
              <button 
                type="button"
                onClick={() => setMode("loan")}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2.5 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all min-w-0 truncate ${!isInvestment ? "bg-surface text-brand shadow-sm border border-line" : "text-muted hover:text-ink"}`}
              >
                <Landmark className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Loan / Borrowing</span>
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="space-y-5 min-w-0">
              
              {/* Principal Amount */}
              <div className="min-w-0">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-2 truncate">
                  <Wallet className="w-3.5 h-3.5 text-brand shrink-0" /> 
                  Principal Amount (Initial {isInvestment ? "Deposit" : "Loan"})
                </label>
                <div className="relative flex items-center bg-paper border border-line rounded-xl focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition-all overflow-hidden min-w-0">
                  <span className="pl-4 sm:pl-5 text-xl sm:text-2xl font-black text-muted">$</span>
                  <input
                    type="text" value={principal} onChange={(e) => handleNumInput(setPrincipal, e.target.value)}
                    placeholder="0.00"
                    className="w-full min-w-0 bg-transparent px-2.5 py-4 sm:py-5 text-2xl sm:text-3xl font-black text-ink outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                {/* Interest Rate */}
                <div className="min-w-0">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-2 truncate">
                    <Percent className="w-3.5 h-3.5 text-brand shrink-0" /> Annual Interest Rate
                  </label>
                  <div className="relative flex items-center min-w-0">
                    <input
                      type="text" value={rate} onChange={(e) => handleNumInput(setRate, e.target.value)}
                      placeholder="0.0"
                      className={`${baseInputStyle} pr-8 text-right`}
                    />
                    <span className="absolute right-3 text-base font-black text-muted pointer-events-none">%</span>
                  </div>
                </div>

                {/* Time Period */}
                <div className="min-w-0">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-2 truncate">
                    <CalendarDays className="w-3.5 h-3.5 text-brand shrink-0" /> Time Period
                  </label>
                  <div className="flex items-stretch bg-paper border border-line rounded-xl overflow-hidden min-w-0">
                    <input
                      type="text" value={time} onChange={(e) => handleNumInput(setTime, e.target.value)}
                      placeholder="0"
                      className="w-1/2 bg-transparent px-3 py-2.5 text-base font-black text-ink outline-none tabular-nums text-center border-r border-line"
                    />
                    <select 
                      value={timeUnit} onChange={(e) => setTimeUnit(e.target.value)}
                      className="w-1/2 bg-surface px-2 text-[10px] font-black uppercase tracking-wider text-ink outline-none cursor-pointer truncate"
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
            <div className="p-4 rounded-xl bg-paper border border-line flex items-start gap-3 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-brand" />
              <div className="min-w-0">
                <span className="block text-xs font-black uppercase tracking-wider text-ink truncate">
                  Simple Interest Only
                </span>
                <p className="text-[11px] font-medium text-muted leading-relaxed mt-0.5">
                  Calculation does not compound. Interest applies strictly to the initial principal amount.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[500px] min-w-0">
            
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <PieChart className="w-4 h-4 text-brand shrink-0" /> Financial Summary
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0">
                {timeUnit} Scale
              </span>
            </div>

            {/* HERO METRICS */}
            <div className="text-center bg-paper border border-line py-6 px-4 rounded-xl shadow-sm mb-5 relative overflow-hidden shrink-0 min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2 truncate">
                Total Maturity Amount
              </span>
              <span className="text-4xl sm:text-5xl font-black text-ink tracking-tight tabular-nums leading-none truncate block">
                {calculations.formatCurrency(calculations.totalAmount)}
              </span>
              
              {calculations.totalAmount > 0 && (
                <div className="w-full px-2 mt-5">
                  <div className="flex h-2.5 rounded-full overflow-hidden bg-line">
                    <div style={{ width: `${calculations.pctPrincipal}%` }} className="bg-muted/40 transition-all duration-500"></div>
                    <div style={{ width: `${calculations.pctInterest}%` }} className="bg-brand transition-all duration-500"></div>
                  </div>
                  <div className="flex justify-between mt-1.5 px-0.5 text-[9px] font-black uppercase tracking-wider text-muted min-w-0">
                    <span className="truncate">Principal ({calculations.pctPrincipal.toFixed(0)}%)</span>
                    <span className="text-brand truncate">Interest ({calculations.pctInterest.toFixed(0)}%)</span>
                  </div>
                </div>
              )}
            </div>

            {/* BREAKDOWN RECEIPT */}
            <div className="flex-1 flex flex-col min-h-0 bg-paper rounded-xl border border-line p-2 shadow-sm mb-4 min-w-0">
              <div className="flex-1 overflow-y-auto custom-scrollbar min-w-0">
                
                <div className="flex items-center justify-between px-3 py-3 border-b border-line/50 text-xs min-w-0">
                  <span className="font-bold text-muted uppercase tracking-wider truncate">Initial Principal</span>
                  <span className="font-black tabular-nums text-ink shrink-0">{calculations.formatCurrency(calculations.p)}</span>
                </div>
                
                <div className="flex items-center justify-between px-3 py-3 bg-brand/5 text-xs min-w-0">
                  <span className="font-black uppercase tracking-wider flex items-center gap-1.5 text-brand truncate">
                    <Activity className="w-3.5 h-3.5 shrink-0" /> {actionText}
                  </span>
                  <span className="font-black tabular-nums text-brand shrink-0">
                    +{calculations.formatCurrency(calculations.interest)}
                  </span>
                </div>

              </div>
            </div>

            {/* WEALTH VELOCITY */}
            <div className="bg-paper border border-line p-4 rounded-xl shadow-sm min-w-0">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-muted mb-2.5 flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <Clock className="w-3.5 h-3.5 shrink-0" /> Interest Velocity Breakdown
              </h4>
              
              <div className="grid grid-cols-3 gap-2 text-center divide-x divide-line min-w-0 text-xs">
                <div className="min-w-0 truncate">
                  <span className="block text-[8px] font-bold text-muted uppercase tracking-wider mb-0.5 truncate">Yearly</span>
                  <span className="font-black tabular-nums text-ink truncate block">{calculations.formatCurrency(calculations.yearlyInterest)}</span>
                </div>
                <div className="min-w-0 truncate px-1">
                  <span className="block text-[8px] font-bold text-muted uppercase tracking-wider mb-0.5 truncate">Monthly</span>
                  <span className="font-black tabular-nums text-ink truncate block">{calculations.formatCurrency(calculations.monthlyInterest)}</span>
                </div>
                <div className="min-w-0 truncate">
                  <span className="block text-[8px] font-bold text-muted uppercase tracking-wider mb-0.5 truncate">Daily</span>
                  <span className="font-black tabular-nums text-ink truncate block">{calculations.formatCurrency(calculations.dailyInterest)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}