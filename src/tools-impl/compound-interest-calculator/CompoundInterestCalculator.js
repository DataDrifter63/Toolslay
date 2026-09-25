"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  TrendingUp, DollarSign, Percent, Shield, 
  Activity, Wallet, CalendarDays, BarChart3, 
  Minus, Plus, Settings, ArrowUpRight, 
  Copy, Check 
} from "lucide-react";

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

export default function CompoundInterestCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES.find(c => c.code === 'PKR') || CURRENCIES[0]);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [copied, setCopied] = useState(false);

  // Core Inputs
  const [principal, setPrincipal] = useState("100000"); 
  const [contribution, setContribution] = useState("10000");
  const [contributionFreq, setContributionFreq] = useState("monthly"); 
  const [years, setYears] = useState(10);
  const [interestRate, setInterestRate] = useState(15.0); 
  const [compoundFreq, setCompoundFreq] = useState("monthly"); 

  // Advanced / Pro Inputs
  const [stepUpRate, setStepUpRate] = useState(5.0); 
  const [inflationRate, setInflationRate] = useState(8.0); 

  // Results
  const [results, setResults] = useState({
    totalPrincipal: 0,
    futureValue: 0,
    totalInterest: 0,
    realFutureValue: 0, 
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

    for (let currentYear = 1; currentYear <= y; currentYear++) {
        for (let month = 1; month <= 12; month++) {
            currentBalance *= (1 + effectiveMonthlyRate);
            
            if (contributionFreq === "monthly") {
                currentBalance += currentMonthlyContribution;
                totalInvested += currentMonthlyContribution;
            }
        }
        
        if (contributionFreq === "annually") {
            currentBalance += currentAnnualContribution;
            totalInvested += currentAnnualContribution;
        }

        schedule.push({
            year: currentYear,
            balance: currentBalance,
            invested: totalInvested,
            interest: currentBalance - totalInvested
        });

        if (stepUp > 0) {
            currentMonthlyContribution *= (1 + (stepUp / 100));
            currentAnnualContribution *= (1 + (stepUp / 100));
        }
    }

    const futureVal = currentBalance;
    const totalInt = Math.max(0, futureVal - totalInvested);

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

  const copyResult = async () => {
    if (results.futureValue <= 0) return;
    const text = 
      `Compound Interest Summary (${years} Yrs @ ${interestRate}% APR, Compounded ${compoundFreq})\n` +
      `Total Future Value: ${formatCurrency(results.futureValue, currency.code, currency.locale)}\n` +
      `Total Invested: ${formatCurrency(results.totalPrincipal, currency.code, currency.locale)}\n` +
      `Compound Interest Earned: +${formatCurrency(results.totalInterest, currency.code, currency.locale)}\n\n` +
      (showAdvanced && Number(inflationRate) > 0 ? `True Purchasing Power (${inflationRate}% inflation): ${formatCurrency(results.realFutureValue, currency.code, currency.locale)}\n` +
      `Lost to Inflation: -${formatCurrency(results.purchasingPowerLost, currency.code, currency.locale)}` : '');

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text.trim());
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }
    } catch (error) {
      setCopied(false);
    }
  };

  const renderStepper = (value, min, max, onChange, unit, step = 1, isFloat = false) => {
    const handleDec = () => {
      let val = Number(value);
      if (isNaN(val)) val = min + step;
      if (val > min) onChange(isFloat ? Number((val - step).toFixed(1)) : val - step);
    };
    const handleInc = () => {
      let val = Number(value);
      if (isNaN(val)) val = min - step;
      if (val < max) onChange(isFloat ? Number((val + step).toFixed(1)) : val + step);
    };
    const handleChange = (e) => {
      const val = e.target.value;
      if (val === '') onChange('');
      else onChange(isFloat ? val : Number(val));
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
          step={isFloat ? "0.1" : "1"}
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

  const handleInputChange = (setter) => (e) => { setter(e.target.value); };

  const baseInputStyle = "w-full min-w-0 h-11 md:h-12 px-3 sm:px-4 bg-surface border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold";
  const baseCurrencyInputStyle = "w-full min-w-0 h-11 md:h-12 pl-8 pr-3 bg-surface border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold";
  const baseSelectStyle = "w-full min-w-0 h-11 md:h-12 pl-3 sm:pl-4 pr-10 bg-surface border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold cursor-pointer";

  const principalPct = results.futureValue > 0 ? (results.totalPrincipal / results.futureValue) * 100 : 0;
  const interestPct = results.futureValue > 0 ? (results.totalInterest / results.futureValue) * 100 : 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      
      {/* MAIN WRAPPER SHELL */}
      <div className="rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 min-w-0">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-brand shrink-0" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink truncate">
              Advanced Compounding Engine
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
              <Settings className="w-4 h-4 text-brand shrink-0" /> {showAdvanced ? "Basic Mode" : "Pro Settings"}
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] items-start gap-6 md:gap-8 min-w-0">
          
          {/* INPUT FORM PANEL */}
          <div className="flex flex-col gap-6 md:gap-8 min-w-0">
            <div className="bg-surface border border-line p-5 md:p-7 rounded-xl space-y-6 md:space-y-8 min-w-0">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 min-w-0">
                <div className="space-y-2 sm:col-span-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted">
                    <Wallet className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0"/> Initial Principal
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none">{currency.symbol}</span>
                    <input 
                      type="number" 
                      min="0" 
                      value={principal} 
                      onChange={handleInputChange(setPrincipal)} 
                      className={`${baseCurrencyInputStyle} text-xl md:text-2xl font-black`} 
                    />
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <div className="flex justify-between items-center min-w-0">
                    <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted truncate">
                      <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-teal shrink-0"/> Contribution
                    </label>
                    <select 
                      value={contributionFreq} 
                      onChange={(e) => setContributionFreq(e.target.value)} 
                      className="text-[10px] uppercase font-bold bg-transparent text-teal outline-none cursor-pointer shrink-0"
                    >
                      <option value="monthly">/ Month</option>
                      <option value="annually">/ Year</option>
                    </select>
                  </div>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none">{currency.symbol}</span>
                    <input type="number" min="0" value={contribution} onChange={handleInputChange(setContribution)} className={baseCurrencyInputStyle} />
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <div className="flex justify-between items-center min-w-0">
                    <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted truncate">
                      <Percent className="w-4 h-4 md:w-5 md:h-5 text-[#fb7185] shrink-0"/> Interest Rate
                    </label>
                    <span className="text-[9px] uppercase font-bold text-[#fb7185] bg-[#fb7185]/10 px-1.5 py-0.5 rounded shrink-0">Annual</span>
                  </div>
                  <div className="relative group">
                    <input type="number" step="0.1" min="0" value={interestRate} onChange={handleInputChange(setInterestRate)} className={`${baseInputStyle} pr-8`} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none">%</span>
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted truncate">
                    <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0"/> Timeline
                  </label>
                  {renderStepper(years, 1, 100, setYears, "Yrs", 1, false)}
                </div>

                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted truncate">Compounding</label>
                  <select value={compoundFreq} onChange={(e) => setCompoundFreq(e.target.value)} className={baseSelectStyle}>
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>

              {showAdvanced && (
                <div className="pt-6 border-t border-line space-y-6 animate-in fade-in slide-in-from-top-2 min-w-0">
                  <div className="flex items-center justify-between min-w-0">
                     <h3 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                       <Activity className="w-4 h-4 text-brand shrink-0"/> Advanced Pro Models
                     </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 min-w-0">
                    <div className="space-y-2 min-w-0">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-brand flex items-center gap-1 truncate"><ArrowUpRight className="w-3 h-3"/> Step-Up Contribution</label>
                      {renderStepper(stepUpRate, 0, 50, setStepUpRate, "%/yr", 0.5, true)}
                      <p className="text-[10px] text-muted leading-relaxed truncate">Automatically increases deposits annually (raises).</p>
                    </div>
                    <div className="space-y-2 min-w-0">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-amber-600 block truncate">Inflation Rate</label>
                      {renderStepper(inflationRate, 0, 20, setInflationRate, "%/yr", 0.5, true)}
                      <p className="text-[10px] text-muted leading-relaxed truncate">Reduces future purchasing power.</p>
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
                 <h3 className="text-base md:text-lg font-bold text-ink truncate">Compounding Projection</h3>
                 <button
                   type="button"
                   onClick={copyResult}
                   className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border border-line bg-surface hover:bg-line text-ink text-xs font-semibold transition-colors shrink-0"
                 >
                   {copied ? <><Check className="w-3.5 h-3.5 text-teal" /> Copied</> : <><Copy className="w-3.5 h-3.5 text-muted" /> Copy</>}
                 </button>
               </div>
               
               <div className="z-10 relative my-3 min-w-0">
                 <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5 truncate">Total Future Value</h4>
                 <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-ink mb-3 truncate">
                   {isMounted ? formatCurrency(results.futureValue, currency.code, currency.locale) : `${currency.symbol}0`}
                 </div>
               </div>

               <div className="mt-8 mb-2 max-w-2xl mx-auto space-y-2 min-w-0">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                   <span className="text-brand">Total Invested</span>
                   <span className="text-teal">Compound Interest</span>
                 </div>
                 <div className="h-4 w-full bg-line rounded-full flex overflow-hidden border border-line/50">
                   <div className="h-full bg-brand transition-all duration-700 ease-out" style={{ width: `${principalPct}%` }}></div>
                   <div className="h-full bg-teal transition-all duration-700 ease-out" style={{ width: `${interestPct}%` }}></div>
                 </div>
                 <div className="flex justify-between text-xs font-bold text-ink pt-1 truncate">
                   <span>{isMounted ? formatCurrency(results.totalPrincipal, currency.code, currency.locale) : "$0"}</span>
                   <span className="text-teal">+{isMounted ? formatCurrency(results.totalInterest, currency.code, currency.locale) : "$0"}</span>
                 </div>
               </div>
            </div>

            {showAdvanced && Number(inflationRate) > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-5 md:p-6 rounded-xl shadow-card animate-in fade-in zoom-in-95 min-w-0">
                <div className="flex items-center gap-2 border-b border-amber-500/20 pb-3 mb-4 min-w-0">
                    <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                    <h3 className="base font-bold text-ink truncate">True Purchasing Power</h3>
                </div>
                
                <div className="text-center mb-5 min-w-0">
                    <span className="block text-3xl sm:text-4xl font-black text-amber-600 tracking-tight truncate">
                      {isMounted ? formatCurrency(results.realFutureValue, currency.code, currency.locale) : "$0"}
                    </span>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1 block truncate">Value in today's money</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface border border-line min-w-0">
                   <span className="text-xs font-bold text-muted truncate">Lost to Inflation</span>
                   <span className="font-bold text-[#e11d48] font-mono text-xs sm:text-sm shrink-0 pl-2">-{isMounted ? formatCurrency(results.purchasingPowerLost, currency.code, currency.locale) : "$0"}</span>
                </div>
              </div>
            )}

            <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card min-w-0">
              <div className="flex items-center gap-2 border-b border-line pb-3.5 mb-4 min-w-0">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0" />
                  <h3 className="text-sm md:text-base font-bold text-ink truncate">Growth Timeline</h3>
              </div>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1 min-w-0">
                  {results.yearlyData.map((data) => {
                    if (years > 15 && data.year % 5 !== 0 && data.year !== years && data.year !== 1) return null;
                    
                    return (
                      <div key={data.year} className="flex justify-between items-center p-2.5 rounded-lg bg-surface border border-line text-xs min-w-0">
                          <span className="font-bold text-ink shrink-0 pr-2">Year {data.year}</span>
                          <div className="flex flex-col text-right truncate">
                              <span className="font-black text-ink truncate">{formatCurrency(data.balance, currency.code, currency.locale)}</span>
                              <span className="text-[10px] font-bold text-teal truncate">+{formatCurrency(data.interest, currency.code, currency.locale)}</span>
                          </div>
                      </div>
                    )
                  })}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}