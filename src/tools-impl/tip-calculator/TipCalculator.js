"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Coffee, DollarSign, Percent, Users, Receipt, 
  CheckCircle2, SplitSquareHorizontal, Copy, Check 
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
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(val || 0);
};

export default function TipCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [copied, setCopied] = useState(false);
  
  const [billAmount, setBillAmount] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [tipPercent, setTipPercent] = useState("15");
  const [splitCount, setSplitCount] = useState("1");
  
  // Advanced Features
  const [tipOnTax, setTipOnTax] = useState(false); 
  const [roundMode, setRoundMode] = useState("none"); // none, roundTotal, roundPerPerson

  const [results, setResults] = useState({
    subtotal: 0,
    tax: 0,
    tipTotal: 0,
    grandTotal: 0,
    perPersonTotal: 0,
    perPersonTip: 0,
    effectiveTipPercent: 0
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateTip = useCallback(() => {
    const sub = parseFloat(billAmount) || 0;
    const tax = parseFloat(taxAmount) || 0;
    const tipP = parseFloat(tipPercent) || 0;
    const split = Math.max(1, parseInt(splitCount) || 1);

    if (sub <= 0) {
      setResults({ subtotal: 0, tax: 0, tipTotal: 0, grandTotal: 0, perPersonTotal: 0, perPersonTip: 0, effectiveTipPercent: 0 });
      return;
    }

    const baseForTip = tipOnTax ? (sub + tax) : sub;
    let calculatedTip = baseForTip * (tipP / 100);
    let total = sub + tax + calculatedTip;

    // Smart Rounding Logic
    if (roundMode === "roundTotal") {
      total = Math.ceil(total);
      calculatedTip = total - sub - tax; 
    } else if (roundMode === "roundPerPerson") {
      let perPersonRaw = total / split;
      let perPersonRounded = Math.ceil(perPersonRaw);
      total = perPersonRounded * split;
      calculatedTip = total - sub - tax;
    }

    if (calculatedTip < 0) calculatedTip = 0;
    total = sub + tax + calculatedTip;

    const perPersonT = total / split;
    const perPersonTip = calculatedTip / split;
    const effectiveTip = (calculatedTip / sub) * 100;

    setResults({
      subtotal: sub,
      tax: tax,
      tipTotal: calculatedTip,
      grandTotal: total,
      perPersonTotal: perPersonT,
      perPersonTip: perPersonTip,
      effectiveTipPercent: isNaN(effectiveTip) ? 0 : effectiveTip
    });
  }, [billAmount, taxAmount, tipPercent, splitCount, tipOnTax, roundMode]);

  useEffect(() => {
    calculateTip();
  }, [calculateTip]);

  const copyResult = async () => {
    if (results.grandTotal <= 0) return;
    
    let text = `Bill Summary\n`;
    text += `Grand Total: ${formatCurrency(results.grandTotal, currency.code, currency.locale)}\n`;
    
    if (parseInt(splitCount) > 1) {
      text += `Per Person (Split by ${splitCount}): ${formatCurrency(results.perPersonTotal, currency.code, currency.locale)}\n`;
    }
    
    text += `\nBreakdown:\n`;
    text += `- Subtotal: ${formatCurrency(results.subtotal, currency.code, currency.locale)}\n`;
    if (results.tax > 0) {
      text += `- Tax: ${formatCurrency(results.tax, currency.code, currency.locale)}\n`;
    }
    text += `- Total Tip: ${formatCurrency(results.tipTotal, currency.code, currency.locale)}\n`;

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

  const setPresetTip = (val) => {
    setTipPercent(val.toString());
    setRoundMode("none"); 
  };

  const handleSplitChange = (action) => {
    let current = parseInt(splitCount) || 1;
    if (action === 'minus' && current > 1) setSplitCount((current - 1).toString());
    if (action === 'plus' && current < 100) setSplitCount((current + 1).toString());
  };

  // Base input styles with larger fonts for desktop
  const baseInputStyle = "w-full min-w-0 h-12 md:h-14 px-4 bg-surface border border-line rounded-lg text-ink text-base md:text-lg focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
  const baseSelectStyle = "w-full min-w-0 h-12 md:h-14 pl-4 pr-8 bg-surface border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold cursor-pointer";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      
      {/* MAIN WRAPPER SHELL */}
      <div className="rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 min-w-0">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Coffee className="w-6 h-6 md:w-7 md:h-7 text-brand shrink-0" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink truncate">
              Tip Calculator & Splitter
            </h2>
          </div>

          <div className="shrink-0">
            <select 
              value={currency.code}
              onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
              className="h-10 md:h-11 pl-4 pr-10 bg-surface border border-line rounded-lg text-ink text-sm md:text-base font-semibold focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all cursor-pointer min-w-[100px]"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
              ))}
            </select>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] items-start gap-6 md:gap-8 min-w-0">
          
          {/* INPUT FORM PANEL */}
          <div className="flex flex-col gap-6 md:gap-8 min-w-0">
            
            {/* Bill & Tax */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 min-w-0">
              <div className="space-y-2 sm:col-span-2 min-w-0">
                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted" htmlFor="tip-bill">
                  <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-brand" /> Bill Subtotal
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted">{currency.symbol}</span>
                  <input 
                    id="tip-bill"
                    type="number" 
                    min="0" 
                    value={billAmount} 
                    onChange={(e) => setBillAmount(e.target.value)} 
                    className={`${baseInputStyle} pl-10 md:pl-11 text-xl md:text-2xl font-bold`} 
                    placeholder="0.00" 
                  />
                </div>
              </div>

              <div className="space-y-2 min-w-0">
                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted" htmlFor="tip-tax">
                  <Receipt className="w-4 h-4 md:w-5 md:h-5 text-brand" /> Tax (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-muted">{currency.symbol}</span>
                  <input 
                    id="tip-tax"
                    type="number" 
                    min="0" 
                    value={taxAmount} 
                    onChange={(e) => setTaxAmount(e.target.value)} 
                    className={`${baseInputStyle} pl-10 md:pl-11 font-semibold`} 
                    placeholder="0.00" 
                  />
                </div>
              </div>

              <div className="space-y-2 min-w-0">
                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted" htmlFor="tip-split">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-brand" /> Split Between
                </label>
                <div className="flex items-center bg-surface border border-line rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand h-12 md:h-14">
                  <button 
                    onClick={() => handleSplitChange('minus')} 
                    className="w-12 md:w-14 h-full flex items-center justify-center font-bold text-muted hover:text-brand hover:bg-paper transition-colors text-xl"
                  >
                    -
                  </button>
                  <input 
                    id="tip-split"
                    type="number" 
                    min="1" 
                    value={splitCount} 
                    onChange={(e) => setSplitCount(e.target.value)} 
                    className="w-full h-full text-center text-base md:text-lg font-bold bg-transparent focus:outline-none text-ink [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                  <button 
                    onClick={() => handleSplitChange('plus')} 
                    className="w-12 md:w-14 h-full flex items-center justify-center font-bold text-muted hover:text-brand hover:bg-paper transition-colors text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Tip Selection */}
            <div className="space-y-4 pt-6 border-t border-line min-w-0">
              <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted">
                <Percent className="w-4 h-4 md:w-5 md:h-5 text-brand" /> Tip Percentage
              </label>
              
              <div className="grid grid-cols-4 gap-2 md:gap-3 min-w-0">
                {[
                  { val: 10, label: "Okay" },
                  { val: 15, label: "Good" },
                  { val: 18, label: "Great" },
                  { val: 20, label: "Wow!" }
                ].map(preset => {
                  const isActive = parseFloat(tipPercent) === preset.val;
                  return (
                    <button 
                      key={preset.val}
                      onClick={() => setPresetTip(preset.val)}
                      className={`flex flex-col items-center justify-center py-2.5 md:py-3 px-1 rounded-lg border transition-all ${
                        isActive 
                          ? 'bg-brand/10 border-brand/30 text-brand shadow-sm' 
                          : 'bg-surface border-line text-muted hover:text-ink hover:border-brand/30'
                      }`}
                    >
                      <span className="font-bold text-lg md:text-xl">{preset.val}%</span>
                      <span className="text-[10px] md:text-xs uppercase font-semibold opacity-80 mt-0.5">{preset.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative group mt-2">
                <input 
                  type="number" 
                  step="0.5" 
                  min="0" 
                  value={tipPercent} 
                  onChange={(e) => {setTipPercent(e.target.value); setRoundMode("none");}} 
                  className={`${baseInputStyle} pr-10 font-bold`} 
                  placeholder="Custom %" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm md:text-base font-bold text-muted">%</span>
              </div>
            </div>

            {/* Advanced Features */}
            <div className="pt-6 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 min-w-0">
              <label className="flex items-center gap-3 cursor-pointer p-3 md:p-4 rounded-lg border border-line bg-surface hover:bg-paper transition-colors h-12 md:h-14">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={tipOnTax} 
                    onChange={(e) => setTipOnTax(e.target.checked)} 
                    className="peer sr-only" 
                  />
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded border border-line bg-surface peer-checked:bg-brand peer-checked:border-brand flex items-center justify-center transition-colors">
                    {tipOnTax && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <span className="text-sm md:text-base font-semibold text-ink">Tip on Tax</span>
              </label>

              <select 
                value={roundMode} 
                onChange={(e) => setRoundMode(e.target.value)}
                className={baseSelectStyle}
              >
                <option value="none">No Rounding</option>
                <option value="roundTotal">Round Up Total Bill</option>
                {parseInt(splitCount) > 1 && <option value="roundPerPerson">Round Up Per Person</option>}
              </select>
            </div>

          </div>

          {/* RESULT CARD */}
          <div className="rounded-xl border border-line bg-paper p-1.5 md:p-2 min-w-0 h-full">
            <div className="bg-surface rounded-lg w-full h-full p-5 md:p-8 flex flex-col relative overflow-hidden min-h-[400px]">
              
              <div className="flex items-center justify-between border-b border-line pb-4 mb-6 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-ink truncate">Bill Summary</h3>
                <button
                  type="button"
                  onClick={copyResult}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border border-line bg-paper hover:bg-line text-ink text-xs md:text-sm font-semibold transition-colors shrink-0"
                >
                  {copied ? <><Check className="w-4 h-4 text-teal" /> Copied</> : <><Copy className="w-4 h-4 text-muted" /> Copy</>}
                </button>
              </div>
              
              {/* Grand Total */}
              <div className="text-center mb-8 min-w-0">
                 <span className="text-xs md:text-sm font-bold text-muted uppercase tracking-widest block mb-2">Grand Total</span>
                 <span className="block text-4xl sm:text-5xl md:text-6xl font-black text-ink tracking-tighter truncate">
                   {isMounted ? formatCurrency(results.grandTotal, currency.code, currency.locale) : `${currency.symbol}0.00`}
                 </span>
              </div>

              {/* Per Person Highlight */}
              {parseInt(splitCount) > 1 && (
                <div className="bg-brand/5 border border-brand/20 p-5 rounded-xl text-center mb-8">
                   <div className="flex justify-center items-center gap-2 mb-2">
                     <SplitSquareHorizontal className="w-4 h-4 md:w-5 md:h-5 text-brand"/>
                     <span className="text-xs md:text-sm font-bold text-brand uppercase tracking-widest">Per Person</span>
                   </div>
                   <span className="block text-3xl md:text-4xl font-black text-brand truncate">
                     {isMounted ? formatCurrency(results.perPersonTotal, currency.code, currency.locale) : `${currency.symbol}0.00`}
                   </span>
                   <span className="block text-xs md:text-sm font-semibold text-brand/70 mt-2">
                     Includes {isMounted ? formatCurrency(results.perPersonTip, currency.code, currency.locale) : "$0.00"} tip
                   </span>
                </div>
              )}

              {/* Breakdown List */}
              <div className="space-y-2 md:space-y-3 flex-grow min-w-0">
                <div className="flex justify-between items-center p-3 rounded-lg hover:bg-paper transition-colors">
                  <span className="text-sm md:text-base text-muted font-semibold">Subtotal</span>
                  <span className="font-bold text-ink text-sm md:text-base">{isMounted ? formatCurrency(results.subtotal, currency.code, currency.locale) : `${currency.symbol}0.00`}</span>
                </div>
                
                {results.tax > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg hover:bg-paper transition-colors animate-in fade-in">
                    <span className="text-sm md:text-base text-muted font-semibold">Tax</span>
                    <span className="font-bold text-ink text-sm md:text-base">{isMounted ? formatCurrency(results.tax, currency.code, currency.locale) : `${currency.symbol}0.00`}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-paper border border-line mt-2">
                  <span className="text-sm md:text-base text-ink font-bold">Total Tip</span>
                  <span className="font-black text-brand text-sm md:text-base">{isMounted ? formatCurrency(results.tipTotal, currency.code, currency.locale) : `${currency.symbol}0.00`}</span>
                </div>
              </div>

              {/* Footer Info */}
              {results.effectiveTipPercent > 0 && (
                <div className="mt-6 pt-5 border-t border-line flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-muted">
                   <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-teal"/> 
                   <span>Effective Tip: {results.effectiveTipPercent.toFixed(1)}% {tipOnTax && "(Incl. Tax)"}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}