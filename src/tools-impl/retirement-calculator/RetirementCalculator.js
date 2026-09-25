"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  PiggyBank, TrendingUp, Calendar, Briefcase, 
  Target, Shield, DollarSign, Activity, 
  Minus, Plus, Copy, Check 
} from "lucide-react";

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
  const [copied, setCopied] = useState(false);

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

  const copyResult = async () => {
    if (results.totalNestEgg <= 0) return;
    const text = 
      `Retirement / FIRE Summary (Age ${retireAge})\n` +
      `Total Nest Egg: ${formatCurrency(results.totalNestEgg, currency.code, currency.locale)}\n` +
      `Growth Multiplier: ${results.growthMultiplier.toFixed(1)}x\n\n` +
      `Contributions vs Growth:\n` +
      `- Total Invested: ${formatCurrency(results.totalContributed, currency.code, currency.locale)}\n` +
      `- Compound Growth: ${formatCurrency(results.totalGrowth, currency.code, currency.locale)}\n\n` +
      `Safe Passive Income (${withdrawalRate}% Rule):\n` +
      `- Monthly Income: ${formatCurrency(results.monthlyIncome, currency.code, currency.locale)}\n` +
      `- Annual Income: ${formatCurrency(results.annualIncome, currency.code, currency.locale)}`;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }
    } catch (error) {
      setCopied(false);
    }
  };

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
      <div className="flex items-center bg-surface border border-line rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand/25 transition-all h-12 md:h-14 min-w-0">
        <button 
          type="button" 
          onClick={handleDec} 
          className="w-12 h-full flex items-center justify-center text-muted hover:text-ink hover:bg-paper transition-colors text-lg shrink-0"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input 
          type="number" 
          value={value} 
          onChange={handleChange}
          className="w-full text-center text-base md:text-lg font-bold bg-transparent focus:outline-none text-ink [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0" 
        />
        <button 
          type="button" 
          onClick={handleInc} 
          className="w-12 h-full flex items-center justify-center text-muted hover:text-ink hover:bg-paper transition-colors text-lg shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
        {unit && <span className="pr-4 font-bold text-muted select-none uppercase text-xs tracking-widest shrink-0">{unit}</span>}
      </div>
    );
  };

  const progressPct = Math.min(100, Math.max(0, (results.totalContributed / (results.totalNestEgg || 1)) * 100));
  const growthPct = Math.min(100, Math.max(0, (results.totalGrowth / (results.totalNestEgg || 1)) * 100));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      
      {/* MAIN WRAPPER SHELL */}
      <div className="rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 min-w-0">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <PiggyBank className="w-6 h-6 md:w-7 md:h-7 text-brand shrink-0" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink truncate">
              Ultimate FIRE Calculator
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 shrink-0">
            <select 
              value={currency.code}
              onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
              className="h-10 md:h-11 pl-3 md:pl-4 pr-8 bg-surface border border-line rounded-lg text-ink text-xs md:text-sm font-semibold focus:outline-none focus:border-brand cursor-pointer"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
              ))}
            </select>
            <button 
              type="button" 
              onClick={() => setShowAdvanced(!showAdvanced)} 
              className="flex items-center gap-2 text-xs md:text-sm font-semibold bg-paper border border-line text-ink px-3.5 py-2.5 rounded-lg hover:bg-brand/10 hover:border-brand/30 transition-colors whitespace-nowrap"
            >
              <Shield className="w-4 h-4 text-brand shrink-0" /> {showAdvanced ? "Basic Mode" : "Pro Settings"}
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] items-start gap-6 md:gap-8 min-w-0">
          
          {/* INPUT FORM PANEL */}
          <div className="flex flex-col gap-6 md:gap-8 min-w-0">
            <div className="bg-surface border border-line p-5 md:p-7 rounded-xl space-y-6 md:space-y-8 min-w-0">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 min-w-0">
                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0"/> Current Age
                  </label>
                  {renderStepper(currentAge, 18, 80, setCurrentAge, "Yrs")}
                </div>
                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted">
                    <Target className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0"/> Retire Age
                  </label>
                  {renderStepper(retireAge, currentAge, 100, setRetireAge, "Yrs")}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 pt-6 border-t border-line min-w-0">
                <div className="space-y-2 sm:col-span-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted">
                    <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0"/> Current Savings (Nest Egg)
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted">{currency.symbol}</span>
                    <input 
                      type="number" 
                      min="0" 
                      value={currentSavings} 
                      onChange={(e) => setCurrentSavings(e.target.value)} 
                      className="w-full text-2xl md:text-3xl font-black pl-10 pr-4 py-3.5 bg-surface border border-line rounded-lg focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 text-ink transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted truncate">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0"/> Monthly Contribution
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted">{currency.symbol}</span>
                    <input 
                      type="number" 
                      min="0" 
                      value={monthlyContribution} 
                      onChange={(e) => setMonthlyContribution(e.target.value)} 
                      className="w-full text-base md:text-lg font-bold pl-10 pr-4 py-3 bg-surface border border-line rounded-lg focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 text-ink transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted truncate">
                    <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0"/> Employer Match (/mo)
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted">{currency.symbol}</span>
                    <input 
                      type="number" 
                      min="0" 
                      value={employerMatch} 
                      onChange={(e) => setEmployerMatch(e.target.value)} 
                      className="w-full text-base md:text-lg font-bold pl-10 pr-4 py-3 bg-surface border border-line rounded-lg focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 text-ink transition-all" 
                    />
                  </div>
                </div>
              </div>

              {showAdvanced && (
                <div className="pt-6 border-t border-line space-y-5 animate-in fade-in slide-in-from-top-2 min-w-0">
                  <div className="flex items-center justify-between min-w-0">
                     <h3 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                       <Activity className="w-4 h-4 text-brand shrink-0"/> Economic Assumptions
                     </h3>
                     <span className="text-[10px] text-brand bg-brand/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">Inflation Adjusted</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
                    <div className="space-y-2 min-w-0">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-muted block truncate">Market Return</label>
                      {renderStepper(expectedReturn, 1, 15, setExpectedReturn, "%", 0.5)}
                    </div>
                    <div className="space-y-2 min-w-0">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-muted block truncate">Inflation Rate</label>
                      {renderStepper(inflationRate, 0, 10, setInflationRate, "%", 0.5)}
                    </div>
                    <div className="space-y-2 min-w-0">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-muted block truncate">Safe Withdrawal</label>
                      {renderStepper(withdrawalRate, 1, 10, setWithdrawalRate, "%", 0.5)}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* OUTPUT DASHBOARD PANEL */}
          <div className="flex flex-col gap-6 h-full min-w-0">
            
            <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card text-center relative overflow-hidden min-w-0">
               
               <div className="flex items-center justify-between border-b border-line pb-4 mb-5 min-w-0">
                 <h3 className="text-base md:text-lg font-bold text-ink truncate">Nest Egg Projection</h3>
                 <button
                   type="button"
                   onClick={copyResult}
                   className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border border-line bg-surface hover:bg-line text-ink text-xs font-semibold transition-colors shrink-0"
                 >
                   {copied ? <><Check className="w-3.5 h-3.5 text-teal" /> Copied</> : <><Copy className="w-3.5 h-3.5 text-muted" /> Copy</>}
                 </button>
               </div>
               
               <div className="z-10 relative my-3 min-w-0">
                 <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5 truncate">Total Nest Egg at Age {retireAge}</h4>
                 <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-ink mb-3 truncate">
                   {isMounted ? formatCurrency(results.totalNestEgg, currency.code, currency.locale) : `${currency.symbol}0`}
                 </div>
                 <div className="text-xs font-semibold text-teal bg-teal/10 border border-teal/20 py-1.5 px-3 rounded-full inline-flex items-center gap-1">
                   Returns multiplied your money {isMounted ? results.growthMultiplier.toFixed(1) : "1.0"}x
                 </div>
               </div>

               <div className="mt-8 mb-2 max-w-2xl mx-auto space-y-2 min-w-0">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                   <span className="text-brand">Total Invested</span>
                   <span className="text-teal">Compound Growth</span>
                 </div>
                 <div className="h-4 w-full bg-line rounded-full flex overflow-hidden border border-line/50">
                   <div className="h-full bg-brand transition-all duration-700 ease-out" style={{ width: `${progressPct}%` }}></div>
                   <div className="h-full bg-teal transition-all duration-700 ease-out" style={{ width: `${growthPct}%` }}></div>
                 </div>
                 <div className="flex justify-between text-xs font-bold text-ink pt-1 truncate">
                   <span>{isMounted ? formatCurrency(results.totalContributed, currency.code, currency.locale) : "$0"}</span>
                   <span>{isMounted ? formatCurrency(results.totalGrowth, currency.code, currency.locale) : "$0"}</span>
                 </div>
               </div>
            </div>

            <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card min-w-0">
              <div className="flex items-center justify-between border-b border-line pb-3.5 mb-4 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    <Target className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0" />
                    <h3 className="text-base font-bold text-ink truncate">Safe Passive Income</h3>
                </div>
                <span className="text-[10px] bg-surface border border-line text-muted font-black px-2 py-1 rounded uppercase tracking-wider shrink-0">{withdrawalRate}% Rule</span>
              </div>
              
              <p className="text-xs text-muted mb-5 font-medium leading-relaxed">
                Based on the {withdrawalRate}% safe withdrawal rule, your nest egg can generate this income indefinitely, adjusted for inflation.
              </p>

              <div className="grid grid-cols-2 gap-3 min-w-0">
                 <div className="p-3.5 bg-teal/10 border border-teal/20 rounded-xl flex flex-col items-center text-center min-w-0">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-teal mb-1 truncate w-full">Monthly Income</span>
                     <span className="text-lg md:text-2xl font-black text-ink truncate w-full">
                       {isMounted ? formatCurrency(results.monthlyIncome, currency.code, currency.locale) : "$0"}
                     </span>
                 </div>
                 <div className="p-3.5 bg-brand/10 border border-brand/20 rounded-xl flex flex-col items-center text-center min-w-0">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-brand mb-1 truncate w-full">Annual Income</span>
                     <span className="text-lg md:text-2xl font-black text-ink truncate w-full">
                       {isMounted ? formatCurrency(results.annualIncome, currency.code, currency.locale) : "$0"}
                     </span>
                 </div>
              </div>
              
              {showAdvanced && (
                  <div className="mt-4 text-center text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/10 py-2 rounded-lg border border-amber-200/50">
                    Note: All results shown in TODAY'S purchasing power (Inflation deducted).
                  </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}