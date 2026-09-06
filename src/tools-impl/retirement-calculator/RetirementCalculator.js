"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PiggyBank, TrendingUp, Calendar, Briefcase, Target, Shield, DollarSign, Activity, Minus, Plus } from "lucide-react";

const CURRENCIES = [
  { code: 'USD', symbol: '$', locale: 'en-US' },
  { code: 'EUR', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', locale: 'en-GB' },
  { code: 'PKR', symbol: '₨', locale: 'en-PK' },
  { code: 'INR', symbol: '₹', locale: 'en-IN' },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU' }
];

const formatCurrency = (val, currencyCode, locale) => {
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency: currencyCode, 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }).format(val || 0);
};

export default function RetirementCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Core Inputs
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [currentSavings, setCurrentSavings] = useState("50000");
  const [monthlyContribution, setMonthlyContribution] = useState("1000");
  
  // Advanced Inputs
  const [employerMatch, setEmployerMatch] = useState("0");
  const [expectedReturn, setExpectedReturn] = useState(8); 
  const [inflationRate, setInflationRate] = useState(3); 
  const [withdrawalRate, setWithdrawalRate] = useState(4); 

  const [results, setResults] = useState({
    totalNestEgg: 0,
    totalContributed: 0,
    totalGrowth: 0,
    monthlyIncome: 0,
    annualIncome: 0,
    growthMultiplier: 0
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateRetirement = useCallback(() => {
    const age = Number(currentAge) || 0;
    const rAge = Number(retireAge) || 0;
    const savings = Number(currentSavings) || 0;
    const monthly = Number(monthlyContribution) || 0;
    const match = Number(employerMatch) || 0;
    const ret = Number(expectedReturn) || 0;
    const inf = Number(inflationRate) || 0;
    const swr = Number(withdrawalRate) || 0;

    const yearsToGrow = Math.max(0, rAge - age);
    
    if (yearsToGrow <= 0) {
      setResults({ totalNestEgg: savings, totalContributed: savings, totalGrowth: 0, monthlyIncome: (savings * (swr/100)) / 12, annualIncome: savings * (swr/100), growthMultiplier: 1 });
      return;
    }

    const realReturnRate = ((1 + (ret / 100)) / (1 + (inf / 100))) - 1;
    const monthlyRate = realReturnRate / 12;
    const totalMonths = yearsToGrow * 12;
    const totalMonthlyInvestment = monthly + match;

    let futureValue = 0;
    
    if (monthlyRate === 0) {
      futureValue = savings + (totalMonthlyInvestment * totalMonths);
    } else {
      const compoundPrincipal = savings * Math.pow(1 + monthlyRate, totalMonths);
      const compoundContributions = totalMonthlyInvestment * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
      futureValue = compoundPrincipal + compoundContributions;
    }

    const totalPrincipalInvested = savings + (totalMonthlyInvestment * totalMonths);
    const pureGrowth = Math.max(0, futureValue - totalPrincipalInvested);
    
    const annualSafeIncome = futureValue * (swr / 100);
    const monthlySafeIncome = annualSafeIncome / 12;

    setResults({
      totalNestEgg: Math.round(futureValue),
      totalContributed: Math.round(totalPrincipalInvested),
      totalGrowth: Math.round(pureGrowth),
      annualIncome: Math.round(annualSafeIncome),
      monthlyIncome: Math.round(monthlySafeIncome),
      growthMultiplier: futureValue > 0 ? (futureValue / (totalPrincipalInvested || 1)) : 1
    });

  }, [currentAge, retireAge, currentSavings, monthlyContribution, employerMatch, expectedReturn, inflationRate, withdrawalRate]);

  useEffect(() => {
    calculateRetirement();
  }, [calculateRetirement]);

  // Internal Premium Stepper (avoids Next.js multi-export object bugs)
  const renderStepper = (value, min, max, onChange, unit, step = 1) => {
    const handleDec = () => {
      let val = Number(value);
      if (isNaN(val)) val = min + step;
      if (val > min) onChange(val - step);
    };
    const handleInc = () => {
      let val = Number(value);
      if (isNaN(val)) val = min - step;
      if (val < max) onChange(val + step);
    };
    const handleChange = (e) => {
      const val = e.target.value;
      if (val === '') onChange('');
      else onChange(Number(val));
    };

    return (
      <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
        <button onClick={handleDec} className="p-4 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
          <Minus className="w-4 h-4" />
        </button>
        <input 
          type="number" 
          value={value} 
          onChange={handleChange}
          className="w-full text-center text-xl font-bold bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
        />
        <button onClick={handleInc} className="p-4 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
          <Plus className="w-4 h-4" />
        </button>
        {unit && <span className="pr-4 font-black text-slate-400 select-none uppercase text-xs tracking-widest">{unit}</span>}
      </div>
    );
  };

  const progressPct = Math.min(100, Math.max(0, (results.totalContributed / (results.totalNestEgg || 1)) * 100));
  const growthPct = Math.min(100, Math.max(0, (results.totalGrowth / (results.totalNestEgg || 1)) * 100));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <PiggyBank className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Ultimate FIRE Calculator</h2>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={currency.code}
            onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
            className="text-sm font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
          </select>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-colors">
            <Shield className="w-4 h-4" /> {showAdvanced ? "Basic Mode" : "Pro Settings"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-xl shadow-sm space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><Calendar className="w-4 h-4 text-indigo-500"/> Current Age</label>
                {renderStepper(currentAge, 18, 80, setCurrentAge, "Yrs")}
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><Target className="w-4 h-4 text-indigo-500"/> Retire Age</label>
                {renderStepper(retireAge, currentAge, 100, setRetireAge, "Yrs")}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-3 md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><DollarSign className="w-4 h-4 text-emerald-500"/> Current Savings (Nest Egg)</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-emerald-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} className="w-full text-3xl font-black pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><TrendingUp className="w-4 h-4 text-emerald-500"/> Monthly Contribution</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-emerald-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><Briefcase className="w-4 h-4 text-blue-500"/> Employer Match (/mo)</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-blue-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={employerMatch} onChange={(e) => setEmployerMatch(e.target.value)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                </div>
              </div>
            </div>

            {showAdvanced && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                   <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4"/> Economic Assumptions</h3>
                   <span className="text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Inflation Adjusted</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Market Return</label>
                    {renderStepper(expectedReturn, 1, 15, setExpectedReturn, "%", 0.5)}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Inflation Rate</label>
                    {renderStepper(inflationRate, 0, 10, setInflationRate, "%", 0.5)}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Safe Withdrawal</label>
                    {renderStepper(withdrawalRate, 1, 10, setWithdrawalRate, "%", 0.5)}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="flex flex-col gap-6 h-full sticky top-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm text-center relative overflow-hidden">
             
             <div className="z-10 relative">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Nest Egg at Age {retireAge}</h3>
               <div className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-2">
                 {isMounted ? formatCurrency(results.totalNestEgg, currency.code, currency.locale) : `${currency.symbol}0`}
               </div>
               <div className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 py-1.5 px-3 rounded-full inline-flex items-center gap-1 mt-2">
                 Returns multiplied your money {isMounted ? results.growthMultiplier.toFixed(1) : "1.0"}x
               </div>
             </div>

             <div className="mt-10 mb-4 max-w-2xl mx-auto space-y-2">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                 <span className="text-indigo-400">Total Invested</span>
                 <span className="text-emerald-400">Compound Growth</span>
               </div>
               <div className="h-5 w-full bg-slate-800 rounded-full flex overflow-hidden border border-slate-700">
                 <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${progressPct}%` }}></div>
                 <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${growthPct}%` }}></div>
               </div>
               <div className="flex justify-between text-xs font-black text-white font-mono pt-1">
                 <span>{isMounted ? formatCurrency(results.totalContributed, currency.code, currency.locale) : "$0"}</span>
                 <span>{isMounted ? formatCurrency(results.totalGrowth, currency.code, currency.locale) : "$0"}</span>
               </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Safe Passive Income</h3>
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-black px-2 py-1 rounded uppercase">{withdrawalRate}% Rule</span>
            </div>
            
            <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
              Based on the {withdrawalRate}% safe withdrawal rule, your nest egg can generate this income indefinitely, adjusted for inflation.
            </p>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col items-center text-center">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Monthly Income</span>
                   <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                     {isMounted ? formatCurrency(results.monthlyIncome, currency.code, currency.locale) : "$0"}
                   </span>
               </div>
               <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center text-center">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-1">Annual Income</span>
                   <span className="text-2xl font-black text-indigo-700 dark:text-indigo-400">
                     {isMounted ? formatCurrency(results.annualIncome, currency.code, currency.locale) : "$0"}
                   </span>
               </div>
            </div>
            
            {showAdvanced && (
                <div className="mt-4 text-center text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/10 py-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                  Note: All results shown in TODAY'S purchasing power (Inflation deducted).
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}