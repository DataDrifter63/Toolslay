"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, DollarSign, Percent, ShoppingCart, Truck, Megaphone, Target, ArrowRight, Tag, Activity } from "lucide-react";

const CURRENCIES = [
  { code: 'USD', symbol: '$', locale: 'en-US' },
  { code: 'EUR', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', locale: 'en-GB' },
  { code: 'PKR', symbol: 'Rs', locale: 'en-PK' },
  { code: 'INR', symbol: '₹', locale: 'en-IN' }
];

const formatCurrency = (val, currencyCode, locale) => {
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency: currencyCode, 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(val || 0);
};

export default function ProfitMarginCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [calcMode, setCalcMode] = useState("margin"); 

  const [cost, setCost] = useState("50");
  const [price, setPrice] = useState("120"); 
  const [targetMargin, setTargetMargin] = useState("40"); 

  const [shipping, setShipping] = useState("5");
  const [marketing, setMarketing] = useState("10");
  const [platformFeePct, setPlatformFeePct] = useState("15"); 

  const [results, setResults] = useState({
    sellingPrice: 0,
    totalCost: 0,
    platformFeeAmount: 0,
    netProfit: 0,
    grossMargin: 0,
    netMargin: 0,
    markup: 0,
    roi: 0
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateMetrics = useCallback(() => {
    const c = Number(cost) || 0;
    const s = Number(shipping) || 0;
    const m = Number(marketing) || 0;
    const feePct = (Number(platformFeePct) || 0) / 100;
    
    const fixedCosts = c + s + m;

    let finalPrice = 0;
    let netProf = 0;
    let feeAmount = 0;

    if (calcMode === "margin") {
      finalPrice = Number(price) || 0;
      feeAmount = finalPrice * feePct;
      const totalC = fixedCosts + feeAmount;
      netProf = finalPrice - totalC;
    } else {
      const targetPct = (Number(targetMargin) || 0) / 100;
      
      if (1 - targetPct - feePct <= 0) {
        finalPrice = 0;
      } else {
        finalPrice = fixedCosts / (1 - targetPct - feePct);
      }
      
      feeAmount = finalPrice * feePct;
      const totalC = fixedCosts + feeAmount;
      netProf = finalPrice - totalC;
    }

    const totalActualCost = fixedCosts + feeAmount;
    const gMargin = finalPrice > 0 ? ((finalPrice - c) / finalPrice) * 100 : 0;
    const nMargin = finalPrice > 0 ? (netProf / finalPrice) * 100 : 0;
    const mkup = totalActualCost > 0 ? (netProf / totalActualCost) * 100 : 0;
    const returnOnInv = totalActualCost > 0 ? (netProf / totalActualCost) * 100 : 0;

    setResults({
      sellingPrice: finalPrice,
      totalCost: totalActualCost,
      platformFeeAmount: feeAmount,
      netProfit: netProf,
      grossMargin: gMargin,
      netMargin: nMargin,
      markup: mkup,
      roi: returnOnInv
    });

  }, [cost, price, targetMargin, shipping, marketing, platformFeePct, calcMode]);

  useEffect(() => {
    calculateMetrics();
  }, [calculateMetrics]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-emerald-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Pro Margin & Pricing Engine</h2>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
           <button 
             onClick={() => setCalcMode("margin")} 
             className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${calcMode === 'margin' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             Analyze Profit
           </button>
           <button 
             onClick={() => setCalcMode("price")} 
             className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${calcMode === 'price' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             Target Pricing
           </button>
           
           <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
           
           <select 
             value={currency.code}
             onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
             className="text-xs font-bold bg-transparent text-slate-700 dark:text-slate-200 px-2 py-1 outline-none cursor-pointer"
           >
             {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ShoppingCart className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Core Financials</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                     Product Cost (COGS)
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-indigo-500">{currency.symbol}</span>
                    <input type="number" min="0" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" />
                  </div>
               </div>

               {calcMode === "margin" ? (
                 <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                       Selling Price
                    </label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-400 group-focus-within:text-emerald-500">{currency.symbol}</span>
                      <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900 dark:text-emerald-100" />
                    </div>
                 </div>
               ) : (
                 <div className="space-y-2 animate-in fade-in slide-in-from-left-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 flex items-center gap-1">
                       Target Net Margin
                    </label>
                    <div className="relative group">
                      <input type="number" min="0" max="99" value={targetMargin} onChange={(e) => setTargetMargin(e.target.value)} className="w-full text-xl font-bold pl-4 pr-10 py-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 text-violet-900 dark:text-violet-100" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-violet-400 group-focus-within:text-violet-500">%</span>
                    </div>
                 </div>
               )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
               <div className="flex items-center gap-2">
                   <Target className="w-5 h-5 text-amber-500" />
                   <h3 className="font-bold text-slate-800 dark:text-slate-200">FBA / Dropshipping Expenses</h3>
               </div>
               <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded font-black uppercase tracking-widest">Optional</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1"><Truck className="w-3 h-3"/> Shipping</label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-amber-500">{currency.symbol}</span>
                    <input type="number" min="0" value={shipping} onChange={(e) => setShipping(e.target.value)} className="w-full text-sm font-bold pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1"><Megaphone className="w-3 h-3"/> Marketing/Ads</label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-amber-500">{currency.symbol}</span>
                    <input type="number" min="0" value={marketing} onChange={(e) => setMarketing(e.target.value)} className="w-full text-sm font-bold pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1"><Activity className="w-3 h-3"/> Platform Fee</label>
                  <div className="relative group">
                    <input type="number" min="0" value={platformFeePct} onChange={(e) => setPlatformFeePct(e.target.value)} className="w-full text-sm font-bold pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-amber-500">%</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm space-y-4">
             <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                 <Tag className="w-5 h-5 text-rose-500" />
                 <h3 className="font-bold text-slate-800 dark:text-slate-200">Discount Simulation</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-slate-100 dark:border-slate-800">
                     <th className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Offer</th>
                     <th className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">New Price</th>
                     <th className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Net Profit</th>
                     <th className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Net Margin</th>
                   </tr>
                 </thead>
                 <tbody>
                   {[10, 15, 20].map((discountPct) => {
                     const discountedPrice = results.sellingPrice * (1 - discountPct / 100);
                     const fee = discountedPrice * ((Number(platformFeePct) || 0) / 100);
                     const totalC = (Number(cost) || 0) + (Number(shipping) || 0) + (Number(marketing) || 0) + fee;
                     const pft = discountedPrice - totalC;
                     const mrg = discountedPrice > 0 ? (pft / discountedPrice) * 100 : 0;
                     const isLoss = pft < 0;

                     return (
                       <tr key={discountPct} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                         <td className="py-3 text-sm font-bold text-rose-500">{discountPct}% OFF</td>
                         <td className="py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{isMounted ? formatCurrency(discountedPrice, currency.code, currency.locale) : '0'}</td>
                         <td className={`py-3 text-sm font-bold ${isLoss ? 'text-rose-500' : 'text-emerald-500'}`}>{isMounted ? formatCurrency(pft, currency.code, currency.locale) : '0'}</td>
                         <td className="py-3 text-sm font-semibold text-slate-500">{isMounted ? mrg.toFixed(1) : '0'}%</td>
                       </tr>
                     )
                   })}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 sticky top-6">
           <div className={`border p-6 md:p-8 rounded-xl shadow-sm text-center relative overflow-hidden transition-colors ${
             results.netProfit >= 0 
               ? 'bg-slate-900 border-slate-800' 
               : 'bg-rose-950 border-rose-900'
           }`}>
             
             <div className="z-10 relative">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                 {calcMode === "margin" ? "Net Profit" : "Required Selling Price"}
               </h3>
               
               <div className={`text-5xl md:text-6xl font-black tracking-tighter mb-4 ${results.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                 {isMounted 
                   ? (calcMode === "margin" 
                       ? formatCurrency(results.netProfit, currency.code, currency.locale) 
                       : formatCurrency(results.sellingPrice, currency.code, currency.locale))
                   : `${currency.symbol}0`
                 }
               </div>

               <div className="grid grid-cols-2 gap-4 mt-6">
                 <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Net Margin</span>
                    <span className="text-xl font-bold text-white">{isMounted ? results.netMargin.toFixed(1) : '0'}%</span>
                 </div>
                 <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Markup</span>
                    <span className="text-xl font-bold text-white">{isMounted ? results.markup.toFixed(1) : '0'}%</span>
                 </div>
               </div>
             </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">Unit Economics Breakdown</h3>
             
             <div className="space-y-3">
               <div className="flex justify-between items-center text-sm">
                 <span className="font-semibold text-slate-600 dark:text-slate-400">Selling Price</span>
                 <span className="font-bold text-slate-800 dark:text-slate-200">{isMounted ? formatCurrency(results.sellingPrice, currency.code, currency.locale) : '0'}</span>
               </div>
               
               <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-rose-500 flex items-center gap-2"><ArrowRight className="w-3 h-3"/> Cost of Goods</span>
                   <span className="font-medium text-slate-600 dark:text-slate-400">-{isMounted ? formatCurrency(Number(cost)||0, currency.code, currency.locale) : '0'}</span>
                 </div>
                 {Number(shipping) > 0 && (
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-rose-500 flex items-center gap-2"><ArrowRight className="w-3 h-3"/> Shipping</span>
                     <span className="font-medium text-slate-600 dark:text-slate-400">-{isMounted ? formatCurrency(Number(shipping), currency.code, currency.locale) : '0'}</span>
                   </div>
                 )}
                 {Number(marketing) > 0 && (
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-rose-500 flex items-center gap-2"><ArrowRight className="w-3 h-3"/> Marketing</span>
                     <span className="font-medium text-slate-600 dark:text-slate-400">-{isMounted ? formatCurrency(Number(marketing), currency.code, currency.locale) : '0'}</span>
                   </div>
                 )}
                 {Number(platformFeePct) > 0 && (
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-rose-500 flex items-center gap-2"><ArrowRight className="w-3 h-3"/> Fees ({platformFeePct}%)</span>
                     <span className="font-medium text-slate-600 dark:text-slate-400">-{isMounted ? formatCurrency(results.platformFeeAmount, currency.code, currency.locale) : '0'}</span>
                   </div>
                 )}
               </div>

               <div className="pt-3 mt-3 border-t-2 border-slate-200 dark:border-slate-700 flex justify-between items-center">
                 <span className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Net Profit</span>
                 <span className={`text-xl font-black ${results.netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {isMounted ? formatCurrency(results.netProfit, currency.code, currency.locale) : '0'}
                 </span>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}