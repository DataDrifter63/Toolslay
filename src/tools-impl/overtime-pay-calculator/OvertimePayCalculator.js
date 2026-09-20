"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  DollarSign, Clock, Calculator, PieChart, 
  Wallet, Briefcase, Zap, ShieldAlert,
  Percent, ArrowRight, CheckCircle2, TrendingUp
} from "lucide-react";

export default function OvertimePayCalculator() {
  const [isMounted, setIsMounted] = useState(false);

  // Financial Inputs
  const [hourlyRate, setHourlyRate] = useState("25");
  
  // Hours Breakdown
  const [regularHours, setRegularHours] = useState("40");
  const [overtimeHours, setOvertimeHours] = useState("10"); // 1.5x
  const [doubleTimeHours, setDoubleTimeHours] = useState("0"); // 2.0x
  
  // Tax Estimator
  const [taxRate, setTaxRate] = useState("22");

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

  // --- CORE PAYROLL ENGINE ---
  const calculations = useMemo(() => {
    const rate = parseFloat(hourlyRate) || 0;
    const regHrs = parseFloat(regularHours) || 0;
    const otHrs = parseFloat(overtimeHours) || 0;
    const dtHrs = parseFloat(doubleTimeHours) || 0;
    const tax = parseFloat(taxRate) || 0;

    // Rates
    const otRate = rate * 1.5;
    const dtRate = rate * 2.0;

    // Gross Totals
    const regPay = rate * regHrs;
    const otPay = otRate * otHrs;
    const dtPay = dtRate * dtHrs;
    
    const grossPay = regPay + otPay + dtPay;
    const totalHours = regHrs + otHrs + dtHrs;

    // Taxes & Net
    const estimatedTax = grossPay * (tax / 100);
    const netPay = grossPay - estimatedTax;

    // Visual Bar Ratios (Based on Gross)
    const pctReg = grossPay > 0 ? (regPay / grossPay) * 100 : 0;
    const pctOt = grossPay > 0 ? (otPay / grossPay) * 100 : 0;
    const pctDt = grossPay > 0 ? (dtPay / grossPay) * 100 : 0;

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return {
      rate, otRate, dtRate,
      regHrs, otHrs, dtHrs, totalHours,
      regPay, otPay, dtPay, grossPay,
      estimatedTax, netPay,
      pctReg, pctOt, pctDt,
      formatCurrency
    };
  }, [hourlyRate, regularHours, overtimeHours, doubleTimeHours, taxRate]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-100 via-teal-50 to-transparent dark:from-emerald-900/30 dark:via-teal-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3.5 rounded-2xl shadow-md">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Pro Overtime Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Multi-Tier OT & Tax Estimator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: ADVANCED INPUT UI ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Base Rate Input */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-500" /> 1. Base Hourly Rate
              </label>
              
              <div className="relative flex items-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all overflow-hidden group">
                <div className="bg-slate-100 dark:bg-slate-800 px-5 py-5 flex items-center justify-center border-r border-slate-200 dark:border-slate-700 group-focus-within:bg-emerald-50 dark:group-focus-within:bg-emerald-900/20 transition-colors">
                  <DollarSign className="w-6 h-6 text-slate-400 group-focus-within:text-emerald-500" />
                </div>
                <input
                  type="text" value={hourlyRate} onChange={(e) => handleNumInput(setHourlyRate, e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent px-5 py-5 text-3xl font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                />
                <span className="pr-6 text-sm font-bold text-slate-400 uppercase tracking-widest">/ hr</span>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Hours Breakdown */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" /> 2. Time Sheet Log
                </label>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {calculations.totalHours} Total Hrs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Regular Hours */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Regular (1.0x)</span>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all overflow-hidden group">
                    <input
                      type="text" value={regularHours} onChange={(e) => handleNumInput(setRegularHours, e.target.value)}
                      placeholder="40" className="w-full bg-transparent px-4 py-3 text-xl font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                    />
                    <span className="pr-4 text-xs font-bold text-slate-400 group-focus-within:text-blue-500 transition-colors">hrs</span>
                  </div>
                </div>

                {/* Overtime (1.5x) */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center justify-between">
                    Overtime <span className="bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded text-[9px] border border-emerald-200 dark:border-emerald-800">1.5x</span>
                  </span>
                  <div className="relative flex items-center bg-emerald-50/30 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-xl focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all overflow-hidden group">
                    <input
                      type="text" value={overtimeHours} onChange={(e) => handleNumInput(setOvertimeHours, e.target.value)}
                      placeholder="0" className="w-full bg-transparent px-4 py-3 text-xl font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                    />
                    <span className="pr-4 text-xs font-bold text-emerald-400 group-focus-within:text-emerald-500 transition-colors">hrs</span>
                  </div>
                </div>

                {/* Double Time (2.0x) */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center justify-between">
                    Double <span className="bg-rose-100 dark:bg-rose-900/30 px-1.5 py-0.5 rounded text-[9px] border border-rose-200 dark:border-rose-800">2.0x</span>
                  </span>
                  <div className="relative flex items-center bg-rose-50/30 dark:bg-rose-900/10 border-2 border-rose-200 dark:border-rose-800/50 rounded-xl focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all overflow-hidden group">
                    <input
                      type="text" value={doubleTimeHours} onChange={(e) => handleNumInput(setDoubleTimeHours, e.target.value)}
                      placeholder="0" className="w-full bg-transparent px-4 py-3 text-xl font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                    />
                    <span className="pr-4 text-xs font-bold text-rose-400 group-focus-within:text-rose-500 transition-colors">hrs</span>
                  </div>
                </div>

              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Tax / Net Pay Estimator */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-amber-500" /> 3. Estimated Withholding Tax
              </label>
              
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50">
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-snug">
                    Overtime often pushes specific paychecks into a higher withholding bracket. Estimate your tax slice here to see true take-home pay.
                  </p>
                </div>
                <div className="relative flex items-center w-28 shrink-0 bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-700/50 rounded-xl focus-within:border-amber-500 transition-all overflow-hidden">
                  <input
                    type="text" value={taxRate} onChange={(e) => handleNumInput(setTaxRate, e.target.value, 100)}
                    className="w-full bg-transparent px-3 py-2.5 text-base font-black text-center text-amber-700 dark:text-amber-500 outline-none tabular-nums"
                  />
                  <span className="pr-3 text-xs font-bold text-amber-500">%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE PAYROLL DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[650px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Wallet className="w-4 h-4 text-teal-500" /> Official Payslip
                </span>
              </div>

              {/* HERO METRIC */}
              <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-8 px-4 rounded-3xl shadow-sm mb-6 relative overflow-hidden shrink-0">
                <div className="absolute -left-6 -bottom-6 opacity-5 pointer-events-none">
                  <Calculator className="w-40 h-40 text-teal-500" />
                </div>
                
                <span className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Estimated Take-Home (Net)
                </span>
                <span className="text-6xl font-black text-teal-600 dark:text-teal-400 tracking-tighter tabular-nums leading-none block">
                  {calculations.formatCurrency(calculations.netPay)}
                </span>
                
                {/* Visual Ratio Bar */}
                {calculations.grossPay > 0 && (
                  <div className="w-full mx-auto mt-8">
                    <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {calculations.pctReg > 0 && <div style={{ width: `${calculations.pctReg}%` }} className="bg-blue-400"></div>}
                      {calculations.pctOt > 0 && <div style={{ width: `${calculations.pctOt}%` }} className="bg-emerald-500"></div>}
                      {calculations.pctDt > 0 && <div style={{ width: `${calculations.pctDt}%` }} className="bg-rose-500"></div>}
                    </div>
                    <div className="flex justify-between mt-2 px-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <span>Regular Pay</span>
                      <span className="text-emerald-500">Overtime Premiums</span>
                    </div>
                  </div>
                )}
              </div>

              {/* DETAILED RECEIPT LIST */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-2 shadow-sm">
                
                <div className="flex text-[9px] font-black uppercase tracking-widest text-slate-400 px-4 pb-2 pt-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex-1">Category & Rate</div>
                  <div className="w-1/3 text-right">Hours</div>
                  <div className="w-1/3 text-right text-slate-600 dark:text-slate-300">Total</div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pt-1">
                  
                  {/* Regular Row */}
                  <div className="flex items-center px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex-1">
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">Base Pay</span>
                      <span className="text-[10px] font-bold text-slate-400">{calculations.formatCurrency(calculations.rate)} / hr</span>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-bold tabular-nums text-slate-600 dark:text-slate-300">{calculations.regHrs}</span>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-black tabular-nums text-slate-800 dark:text-slate-100">{calculations.formatCurrency(calculations.regPay)}</span>
                    </div>
                  </div>

                  {/* Overtime Row */}
                  <div className="flex items-center px-4 py-3 border-b border-emerald-50 dark:border-emerald-900/20 bg-emerald-50/30 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">
                    <div className="flex-1">
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block flex items-center gap-1.5"><Zap className="w-3.5 h-3.5"/> Overtime (1.5x)</span>
                      <span className="text-[10px] font-bold text-emerald-500/70">{calculations.formatCurrency(calculations.otRate)} / hr</span>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{calculations.otHrs}</span>
                    </div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-black tabular-nums text-emerald-600 dark:text-emerald-400">{calculations.formatCurrency(calculations.otPay)}</span>
                    </div>
                  </div>

                  {/* Double Time Row */}
                  {calculations.dtHrs > 0 && (
                    <div className="flex items-center px-4 py-3 border-b border-rose-50 dark:border-rose-900/20 bg-rose-50/30 dark:bg-rose-900/10 transition-colors">
                      <div className="flex-1">
                        <span className="text-sm font-black text-rose-600 dark:text-rose-400 block flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5"/> Double Time</span>
                        <span className="text-[10px] font-bold text-rose-500/70">{calculations.formatCurrency(calculations.dtRate)} / hr</span>
                      </div>
                      <div className="w-1/3 text-right">
                        <span className="text-sm font-bold tabular-nums text-rose-600 dark:text-rose-400">{calculations.dtHrs}</span>
                      </div>
                      <div className="w-1/3 text-right">
                        <span className="text-sm font-black tabular-nums text-rose-600 dark:text-rose-400">{calculations.formatCurrency(calculations.dtPay)}</span>
                      </div>
                    </div>
                  )}

                  {/* Tax Row */}
                  {calculations.estimatedTax > 0 && (
                    <div className="flex items-center px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 transition-colors">
                      <div className="flex-1">
                        <span className="text-sm font-black text-slate-600 dark:text-slate-300 block">Est. Tax Withheld</span>
                        <span className="text-[10px] font-bold text-slate-400">At {taxRate}% bracket</span>
                      </div>
                      <div className="w-1/3 text-right"></div>
                      <div className="w-1/3 text-right">
                        <span className="text-sm font-black tabular-nums text-rose-500">− {calculations.formatCurrency(calculations.estimatedTax)}</span>
                      </div>
                    </div>
                  )}

                  {/* Gross Total */}
                  <div className="flex items-center px-4 py-4 mt-2">
                    <div className="flex-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Total Gross Pay</span>
                    </div>
                    <div className="w-1/3 text-right"></div>
                    <div className="w-1/3 text-right">
                      <span className="text-sm font-black tabular-nums text-slate-800 dark:text-slate-100">{calculations.formatCurrency(calculations.grossPay)}</span>
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