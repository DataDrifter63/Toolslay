"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  DollarSign, Clock, Calculator, PieChart, 
  Wallet, Briefcase, Zap, ShieldAlert,
  Percent, ArrowRight, CheckCircle2, TrendingUp
} from "lucide-react";

export default function OvertimePayCalculator() {
  const [isMounted, setIsMounted] = useState(false);

  const [hourlyRate, setHourlyRate] = useState("25");
  const [regularHours, setRegularHours] = useState("40");
  const [overtimeHours, setOvertimeHours] = useState("10");
  const [doubleTimeHours, setDoubleTimeHours] = useState("0");
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

  const calculations = useMemo(() => {
    const rate = parseFloat(hourlyRate) || 0;
    const regHrs = parseFloat(regularHours) || 0;
    const otHrs = parseFloat(overtimeHours) || 0;
    const dtHrs = parseFloat(doubleTimeHours) || 0;
    const tax = parseFloat(taxRate) || 0;

    const otRate = rate * 1.5;
    const dtRate = rate * 2.0;

    const regPay = rate * regHrs;
    const otPay = otRate * otHrs;
    const dtPay = dtRate * dtHrs;
    
    const grossPay = regPay + otPay + dtPay;
    const totalHours = regHrs + otHrs + dtHrs;

    const estimatedTax = grossPay * (tax / 100);
    const netPay = grossPay - estimatedTax;

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

  const baseInputStyle = "w-full min-w-0 bg-paper border border-line rounded-xl px-3 py-2.5 text-base font-bold text-ink outline-none focus:border-brand tabular-nums";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              Pro Overtime Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              Multi-Tier OT & Tax Estimator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start min-w-0">
        
        {/* CONFIGURATION */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* Base Rate Input */}
            <div className="space-y-2.5 min-w-0">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                <Briefcase className="w-3.5 h-3.5 text-brand shrink-0" /> 1. Base Hourly Rate
              </label>
              
              <div className="relative flex items-center bg-paper border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden min-w-0">
                <span className="pl-4 sm:pl-5 text-xl sm:text-2xl font-black text-muted">$</span>
                <input
                  type="text" value={hourlyRate} onChange={(e) => handleNumInput(setHourlyRate, e.target.value)}
                  placeholder="0.00"
                  className="w-full min-w-0 bg-transparent px-2.5 py-3.5 sm:py-4 text-2xl sm:text-3xl font-black text-ink outline-none tabular-nums"
                />
                <span className="pr-4 sm:pr-5 text-[10px] font-bold text-muted uppercase tracking-widest bg-surface h-full flex items-center border-l border-line shrink-0">/ hr</span>
              </div>
            </div>

            <hr className="border-line" />

            {/* Hours Breakdown */}
            <div className="space-y-4 min-w-0">
              <div className="flex items-center justify-between min-w-0">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                  <Clock className="w-3.5 h-3.5 text-brand shrink-0" /> 2. Time Sheet Log
                </label>
                <span className="text-[9px] font-bold text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0">
                  {calculations.totalHours} Total Hrs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                
                {/* Regular Hours */}
                <div className="space-y-1.5 min-w-0">
                  <span className="block text-[8px] font-bold text-muted uppercase tracking-wider truncate">Regular (1.0x)</span>
                  <div className="relative flex items-center min-w-0">
                    <input
                      type="text" value={regularHours} onChange={(e) => handleNumInput(setRegularHours, e.target.value)}
                      placeholder="40" className={`${baseInputStyle} pr-10`}
                    />
                    <span className="absolute right-3 text-[10px] font-bold text-muted pointer-events-none">hrs</span>
                  </div>
                </div>

                {/* Overtime (1.5x) */}
                <div className="space-y-1.5 min-w-0">
                  <span className="block text-[8px] font-bold text-brand uppercase tracking-wider flex items-center justify-between min-w-0 truncate">
                    <span className="truncate">Overtime</span>
                    <span className="bg-brand/15 text-brand px-1 py-0.2 rounded text-[7px] shrink-0 font-black">1.5x</span>
                  </span>
                  <div className="relative flex items-center min-w-0">
                    <input
                      type="text" value={overtimeHours} onChange={(e) => handleNumInput(setOvertimeHours, e.target.value)}
                      placeholder="0" className={`${baseInputStyle} pr-10`}
                    />
                    <span className="absolute right-3 text-[10px] font-bold text-muted pointer-events-none">hrs</span>
                  </div>
                </div>

                {/* Double Time (2.0x) */}
                <div className="space-y-1.5 min-w-0">
                  <span className="block text-[8px] font-bold text-[#e11d48] uppercase tracking-wider flex items-center justify-between min-w-0 truncate">
                    <span className="truncate">Double</span>
                    <span className="bg-[#fb7185]/20 text-[#e11d48] px-1 py-0.2 rounded text-[7px] shrink-0 font-black">2.0x</span>
                  </span>
                  <div className="relative flex items-center min-w-0">
                    <input
                      type="text" value={doubleTimeHours} onChange={(e) => handleNumInput(setDoubleTimeHours, e.target.value)}
                      placeholder="0" className={`${baseInputStyle} pr-10`}
                    />
                    <span className="absolute right-3 text-[10px] font-bold text-muted pointer-events-none">hrs</span>
                  </div>
                </div>

              </div>
            </div>

            <hr className="border-line" />

            {/* Tax / Net Pay Estimator */}
            <div className="space-y-2.5 min-w-0">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                <Percent className="w-3.5 h-3.5 text-[#d97706] shrink-0" /> 3. Estimated Withholding Tax
              </label>
              
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-paper border border-line min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-muted leading-tight truncate">
                    Tax bracket override for overtime withholding.
                  </p>
                </div>
                <div className="relative flex items-center w-24 shrink-0">
                  <input
                    type="text" value={taxRate} onChange={(e) => handleNumInput(setTaxRate, e.target.value, 100)}
                    className="w-full bg-surface border border-line rounded-lg px-2.5 py-2 text-sm font-black text-center text-ink outline-none tabular-nums"
                  />
                  <span className="absolute right-2.5 text-xs font-bold text-muted pointer-events-none">%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* PAYROLL DASHBOARD */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[500px] min-w-0">
            
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <Wallet className="w-4 h-4 text-teal shrink-0" /> Official Payslip
              </span>
            </div>

            {/* HERO METRIC */}
            <div className="text-center bg-paper border border-line py-6 px-4 rounded-xl shadow-sm mb-5 relative overflow-hidden shrink-0 min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2 truncate">
                Estimated Take-Home (Net)
              </span>
              <span className="text-4xl sm:text-5xl font-black text-teal tracking-tight tabular-nums leading-none block truncate">
                {calculations.formatCurrency(calculations.netPay)}
              </span>
              
              {/* Visual Ratio Bar */}
              {calculations.grossPay > 0 && (
                <div className="w-full px-2 mt-5">
                  <div className="flex h-2.5 rounded-full overflow-hidden bg-line">
                    {calculations.pctReg > 0 && <div style={{ width: `${calculations.pctReg}%` }} className="bg-muted/50"></div>}
                    {calculations.pctOt > 0 && <div style={{ width: `${calculations.pctOt}%` }} className="bg-brand"></div>}
                    {calculations.pctDt > 0 && <div style={{ width: `${calculations.pctDt}%` }} className="bg-[#e11d48]"></div>}
                  </div>
                  <div className="flex justify-between mt-1.5 px-0.5 text-[9px] font-black uppercase tracking-wider text-muted min-w-0">
                    <span className="truncate">Regular Pay</span>
                    <span className="text-brand truncate">OT Premiums</span>
                  </div>
                </div>
              )}
            </div>

            {/* DETAILED RECEIPT LIST */}
            <div className="flex-1 flex flex-col min-h-0 bg-paper rounded-xl border border-line p-2 shadow-sm min-w-0">
              
              <div className="flex text-[9px] font-black uppercase tracking-widest text-muted px-3 pb-2 pt-2 border-b border-line shrink-0 min-w-0">
                <div className="flex-1 truncate">Category & Rate</div>
                <div className="w-1/4 text-right truncate">Hrs</div>
                <div className="w-1/3 text-right text-ink truncate">Total</div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pt-1 min-w-0 text-xs">
                
                {/* Regular Row */}
                <div className="flex items-center px-3 py-2.5 border-b border-line/50 min-w-0">
                  <div className="flex-1 min-w-0 truncate pr-2">
                    <span className="font-black text-ink block truncate">Base Pay</span>
                    <span className="text-[9px] font-bold text-muted truncate block">{calculations.formatCurrency(calculations.rate)} / hr</span>
                  </div>
                  <div className="w-1/4 text-right tabular-nums text-muted shrink-0">{calculations.regHrs}</div>
                  <div className="w-1/3 text-right font-black tabular-nums text-ink shrink-0">{calculations.formatCurrency(calculations.regPay)}</div>
                </div>

                {/* Overtime Row */}
                <div className="flex items-center px-3 py-2.5 border-b border-line/50 bg-brand/5 min-w-0">
                  <div className="flex-1 min-w-0 truncate pr-2">
                    <span className="font-black text-brand block flex items-center gap-1 truncate"><Zap className="w-3 h-3 shrink-0"/> Overtime (1.5x)</span>
                    <span className="text-[9px] font-bold text-muted truncate block">{calculations.formatCurrency(calculations.otRate)} / hr</span>
                  </div>
                  <div className="w-1/4 text-right tabular-nums text-brand shrink-0">{calculations.otHrs}</div>
                  <div className="w-1/3 text-right font-black tabular-nums text-brand shrink-0">{calculations.formatCurrency(calculations.otPay)}</div>
                </div>

                {/* Double Time Row */}
                {calculations.dtHrs > 0 && (
                  <div className="flex items-center px-3 py-2.5 border-b border-line/50 bg-[#fb7185]/10 min-w-0">
                    <div className="flex-1 min-w-0 truncate pr-2">
                      <span className="font-black text-[#e11d48] block flex items-center gap-1 truncate"><ShieldAlert className="w-3 h-3 shrink-0"/> Double Time</span>
                      <span className="text-[9px] font-bold text-muted truncate block">{calculations.formatCurrency(calculations.dtRate)} / hr</span>
                    </div>
                    <div className="w-1/4 text-right tabular-nums text-[#e11d48] shrink-0">{calculations.dtHrs}</div>
                    <div className="w-1/3 text-right font-black tabular-nums text-[#e11d48] shrink-0">{calculations.formatCurrency(calculations.dtPay)}</div>
                  </div>
                )}

                {/* Tax Row */}
                {calculations.estimatedTax > 0 && (
                  <div className="flex items-center px-3 py-2.5 border-b border-line/50 min-w-0">
                    <div className="flex-1 min-w-0 truncate pr-2">
                      <span className="font-black text-muted block truncate">Est. Tax Withheld</span>
                      <span className="text-[9px] font-bold text-muted truncate block">At {taxRate}% bracket</span>
                    </div>
                    <div className="w-1/4 text-right shrink-0"></div>
                    <div className="w-1/3 text-right font-black tabular-nums text-[#e11d48] shrink-0">− {calculations.formatCurrency(calculations.estimatedTax)}</div>
                  </div>
                )}

                {/* Gross Total */}
                <div className="flex items-center px-3 py-3 mt-1 min-w-0">
                  <div className="flex-1 min-w-0 truncate">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted block truncate">Total Gross Pay</span>
                  </div>
                  <div className="w-1/4 text-right shrink-0"></div>
                  <div className="w-1/3 text-right font-black tabular-nums text-ink text-sm shrink-0">{calculations.formatCurrency(calculations.grossPay)}</div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}