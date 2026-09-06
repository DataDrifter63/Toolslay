"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, DollarSign, Percent, Shield, Activity, Wallet, CalendarDays, BarChart3, Minus, Plus } from "lucide-react";

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

export default function InvestmentReturnCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Core Inputs
  const [initialDeposit, setInitialDeposit] = useState(10000);
  const [contribution, setContribution] = useState(500);
  const [contributionFreq, setContributionFreq] = useState("monthly"); // monthly, annually
  const [years, setYears] = useState(10);
  const [interestRate, setInterestRate] = useState(8.0); // %

  // Advanced / Pro Inputs
  const [inflationRate, setInflationRate] = useState(3.0); // %
  const [taxRate, setTaxRate] = useState(15.0); // % Capital Gains Tax

  const [results, setResults] = useState({
    totalPrincipal: 0,
    grossFutureValue: 0,
    totalInterest: 0,
    taxPaid: 0,
    netFutureValue: 0,
    realFutureValue: 0, // Inflation adjusted
    purchasingPowerLost: 0,
    yearlyData: []
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateInvestment = useCallback(() => {
    const p = Number(initialDeposit) || 0;
    const c = Number(contribution) || 0;
    const y = Number(years) || 0;
    const r = Number(interestRate) || 0;
    const inf = Number(inflationRate) || 0;
    const tax = Number(taxRate) || 0;

    if (y <= 0) return;

    const periodsPerYear = contributionFreq === "monthly" ? 12 : 1;
    const totalPeriods = y * periodsPerYear;
    const periodRate = r / 100 / periodsPerYear;

    let currentBalance = p;
    let totalInvested = p;
    let schedule = [];

    // Compound Interest Calculation Loop
    for (let i = 1; i <= totalPeriods; i++) {
      currentBalance = currentBalance * (1 + periodRate) + c;
      totalInvested += c;

      // Record yearly snapshot
      if (i % periodsPerYear === 0) {
        schedule.push({
          year: i / periodsPerYear,
          balance: currentBalance,
          invested: totalInvested,
          interest: currentBalance - totalInvested
        });
      }
    }

    const grossFV = currentBalance;
    const grossGains = Math.max(0, grossFV - totalInvested);
    
    // Deferred Tax Calculation
    const taxPaid = grossGains * (tax / 100);
    const netFV = grossFV - taxPaid;

    // Inflation / Real Value Calculation
    const realFV = netFV / Math.pow(1 + (inf / 100), y);
    const purchasingPowerLost = netFV - realFV;

    setResults({
      totalPrincipal: totalInvested,
      grossFutureValue: grossFV,
      totalInterest: grossGains,
      taxPaid: taxPaid,
      netFutureValue: netFV,
      realFutureValue: realFV,
      purchasingPowerLost: Math.max(0, purchasingPowerLost),
      yearlyData: schedule
    });

  }, [initialDeposit, contribution, contributionFreq, years, interestRate, inflationRate, taxRate]);

  useEffect(() => {
    calculateInvestment();
  }, [calculateInvestment]);

  // Internal Helper Function to prevent Webpack Export Object bugs
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
      <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-violet-500 transition-shadow">
        <button onClick={handleDec} className="p-4 text-slate-500 hover:text-violet-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
          <Minus className="w-4 h-4" />
        </button>
        <input 
          type="number" 
          value={value} 
          onChange={handleChange}
          className="w-full text-center text-xl font-bold bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
        />
        <button onClick={handleInc} className="p-4 text-slate-500 hover:text-violet-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
          <Plus className="w-4 h-4" />
        </button>
        {unit && <span className="pr-4 font-black text-slate-400 select-none uppercase text-xs tracking-widest">{unit}</span>}
      </div>
    );
  };

  const principalPct = results.netFutureValue > 0 ? (results.totalPrincipal / results.netFutureValue) * 100 : 0;
  const interestPct = results.netFutureValue > 0 ? ((results.totalInterest - results.taxPaid) / results.netFutureValue) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-violet-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Pro Wealth Builder</h2>
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
            <Shield className="w-4 h-4" /> {showAdvanced ? "Basic Mode" : "Taxes & Inflation"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-xl shadow-sm space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Wallet className="w-4 h-4 text-violet-500"/> Starting Amount
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-violet-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={initialDeposit} onChange={(e) => setInitialDeposit(e.target.value)} className="w-full text-3xl font-black pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    <DollarSign className="w-4 h-4 text-emerald-500"/> Contribution
                    </label>
                    <select value={contributionFreq} onChange={(e) => setContributionFreq(e.target.value)} className="text-[10px] uppercase font-bold bg-transparent text-emerald-600 dark:text-emerald-400 outline-none cursor-pointer">
                        <option value="monthly">/ Month</option>
                        <option value="annually">/ Year</option>
                    </select>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-emerald-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={contribution} onChange={(e) => setContribution(e.target.value)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                  <Percent className="w-4 h-4 text-sky-500"/> Expected Return
                </label>
                <div className="relative group">
                  <input type="number" step="0.1" min="0" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="w-full text-xl font-bold pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-sky-500 transition-colors">%</span>
                </div>
              </div>

              <div className="space-y-3 md:col-span-2 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><CalendarDays className="w-4 h-4 text-violet-500"/> Investment Timeline</label>
                {renderStepper(years, 1, 100, setYears, "Years")}
              </div>
            </div>

            {showAdvanced && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                   <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4"/> Economic Drag Factors</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Capital Gains Tax</label>
                    {renderStepper(taxRate, 0, 50, setTaxRate, "%", 1)}
                    <p className="text-[10px] text-slate-500">Deducted from total profit at the end of the term.</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Inflation Rate</label>
                    {renderStepper(inflationRate, 0, 20, setInflationRate, "%", 0.5)}
                    <p className="text-[10px] text-slate-500">Reduces future purchasing power.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="flex flex-col gap-6 h-full sticky top-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm text-center relative overflow-hidden">
             
             <div className="z-10 relative">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Net Future Value</h3>
               <div className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-2">
                 {isMounted ? formatCurrency(results.netFutureValue, currency.code, currency.locale) : `${currency.symbol}0`}
               </div>
               
               {Number(taxRate) > 0 && (
                   <div className="text-[10px] font-bold text-rose-400 bg-rose-400/10 border border-rose-400/20 py-1 px-3 rounded-full inline-flex items-center gap-1 mt-1">
                     After {isMounted ? formatCurrency(results.taxPaid, currency.code, currency.locale) : "$0"} Tax Deduction
                   </div>
               )}
             </div>

             <div className="mt-8 mb-4 max-w-2xl mx-auto space-y-2">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                 <span className="text-violet-400">Total Invested</span>
                 <span className="text-emerald-400">Net Return</span>
               </div>
               <div className="h-4 w-full bg-slate-800 rounded-full flex overflow-hidden border border-slate-700">
                 <div className="h-full bg-violet-500 transition-all duration-1000 ease-out" style={{ width: `${principalPct}%` }}></div>
                 <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${interestPct}%` }}></div>
               </div>
               <div className="flex justify-between text-xs font-black text-white font-mono pt-1">
                 <span>{isMounted ? formatCurrency(results.totalPrincipal, currency.code, currency.locale) : "$0"}</span>
                 <span>+{isMounted ? formatCurrency(results.totalInterest - results.taxPaid, currency.code, currency.locale) : "$0"}</span>
               </div>
             </div>
          </div>

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

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <BarChart3 className="w-5 h-5 text-sky-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Growth Timeline</h3>
            </div>
            
            <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                {results.yearlyData.map((data, idx) => {
                  if (years > 15 && data.year % 5 !== 0 && data.year !== years) return null;
                  
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