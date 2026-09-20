"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Baby, Droplets, DollarSign, Package, 
  CalendarDays, ShoppingCart, Calculator, 
  Info, Sparkles, Box, Wallet
} from "lucide-react";

// Pediatric Averages for Diaper Usage
const AGE_GROUPS = [
  { id: "nb", label: "Newborn (0-1 mo)", min: 10, max: 12, size: "Newborn (N) or Size 1", desc: "Frequent feeding means frequent liquid output." },
  { id: "1-3m", label: "1 to 3 Months", min: 8, max: 10, size: "Size 1 or 2", desc: "Digestion settles slightly. Bladder grows." },
  { id: "3-6m", label: "3 to 6 Months", min: 7, max: 8, size: "Size 2 or 3", desc: "Longer sleep stretches reduce nighttime changes." },
  { id: "6-9m", label: "6 to 9 Months", min: 6, max: 7, size: "Size 3", desc: "Solid foods introduced, bowel movements change." },
  { id: "9-12m", label: "9 to 12 Months", min: 5, max: 6, size: "Size 3 or 4", desc: "More predictable patterns established." },
  { id: "1-2y", label: "1 to 2 Years", min: 4, max: 5, size: "Size 4 or 5", desc: "Toddler stage. Higher volume, less frequency." },
  { id: "2-3y", label: "2 to 3 Years", min: 3, max: 4, size: "Size 5, 6 or Pull-Ups", desc: "Potty training preparation phase." }
];

