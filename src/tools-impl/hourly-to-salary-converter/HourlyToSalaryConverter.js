"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  DollarSign, Calculator, Briefcase, 
  Calendar, Percent, ArrowRightLeft, 
  Wallet, PieChart, Clock, CalendarDays,
  Coins, ArrowRight, ShieldCheck
} from "lucide-react";

export default function HourlyToSalaryConverter() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Mode: 'hourly' (Hourly to Salary) or 'salary' (Salary to Hourly)
  const [mode, setMode] = useState("hourly");
  
  // Inputs
  const [amount, setAmount] = useState("25"); // Base rate
  
  // Work Configuration
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const [daysPerWeek, setDaysPerWeek] = useState("5");
  const [weeksPerYear, setWeeksPerYear] = useState("52"); // 52 means no unpaid vacation
  
  // Tax / Deductions
  const [taxRate, setTaxRate] = useState("20"); // Percentage

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNumInput = (setter, value, max) => {
    if (value === "") {
      setter("");
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && (!max || num <= max)) {
      // Allow decimals for amount, integers for others (handled gently)
      setter(value);
    }
  };

  // --- CORE PAYROLL ENGINE ---
  const calculations = useMemo(() => {
    const baseAmt = parseFloat(amount) || 0;
    const hPd = parseFloat(hoursPerDay) || 0;
    const dPw = parseFloat(daysPerWeek) || 0;
    const wPy = parseFloat(weeksPerYear) || 0;
    const tax = parseFloat(taxRate) || 0;

    // Avoid division by zero
    const safeHPd = Math.max(0.1, hPd);
    const safeDPw = Math.max(0.1, dPw);
    const safeWPy = Math.max(1, wPy);

    const totalHoursPerYear = safeHPd * safeDPw * safeWPy;
    
    let yearlyGross = 0;
    let hourlyGross = 0;

    if (mode === "hourly") {
      hourlyGross = baseAmt;
      yearlyGross = hourlyGross * totalHoursPerYear;
    } else {
      yearlyGross = baseAmt;
      hourlyGross = yearlyGross / totalHoursPerYear;
    }

    // Gross Breakdowns
    const monthlyGross = yearlyGross / 12;
    const weeklyGross = yearlyGross / safeWPy;
    const biWeeklyGross = weeklyGross * 2;
    const dailyGross = hourlyGross * safeHPd;

    // Tax Multiplier
    const netMultiplier = Math.max(0, 1 - (tax / 100));

    // Formatter
    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

    return {
      totalHoursPerYear,
      breakdown: [
        { label: "Yearly", gross: yearlyGross, net: yearlyGross * netMultiplier },
        { label: "Monthly", gross: monthlyGross, net: monthlyGross * netMultiplier },
        { label: "Bi-Weekly", gross: biWeeklyGross, net: biWeeklyGross * netMultiplier },
        { label: "Weekly", gross: weeklyGross, net: weeklyGross * netMultiplier },
        { label: "Daily", gross: dailyGross, net: dailyGross * netMultiplier },
        { label: "Hourly", gross: hourlyGross, net: hourlyGross * netMultiplier },
      ],
      taxAmountYearly: yearlyGross * (tax / 100),
      formatter: formatCurrency
    };
  }, [mode, amount, hoursPerDay, daysPerWeek, weeksPerYear, taxRate]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-100 via-teal-50 to-transparent dark:from-emerald-900/30 dark:via-teal-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3.5 rounded-2xl shadow-md">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Payroll Conversion Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Gross vs. Net Pay Analytics
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner">
              <button 
                onClick={() => { setMode("hourly"); setAmount("25"); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${mode === "hourly" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <Clock className="w-4 h-4" /> Hourly to Salary
              </button>
              <button 
                onClick={() => { setMode("salary"); setAmount("60000"); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${mode === "salary" ? "bg-white dark:bg-slate-700 text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <Briefcase className="w-4 h-4" /> Salary to Hourly
              </button>
            </div>

            {/* Main Input */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> 
                {mode === "hourly" ? "Hourly Wage Rate" : "Annual Base Salary"}
              </label>
              <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-emerald-500 transition-all overflow-hidden">
                <span className="pl-6 text-2xl font-black text-slate-400">$</span>
                <input
                  type="text" value={amount} onChange={(e) => handleNumInput(setAmount, e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent px-3 py-5 text-3xl font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                />
                <span className="pr-6 text-sm font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 h-full flex items-center px-4 border-l border-slate-200 dark:border-slate-700">
                  {mode === "hourly" ? "/ hr" : "/ yr"}
                </span>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Work Configuration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-teal-500" /> Schedule Configuration
                </label>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {calculations.totalHoursPerYear.toLocaleString()} Hrs/Year
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Hours / Day</label>
                  <input type="text" value={hoursPerDay} onChange={(e) => handleNumInput(setHoursPerDay, e.target.value, 24)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-lg font-black outline-none focus:border-teal-500 text-center tabular-nums" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Days / Week</label>
                  <input type="text" value={daysPerWeek} onChange={(e) => handleNumInput(setDaysPerWeek, e.target.value, 7)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-lg font-black outline-none focus:border-teal-500 text-center tabular-nums" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Weeks / Year</label>
                  <input type="text" value={weeksPerYear} onChange={(e) => handleNumInput(setWeeksPerYear, e.target.value, 52)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-lg font-black outline-none focus:border-teal-500 text-center tabular-nums" />
                  {/* FIX APPLIED HERE: Replaced < with &lt; */}
                  <p className="text-[8px] text-center text-slate-400 mt-1">Set &lt; 52 for unpaid time off.</p>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Tax / Net Pay Estimator */}
            <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <Percent className="w-3.5 h-3.5" /> Effective Tax Rate
                  </h4>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">Estimate deductions to calculate Net (Take-Home) Pay.</p>
                </div>
                <div className="w-24 shrink-0">
                  <div className="relative flex items-center">
                    <input type="text" value={taxRate} onChange={(e) => handleNumInput(setTaxRate, e.target.value, 100)} className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/50 rounded-xl px-3 py-2 text-base font-black text-rose-700 dark:text-rose-400 text-center outline-none focus:border-rose-500 tabular-nums" />
                    <span className="absolute right-3 text-xs font-bold text-rose-400 pointer-events-none">%</span>
                  </div>
                </div>
              </div>
              
              {/* Tax Impact Visual */}
              {parseFloat(taxRate) > 0 && (
                <div className="flex items-center gap-3 text-xs font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-100 dark:border-rose-900 shadow-sm">
                  <PieChart className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Estimated Yearly Tax Withheld:</span>
                  <span className="tabular-nums font-black">{calculations.formatter(calculations.taxAmountYearly)}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE PAYROLL DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[650px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Wallet className="w-4 h-4 text-emerald-500" /> Salary Breakdown
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                  Gross vs Net
                </span>
              </div>

              {/* HERO METRIC (Depends on Mode) */}
              <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-8 px-4 rounded-2xl shadow-sm mb-6 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-5">
                  <ShieldCheck className="w-32 h-32 text-emerald-500" />
                </div>
                
                <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                  {mode === "hourly" ? "Estimated Yearly Gross Salary" : "Equivalent Hourly Rate (Gross)"}
                </span>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-5xl sm:text-6xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter tabular-nums leading-none">
                    {mode === "hourly" 
                      ? calculations.formatter(calculations.breakdown[0].gross) 
                      : calculations.formatter(calculations.breakdown[5].gross)}
                  </span>
                </div>
                {parseFloat(taxRate) > 0 && (
                  <span className="block mt-3 text-[11px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 inline-block px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                    Take-Home Net: {mode === "hourly" 
                      ? calculations.formatter(calculations.breakdown[0].net) 
                      : calculations.formatter(calculations.breakdown[5].net)}
                  </span>
                )}
              </div>

              {/* DETAILED RECEIPT LIST */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-2 shadow-sm">
                
                {/* Header Row */}
                <div className="flex text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 pb-2 pt-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex-1">Pay Period</div>
                  <div className="w-1/3 text-right">Gross Pay</div>
                  {parseFloat(taxRate) > 0 && <div className="w-1/3 text-right text-emerald-500">Net Pay</div>}
                </div>

                {/* Rows */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {calculations.breakdown.map((item, idx) => (
                    <div 
                      key={item.label} 
                      className={`flex items-center px-3 py-4 transition-colors ${idx !== calculations.breakdown.length -1 ? 'border-b border-slate-50 dark:border-slate-800/50' : ''} hover:bg-slate-50 dark:hover:bg-slate-800/50`}
                    >
                      <div className="flex-1">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100">{item.label}</span>
                      </div>
                      <div className="w-1/3 text-right">
                        <span className="text-sm font-bold tabular-nums text-slate-600 dark:text-slate-300">
                          {calculations.formatter(item.gross)}
                        </span>
                      </div>
                      {parseFloat(taxRate) > 0 && (
                        <div className="w-1/3 text-right">
                          <span className="text-sm font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                            {calculations.formatter(item.net)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}