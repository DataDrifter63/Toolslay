"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Target, DollarSign, Package, TrendingUp, 
  AlertTriangle, Briefcase, Activity, PieChart, 
  ArrowUpRight, Copy, Check 
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

export default function BreakEvenCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [copied, setCopied] = useState(false);

  // Core Inputs
  const [fixedCosts, setFixedCosts] = useState("5000"); 
  const [variableCost, setVariableCost] = useState("20"); 
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

  const copyResult = async () => {
    if (results.isImpossible || results.breakEvenUnits <= 0) return;
    const text = 
      `Break-Even & Unit Economics Summary\n` +
      `Break-Even Point: ${results.breakEvenUnits.toLocaleString()} units (${formatCurrency(results.breakEvenRevenue, currency.code, currency.locale)})\n` +
      (showAdvanced && Number(targetProfit) > 0 ? `Target Profit Goal (${formatCurrency(targetProfit, currency.code, currency.locale)}): ${results.targetUnits.toLocaleString()} units (${formatCurrency(results.targetRevenue, currency.code, currency.locale)})\n\n` : '\n') +
      `Unit Economics:\n` +
      `- Contribution Margin: ${formatCurrency(results.contributionMargin, currency.code, currency.locale)}/unit\n` +
      `- Gross Margin: ${results.grossMarginPct.toFixed(1)}%\n` +
      `- Markup: ${results.markupPct.toFixed(1)}%`;

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

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const baseInputStyle = "w-full min-w-0 h-11 md:h-12 px-3 sm:px-4 bg-surface border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold";
  const baseCurrencyInputStyle = "w-full min-w-0 h-11 md:h-12 pl-8 pr-3 bg-surface border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      
      {/* MAIN WRAPPER SHELL */}
      <div className="rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 min-w-0">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Activity className="w-6 h-6 md:w-7 md:h-7 text-brand shrink-0" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink truncate">
              Pro Break-Even Engine
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
              <Target className="w-4 h-4 text-brand shrink-0" /> {showAdvanced ? "Basic Mode" : "Target Goals"}
            </button>
          </div>
        </div>

        {results.isImpossible && (
          <div className="bg-[#fb7185]/10 border border-[#fb7185]/30 p-4 rounded-xl flex items-start gap-3 animate-in fade-in min-w-0">
            <AlertTriangle className="w-5 h-5 text-[#e11d48] shrink-0 mt-0.5" />
            <div className="flex flex-col min-w-0">
              <h4 className="text-sm font-bold text-[#e11d48] truncate">Critical Pricing Error Detected</h4>
              <p className="text-xs font-medium text-muted leading-relaxed">
                Your Variable Cost per unit is higher than or equal to your Selling Price. You lose money on every sale. Break-even is mathematically impossible until you raise the price or lower costs.
              </p>
            </div>
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] items-start gap-6 md:gap-8 min-w-0">
          
          {/* INPUT FORM PANEL */}
          <div className="flex flex-col gap-6 md:gap-8 min-w-0">
            <div className="bg-surface border border-line p-5 md:p-7 rounded-xl space-y-6 md:space-y-8 min-w-0">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 min-w-0">
                <div className="space-y-2 sm:col-span-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted">
                    <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0"/> Total Fixed Costs
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none">{currency.symbol}</span>
                    <input 
                      type="number" 
                      min="0" 
                      value={fixedCosts} 
                      onChange={handleInputChange(setFixedCosts)} 
                      className={`${baseCurrencyInputStyle} text-xl md:text-2xl font-black`} 
                      placeholder="Rent, Salaries" 
                    />
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted truncate">
                    <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-teal shrink-0"/> Sell Price (Per Unit)
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none">{currency.symbol}</span>
                    <input type="number" min="0" value={pricePerUnit} onChange={handleInputChange(setPricePerUnit)} className={baseCurrencyInputStyle} />
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted truncate">
                    <Package className="w-4 h-4 md:w-5 md:h-5 text-[#fb7185] shrink-0"/> Variable Cost (Per Unit)
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none">{currency.symbol}</span>
                    <input 
                      type="number" 
                      min="0" 
                      value={variableCost} 
                      onChange={handleInputChange(setVariableCost)} 
                      className={`${baseCurrencyInputStyle} ${results.isImpossible ? 'border-[#fb7185] text-[#e11d48]' : ''}`} 
                    />
                  </div>
                </div>
              </div>

              {showAdvanced && (
                <div className="pt-6 border-t border-line space-y-4 animate-in fade-in slide-in-from-top-2 min-w-0">
                  <div className="flex items-center justify-between min-w-0">
                     <h3 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                       <Target className="w-4 h-4 text-brand shrink-0"/> Pro Goal Modeling
                     </h3>
                     <span className="text-[10px] text-brand bg-brand/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">Scaling</span>
                  </div>
                  
                  <div className="space-y-2 min-w-0">
                    <label className="text-xs sm:text-sm font-bold uppercase tracking-wide text-muted block truncate">Desired Target Profit</label>
                    <div className="relative group">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none">{currency.symbol}</span>
                      <input type="number" min="0" value={targetProfit} onChange={handleInputChange(setTargetProfit)} className={baseCurrencyInputStyle} placeholder="10000" />
                    </div>
                    <p className="text-[10px] text-muted font-medium leading-relaxed">Find out exactly how many units you need to sell to hit this profit target after covering all fixed costs.</p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* OUTPUT DASHBOARD PANEL */}
          <div className="flex flex-col gap-6 h-full min-w-0">
            
            <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card text-center relative overflow-hidden min-w-0">
               <div className="flex items-center justify-between border-b border-line pb-4 mb-5 min-w-0">
                 <h3 className="text-base md:text-lg font-bold text-ink truncate">Break-Even Point</h3>
                 <button
                   type="button"
                   onClick={copyResult}
                   className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border border-line bg-surface hover:bg-line text-ink text-xs font-semibold transition-colors shrink-0"
                 >
                   {copied ? <><Check className="w-3.5 h-3.5 text-teal" /> Copied</> : <><Copy className="w-3.5 h-3.5 text-muted" /> Copy</>}
                 </button>
               </div>
               
               <div className="z-10 relative my-3 min-w-0">
                 <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5 truncate">Zero Profit Point</h4>
                 <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-ink mb-2 truncate">
                   {isMounted ? results.breakEvenUnits.toLocaleString() : "0"}
                 </div>
                 <div className="text-xs font-semibold text-brand uppercase tracking-wider truncate">
                   Units to Sell
                 </div>
               </div>

               <div className="mt-6 mb-2 p-3 bg-surface border border-line rounded-lg flex justify-between items-center min-w-0">
                   <span className="text-xs font-bold text-muted truncate">Revenue Required</span>
                   <span className="text-base sm:text-lg font-black text-teal shrink-0 pl-2">{isMounted ? formatCurrency(results.breakEvenRevenue, currency.code, currency.locale) : "$0"}</span>
               </div>
            </div>

            {showAdvanced && Number(targetProfit) > 0 && !results.isImpossible && (
              <div className="bg-brand/10 border border-brand/20 p-5 md:p-6 rounded-xl shadow-card animate-in fade-in zoom-in-95 min-w-0">
                <div className="flex items-center gap-2 border-b border-brand/20 pb-3 mb-4 min-w-0">
                    <TrendingUp className="w-5 h-5 text-brand shrink-0" />
                    <h3 className="base font-bold text-ink truncate">To Hit Target Profit</h3>
                </div>
                
                <div className="flex justify-between items-end min-w-0">
                    <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1 truncate">Target Units</span>
                        <span className="text-3xl sm:text-4xl font-black text-brand tracking-tight truncate">
                          {isMounted ? results.targetUnits.toLocaleString() : "0"}
                        </span>
                    </div>
                    <div className="flex flex-col text-right min-w-0">
                        <span className="text-[10px] font-bold text-teal uppercase tracking-widest mb-1 truncate">Target Revenue</span>
                        <span className="text-xl sm:text-2xl font-black text-teal truncate">
                          {isMounted ? formatCurrency(results.targetRevenue, currency.code, currency.locale) : "$0"}
                        </span>
                    </div>
                </div>
              </div>
            )}

            <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card min-w-0">
              <div className="flex items-center gap-2 border-b border-line pb-3.5 mb-4 min-w-0">
                  <PieChart className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0" />
                  <h3 className="text-sm md:text-base font-bold text-ink truncate">Unit Economics & Margins</h3>
              </div>
              
              <div className="space-y-3 min-w-0">
                 <div className="flex justify-between items-center p-3 rounded-lg bg-surface border border-line min-w-0">
                     <div className="flex flex-col min-w-0 pr-2">
                         <span className="text-xs font-black text-ink uppercase truncate">Contribution Margin</span>
                         <span className="text-[10px] font-bold text-muted mt-0.5 truncate">Profit per unit before fixed costs</span>
                     </div>
                     <span className="text-base sm:text-lg font-black text-teal shrink-0">
                        {isMounted ? formatCurrency(results.contributionMargin, currency.code, currency.locale) : "$0"}
                     </span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3 min-w-0">
                     <div className="flex flex-col items-center p-3 rounded-lg bg-surface border border-line min-w-0">
                         <span className="text-[10px] font-bold uppercase text-muted mb-1 truncate">Gross Margin</span>
                         <span className="text-lg sm:text-xl font-black text-ink truncate">
                            {isMounted ? results.grossMarginPct.toFixed(1) : "0"}%
                         </span>
                     </div>
                     <div className="flex flex-col items-center p-3 rounded-lg bg-surface border border-line min-w-0">
                         <span className="text-[10px] font-bold uppercase text-muted mb-1 truncate">Markup</span>
                         <span className="text-lg sm:text-xl font-black text-ink flex items-center justify-center gap-1 truncate">
                            {isMounted ? results.markupPct.toFixed(1) : "0"}% <ArrowUpRight className="w-3.5 h-3.5 text-teal shrink-0"/>
                         </span>
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