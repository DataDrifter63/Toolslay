"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Car, TrendingDown, DollarSign, CalendarDays, 
  Key, ShieldCheck, Gem, BatteryCharging,
  Info, PieChart, Activity, AlertCircle, ArrowDownRight
} from "lucide-react";

export default function CarDepreciationCalculator() {
  const [isMounted, setIsMounted] = useState(false);

  // Inputs
  const [price, setPrice] = useState("35000");
  const [condition, setCondition] = useState("new"); // 'new' or 'used'
  const [brandTier, setBrandTier] = useState("standard"); // 'economy', 'standard', 'luxury', 'ev'
  const [yearsToOwn, setYearsToOwn] = useState("5");

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

  // --- CORE DEPRECIATION ENGINE ---
  const calculations = useMemo(() => {
    const startPrice = parseFloat(price) || 0;
    const years = parseInt(yearsToOwn) || 0;
    
    // Base Rates based on Brand Tier
    // Format: [Year 1 Cliff (New Only), Year 2-5 Rate, Year 6+ Rate]
    const rates = {
      economy: { cliff: 0.15, mid: 0.10, late: 0.08, name: "Economy / Reliable" },
      standard: { cliff: 0.20, mid: 0.15, late: 0.10, name: "Standard" },
      luxury: { cliff: 0.25, mid: 0.18, late: 0.15, name: "Luxury / Premium" },
      ev: { cliff: 0.28, mid: 0.20, late: 0.12, name: "Electric Vehicle (EV)" }
    };

    const currentRates = rates[brandTier];
    let schedule = [];
    let currentVal = startPrice;
    let totalDepreciation = 0;

    for (let i = 1; i <= Math.min(years, 30); i++) { // Cap at 30 years to prevent infinite bounds
      let depRate = 0;

      if (i === 1 && condition === "new") {
        depRate = currentRates.cliff;
      } else if (i <= 5) {
        depRate = currentRates.mid;
      } else {
        depRate = currentRates.late;
      }

      // If condition is used, we skip the extreme Year 1 cliff, but simulate standard mid-life drop
      if (i === 1 && condition === "used") {
         depRate = currentRates.mid;
      }

      let dropAmt = currentVal * depRate;
      currentVal -= dropAmt;
      totalDepreciation += dropAmt;

      schedule.push({
        year: i,
        startVal: currentVal + dropAmt,
        dropAmt: dropAmt,
        endVal: currentVal,
        rateApplied: depRate * 100
      });
    }

    const finalValue = currentVal;
    
    const pctRetained = startPrice > 0 ? (finalValue / startPrice) * 100 : 0;
    const pctLost = startPrice > 0 ? (totalDepreciation / startPrice) * 100 : 0;

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return {
      startPrice, years, finalValue, totalDepreciation,
      schedule, pctRetained, pctLost, currentRates,
      formatCurrency
    };
  }, [price, condition, brandTier, yearsToOwn]);

  if (!isMounted) return null;

  // Theming Engine based on Brand Tier
  const tierThemes = {
    economy: "from-blue-500 to-cyan-500 ring-blue-500/20 text-blue-500",
    standard: "from-slate-600 to-slate-400 ring-slate-500/20 text-slate-600 dark:text-slate-400",
    luxury: "from-amber-500 to-orange-500 ring-amber-500/20 text-amber-500",
    ev: "from-emerald-500 to-teal-500 ring-emerald-500/20 text-emerald-500"
  };

  const activeTheme = tierThemes[brandTier];

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-all duration-500">
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${activeTheme.replace('text-', 'from-').split(' ')[0].replace('500', '100')} via-slate-50 to-transparent dark:opacity-10 opacity-70 rounded-bl-full -z-10 transition-all duration-1000`}></div>
        <div className="flex items-center gap-4">
          <div className={`bg-gradient-to-br ${activeTheme.split(' ')[0]} ${activeTheme.split(' ')[1]} p-3.5 rounded-2xl shadow-md transition-all duration-500`}>
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Auto Depreciation Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Vehicle Value Retention Calculator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start">
        
        {/* ================= LEFT: ADVANCED CONFIGURATION ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Purchase Price Input (Upgraded UI) */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <DollarSign className={`w-3.5 h-3.5 ${activeTheme.split(' ')[2]}`} /> 1. Purchase Price
              </label>
              
              <div className={`relative flex items-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-slate-400 focus-within:ring-4 ${activeTheme.split(' ')[2].replace('text-', 'focus-within:ring-')} transition-all overflow-hidden group`}>
                <div className="bg-slate-50 dark:bg-slate-800 px-5 py-5 flex items-center justify-center border-r border-slate-200 dark:border-slate-700 transition-colors">
                  <DollarSign className="w-6 h-6 text-slate-400" />
                </div>
                <input
                  type="text" value={price} onChange={(e) => handleNumInput(setPrice, e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent px-5 py-5 text-3xl font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                />
              </div>
            </div>

            {/* Condition Toggle */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-500" /> 2. Vehicle Condition
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner">
                <button 
                  onClick={() => setCondition("new")}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg transition-all ${condition === "new" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  <span className="text-xs font-black uppercase tracking-widest">Brand New</span>
                  <span className="text-[9px] font-bold opacity-70">Has Year 1 Cliff</span>
                </button>
                <button 
                  onClick={() => setCondition("used")}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg transition-all ${condition === "used" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  <span className="text-xs font-black uppercase tracking-widest">Used / Pre-Owned</span>
                  <span className="text-[9px] font-bold opacity-70">Steadier Decline</span>
                </button>
              </div>
            </div>

            {/* Brand Tier Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> 3. Brand Depreciation Tier
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setBrandTier("economy")} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-start gap-1.5 ${brandTier === "economy" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/50"}`}>
                  <ShieldCheck className={`w-4 h-4 ${brandTier === "economy" ? "text-blue-500" : "text-slate-400"}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${brandTier === "economy" ? "text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"}`}>Economy</span>
                  <span className="text-[9px] font-bold text-slate-400 text-left line-clamp-1">Toyota, Honda, Kia</span>
                </button>
                <button onClick={() => setBrandTier("standard")} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-start gap-1.5 ${brandTier === "standard" ? "border-slate-600 dark:border-slate-400 bg-slate-100 dark:bg-slate-800" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/50"}`}>
                  <Car className={`w-4 h-4 ${brandTier === "standard" ? "text-slate-600 dark:text-slate-400" : "text-slate-400"}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${brandTier === "standard" ? "text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-400"}`}>Standard</span>
                  <span className="text-[9px] font-bold text-slate-400 text-left line-clamp-1">Ford, Chevy, Nissan</span>
                </button>
                <button onClick={() => setBrandTier("luxury")} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-start gap-1.5 ${brandTier === "luxury" ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/50"}`}>
                  <Gem className={`w-4 h-4 ${brandTier === "luxury" ? "text-amber-500" : "text-slate-400"}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${brandTier === "luxury" ? "text-amber-700 dark:text-amber-400" : "text-slate-600 dark:text-slate-400"}`}>Luxury</span>
                  <span className="text-[9px] font-bold text-slate-400 text-left line-clamp-1">BMW, Mercedes, Audi</span>
                </button>
                <button onClick={() => setBrandTier("ev")} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-start gap-1.5 ${brandTier === "ev" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/50"}`}>
                  <BatteryCharging className={`w-4 h-4 ${brandTier === "ev" ? "text-emerald-500" : "text-slate-400"}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${brandTier === "ev" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"}`}>Electric (EV)</span>
                  <span className="text-[9px] font-bold text-slate-400 text-left line-clamp-1">Tesla, Rivian, Polestar</span>
                </button>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Ownership Period */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-slate-500" /> 4. Ownership Duration
              </label>
              
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-snug">
                    How many years do you plan to keep this vehicle before selling or trading it in?
                  </p>
                </div>
                <div className="relative flex items-center w-28 shrink-0 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus-within:border-slate-500 transition-all overflow-hidden">
                  <input
                    type="text" value={yearsToOwn} onChange={(e) => handleNumInput(setYearsToOwn, e.target.value, 30)}
                    className="w-full bg-transparent px-3 py-2.5 text-base font-black text-center text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                  />
                  <span className="pr-3 text-[10px] font-bold text-slate-400 uppercase">Yrs</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD / LEDGER ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[700px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${activeTheme.split(' ')[2]}`} /> Valuation Summary
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                  Year {calculations.years} View
                </span>
              </div>

              {/* SMART ALERT (New Car Cliff Warning) */}
              {condition === "new" && calculations.years > 0 && (
                <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50 p-3 rounded-xl flex items-start gap-2 mb-4 shrink-0">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">The "Drive-Off" Penalty</span>
                    <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-0.5">As a brand new {calculations.currentRates.name.toLowerCase()} car, it will lose ~{calculations.currentRates.cliff * 100}% of its value in the very first year alone.</p>
                  </div>
                </div>
              )}

              {/* HERO METRIC */}
              <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-8 px-4 rounded-3xl shadow-sm mb-6 relative overflow-hidden shrink-0">
                <span className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Estimated Resale Value
                </span>
                <span className={`text-5xl sm:text-6xl font-black ${activeTheme.split(' ')[2]} tracking-tighter tabular-nums leading-none block`}>
                  {calculations.formatCurrency(calculations.finalValue)}
                </span>
                
                {/* Visual Ratio Bar */}
                {calculations.startPrice > 0 && (
                  <div className="w-11/12 mx-auto mt-8">
                    <div className="flex h-3.5 rounded-full overflow-hidden bg-rose-100 dark:bg-rose-900/30 shadow-inner">
                      {calculations.pctRetained > 0 && <div style={{ width: `${calculations.pctRetained}%` }} className={`bg-gradient-to-r ${activeTheme.split(' ')[0]} ${activeTheme.split(' ')[1]}`}></div>}
                    </div>
                    <div className="flex justify-between mt-2 px-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <span className={activeTheme.split(' ')[2]}>Retained ({calculations.pctRetained.toFixed(0)}%)</span>
                      <span className="text-rose-500">Lost ({calculations.pctLost.toFixed(0)}%)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* TOTAL LOSS SUMMARY */}
              <div className="flex items-center justify-between px-4 py-4 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/50 rounded-2xl mb-6 shrink-0">
                 <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                   <TrendingDown className="w-3.5 h-3.5" /> Total Value Evaporated
                 </span>
                 <span className="text-lg font-black tabular-nums text-rose-600 dark:text-rose-400">
                   − {calculations.formatCurrency(calculations.totalDepreciation)}
                 </span>
              </div>

              {/* DETAILED YEARLY LEDGER */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-2 shadow-sm">
                
                <div className="flex text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 pb-2 pt-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="w-16">Year</div>
                  <div className="flex-1">Depreciation</div>
                  <div className="w-1/3 text-right">Value Left</div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pt-1">
                  {calculations.schedule.map((row, idx) => (
                    <div key={idx} className="flex items-center px-3 py-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="w-16">
                        <span className="text-[11px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Yr {row.year}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold tabular-nums text-rose-500 flex items-center gap-1">
                          <ArrowDownRight className="w-3 h-3" /> {calculations.formatCurrency(row.dropAmt)}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{row.rateApplied.toFixed(0)}% drop</span>
                      </div>
                      <div className="w-1/3 text-right">
                        <span className="text-sm font-black tabular-nums text-slate-800 dark:text-slate-100">{calculations.formatCurrency(row.endVal)}</span>
                      </div>
                    </div>
                  ))}
                  
                  {calculations.schedule.length === 0 && (
                     <div className="flex-1 flex items-center justify-center h-20 text-xs font-bold text-slate-400">
                        Enter a valid year duration.
                     </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}