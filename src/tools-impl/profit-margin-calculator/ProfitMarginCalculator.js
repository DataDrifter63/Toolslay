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

  const baseInputStyle = "w-full min-w-0 h-11 px-3 sm:px-4 bg-paper border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold";
  const baseCurrencyInputStyle = "w-full min-w-0 h-11 pl-8 sm:pl-9 pr-3 bg-paper border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* HEADER BAR */}
      <div className="rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-brand shrink-0" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink truncate">Pro Margin & Pricing Engine</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-paper p-1 rounded-lg border border-line shrink-0">
           <button 
             type="button"
             onClick={() => setCalcMode("margin")} 
             className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${calcMode === 'margin' ? 'bg-surface text-brand shadow-sm border border-line' : 'text-muted hover:text-ink'}`}
           >
             Analyze Profit
           </button>
           <button 
             type="button"
             onClick={() => setCalcMode("price")} 
             className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${calcMode === 'price' ? 'bg-surface text-brand shadow-sm border border-line' : 'text-muted hover:text-ink'}`}
           >
             Target Pricing
           </button>
           
           <div className="w-px h-5 bg-line mx-0.5"></div>
           
           <select 
             value={currency.code}
             onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
             className="text-xs font-bold bg-transparent text-ink px-2 py-1 outline-none cursor-pointer"
           >
             {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] gap-6 md:gap-8 items-start min-w-0">
        
        {/* INPUT FORMS */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-xl shadow-card space-y-5 min-w-0">
            <div className="flex items-center gap-2 border-b border-line pb-3 min-w-0">
                <ShoppingCart className="w-5 h-5 text-brand shrink-0" />
                <h3 className="font-bold text-ink text-sm sm:text-base truncate">Core Financials</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 min-w-0">
               <div className="space-y-1.5 min-w-0">
                  <label className="text-xs font-bold uppercase tracking-wide text-muted block truncate">
                      Product Cost (COGS)
                  </label>
                  <div className="relative group min-w-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted pointer-events-none">{currency.symbol}</span>
                    <input type="number" min="0" value={cost} onChange={(e) => setCost(e.target.value)} className={baseCurrencyInputStyle} />
                  </div>
               </div>

               {calcMode === "margin" ? (
                 <div className="space-y-1.5 animate-in fade-in min-w-0">
                    <label className="text-xs font-bold uppercase tracking-wide text-teal block truncate">
                        Selling Price
                    </label>
                    <div className="relative group min-w-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-teal pointer-events-none">{currency.symbol}</span>
                      <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={`${baseCurrencyInputStyle} border-teal/40 text-teal`} />
                    </div>
                 </div>
               ) : (
                 <div className="space-y-1.5 animate-in fade-in min-w-0">
                    <label className="text-xs font-bold uppercase tracking-wide text-brand block truncate">
                        Target Net Margin
                    </label>
                    <div className="relative group min-w-0">
                      <input type="number" min="0" max="99" value={targetMargin} onChange={(e) => setTargetMargin(e.target.value)} className={`${baseInputStyle} border-brand/40 pr-8 text-brand`} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-brand pointer-events-none">%</span>
                    </div>
                 </div>
               )}
            </div>
          </div>

          <div className="bg-surface border border-line p-5 sm:p-6 rounded-xl shadow-card space-y-5 min-w-0">
            <div className="flex justify-between items-center border-b border-line pb-3 min-w-0">
               <div className="flex items-center gap-2 min-w-0">
                   <Target className="w-5 h-5 text-amber-500 shrink-0" />
                   <h3 className="font-bold text-ink text-sm sm:text-base truncate">FBA / Dropshipping Expenses</h3>
               </div>
               <span className="text-[9px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0">Optional</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
               <div className="space-y-1.5 min-w-0">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1 truncate"><Truck className="w-3 h-3 shrink-0"/> Shipping</label>
                  <div className="relative group min-w-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted pointer-events-none">{currency.symbol}</span>
                    <input type="number" min="0" value={shipping} onChange={(e) => setShipping(e.target.value)} className={baseCurrencyInputStyle} />
                  </div>
               </div>
               <div className="space-y-1.5 min-w-0">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1 truncate"><Megaphone className="w-3 h-3 shrink-0"/> Marketing/Ads</label>
                  <div className="relative group min-w-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted pointer-events-none">{currency.symbol}</span>
                    <input type="number" min="0" value={marketing} onChange={(e) => setMarketing(e.target.value)} className={baseCurrencyInputStyle} />
                  </div>
               </div>
               <div className="space-y-1.5 min-w-0">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1 truncate"><Activity className="w-3 h-3 shrink-0"/> Platform Fee</label>
                  <div className="relative group min-w-0">
                    <input type="number" min="0" value={platformFeePct} onChange={(e) => setPlatformFeePct(e.target.value)} className={`${baseInputStyle} pr-7`} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted pointer-events-none">%</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-surface border border-line p-5 sm:p-6 rounded-xl shadow-card space-y-4 min-w-0">
              <div className="flex items-center gap-2 border-b border-line pb-3 min-w-0">
                  <Tag className="w-5 h-5 text-[#fb7185] shrink-0" />
                  <h3 className="font-bold text-ink text-sm sm:text-base truncate">Discount Simulation</h3>
              </div>
              <div className="overflow-x-auto min-w-0">
                <table className="w-full text-left border-collapse min-w-[320px]">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted">Offer</th>
                      <th className="py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted">New Price</th>
                      <th className="py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted">Net Profit</th>
                      <th className="py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted">Net Margin</th>
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
                        <tr key={discountPct} className="border-b border-line/50 hover:bg-paper/50 transition-colors">
                          <td className="py-2.5 text-xs sm:text-sm font-bold text-[#fb7185]">{discountPct}% OFF</td>
                          <td className="py-2.5 text-xs sm:text-sm font-semibold text-ink">{isMounted ? formatCurrency(discountedPrice, currency.code, currency.locale) : '0'}</td>
                          <td className={`py-2.5 text-xs sm:text-sm font-bold ${isLoss ? 'text-[#e11d48]' : 'text-teal'}`}>{isMounted ? formatCurrency(pft, currency.code, currency.locale) : '0'}</td>
                          <td className="py-2.5 text-xs sm:text-sm font-semibold text-muted">{isMounted ? mrg.toFixed(1) : '0'}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
          </div>
        </div>

        {/* OUTPUT DASHBOARD */}
        <div className="flex flex-col gap-6 sticky top-6 min-w-0">
           <div className={`border p-5 sm:p-7 rounded-xl shadow-card text-center relative overflow-hidden transition-colors min-w-0 ${
             results.netProfit >= 0 
               ? 'bg-paper border-line text-ink' 
               : 'bg-[#fb7185]/10 border-[#fb7185]/30 text-ink'
           }`}>
             
             <div className="z-10 relative min-w-0">
               <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-2 truncate">
                 {calcMode === "margin" ? "Net Profit" : "Required Selling Price"}
               </h3>
               
               <div className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 truncate ${results.netProfit >= 0 ? 'text-teal' : 'text-[#e11d48]'}`}>
                 {isMounted 
                   ? (calcMode === "margin" 
                       ? formatCurrency(results.netProfit, currency.code, currency.locale) 
                       : formatCurrency(results.sellingPrice, currency.code, currency.locale))
                   : `${currency.symbol}0`
                 }
               </div>

               <div className="grid grid-cols-2 gap-3 mt-4 min-w-0">
                 <div className="bg-surface border border-line p-3.5 rounded-lg min-w-0">
                    <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted mb-1 truncate">Net Margin</span>
                    <span className="text-lg sm:text-xl font-black text-ink">{isMounted ? results.netMargin.toFixed(1) : '0'}%</span>
                 </div>
                 <div className="bg-surface border border-line p-3.5 rounded-lg min-w-0">
                    <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted mb-1 truncate">Markup</span>
                    <span className="text-lg sm:text-xl font-black text-ink">{isMounted ? results.markup.toFixed(1) : '0'}%</span>
                 </div>
               </div>
             </div>
           </div>

           <div className="bg-paper border border-line p-5 sm:p-6 rounded-xl shadow-card min-w-0">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-4 text-center truncate">Unit Economics Breakdown</h3>
             
             <div className="space-y-3 min-w-0">
               <div className="flex justify-between items-center text-xs sm:text-sm min-w-0">
                 <span className="font-semibold text-muted truncate">Selling Price</span>
                 <span className="font-bold text-ink shrink-0 pl-2">{isMounted ? formatCurrency(results.sellingPrice, currency.code, currency.locale) : '0'}</span>
               </div>
               
               <div className="pt-2 border-t border-line space-y-2 min-w-0">
                 <div className="flex justify-between items-center text-xs sm:text-sm min-w-0">
                   <span className="text-[#fb7185] flex items-center gap-1.5 truncate"><ArrowRight className="w-3 h-3 shrink-0"/> Cost of Goods</span>
                   <span className="font-medium text-muted shrink-0 pl-2">-{isMounted ? formatCurrency(Number(cost)||0, currency.code, currency.locale) : '0'}</span>
                 </div>
                 {Number(shipping) > 0 && (
                   <div className="flex justify-between items-center text-xs sm:text-sm min-w-0">
                     <span className="text-[#fb7185] flex items-center gap-1.5 truncate"><ArrowRight className="w-3 h-3 shrink-0"/> Shipping</span>
                     <span className="font-medium text-muted shrink-0 pl-2">-{isMounted ? formatCurrency(Number(shipping), currency.code, currency.locale) : '0'}</span>
                   </div>
                 )}
                 {Number(marketing) > 0 && (
                   <div className="flex justify-between items-center text-xs sm:text-sm min-w-0">
                     <span className="text-[#fb7185] flex items-center gap-1.5 truncate"><ArrowRight className="w-3 h-3 shrink-0"/> Marketing</span>
                     <span className="font-medium text-muted shrink-0 pl-2">-{isMounted ? formatCurrency(Number(marketing), currency.code, currency.locale) : '0'}</span>
                   </div>
                 )}
                 {Number(platformFeePct) > 0 && (
                   <div className="flex justify-between items-center text-xs sm:text-sm min-w-0">
                     <span className="text-[#fb7185] flex items-center gap-1.5 truncate"><ArrowRight className="w-3 h-3 shrink-0"/> Fees ({platformFeePct}%)</span>
                     <span className="font-medium text-muted shrink-0 pl-2">-{isMounted ? formatCurrency(results.platformFeeAmount, currency.code, currency.locale) : '0'}</span>
                   </div>
                 )}
               </div>

               <div className="pt-3 mt-3 border-t-2 border-line flex justify-between items-center min-w-0">
                 <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-ink truncate">Net Profit</span>
                 <span className={`text-lg sm:text-xl font-black shrink-0 pl-2 ${results.netProfit >= 0 ? 'text-teal' : 'text-[#e11d48]'}`}>
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