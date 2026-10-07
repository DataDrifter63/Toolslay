"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase, DollarSign, Clock, CalendarDays, 
  Percent, Coffee, Receipt, ShieldCheck, 
  Target, AlertCircle, PieChart, Activity
} from "lucide-react";

export default function FreelanceHourlyRate() {
  const [isMounted, setIsMounted] = useState(false);
  
  const [targetIncome, setTargetIncome] = useState("75000");
  const [businessExpenses, setBusinessExpenses] = useState("5000");
  const [taxRate, setTaxRate] = useState("25");
  
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [vacationDays, setVacationDays] = useState("15");
  const [sickDays, setSickDays] = useState("5");
  
  const [billablePercent, setBillablePercent] = useState("60");

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

  const calculations = useMemo(() => {
    const target = parseFloat(targetIncome) || 0;
    const expenses = parseFloat(businessExpenses) || 0;
    const tax = parseFloat(taxRate) || 0;
    
    const weeklyHours = parseFloat(hoursPerWeek) || 0;
    const vDays = parseFloat(vacationDays) || 0;
    const sDays = parseFloat(sickDays) || 0;
    const bPercent = parseFloat(billablePercent) || 0;

    const taxMultiplier = Math.max(0.01, 1 - (tax / 100));
    const requiredProfit = target / taxMultiplier;
    const estimatedTax = requiredProfit - target;
    const grossRevenue = requiredProfit + expenses;

    const baseWorkingDays = 261; 
    const actualWorkingDays = Math.max(0, baseWorkingDays - vDays - sDays);
    const weeksWorked = actualWorkingDays / 5;
    const totalWorkingHours = weeksWorked * weeklyHours;
    
    const billableHours = totalWorkingHours * (bPercent / 100);
    const unbillableHours = totalWorkingHours - billableHours;

    const safeBillableHours = Math.max(1, billableHours);
    const idealHourlyRate = grossRevenue / safeBillableHours;
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

  const baseInputStyle = "w-full min-w-0 bg-paper border border-line rounded-xl px-3.5 py-3 text-base font-bold text-ink outline-none focus:border-brand tabular-nums";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              Freelance Rate Oracle
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              True Cost & Billable Hours Calculator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start min-w-0">
        
        {/* CONFIGURATION ENGINE */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* Financial Goals */}
            <div className="space-y-4 min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <Target className="w-3.5 h-3.5 text-brand shrink-0" /> 1. Financial Targets
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                <div className="sm:col-span-2 min-w-0">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-1.5 truncate">
                    <DollarSign className="w-3.5 h-3.5 text-teal shrink-0" /> Target Take-Home Income
                  </label>
                  <p className="text-[10px] text-muted mb-2 truncate">Net amount after all taxes and expenses.</p>
                  <div className="relative flex items-center bg-paper border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden min-w-0">
                    <span className="pl-4 sm:pl-5 text-xl font-black text-muted">$</span>
                    <input
                      type="text" value={targetIncome} onChange={(e) => handleNumInput(setTargetIncome, e.target.value)}
                      placeholder="0.00"
                      className="w-full min-w-0 bg-transparent px-2.5 py-3.5 text-2xl font-black text-ink outline-none tabular-nums"
                    />
                    <span className="pr-4 sm:pr-5 text-[10px] font-bold text-muted uppercase tracking-widest bg-surface h-full flex items-center border-l border-line shrink-0">/ yr</span>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-1.5 truncate">
                    <Receipt className="w-3.5 h-3.5 text-[#e11d48] shrink-0" /> Annual Biz Expenses
                  </label>
                  <div className="relative flex items-center min-w-0">
                    <span className="absolute left-3.5 text-sm font-black text-muted pointer-events-none">$</span>
                    <input
                      type="text" value={businessExpenses} onChange={(e) => handleNumInput(setBusinessExpenses, e.target.value)}
                      className={`${baseInputStyle} pl-8`}
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-1.5 truncate">
                    <Percent className="w-3.5 h-3.5 text-[#e11d48] shrink-0" /> Est. Tax Rate
                  </label>
                  <div className="relative flex items-center min-w-0">
                    <input
                      type="text" value={taxRate} onChange={(e) => handleNumInput(setTaxRate, e.target.value, 100)}
                      className={`${baseInputStyle} pr-8 text-right`}
                    />
                    <span className="absolute right-3.5 text-sm font-black text-muted pointer-events-none">%</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-line" />

            {/* Schedule & Availability */}
            <div className="space-y-4 min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <CalendarDays className="w-3.5 h-3.5 text-brand shrink-0" /> 2. Work Schedule & Time Off
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                <div className="bg-paper p-3 rounded-xl border border-line min-w-0">
                  <label className="block text-[8px] font-bold text-muted uppercase tracking-widest mb-1 truncate text-center">Hours / Week</label>
                  <input type="text" value={hoursPerWeek} onChange={(e) => handleNumInput(setHoursPerWeek, e.target.value, 168)} className="w-full bg-surface border border-line rounded-lg py-2 text-base font-black outline-none focus:border-brand text-center tabular-nums text-ink" />
                </div>
                <div className="bg-paper p-3 rounded-xl border border-line min-w-0">
                  <label className="block text-[8px] font-bold text-muted uppercase tracking-widest mb-1 truncate text-center">Vacation Days</label>
                  <input type="text" value={vacationDays} onChange={(e) => handleNumInput(setVacationDays, e.target.value, 365)} className="w-full bg-surface border border-line rounded-lg py-2 text-base font-black outline-none focus:border-brand text-center tabular-nums text-ink" />
                </div>
                <div className="bg-paper p-3 rounded-xl border border-line min-w-0">
                  <label className="block text-[8px] font-bold text-muted uppercase tracking-widest mb-1 truncate text-center">Sick Days / Yr</label>
                  <input type="text" value={sickDays} onChange={(e) => handleNumInput(setSickDays, e.target.value, 365)} className="w-full bg-surface border border-line rounded-lg py-2 text-base font-black outline-none focus:border-brand text-center tabular-nums text-ink" />
                </div>
              </div>
            </div>

            <hr className="border-line" />

            {/* Billable Time Ratio */}
            <div className="p-4 rounded-xl bg-paper border border-line min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-brand truncate">
                    <Clock className="w-3.5 h-3.5 shrink-0" /> Billable Time Ratio
                  </h4>
                  <p className="text-[10px] font-medium text-muted mt-0.5 truncate">
                    % time on direct client projects vs admin.
                  </p>
                </div>
                <div className="relative flex items-center w-full sm:w-24 shrink-0">
                  <input
                    type="text" value={billablePercent} onChange={(e) => handleNumInput(setBillablePercent, e.target.value, 100)}
                    className="w-full bg-surface border border-line rounded-xl px-3 py-2 text-base font-black text-brand text-center outline-none focus:border-brand tabular-nums"
                  />
                  <span className="absolute right-3 text-xs font-bold text-muted pointer-events-none">%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD / RECEIPT */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[500px] min-w-0">
            
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <Activity className="w-4 h-4 text-brand shrink-0" /> Pricing Strategy
              </span>
            </div>

            {/* HERO METRIC: THE IDEAL RATE */}
            <div className="text-center bg-paper border border-line py-6 px-4 rounded-xl shadow-sm mb-5 relative overflow-hidden shrink-0 min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2 truncate">
                Target Hourly Rate
              </span>
              <div className="flex items-end justify-center gap-1 min-w-0">
                <span className="text-4xl sm:text-5xl font-black text-brand tracking-tight tabular-nums leading-none truncate">
                  {calculations.formatCurrency(calculations.idealHourlyRate)}
                </span>
                <span className="text-sm font-bold text-muted mb-1 shrink-0">/hr</span>
              </div>
              
              <p className="text-[10px] font-bold text-muted mt-3 bg-surface inline-block px-3 py-1 rounded-full border border-line truncate max-w-full">
                Covers taxes, expenses, and target net income.
              </p>
            </div>

            {/* DETAILED BUSINESS RECEIPT */}
            <div className="flex-1 flex flex-col min-h-0 bg-paper rounded-xl border border-line p-3 shadow-sm space-y-4 min-w-0">
              
              {/* Money Breakdown */}
              <div className="min-w-0">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-muted mb-2.5 flex items-center gap-1 truncate">
                  <PieChart className="w-3 h-3 shrink-0" /> Annual Money Breakdown
                </h4>
                <div className="space-y-2 text-xs min-w-0">
                  <div className="flex justify-between items-center min-w-0">
                    <span className="font-bold text-muted truncate">Gross Revenue Needed</span>
                    <span className="font-black text-ink tabular-nums shrink-0">{calculations.formatCurrency(calculations.grossRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#e11d48] min-w-0">
                    <span className="font-bold truncate">Business Expenses</span>
                    <span className="font-black tabular-nums shrink-0">− {calculations.formatCurrency(parseFloat(businessExpenses) || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#e11d48] min-w-0">
                    <span className="font-bold truncate">Estimated Tax Withheld</span>
                    <span className="font-black tabular-nums shrink-0">− {calculations.formatCurrency(calculations.estimatedTax)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-line pt-2 text-teal min-w-0">
                    <span className="font-black uppercase tracking-wider truncate">Net Take-Home</span>
                    <span className="font-black tabular-nums shrink-0">{calculations.formatCurrency(parseFloat(targetIncome) || 0)}</span>
                  </div>
                </div>
              </div>

              <hr className="border-line/60" />

              {/* Time Breakdown */}
              <div className="min-w-0">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-muted mb-2.5 flex items-center gap-1 truncate">
                  <Clock className="w-3 h-3 shrink-0" /> Annual Time Breakdown
                </h4>
                <div className="space-y-2 text-xs min-w-0">
                  <div className="flex justify-between items-center min-w-0">
                    <span className="font-bold text-muted truncate">Total Working Hours</span>
                    <span className="font-black text-ink tabular-nums shrink-0">{Math.round(calculations.totalWorkingHours)} hrs</span>
                  </div>
                  <div className="flex justify-between items-center min-w-0">
                    <span className="font-bold text-muted truncate">Unbillable (Admin)</span>
                    <span className="font-black text-[#e11d48] tabular-nums shrink-0">{Math.round(calculations.unbillableHours)} hrs</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-line pt-2 min-w-0">
                    <span className="font-black text-brand uppercase tracking-wider truncate">True Billable Hours</span>
                    <span className="font-black text-brand tabular-nums shrink-0">{Math.round(calculations.billableHours)} hrs</span>
                  </div>
                </div>
              </div>

              {/* Reality Check Alert */}
              <div className="mt-auto pt-3 flex items-start gap-2 bg-surface p-2.5 rounded-xl border border-line min-w-0 text-xs">
                <AlertCircle className="w-3.5 h-3.5 text-[#d97706] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[9px] font-black uppercase tracking-widest text-[#d97706] truncate">The Employee Trap</span>
                  <p className="text-[10px] font-medium text-muted leading-tight mt-0.5 truncate">
                    Naive rate (Total ÷ Total Hrs): <strong className="text-ink">{calculations.formatCurrency(calculations.survivalRate)}/hr</strong>
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}