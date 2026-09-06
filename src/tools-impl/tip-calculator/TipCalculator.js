"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Coffee, DollarSign, Percent, Users, Calculator, Sparkles, Receipt, CheckCircle2, SplitSquareHorizontal } from "lucide-react";

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
  
  const [billAmount, setBillAmount] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [tipPercent, setTipPercent] = useState("15");
  const [splitCount, setSplitCount] = useState("1");
  
  // Advanced Features
  const [tipOnTax, setTipOnTax] = useState(false); // Default: Tip on subtotal only
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
      calculatedTip = total - sub - tax; // Adjust tip to make total a whole number
    } else if (roundMode === "roundPerPerson") {
      let perPersonRaw = total / split;
      let perPersonRounded = Math.ceil(perPersonRaw);
      total = perPersonRounded * split;
      calculatedTip = total - sub - tax;
    }

    // Ensure tip doesn't go negative due to weird rounding on 0 tip
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

  const setPresetTip = (val) => {
    setTipPercent(val.toString());
    setRoundMode("none"); // Reset rounding when forcing a percentage
  };

  const handleSplitChange = (action) => {
    let current = parseInt(splitCount) || 1;
    if (action === 'minus' && current > 1) setSplitCount((current - 1).toString());
    if (action === 'plus' && current < 100) setSplitCount((current + 1).toString());
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Coffee className="w-6 h-6 text-amber-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Pro Tip & Split</h2>
        </div>
        <select 
            value={currency.code}
            onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
            className="text-sm font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
        >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6 items-start">
        
        {/* Left Input Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <DollarSign className="w-4 h-4 text-amber-500"/> Bill Subtotal
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-amber-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} className="w-full text-3xl font-black pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100 transition-shadow" placeholder="0.00" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Receipt className="w-4 h-4 text-amber-500"/> Tax (Optional)
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-amber-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100 transition-shadow" placeholder="0.00" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Users className="w-4 h-4 text-amber-500"/> Split Between
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-500">
                  <button onClick={() => handleSplitChange('minus')} className="px-5 py-3 font-black text-slate-500 hover:text-amber-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">-</button>
                  <input type="number" min="1" value={splitCount} onChange={(e) => setSplitCount(e.target.value)} className="w-full text-center text-xl font-bold bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <button onClick={() => handleSplitChange('plus')} className="px-5 py-3 font-black text-slate-500 hover:text-amber-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">+</button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">
                <span className="flex items-center gap-2"><Percent className="w-4 h-4 text-amber-500"/> Tip Percentage</span>
              </label>
              
              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { val: 10, label: "Okay" },
                  { val: 15, label: "Good" },
                  { val: 18, label: "Great" },
                  { val: 20, label: "Wow!" }
                ].map(preset => (
                  <button 
                    key={preset.val}
                    onClick={() => setPresetTip(preset.val)}
                    className={`py-2 px-1 rounded-lg border flex flex-col items-center justify-center transition-all ${parseFloat(tipPercent) === preset.val ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-400 scale-[1.02] shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                  >
                    <span className="font-black text-lg">{preset.val}%</span>
                    <span className="text-[10px] uppercase font-bold opacity-70">{preset.label}</span>
                  </button>
                ))}
              </div>

              {/* Custom Tip Input */}
              <div className="relative group">
                <input type="number" step="0.5" min="0" value={tipPercent} onChange={(e) => {setTipPercent(e.target.value); setRoundMode("none");}} className="w-full text-lg font-bold pl-4 pr-8 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100 transition-shadow" placeholder="Custom %" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-amber-500 transition-colors">%</span>
              </div>
            </div>

            {/* Smart Features */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <input type="checkbox" checked={tipOnTax} onChange={(e) => setTipOnTax(e.target.checked)} className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Tip on Tax</span>
                    <span className="text-[10px] text-slate-500">Include tax in tip calculation</span>
                  </div>
              </label>

              <select 
                value={roundMode} 
                onChange={(e) => setRoundMode(e.target.value)}
                className="w-full text-sm font-bold px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                <option value="none">No Rounding</option>
                <option value="roundTotal">Round Up Total Bill</option>
                {parseInt(splitCount) > 1 && <option value="roundPerPerson">Round Up Per Person</option>}
              </select>
            </div>

          </div>
        </div>

        {/* Right Sticky Summary */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm flex flex-col sticky top-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">Bill Summary</h3>
          </div>
          
          <div className="text-center mb-6">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Grand Total</span>
             <span className="block text-5xl md:text-6xl font-black text-white tracking-tighter">
               {isMounted ? formatCurrency(results.grandTotal, currency.code, currency.locale) : `${currency.symbol}0`}
             </span>
          </div>

          {parseInt(splitCount) > 1 && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-center mb-6 animate-in zoom-in-95">
               <div className="flex justify-center items-center gap-2 mb-1">
                 <SplitSquareHorizontal className="w-4 h-4 text-amber-400"/>
                 <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Per Person</span>
               </div>
               <span className="block text-3xl font-black text-amber-500">
                 {isMounted ? formatCurrency(results.perPersonTotal, currency.code, currency.locale) : `${currency.symbol}0`}
               </span>
               <span className="block text-[10px] font-bold text-amber-400/70 mt-1">
                 Includes {isMounted ? formatCurrency(results.perPersonTip, currency.code, currency.locale) : "$0"} tip
               </span>
            </div>
          )}

          {/* Itemized Receipt */}
          <div className="space-y-3 flex-grow mt-2">
            <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/50">
              <span className="text-sm text-slate-400 font-medium">Subtotal</span>
              <span className="font-bold text-white font-mono">{isMounted ? formatCurrency(results.subtotal, currency.code, currency.locale) : `${currency.symbol}0`}</span>
            </div>
            
            {results.tax > 0 && (
              <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/50">
                <span className="text-sm text-slate-400 font-medium">Tax</span>
                <span className="font-bold text-white font-mono">{isMounted ? formatCurrency(results.tax, currency.code, currency.locale) : `${currency.symbol}0`}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center p-2 rounded bg-slate-800/80 border border-slate-700">
              <span className="text-sm text-slate-200 font-bold">Total Tip</span>
              <span className="font-bold text-amber-400 font-mono">{isMounted ? formatCurrency(results.tipTotal, currency.code, currency.locale) : `${currency.symbol}0`}</span>
            </div>
          </div>

          {/* Footer Info */}
          {results.effectiveTipPercent > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
               <CheckCircle2 className="w-4 h-4 text-emerald-500"/> 
               Effective Tip: {results.effectiveTipPercent.toFixed(1)}% 
               {tipOnTax && "(Incl. Tax)"}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}