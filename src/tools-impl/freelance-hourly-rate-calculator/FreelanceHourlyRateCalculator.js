"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase, DollarSign, Clock, CalendarDays, 
  Percent, Coffee, Receipt, ShieldCheck, 
  Target, AlertCircle, PieChart, Activity
} from "lucide-react";

export default function FreelanceHourlyRate() {
  const [isMounted, setIsMounted] = useState(false);
  
  // 1. Financial Goals
  const [targetIncome, setTargetIncome] = useState("75000"); // Take-home money
  const [businessExpenses, setBusinessExpenses] = useState("5000"); // Software, internet, gear
  const [taxRate, setTaxRate] = useState("25"); // Self-employment tax
  
  // 2. Schedule & Time
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [vacationDays, setVacationDays] = useState("15");
  const [sickDays, setSickDays] = useState("5");
  
  // 3. Efficiency (Billable vs Unbillable)
  const [billablePercent, setBillablePercent] = useState("60"); // % of time actually doing client work

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNumInput = (setter, value, max = null) => {
    if (value === "") {
      setter("");
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && (!max || num <= max)) {
      setter(value);
    }
  };

  // --- CORE FREELANCE MATH ENGINE ---
  const calculations = useMemo(() => {
    // Parse inputs safely
    const target = parseFloat(targetIncome) || 0;
    const expenses = parseFloat(businessExpenses) || 0;
    const tax = parseFloat(taxRate) || 0;
    
    const weeklyHours = parseFloat(hoursPerWeek) || 0;
    const vDays = parseFloat(vacationDays) || 0;
    const sDays = parseFloat(sickDays) || 0;
    const bPercent = parseFloat(billablePercent) || 0;

    // --- REVENUE CALCULATION ---
    // If you want $75k AFTER 25% tax, your taxable profit must be: 75k / (1 - 0.25) = 100k
    const taxMultiplier = Math.max(0.01, 1 - (tax / 100)); // prevent division by zero
    const requiredProfit = target / taxMultiplier;
    const estimatedTax = requiredProfit - target;
    const grossRevenue = requiredProfit + expenses;

    // --- TIME CALCULATION ---
    // Total days in year: 365. Weekends: 104. Working days base: 261
    const baseWorkingDays = 261; 
    const actualWorkingDays = Math.max(0, baseWorkingDays - vDays - sDays);
    
    // Convert actual working days to weeks (1 week = 5 working days)
    const weeksWorked = actualWorkingDays / 5;
    
    // Total hours worked in the year
    const totalWorkingHours = weeksWorked * weeklyHours;
    
    // Billable hours (the only hours you actually get paid for)
    const billableHours = totalWorkingHours * (bPercent / 100);
    const unbillableHours = totalWorkingHours - billableHours;

    // --- FINAL RATE ---
    // Prevent division by zero if someone enters 0 billable hours
    const safeBillableHours = Math.max(1, billableHours);
    const idealHourlyRate = grossRevenue / safeBillableHours;
    
    // Minimum Survival Rate (0 expenses, 0 tax consideration, 100% billable assumption - just to show the contrast)
    const survivalRate = target / Math.max(1, totalWorkingHours);

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

    return {
      requiredProfit, estimatedTax, grossRevenue,
      actualWorkingDays, weeksWorked, totalWorkingHours, 
      billableHours, unbillableHours,
      idealHourlyRate, survivalRate,
      formatCurrency
    };
  }, [targetIncome, businessExpenses, taxRate, hoursPerWeek, vacationDays, sickDays, billablePercent]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100 via-blue-50 to-transparent dark:from-indigo-900/30 dark:via-blue-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-3.5 rounded-2xl shadow-md">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Freelance Rate Oracle
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              True Cost & Billable Hours Calculator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Financial Goals */}
            <div className="space-y-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Target className="w-3.5 h-3.5 text-indigo-500" /> 1. Financial Targets
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Target Take-Home Income
                  </label>
                  <p className="text-[10px] text-slate-400 mb-2 leading-tight">The net amount you want in your bank account after all taxes and expenses.</p>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-indigo-500 transition-all overflow-hidden">
                    <span className="pl-6 text-xl font-black text-slate-400">$</span>
                    <input
                      type="text" value={targetIncome} onChange={(e) => handleNumInput(setTargetIncome, e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent px-3 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                    />
                    <span className="pr-6 text-xs font-bold text-slate-400 uppercase tracking-widest">/ yr</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Receipt className="w-3.5 h-3.5 text-rose-500" /> Annual Biz Expenses
                  </label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-indigo-500 transition-all overflow-hidden">
                    <span className="pl-4 text-sm font-black text-slate-400">$</span>
                    <input
                      type="text" value={businessExpenses} onChange={(e) => handleNumInput(setBusinessExpenses, e.target.value)}
                      className="w-full bg-transparent px-2 py-3 text-sm font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Percent className="w-3.5 h-3.5 text-rose-500" /> Est. Tax Rate
                  </label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-indigo-500 transition-all overflow-hidden">
                    <input
                      type="text" value={taxRate} onChange={(e) => handleNumInput(setTaxRate, e.target.value, 100)}
                      className="w-full bg-transparent px-4 py-3 text-sm font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums text-right"
                    />
                    <span className="pr-4 pl-2 text-sm font-black text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Schedule & Availability */}
            <div className="space-y-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-500" /> 2. Work Schedule & Time Off
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Hours / Week</label>
                  <input type="text" value={hoursPerWeek} onChange={(e) => handleNumInput(setHoursPerWeek, e.target.value, 168)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-lg font-black outline-none focus:border-indigo-500 text-center tabular-nums" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Vacation Days</label>
                  <input type="text" value={vacationDays} onChange={(e) => handleNumInput(setVacationDays, e.target.value, 365)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-lg font-black outline-none focus:border-indigo-500 text-center tabular-nums" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sick Days / Yr</label>
                  <input type="text" value={sickDays} onChange={(e) => handleNumInput(setSickDays, e.target.value, 365)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-lg font-black outline-none focus:border-indigo-500 text-center tabular-nums" />
                </div>
              </div>
            </div>

            {/* 3. The Billable Dilemma (Killer Feature) */}
            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
                    <Clock className="w-3.5 h-3.5" /> Billable Time Ratio
                  </h4>
                  <p className="text-[10px] font-medium text-slate-500 leading-relaxed max-w-[280px]">
                    How much of your time is spent actually working on client projects vs unbillable admin (marketing, emails, invoices)?
                  </p>
                </div>
                <div className="relative flex items-center w-full sm:w-28 shrink-0">
                  <input
                    type="text" value={billablePercent} onChange={(e) => handleNumInput(setBillablePercent, e.target.value, 100)}
                    className="w-full bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800/50 rounded-xl px-3 py-2.5 text-lg font-black text-blue-700 dark:text-blue-400 text-center outline-none focus:border-blue-500 tabular-nums"
                  />
                  <span className="absolute right-3 text-sm font-bold text-blue-400 pointer-events-none">%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD / RECEIPT ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[650px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className="w-4 h-4 text-indigo-500" /> Pricing Strategy
                </span>
              </div>

              {/* HERO METRIC: THE IDEAL RATE */}
              <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-8 px-4 rounded-2xl shadow-sm mb-6 relative overflow-hidden shrink-0">
                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-32 h-32 text-indigo-500" />
                </div>
                
                <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                  Target Hourly Rate
                </span>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-6xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter tabular-nums leading-none">
                    {calculations.formatCurrency(calculations.idealHourlyRate)}
                  </span>
                  <span className="text-lg font-bold text-slate-400 mb-1">/hr</span>
                </div>
                
                <p className="text-[10px] font-bold text-slate-500 mt-4 bg-slate-50 dark:bg-slate-800 inline-block px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                  Charge this rate to cover taxes, expenses, and hit your goal.
                </p>
              </div>

              {/* DETAILED BUSINESS RECEIPT */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm space-y-5">
                
                {/* 1. Money Breakdown */}
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1">
                    <PieChart className="w-3 h-3" /> Annual Money Breakdown
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500">Gross Revenue Needed</span>
                      <span className="font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.formatCurrency(calculations.grossRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-rose-500">
                      <span className="font-bold">Business Expenses</span>
                      <span className="font-black tabular-nums">− {calculations.formatCurrency(parseFloat(businessExpenses) || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-rose-500">
                      <span className="font-bold">Estimated Tax Withheld</span>
                      <span className="font-black tabular-nums">− {calculations.formatCurrency(calculations.estimatedTax)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-800 pt-2 text-emerald-600 dark:text-emerald-400">
                      <span className="font-black uppercase tracking-widest">Net Take-Home</span>
                      <span className="font-black tabular-nums">{calculations.formatCurrency(parseFloat(targetIncome) || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Time Breakdown */}
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Annual Time Breakdown
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500">Total Working Hours</span>
                      <span className="font-black text-slate-800 dark:text-slate-100 tabular-nums">{Math.round(calculations.totalWorkingHours)} hrs</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500">Unbillable (Admin/Marketing)</span>
                      <span className="font-black text-rose-500 tabular-nums">{Math.round(calculations.unbillableHours)} hrs</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-800 pt-2">
                      <span className="font-black text-indigo-500 uppercase tracking-widest">True Billable Hours</span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{Math.round(calculations.billableHours)} hrs</span>
                    </div>
                  </div>
                </div>

                {/* Reality Check Alert */}
                <div className="mt-auto pt-4 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">The Employee Trap</span>
                    <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-snug mt-1">
                      If you calculated your rate like an employee (Total Income ÷ Total Hours), your rate would only be <strong>{calculations.formatCurrency(calculations.survivalRate)}/hr</strong>. You would lose money on taxes, expenses, and admin time.
                    </p>
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