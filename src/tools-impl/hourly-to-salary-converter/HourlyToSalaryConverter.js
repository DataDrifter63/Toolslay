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
  const [mode, setMode] = useState("hourly");
  const [amount, setAmount] = useState("25");
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const [daysPerWeek, setDaysPerWeek] = useState("5");
  const [weeksPerYear, setWeeksPerYear] = useState("52");
  const [taxRate, setTaxRate] = useState("20");

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
      setter(value);
    }
  };

  const calculations = useMemo(() => {
    const baseAmt = parseFloat(amount) || 0;
    const hPd = parseFloat(hoursPerDay) || 0;
    const dPw = parseFloat(daysPerWeek) || 0;
    const wPy = parseFloat(weeksPerYear) || 0;
    const tax = parseFloat(taxRate) || 0;

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

    const monthlyGross = yearlyGross / 12;
    const weeklyGross = yearlyGross / safeWPy;
    const biWeeklyGross = weeklyGross * 2;
    const dailyGross = hourlyGross * safeHPd;

    const netMultiplier = Math.max(0, 1 - (tax / 100));

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

  const baseInputStyle = "w-full min-w-0 bg-paper border border-line rounded-xl px-3 py-2.5 text-base font-bold text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all tabular-nums text-center";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              Payroll Conversion Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              Gross vs. Net Pay Analytics
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start min-w-0">
        
        {/* CONFIGURATION ENGINE */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* Mode Toggle */}
            <div className="flex bg-paper rounded-xl p-1 border border-line min-w-0 gap-1">
              <button 
                type="button"
                onClick={() => { setMode("hourly"); setAmount("25"); }}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2.5 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all min-w-0 truncate ${mode === "hourly" ? "bg-surface text-brand shadow-sm border border-line" : "text-muted hover:text-ink"}`}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Hourly to Salary</span>
              </button>
              <button 
                type="button"
                onClick={() => { setMode("salary"); setAmount("60000"); }}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2.5 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all min-w-0 truncate ${mode === "salary" ? "bg-surface text-brand shadow-sm border border-line" : "text-muted hover:text-ink"}`}
              >
                <Briefcase className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Salary to Hourly</span>
              </button>
            </div>

            {/* Main Input */}
            <div className="min-w-0">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-2 truncate">
                <DollarSign className="w-3.5 h-3.5 text-brand shrink-0" /> 
                {mode === "hourly" ? "Hourly Wage Rate" : "Annual Base Salary"}
              </label>
              <div className="relative flex items-center bg-paper border border-line rounded-xl focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition-all overflow-hidden min-w-0">
                <span className="pl-4 sm:pl-5 text-xl sm:text-2xl font-black text-muted">$</span>
                <input
                  type="text" value={amount} onChange={(e) => handleNumInput(setAmount, e.target.value)}
                  placeholder="0.00"
                  className="w-full min-w-0 bg-transparent px-2.5 py-4 sm:py-5 text-2xl sm:text-3xl font-black text-ink outline-none tabular-nums"
                />
                <span className="pr-4 sm:pr-5 text-xs sm:text-sm font-bold text-muted uppercase tracking-widest bg-surface h-full flex items-center px-3 sm:px-4 border-l border-line shrink-0">
                  {mode === "hourly" ? "/ hr" : "/ yr"}
                </span>
              </div>
            </div>

            <hr className="border-line" />

            {/* Work Configuration */}
            <div className="min-w-0">
              <div className="flex items-center justify-between mb-3 min-w-0">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                  <CalendarDays className="w-3.5 h-3.5 text-brand shrink-0" /> Schedule Configuration
                </label>
                <span className="text-[9px] font-bold text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0">
                  {calculations.totalHoursPerYear.toLocaleString()} Hrs/Year
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                <div className="bg-paper p-3 rounded-xl border border-line min-w-0">
                  <label className="block text-[9px] font-bold text-muted uppercase tracking-widest mb-1 truncate text-center">Hours / Day</label>
                  <input type="text" value={hoursPerDay} onChange={(e) => handleNumInput(setHoursPerDay, e.target.value, 24)} className={baseInputStyle} />
                </div>
                <div className="bg-paper p-3 rounded-xl border border-line min-w-0">
                  <label className="block text-[9px] font-bold text-muted uppercase tracking-widest mb-1 truncate text-center">Days / Week</label>
                  <input type="text" value={daysPerWeek} onChange={(e) => handleNumInput(setDaysPerWeek, e.target.value, 7)} className={baseInputStyle} />
                </div>
                <div className="bg-paper p-3 rounded-xl border border-line min-w-0">
                  <label className="block text-[9px] font-bold text-muted uppercase tracking-widest mb-1 truncate text-center">Weeks / Year</label>
                  <input type="text" value={weeksPerYear} onChange={(e) => handleNumInput(setWeeksPerYear, e.target.value, 52)} className={baseInputStyle} />
                  <p className="text-[8px] text-center text-muted mt-1 truncate">Set &lt; 52 for unpaid time off.</p>
                </div>
              </div>
            </div>

            <hr className="border-line" />

            {/* Tax / Net Pay Estimator */}
            <div className="p-4 sm:p-5 rounded-xl bg-paper border border-[#fb7185]/30 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 min-w-0">
                <div className="min-w-0">
                  <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-[#e11d48] truncate">
                    <Percent className="w-3.5 h-3.5 shrink-0" /> Effective Tax Rate
                  </h4>
                  <p className="text-[10px] font-medium text-muted mt-0.5 truncate">Estimate deductions for Net Pay.</p>
                </div>
                <div className="w-full sm:w-24 shrink-0">
                  <div className="relative flex items-center">
                    <input type="text" value={taxRate} onChange={(e) => handleNumInput(setTaxRate, e.target.value, 100)} className="w-full bg-surface border border-[#fb7185]/30 rounded-xl px-3 py-1.5 text-base font-black text-[#e11d48] text-center outline-none focus:border-[#e11d48] tabular-nums" />
                    <span className="absolute right-3 text-xs font-bold text-muted pointer-events-none">%</span>
                  </div>
                </div>
              </div>
              
              {parseFloat(taxRate) > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#e11d48] bg-surface p-2.5 rounded-lg border border-line shadow-sm min-w-0">
                  <PieChart className="w-3.5 h-3.5 shrink-0" />
                  <span className="flex-1 truncate">Estimated Yearly Tax Withheld:</span>
                  <span className="tabular-nums font-black shrink-0">{calculations.formatter(calculations.taxAmountYearly)}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* PAYROLL DASHBOARD */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[500px] min-w-0">
            
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <Wallet className="w-4 h-4 text-brand shrink-0" /> Salary Breakdown
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0">
                Gross vs Net
              </span>
            </div>

            {/* HERO METRIC */}
            <div className="text-center bg-paper border border-line py-6 px-4 rounded-xl shadow-sm mb-5 relative overflow-hidden min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2 truncate">
                {mode === "hourly" ? "Estimated Yearly Gross Salary" : "Equivalent Hourly Rate (Gross)"}
              </span>
              <div className="flex items-center justify-center gap-1 min-w-0">
                <span className="text-4xl sm:text-5xl font-black text-brand tracking-tight tabular-nums leading-none truncate">
                  {mode === "hourly" 
                    ? calculations.formatter(calculations.breakdown[0].gross) 
                    : calculations.formatter(calculations.breakdown.gross)}
                </span>
              </div>
              {parseFloat(taxRate) > 0 && (
                <span className="block mt-2.5 text-[10px] font-bold text-muted bg-surface inline-block px-3 py-1 rounded-full border border-line truncate">
                  Take-Home Net: {mode === "hourly" 
                    ? calculations.formatter(calculations.breakdown[0].net) 
                    : calculations.formatter(calculations.breakdown.net)}
                </span>
              )}
            </div>

            {/* DETAILED RECEIPT LIST */}
            <div className="flex-1 flex flex-col min-h-0 bg-paper rounded-xl border border-line p-2 shadow-sm min-w-0">
              <div className="flex text-[9px] font-black uppercase tracking-widest text-muted px-2.5 pb-2 pt-1 border-b border-line min-w-0">
                <div className="flex-1 truncate">Pay Period</div>
                <div className="w-1/3 text-right truncate">Gross Pay</div>
                {parseFloat(taxRate) > 0 && <div className="w-1/3 text-right text-brand truncate">Net Pay</div>}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar min-w-0">
                {calculations.breakdown.map((item, idx) => (
                  <div 
                    key={item.label} 
                    className={`flex items-center px-2.5 py-3 transition-colors ${idx !== calculations.breakdown.length -1 ? 'border-b border-line/50' : ''} hover:bg-surface/50 min-w-0 text-xs`}
                  >
                    <div className="flex-1 min-w-0 truncate">
                      <span className="font-black text-ink truncate">{item.label}</span>
                    </div>
                    <div className="w-1/3 text-right min-w-0 truncate">
                      <span className="font-bold tabular-nums text-muted truncate">
                        {calculations.formatter(item.gross)}
                      </span>
                    </div>
                    {parseFloat(taxRate) > 0 && (
                      <div className="w-1/3 text-right min-w-0 truncate">
                        <span className="font-black tabular-nums text-brand truncate">
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
  );
}