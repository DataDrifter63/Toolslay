"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Target, DollarSign, Package, TrendingUp, AlertTriangle, Briefcase, Activity, PieChart, ArrowUpRight } from "lucide-react";

const CURRENCIES = [
  { code: 'USD', symbol: '$', locale: 'en-US' },
  { code: 'EUR', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', locale: 'en-GB' },
  { code: 'PKR', symbol: '₨', locale: 'en-PK' },
  { code: 'INR', symbol: '₹', locale: 'en-IN' },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', locale: 'en-CA' }
];

const formatCurrency = (val, currencyCode, locale) => {
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency: currencyCode, 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }).format(val || 0);
};

// ✅ BULLETPROOF EXPORT FUNCTION (Fixes HMR Object Error)
export default function BreakEvenCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [showAdvanced, setShowAdvanced] = useState(true);

  // Core Inputs
  const [fixedCosts, setFixedCosts] = useState("5000"); // Rent, Salaries, Insurance
  const [variableCost, setVariableCost] = useState("20"); // Materials, Direct Labor per unit
  const [pricePerUnit, setPricePerUnit] = useState("50"); 
  
  // Advanced Pro Inputs
  const [targetProfit, setTargetProfit] = useState("10000"); 

  // Results
  const [results, setResults] = useState({
    contributionMargin: 0,
    grossMarginPct: 0,
    markupPct: 0,
    breakEvenUnits: 0,
    breakEvenRevenue: 0,
    targetUnits: 0,
    targetRevenue: 0,
    isImpossible: false
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateBreakEven = useCallback(() => {
    const fixed = Number(fixedCosts) || 0;
    const vc = Number(variableCost) || 0;
    const price = Number(pricePerUnit) || 0;
    const target = Number(targetProfit) || 0;

    const contributionMargin = price - vc;
    
    // Impossible Scenario: Price is less than or equal to Variable Cost
    if (price <= 0 || contributionMargin <= 0) {
        setResults({
            contributionMargin,
            grossMarginPct: price > 0 ? (contributionMargin / price) * 100 : 0,
            markupPct: vc > 0 ? (contributionMargin / vc) * 100 : 0,
            breakEvenUnits: 0,
            breakEvenRevenue: 0,
            targetUnits: 0,
            targetRevenue: 0,
            isImpossible: true
        });
        return;
    }

    const beUnits = Math.ceil(fixed / contributionMargin);
    const beRevenue = beUnits * price;

    const tUnits = Math.ceil((fixed + target) / contributionMargin);
    const tRevenue = tUnits * price;

    const grossMarginPct = (contributionMargin / price) * 100;
    const markupPct = vc > 0 ? (contributionMargin / vc) * 100 : 100;

    setResults({
      contributionMargin,
      grossMarginPct,
      markupPct,
      breakEvenUnits: beUnits,
      breakEvenRevenue: beRevenue,
      targetUnits: tUnits,
      targetRevenue: tRevenue,
      isImpossible: false
    });

  }, [fixedCosts, variableCost, pricePerUnit, targetProfit]);

  useEffect(() => {
    calculateBreakEven();
  }, [calculateBreakEven]);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-violet-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Pro Break-Even Engine</h2>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={currency.code}
            onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
            className="text-sm font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
          </select>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 transition-colors">
            <Target className="w-4 h-4" /> {showAdvanced ? "Basic Mode" : "Target Goals"}
          </button>
        </div>
      </div>

      {results.isImpossible && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4 rounded-xl flex items-start md:items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0" />
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400">Critical Pricing Error Detected</h4>
            <p className="text-xs font-medium text-rose-600 dark:text-rose-300">
              Your Variable Cost per unit is higher than or equal to your Selling Price. You lose money on every sale. Break-even is mathematically impossible until you raise the price or lower costs.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* Input Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-xl shadow-sm space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-3 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Briefcase className="w-4 h-4 text-violet-500"/> Total Fixed Costs
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-violet-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={fixedCosts} onChange={handleInputChange(setFixedCosts)} className="w-full text-3xl font-black pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100 transition-shadow" placeholder="e.g. Rent, Salaries" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-200">
                   <span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500"/> Sell Price (Per Unit)</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-emerald-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={pricePerUnit} onChange={handleInputChange(setPricePerUnit)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Package className="w-4 h-4 text-rose-500"/> Variable Cost (Per Unit)
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-rose-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={variableCost} onChange={handleInputChange(setVariableCost)} className={`w-full text-xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 transition-shadow ${results.isImpossible ? 'border-rose-300 focus:ring-rose-500 text-rose-700' : 'border-slate-200 dark:border-slate-700 focus:ring-rose-500 text-slate-800 dark:text-slate-100'}`} />
                </div>
              </div>

            </div>

            {showAdvanced && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                   <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Target className="w-4 h-4 text-indigo-500"/> Pro Goal Modeling</h3>
                   <span className="text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Business Scaling</span>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Desired Target Profit</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-indigo-500 transition-colors">{currency.symbol}</span>
                    <input type="number" min="0" value={targetProfit} onChange={handleInputChange(setTargetProfit)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-shadow" placeholder="E.g. 10000" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Find out exactly how many units you need to sell to hit this profit target after covering all fixed costs.</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Output Dashboard */}
        <div className="flex flex-col gap-6 h-full sticky top-6">
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm text-center relative overflow-hidden">
             <div className="z-10 relative">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Break-Even Point (Zero Profit)</h3>
               <div className="text-6xl md:text-7xl font-black tracking-tighter text-white mb-2">
                 {isMounted ? results.breakEvenUnits.toLocaleString() : "0"}
               </div>
               <div className="text-sm font-semibold text-violet-400 uppercase tracking-widest">
                 Units to Sell
               </div>
             </div>

             <div className="mt-8 mb-2 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-300 uppercase">Revenue Required</span>
                 <span className="text-xl font-black text-emerald-400">{isMounted ? formatCurrency(results.breakEvenRevenue, currency.code, currency.locale) : "$0"}</span>
             </div>
          </div>

          {showAdvanced && Number(targetProfit) > 0 && !results.isImpossible && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-800/50 p-6 rounded-xl shadow-sm animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2 border-b border-indigo-800/50 pb-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-semibold text-white">To Hit Target Profit</h3>
              </div>
              
              <div className="flex justify-between items-end mb-4">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-indigo-400/70 uppercase tracking-widest mb-1">Target Units</span>
                      <span className="text-4xl font-black text-indigo-400 tracking-tighter">
                        {isMounted ? results.targetUnits.toLocaleString() : "0"}
                      </span>
                  </div>
                  <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest mb-1">Target Revenue</span>
                      <span className="text-2xl font-black text-emerald-400">
                        {isMounted ? formatCurrency(results.targetRevenue, currency.code, currency.locale) : "$0"}
                      </span>
                  </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <PieChart className="w-5 h-5 text-sky-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Unit Economics & Margins</h3>
            </div>
            
            <div className="space-y-3">
               <div className="flex justify-between items-center p-3 rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/30">
                   <div className="flex flex-col">
                       <span className="text-xs font-black text-sky-700 dark:text-sky-400 uppercase">Contribution Margin</span>
                       <span className="text-[10px] font-bold text-slate-400 mt-0.5">Profit per unit before fixed costs</span>
                   </div>
                   <span className="text-lg font-black text-sky-600 dark:text-sky-300">
                      {isMounted ? formatCurrency(results.contributionMargin, currency.code, currency.locale) : "$0"}
                   </span>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                   <div className="flex flex-col items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                       <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Gross Margin</span>
                       <span className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                          {isMounted ? results.grossMarginPct.toFixed(1) : "0"}%
                       </span>
                   </div>
                   <div className="flex flex-col items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                       <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Markup</span>
                       <span className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                          {isMounted ? results.markupPct.toFixed(1) : "0"}% <ArrowUpRight className="w-4 h-4 text-emerald-500"/>
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