export default function DiaperChangesEstimator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [age, setAge] = useState(AGE_GROUPS[0]);
  
  // Customization & Financials
  const [costPerDiaper, setCostPerDiaper] = useState(0.25); // Average US premium diaper cost
  const [wipesPerChange, setWipesPerChange] = useState(3);
  
  // Stockpile Planning
  const [stockDuration, setStockDuration] = useState(1); // months
  const [currency, setCurrency] = useState("$");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Core Stockpile & Math Engine
  const calculations = useMemo(() => {
    // Averages
    const avgDailyChanges = Math.round((age.min + age.max) / 2);
    
    // Daily Stats
    const dailyCost = avgDailyChanges * costPerDiaper;
    const dailyWipes = avgDailyChanges * wipesPerChange;
    
    // Monthly / Yearly Projections (Average 30.4 days per month)
    const daysInMonth = 30.4;
    const monthlyDiapers = Math.round(avgDailyChanges * daysInMonth);
    const monthlyCost = monthlyDiapers * costPerDiaper;
    const yearlyCost = avgDailyChanges * 365 * costPerDiaper;

    // Stockpile Goal
    const stockDays = stockDuration * daysInMonth;
    const stockDiapers = Math.round(avgDailyChanges * stockDays);
    const stockWipes = Math.round(dailyWipes * stockDays);
    const stockCost = stockDiapers * costPerDiaper;

    return {
      daily: { min: age.min, max: age.max, avg: avgDailyChanges },
      dailyCost,
      dailyWipes,
      monthlyDiapers,
      monthlyCost,
      yearlyCost,
      stock: {
        diapers: stockDiapers,
        wipes: stockWipes,
        cost: stockCost,
        months: stockDuration
      }
    };
  }, [age, costPerDiaper, wipesPerChange, stockDuration]);

  const formatMoney = (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatNum = (val) => val.toLocaleString();

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-teal-100 to-transparent dark:from-teal-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-teal-50 dark:bg-teal-900/30 p-3.5 rounded-2xl">
            <Baby className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Diaper Estimator & Stockpile Planner
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Daily Changes, Size Guide & Budget Projections
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Age Selection Grid */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-slate-400" /> Baby's Age Group
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AGE_GROUPS.map((group) => {
                  const isActive = age.id === group.id;
                  return (
                    <button
                      key={group.id}
                      onClick={() => setAge(group)}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col gap-1 ${
                        isActive
                          ? "bg-teal-50 dark:bg-teal-900/20 border-teal-500 shadow-sm scale-[1.02]"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-teal-200"
                      }`}
                    >
                      <span className={`block text-xs font-black uppercase tracking-widest ${isActive ? 'text-teal-700 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {group.label}
                      </span>
                      <span className="block text-[10px] font-medium text-slate-500 leading-snug mt-0.5">
                        Est. {group.min}-{group.max} / day
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customization & Budgets */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-5">
                <Calculator className="w-4 h-4 text-slate-400" /> Math & Variables
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Wipes Ratio Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Wipes per Change</span>
                    <span className="text-xs font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded">
                      {wipesPerChange} Wipes
                    </span>
                  </div>
                  <input
                    type="range" min="1" max="6" step="1"
                    value={wipesPerChange}
                    onChange={(e) => setWipesPerChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-50"
                  />
                  <span className="block text-[9px] font-medium text-slate-400">Blowouts require more wipes!</span>
                </div>

                {/* Cost Per Diaper */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cost Per Diaper</span>
                    <span className="text-xs font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded">
                      {currency}{costPerDiaper.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-teal-400 transition-all px-3">
                    <input
                      type="text" value={currency} onChange={(e) => setCurrency(e.target.value)}
                      className="w-8 bg-transparent py-2.5 text-sm font-bold text-slate-400 outline-none border-r border-slate-200 dark:border-slate-700 text-center"
                    />
                    <input
                      type="number" min="0.01" step="0.01" value={costPerDiaper} onChange={(e) => setCostPerDiaper(parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent px-3 py-2.5 text-sm font-black text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Stockpile Goal Setter */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-end mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-slate-400" /> Stockpile Goal
                </label>
                <span className="text-sm font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800/50">
                  {stockDuration} {stockDuration === 1 ? "Month" : "Months"}
                </span>
              </div>
              
              <div className="px-1">
                <input
                  type="range" min="1" max="12" step="1"
                  value={stockDuration}
                  onChange={(e) => setStockDuration(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-50 dark:focus:ring-teal-900/20"
                />
                <div className="flex justify-between text-[10px] font-bold mt-2 uppercase tracking-widest text-slate-400">
                  <span>1 Month</span>
                  <span className="text-teal-400">6 Months</span>
                  <span>1 Year</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: PLANNER DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              {/* Daily Requirements */}
              <div className="text-center mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm mb-4">
                  <Baby className="w-3.5 h-3.5 text-teal-500" /> Daily Requirements
                </span>
                
                <div className="flex justify-center items-end gap-2">
                  <span className="text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                    {calculations.daily.avg}
                  </span>
                  <span className="text-lg font-bold text-slate-400 mb-2 uppercase tracking-widest">
                    Diapers
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs font-bold text-slate-500">
                  <span>(Range: {calculations.daily.min} - {calculations.daily.max})</span>
                  <span>•</span>
                  <span className="text-teal-600 dark:text-teal-400">~{calculations.dailyWipes} Wipes</span>
                </div>
              </div>

              {/* The Stockpile Shopping List */}
              <div className="flex-1 mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-slate-400" /> Your Stockpile Shopping List
                </h4>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                    <Box className="w-5 h-5 text-teal-500 mb-2" />
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none mb-1">
                      {formatNum(calculations.stock.diapers)}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Total Diapers</span>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                    <Droplets className="w-5 h-5 text-sky-500 mb-2" />
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none mb-1">
                      {formatNum(calculations.stock.wipes)}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Total Wipes</span>
                  </div>
                </div>

                {/* Sizing Alert */}
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 p-3 rounded-xl flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-0.5">
                      Sizing Tip for this Stockpile
                    </span>
                    <p className="text-[10px] font-medium text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                      At this age, buy primarily <strong>{age.size}</strong>. If stocking up for many months, mix sizes as babies grow out of smaller sizes fast.
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Reality Check Box */}
              <div className="bg-slate-800 dark:bg-black p-5 rounded-2xl shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Wallet className="w-24 h-24 text-teal-400" />
                </div>
                
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  Financial Projections
                </span>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                    <span className="text-xs font-bold text-slate-300">Monthly Est.</span>
                    <span className="text-sm font-black text-white">{currency}{formatMoney(calculations.monthlyCost)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                    <span className="text-xs font-bold text-slate-300">Cost for {stockDuration} mo Stockpile</span>
                    <span className="text-sm font-black text-teal-400">{currency}{formatMoney(calculations.stock.cost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">Yearly Burn Rate</span>
                    <span className="text-base font-black text-white">{currency}{formatMoney(calculations.yearlyCost)}</span>
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