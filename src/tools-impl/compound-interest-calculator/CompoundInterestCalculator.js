"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, DollarSign, Percent, Shield, Activity, Wallet, CalendarDays, BarChart3, Minus, Plus, Settings, ArrowUpRight } from "lucide-react";

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

// ✅ STRICT EXPORT FUNCTION (100% Crash-Proof for Next.js HMR)
export default function CompoundInterestCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Implicitly setting local context preference as default
  const [currency, setCurrency] = useState(CURRENCIES.find(c => c.code === 'PKR') || CURRENCIES[0]);
  const [showAdvanced, setShowAdvanced] = useState(true);

  // Core Inputs
  const [principal, setPrincipal] = useState("100000"); 
  const [contribution, setContribution] = useState("10000");
  const [contributionFreq, setContributionFreq] = useState("monthly"); // monthly, annually
  const [years, setYears] = useState(10);
  const [interestRate, setInterestRate] = useState(15.0); // %
  const [compoundFreq, setCompoundFreq] = useState("monthly"); // daily, monthly, quarterly, annually

  // Advanced / Pro Inputs
  const [stepUpRate, setStepUpRate] = useState(5.0); // % Annual increase in contribution
  const [inflationRate, setInflationRate] = useState(8.0); // % 

  // Results
  const [results, setResults] = useState({
    totalPrincipal: 0,
    futureValue: 0,
    totalInterest: 0,
    realFutureValue: 0, // Inflation adjusted
    purchasingPowerLost: 0,
    yearlyData: []
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateCompoundInterest = useCallback(() => {
    const p = Number(principal) || 0;
    const c = Number(contribution) || 0;
    const y = Number(years) || 0;
    const r = Number(interestRate) || 0;
    const inf = Number(inflationRate) || 0;
    const stepUp = Number(stepUpRate) || 0;

    if (y <= 0) return;

    // Determine Effective Monthly Rate based on Compounding Frequency
    let effectiveMonthlyRate = 0;
    const rDecimal = r / 100;
    
    if (compoundFreq === "daily") {
        effectiveMonthlyRate = Math.pow(1 + rDecimal / 365, 365 / 12) - 1;
    } else if (compoundFreq === "monthly") {
        effectiveMonthlyRate = rDecimal / 12;
    } else if (compoundFreq === "quarterly") {
        effectiveMonthlyRate = Math.pow(1 + rDecimal / 4, 4 / 12) - 1;
    } else if (compoundFreq === "annually") {
        effectiveMonthlyRate = Math.pow(1 + rDecimal, 1 / 12) - 1;
    }

    let currentBalance = p;
    let totalInvested = p;
    let currentMonthlyContribution = contributionFreq === "monthly" ? c : 0;
    let currentAnnualContribution = contributionFreq === "annually" ? c : 0;
    
    let schedule = [];

    // Master Simulation Loop (Month by Month for absolute precision)
    for (let currentYear = 1; currentYear <= y; currentYear++) {
        for (let month = 1; month <= 12; month++) {
            // Compound interest first (End of period standard)
            currentBalance *= (1 + effectiveMonthlyRate);
            
            // Add monthly contribution
            if (contributionFreq === "monthly") {
                currentBalance += currentMonthlyContribution;
                totalInvested += currentMonthlyContribution;
            }
        }
        
        // Add annual contribution at year-end
        if (contributionFreq === "annually") {
            currentBalance += currentAnnualContribution;
            totalInvested += currentAnnualContribution;
        }

        // Record yearly snapshot
        schedule.push({
            year: currentYear,
            balance: currentBalance,
            invested: totalInvested,
            interest: currentBalance - totalInvested
        });

        // PRO FEATURE: Apply Step-Up Rate to contributions for the next year (Salary growth simulation)
        if (stepUp > 0) {
            currentMonthlyContribution *= (1 + (stepUp / 100));
            currentAnnualContribution *= (1 + (stepUp / 100));
        }
    }

    const futureVal = currentBalance;
    const totalInt = Math.max(0, futureVal - totalInvested);

    // Inflation / Real Value Calculation
    const realFV = futureVal / Math.pow(1 + (inf / 100), y);
    const purchasingPowerLost = futureVal - realFV;

    setResults({
      totalPrincipal: totalInvested,
      futureValue: futureVal,
      totalInterest: totalInt,
      realFutureValue: realFV,
      purchasingPowerLost: Math.max(0, purchasingPowerLost),
      yearlyData: schedule
    });

  }, [principal, contribution, contributionFreq, years, interestRate, compoundFreq, stepUpRate, inflationRate]);

  useEffect(() => {
    calculateCompoundInterest();
  }, [calculateCompoundInterest]);

  // Internal Helper Function for Inputs (Prevents HMR Object bugs)
  const renderStepper = (value, min, max, onChange, unit, step = 1, isFloat = false) => {
    const handleDec = () => {
      let val = Number(value);
      if (isNaN(val)) val = min + step;
      if (val > min) onChange(isFloat ? (val - step).toFixed(1) : val - step);
    };
    const handleInc = () => {
      let val = Number(value);
      if (isNaN(val)) val = min - step;
      if (val < max) onChange(isFloat ? (val + step).toFixed(1) : val + step);
    };
    const handleChange = (e) => {
      const val = e.target.value;
      if (val === '') onChange('');
      else onChange(isFloat ? val : Number(val));
    };

    return (
      <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-shadow">
        <button onClick={handleDec} className="p-3 text-slate-500 hover:text-emerald-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
          <Minus className="w-4 h-4" />
        </button>
        <input 
          type="number" 
          step={isFloat ? "0.1" : "1"}
          value={value} 
          onChange={handleChange}
          className="w-full text-center text-xl font-bold bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
        />
        <button onClick={handleInc} className="p-3 text-slate-500 hover:text-emerald-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
          <Plus className="w-4 h-4" />
        </button>
        {unit && <span className="pr-4 font-black text-slate-400 select-none uppercase text-xs tracking-widest">{unit}</span>}
      </div>
    );
  };

  const handleInputChange = (setter) => (e) => { setter(e.target.value); };

  const principalPct = results.futureValue > 0 ? (results.totalPrincipal / results.futureValue) * 100 : 0;
  const interestPct = results.futureValue > 0 ? (results.totalInterest / results.futureValue) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-emerald-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Advanced Compounding Engine</h2>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={currency.code}
            onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
            className="text-sm font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
          </select>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 transition-colors">
            <Settings className="w-4 h-4" /> {showAdvanced ? "Basic Mode" : "Pro Settings"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* Input Form Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-xl shadow-sm space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-3 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Wallet className="w-4 h-4 text-emerald-500"/> Initial Principal
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-emerald-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={principal} onChange={handleInputChange(setPrincipal)} className="w-full text-3xl font-black pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    <DollarSign className="w-4 h-4 text-sky-500"/> Contribution
                    </label>
                    <select value={contributionFreq} onChange={(e) => setContributionFreq(e.target.value)} className="text-[10px] uppercase font-bold bg-transparent text-sky-600 dark:text-sky-400 outline-none cursor-pointer">
                        <option value="monthly">/ Month</option>
                        <option value="annually">/ Year</option>
                    </select>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-sky-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={contribution} onChange={handleInputChange(setContribution)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                      <Percent className="w-4 h-4 text-rose-500"/> Interest Rate
                    </label>
                    <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-1.5 rounded">Annual</span>
                </div>
                <div className="relative group">
                  <input type="number" step="0.1" min="0" value={interestRate} onChange={handleInputChange(setInterestRate)} className="w-full text-xl font-bold pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-rose-500 transition-colors">%</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><CalendarDays className="w-4 h-4 text-indigo-500"/> Timeline</label>
                {renderStepper(years, 1, 100, setYears, "Yrs", 1, false)}
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">Compounding</label>
                <select value={compoundFreq} onChange={(e) => setCompoundFreq(e.target.value)} className="w-full text-sm font-bold p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 cursor-pointer">
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>

            </div>

            {/* Pro Settings */}
            {showAdvanced && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                   <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500"/> Advanced Pro Models</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> Step-Up Contribution</label>
                    {renderStepper(stepUpRate, 0, 50, setStepUpRate, "%/yr", 0.5, true)}
                    <p className="text-[10px] text-slate-500 leading-relaxed">Automatically increases your deposits by this percentage every year (e.g. Salary raises).</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Inflation Rate</label>
                    {renderStepper(inflationRate, 0, 20, setInflationRate, "%/yr", 0.5, true)}
                    <p className="text-[10px] text-slate-500 leading-relaxed">Reduces future purchasing power to show you what your money will actually buy.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Dashboard Sidebar */}
        <div className="flex flex-col gap-6 h-full sticky top-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm text-center relative overflow-hidden">
             
             <div className="z-10 relative">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Future Value</h3>
               <div className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-2">
                 {isMounted ? formatCurrency(results.futureValue, currency.code, currency.locale) : `${currency.symbol}0`}
               </div>
             </div>

             {/* Growth Composition Bar */}
             <div className="mt-8 mb-4 max-w-2xl mx-auto space-y-2">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                 <span className="text-sky-400">Total Invested</span>
                 <span className="text-emerald-400">Compound Interest</span>
               </div>
               <div className="h-4 w-full bg-slate-800 rounded-full flex overflow-hidden border border-slate-700">
                 <div className="h-full bg-sky-500 transition-all duration-1000 ease-out" style={{ width: `${principalPct}%` }}></div>
                 <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${interestPct}%` }}></div>
               </div>
               <div className="flex justify-between text-xs font-black text-white font-mono pt-1">
                 <span>{isMounted ? formatCurrency(results.totalPrincipal, currency.code, currency.locale) : "$0"}</span>
                 <span>+{isMounted ? formatCurrency(results.totalInterest, currency.code, currency.locale) : "$0"}</span>
               </div>
             </div>
          </div>

          {/* Pro Feature: Real Purchasing Power */}
          {showAdvanced && Number(inflationRate) > 0 && (
            <div className="bg-gradient-to-br from-amber-900/40 to-slate-900 border border-amber-800/50 p-6 rounded-xl shadow-sm animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2 border-b border-amber-800/50 pb-3 mb-4">
                  <Shield className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-white">True Purchasing Power</h3>
              </div>
              
              <div className="text-center mb-6">
                  <span className="block text-4xl font-black text-amber-500 tracking-tighter">
                    {isMounted ? formatCurrency(results.realFutureValue, currency.code, currency.locale) : "$0"}
                  </span>
                  <span className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest mt-1 block">Value in today's money</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                 <span className="text-xs font-bold text-slate-400">Lost to Inflation</span>
                 <span className="font-bold text-rose-400 font-mono">-{isMounted ? formatCurrency(results.purchasingPowerLost, currency.code, currency.locale) : "$0"}</span>
              </div>
            </div>
          )}

          {/* Year-by-Year Mini Schedule */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <BarChart3 className="w-5 h-5 text-sky-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Growth Timeline</h3>
            </div>
            
            <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                {results.yearlyData.map((data) => {
                  // Optimization: Show specific milestones for long timelines
                  if (years > 15 && data.year % 5 !== 0 && data.year !== years && data.year !== 1) return null;
                  
                  return (
                    <div key={data.year} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-16">Year {data.year}</span>
                        <div className="flex flex-col text-right">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100">{formatCurrency(data.balance, currency.code, currency.locale)}</span>
                            <span className="text-[10px] font-bold text-emerald-500">+{formatCurrency(data.interest, currency.code, currency.locale)}</span>
                        </div>
                    </div>
                  )
                })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}