"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Home, Landmark, Calculator, Percent, 
  DollarSign, ShieldCheck, PieChart, 
  CalendarDays, TrendingUp, AlertCircle, 
  Receipt, Wallet
} from "lucide-react";

export default function PropertyTaxEstimator() {
  const [isMounted, setIsMounted] = useState(false);

  // 1. Property Details
  const [marketValue, setMarketValue] = useState("350000");
  const [assessmentRatio, setAssessmentRatio] = useState("100"); // Usually 80-100% depending on county
  
  // 2. Tax Rates & Deductions
  const [taxRate, setTaxRate] = useState("1.25"); // Annual property tax rate %
  const [exemptions, setExemptions] = useState("0"); // Fixed $ amount deducted from assessed value (e.g. Homestead)

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNumInput = (setter, value, max = null) => {
    if (value === "") {
      setter("");
      return;
    }
    if (/^\d*\.?\d*$/.test(value)) {
      const num = parseFloat(value);
      if (max && num > max) return;
      setter(value);
    }
  };

  // --- CORE PROPERTY TAX ENGINE ---
  const calculations = useMemo(() => {
    const marketVal = parseFloat(marketValue) || 0;
    const ratio = parseFloat(assessmentRatio) || 100;
    const rate = parseFloat(taxRate) || 0;
    const exempt = parseFloat(exemptions) || 0;

    // 1. Assessed Value (The value the county taxes you on, not necessarily what you can sell it for)
    const assessedValue = marketVal * (ratio / 100);

    // 2. Taxable Value (Assessed Value minus any legal homeowner/veteran exemptions)
    const taxableValue = Math.max(0, assessedValue - exempt);

    // 3. Tax Calculations
    const annualTax = taxableValue * (rate / 100);
    const monthlyEscrow = annualTax / 12;
    const biAnnualTax = annualTax / 2;

    // 4. Pro Metrics
    // Effective tax rate is the actual percentage of the market value you are paying, 
    // which often differs from the nominal rate due to assessments and exemptions.
    const effectiveTaxRate = marketVal > 0 ? (annualTax / marketVal) * 100 : 0;
    
    // Tax Savings from Exemptions
    const taxSavedByExemptions = (Math.min(exempt, assessedValue)) * (rate / 100);

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return {
      marketVal, assessedValue, taxableValue,
      annualTax, monthlyEscrow, biAnnualTax,
      effectiveTaxRate, taxSavedByExemptions,
      formatCurrency
    };
  }, [marketValue, assessmentRatio, taxRate, exemptions]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-indigo-100 via-rose-50 to-transparent dark:from-indigo-900/30 dark:via-rose-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-rose-500 p-3.5 rounded-2xl shadow-md">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Property Tax Estimator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Assessed Value & Escrow Analytics
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: ADVANCED CONFIGURATION ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Market Value */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-indigo-500" /> 1. Home Market Value
              </label>
              <p className="text-[10px] font-medium text-slate-500 leading-snug">
                The estimated current selling price of the property.
              </p>
              
              <div className="relative flex items-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all overflow-hidden group">
                <div className="bg-slate-50 dark:bg-slate-800 px-5 py-5 flex items-center justify-center border-r border-slate-200 dark:border-slate-700 transition-colors">
                  <DollarSign className="w-6 h-6 text-slate-400 group-focus-within:text-indigo-500" />
                </div>
                <input
                  type="text" value={marketValue} onChange={(e) => handleNumInput(setMarketValue, e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent px-5 py-5 text-3xl font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Assessment Details */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" /> 2. Assessment & Tax Rate
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Assessment Ratio */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 group focus-within:border-rose-400 transition-colors">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                    Assessment Ratio
                    <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-[8px]">Often 80-100%</span>
                  </label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" value={assessmentRatio} onChange={(e) => handleNumInput(setAssessmentRatio, e.target.value, 100)} 
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-base font-black outline-none focus:border-rose-500 tabular-nums" 
                    />
                    <span className="absolute right-3 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>

                {/* Tax Rate */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 group focus-within:border-rose-400 transition-colors">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Local Tax Rate
                  </label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" value={taxRate} onChange={(e) => handleNumInput(setTaxRate, e.target.value, 100)} 
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-base font-black outline-none focus:border-rose-500 tabular-nums" 
                    />
                    <span className="absolute right-3 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Exemptions */}
            <div className="space-y-4 p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 border-b border-emerald-200/60 dark:border-emerald-800/60 pb-2">
                <Wallet className="w-3.5 h-3.5" /> 3. Deductions & Exemptions
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-snug max-w-[250px]">
                    Enter any Homestead, Senior, or Veteran exemption amount. This is a fixed dollar amount deducted from your <strong>Assessed Value</strong> before taxes are applied.
                  </p>
                </div>
                <div className="relative flex items-center w-full sm:w-36 shrink-0 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 transition-shadow">
                  <span className="pl-3 text-sm font-bold text-slate-400">$</span>
                  <input 
                    type="text" value={exemptions} onChange={(e) => handleNumInput(setExemptions, e.target.value)} 
                    placeholder="0" className="w-full bg-transparent px-2 py-2.5 text-base font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums" 
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD / RECEIPT ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[680px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Receipt className="w-4 h-4 text-rose-500" /> Official Tax Estimate
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                  Annual Overview
                </span>
              </div>

              {/* SMART ALERT (Exemption Savings) */}
              {calculations.taxSavedByExemptions > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-xl flex items-start gap-2 mb-4 shrink-0 animate-in fade-in">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Exemption Savings Applied</span>
                    <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                      Your exemptions are saving you exactly <strong>{calculations.formatCurrency(calculations.taxSavedByExemptions)}</strong> on your annual tax bill!
                    </p>
                  </div>
                </div>
              )}

              {/* HERO METRIC: ANNUAL TAX */}
              <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-8 px-4 rounded-3xl shadow-sm mb-6 relative overflow-hidden shrink-0">
                <span className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Estimated Annual Property Tax
                </span>
                <span className="text-5xl sm:text-6xl font-black text-rose-600 dark:text-rose-400 tracking-tighter tabular-nums leading-none block">
                  {calculations.formatCurrency(calculations.annualTax)}
                </span>
                
                {/* Effective Tax Rate Badge */}
                <div className="mt-4 flex justify-center">
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <PieChart className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Effective Tax Rate:</span>
                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">{calculations.effectiveTaxRate.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* PAYMENT SCHEDULE */}
              <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-1 flex items-center gap-1"><CalendarDays className="w-3 h-3"/> Monthly Escrow</span>
                  <span className="text-xl font-black tabular-nums text-indigo-700 dark:text-indigo-400">{calculations.formatCurrency(calculations.monthlyEscrow)}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-700">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Bi-Annual Bill</span>
                  <span className="text-xl font-black tabular-nums text-slate-700 dark:text-slate-300">{calculations.formatCurrency(calculations.biAnnualTax)}</span>
                </div>
              </div>

              {/* DETAILED VALUATION LEDGER */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-2 shadow-sm">
                
                <div className="flex text-[9px] font-black uppercase tracking-widest text-slate-400 px-4 pb-2 pt-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex-1">Valuation Breakdown</div>
                  <div className="w-1/3 text-right">Amount</div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pt-1 space-y-1">
                  
                  {/* Market Value */}
                  <div className="flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-lg">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-500 block">Market Value</span>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">{calculations.formatCurrency(calculations.marketVal)}</span>
                    </div>
                  </div>

                  {/* Assessed Value */}
                  <div className="flex items-center px-4 py-3 bg-slate-50 dark:bg-slate-800/50 transition-colors rounded-lg">
                    <div className="flex-1">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Assessed Value</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">At {assessmentRatio}% Ratio</span>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-black tabular-nums text-slate-800 dark:text-slate-100">{calculations.formatCurrency(calculations.assessedValue)}</span>
                    </div>
                  </div>

                  {/* Exemptions */}
                  <div className="flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-lg">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500 block">Less Exemptions</span>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-500">− {calculations.formatCurrency(parseFloat(exemptions) || 0)}</span>
                    </div>
                  </div>

                  {/* Taxable Value */}
                  <div className="flex items-center px-4 py-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <div className="flex-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">Net Taxable Value</span>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-black tabular-nums text-indigo-600 dark:text-indigo-400">{calculations.formatCurrency(calculations.taxableValue)}</span>
                    </div>
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