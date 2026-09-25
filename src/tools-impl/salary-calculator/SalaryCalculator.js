"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Wallet, DollarSign, Percent, Calculator, TrendingUp, 
  CalendarDays, Clock, PieChart, Target, Check, Copy 
} from "lucide-react";

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
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }).format(val || 0);
};

export default function SalaryCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [copied, setCopied] = useState(false);
  
  // Inputs
  const [salaryAmount, setSalaryAmount] = useState("60000");
  const [salaryType, setSalaryType] = useState("yearly"); // hourly, monthly, yearly
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [taxRate, setTaxRate] = useState("18"); // Effective tax %
  const [monthlyDeductions, setMonthlyDeductions] = useState("200"); // Health, 401k, etc.
  const [annualBonus, setAnnualBonus] = useState("5000");

  const [results, setResults] = useState({
    grossAnnual: 0,
    grossMonthly: 0,
    taxAnnual: 0,
    deductionsAnnual: 0,
    netAnnual: 0,
    netMonthly: 0,
    netBiWeekly: 0,
    netWeekly: 0,
    netDaily: 0,
    netHourly: 0,
    budgetNeeds: 0,
    budgetWants: 0,
    budgetSavings: 0
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateSalary = useCallback(() => {
    const amount = parseFloat(salaryAmount) || 0;
    const hours = parseFloat(hoursPerWeek) || 40;
    const taxPct = parseFloat(taxRate) || 0;
    const monthlyDeduct = parseFloat(monthlyDeductions) || 0;
    const bonus = parseFloat(annualBonus) || 0;

    let baseGrossAnnual = 0;

    if (salaryType === "hourly") {
      baseGrossAnnual = amount * hours * 52;
    } else if (salaryType === "monthly") {
      baseGrossAnnual = amount * 12;
    } else {
      baseGrossAnnual = amount;
    }

    const totalGrossAnnual = baseGrossAnnual + bonus;
    
    if (totalGrossAnnual <= 0) {
      setResults({
        grossAnnual: 0, grossMonthly: 0, taxAnnual: 0, deductionsAnnual: 0,
        netAnnual: 0, netMonthly: 0, netBiWeekly: 0, netWeekly: 0, netDaily: 0, netHourly: 0,
        budgetNeeds: 0, budgetWants: 0, budgetSavings: 0
      });
      return;
    }

    const annualTax = totalGrossAnnual * (taxPct / 100);
    const annualDeduct = monthlyDeduct * 12;
    const netAnnual = totalGrossAnnual - annualTax - annualDeduct;
    
    // Time breakdowns
    const netMonthly = netAnnual / 12;
    const netBiWeekly = netAnnual / 26;
    const netWeekly = netAnnual / 52;
    const netDaily = netWeekly / 5; // Assuming 5 work days
    const netHourly = netWeekly / hours;

    // 50/30/20 Budget Rule (based on Monthly Net)
    const budgetNeeds = netMonthly * 0.50;
    const budgetWants = netMonthly * 0.30;
    const budgetSavings = netMonthly * 0.20;

    setResults({
      grossAnnual: totalGrossAnnual,
      grossMonthly: totalGrossAnnual / 12,
      taxAnnual: annualTax,
      deductionsAnnual: annualDeduct,
      netAnnual: Math.max(0, netAnnual),
      netMonthly: Math.max(0, netMonthly),
      netBiWeekly: Math.max(0, netBiWeekly),
      netWeekly: Math.max(0, netWeekly),
      netDaily: Math.max(0, netDaily),
      netHourly: Math.max(0, netHourly),
      budgetNeeds: Math.max(0, budgetNeeds),
      budgetWants: Math.max(0, budgetWants),
      budgetSavings: Math.max(0, budgetSavings)
    });
  }, [salaryAmount, salaryType, hoursPerWeek, taxRate, monthlyDeductions, annualBonus]);

  useEffect(() => {
    calculateSalary();
  }, [calculateSalary]);

  const copyResult = async () => {
    if (results.grossAnnual <= 0) return;
    
    const text = 
      `Salary Analysis Result\n\n` +
      `Gross Annual: ${formatCurrency(results.grossAnnual, currency.code, currency.locale)}\n` +
      `Net Annual (Take-Home): ${formatCurrency(results.netAnnual, currency.code, currency.locale)}\n` +
      `Net Monthly: ${formatCurrency(results.netMonthly, currency.code, currency.locale)}\n\n` +
      `Deductions:\n` +
      `- Estimated Taxes: ${formatCurrency(results.taxAnnual, currency.code, currency.locale)}\n` +
      `- Other Deductions: ${formatCurrency(results.deductionsAnnual, currency.code, currency.locale)}\n\n` +
      `50/30/20 Monthly Budget:\n` +
      `- Needs (50%): ${formatCurrency(results.budgetNeeds, currency.code, currency.locale)}\n` +
      `- Wants (30%): ${formatCurrency(results.budgetWants, currency.code, currency.locale)}\n` +
      `- Savings (20%): ${formatCurrency(results.budgetSavings, currency.code, currency.locale)}`;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }
    } catch (error) {
      setCopied(false);
    }
  };

  // Visual Bar Percentages
  const taxPct = results.grossAnnual > 0 ? (results.taxAnnual / results.grossAnnual) * 100 : 0;
  const deductPct = results.grossAnnual > 0 ? (results.deductionsAnnual / results.grossAnnual) * 100 : 0;
  const netPct = results.grossAnnual > 0 ? (results.netAnnual / results.grossAnnual) * 100 : 0;

  const baseInputStyle = "w-full min-w-0 h-10 px-3 bg-surface border border-line rounded-lg text-ink text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-mono";
  const baseSelectStyle = "w-full min-w-0 h-10 pl-3 pr-8 bg-surface border border-line rounded-lg text-ink text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      
      {/* MAIN WRAPPER SHELL */}
      <div className="rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6 space-y-6 min-w-0">
        
        {/* HEADER BAR WITH ACTION BUTTONS ALIGNED RIGHT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Wallet className="w-5 h-5 text-brand shrink-0" />
            <h2 className="text-base sm:text-lg font-display font-bold text-ink truncate">
              Advanced Salary Analyzer
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            <select 
              value={currency.code}
              onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
              className="h-9 pl-3 pr-8 bg-surface border border-line rounded-lg text-ink text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold cursor-pointer min-w-[90px]"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
              ))}
            </select>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-[1.3fr,1fr] min-w-0">
          
          {/* INPUT FORM PANEL */}
          <div className="flex flex-col gap-5 min-w-0">
            <div className="space-y-5 min-w-0">
              
              {/* Salary Type Toggle */}
              <div className="flex bg-paper border border-line p-1 rounded-lg w-full min-w-0">
                {['hourly', 'monthly', 'yearly'].map((type) => (
                  <button 
                    key={type}
                    onClick={() => setSalaryType(type)} 
                    className={`flex-1 py-2 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest rounded-md transition-all truncate px-2 ${
                      salaryType === type 
                        ? 'bg-surface text-brand shadow-sm border border-line' 
                        : 'text-muted hover:text-ink border border-transparent'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                
                <div className="space-y-2 sm:col-span-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted" htmlFor="salary-base">
                    <DollarSign className="w-3.5 h-3.5 text-brand" /> Base Pay ({salaryType})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted">{currency.symbol}</span>
                    <input 
                      id="salary-base"
                      type="number" 
                      min="0" 
                      value={salaryAmount} 
                      onChange={(e) => setSalaryAmount(e.target.value)} 
                      className={`${baseInputStyle} pl-8 text-sm`} 
                      placeholder="0" 
                    />
                  </div>
                </div>

                {salaryType === 'hourly' && (
                  <div className="space-y-2 sm:col-span-2 min-w-0 animate-in fade-in slide-in-from-top-2">
                    <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted" htmlFor="salary-hours">
                      <Clock className="w-3.5 h-3.5 text-brand" /> Hours per Week
                    </label>
                    <input 
                      id="salary-hours"
                      type="number" 
                      min="1" 
                      max="168" 
                      value={hoursPerWeek} 
                      onChange={(e) => setHoursPerWeek(e.target.value)} 
                      className={`${baseInputStyle} text-sm`} 
                      placeholder="40" 
                    />
                  </div>
                )}

                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted" htmlFor="salary-tax">
                    <Percent className="w-3.5 h-3.5 text-brand" /> Effective Tax Rate
                  </label>
                  <div className="relative">
                    <input 
                      id="salary-tax"
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="100" 
                      value={taxRate} 
                      onChange={(e) => setTaxRate(e.target.value)} 
                      className={`${baseInputStyle} pr-7 text-sm`} 
                      placeholder="15" 
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted">%</span>
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted" htmlFor="salary-bonus">
                    <TrendingUp className="w-3.5 h-3.5 text-brand" /> Annual Bonus
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted">{currency.symbol}</span>
                    <input 
                      id="salary-bonus"
                      type="number" 
                      min="0" 
                      value={annualBonus} 
                      onChange={(e) => setAnnualBonus(e.target.value)} 
                      className={`${baseInputStyle} pl-8 text-sm`} 
                      placeholder="0" 
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted" htmlFor="salary-deductions">
                    <Calculator className="w-3.5 h-3.5 text-brand" /> Other Deductions (Monthly)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted">{currency.symbol}</span>
                    <input 
                      id="salary-deductions"
                      type="number" 
                      min="0" 
                      value={monthlyDeductions} 
                      onChange={(e) => setMonthlyDeductions(e.target.value)} 
                      className={`${baseInputStyle} pl-8 text-sm`} 
                      placeholder="Health Ins, 401k, etc." 
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Time Breakdown Matrix (Moved outside and styled cleanly) */}
            <div className="border border-line rounded-xl overflow-hidden min-w-0 mt-2">
              <div className="bg-paper px-3 py-2 border-b border-line flex items-center gap-1.5">
                 <CalendarDays className="w-3.5 h-3.5 text-brand"/>
                 <h3 className="text-xs font-bold text-ink uppercase tracking-widest">Net Take-Home Breakdown</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line">
                 {[
                    { label: "Annually", val: results.netAnnual },
                    { label: "Bi-Weekly", val: results.netBiWeekly },
                    { label: "Weekly", val: results.netWeekly },
                    { label: "Daily", val: results.netDaily },
                 ].map((stat, idx) => (
                    <div key={idx} className="bg-surface p-3 flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-extrabold text-muted uppercase tracking-widest mb-1">{stat.label}</span>
                        <span className="text-sm font-black font-mono text-ink truncate w-full">
                            {isMounted ? formatCurrency(stat.val, currency.code, currency.locale) : `${currency.symbol}0`}
                        </span>
                    </div>
                 ))}
              </div>
            </div>
          </div>

          {/* HERO RESULT CARD (Grey Background Style) */}
          <div className="rounded-xl border border-line bg-paper p-1.5 min-w-0 h-full">
            <div className="bg-surface rounded-lg w-full h-full p-4 sm:p-6 flex flex-col relative overflow-hidden min-h-[400px]">
              
              <div className="flex items-center justify-between border-b border-line pb-3 mb-5 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <PieChart className="w-4 h-4 text-brand shrink-0" />
                  <h3 className="text-sm font-bold text-ink truncate">Monthly Take-Home</h3>
                </div>
                
                <button
                  type="button"
                  onClick={copyResult}
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-md border border-line bg-paper hover:bg-line text-ink text-[11px] font-bold transition-colors shrink-0"
                >
                  {copied ? <><Check className="w-3 h-3 text-teal" /> Copied</> : <><Copy className="w-3 h-3 text-muted" /> Copy</>}
                </button>
              </div>
              
              <div className="text-center mb-6 min-w-0">
                 <span className="block text-4xl sm:text-5xl font-black font-mono text-ink tracking-tighter truncate pb-1">
                   {isMounted ? formatCurrency(results.netMonthly, currency.code, currency.locale) : `${currency.symbol}0`}
                 </span>
                 <span className="text-[11px] font-bold text-muted mt-1 block uppercase tracking-widest">
                   Gross Monthly: {isMounted ? formatCurrency(results.grossMonthly, currency.code, currency.locale) : `${currency.symbol}0`}
                 </span>
              </div>

              {/* Visual Deduction Bar */}
              <div className="h-4 w-full bg-line rounded-full flex overflow-hidden mb-5 shrink-0">
                <div className="h-full bg-brand transition-all duration-700 ease-out" style={{ width: `${netPct}%` }}></div>
                <div className="h-full bg-[#fb7185] transition-all duration-700 ease-out" style={{ width: `${taxPct}%` }}></div>
                <div className="h-full bg-[#fbbf24] transition-all duration-700 ease-out" style={{ width: `${deductPct}%` }}></div>
              </div>

              <div className="space-y-1.5 mb-6 min-w-0">
                <div className="flex justify-between items-center p-2 rounded-lg bg-brand/5 border border-brand/10 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0"></span>
                    <span className="text-xs text-brand font-bold truncate">Net Salary</span>
                  </div>
                  <span className="font-bold text-brand font-mono shrink-0 pl-2">
                    {isMounted ? formatCurrency(results.netAnnual, currency.code, currency.locale) : `${currency.symbol}0`} <span className="text-[10px] font-sans text-brand/70 uppercase">/yr</span>
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-paper transition-colors min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#fb7185] shrink-0"></span>
                    <span className="text-xs text-muted font-medium truncate">Est. Taxes</span>
                  </div>
                  <span className="font-bold text-ink font-mono shrink-0 pl-2">
                    -{isMounted ? formatCurrency(results.taxAnnual, currency.code, currency.locale) : `${currency.symbol}0`} <span className="text-[10px] font-sans text-muted uppercase">/yr</span>
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-paper transition-colors min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] shrink-0"></span>
                    <span className="text-xs text-muted font-medium truncate">Deductions</span>
                  </div>
                  <span className="font-bold text-ink font-mono shrink-0 pl-2">
                    -{isMounted ? formatCurrency(results.deductionsAnnual, currency.code, currency.locale) : `${currency.symbol}0`} <span className="text-[10px] font-sans text-muted uppercase">/yr</span>
                  </span>
                </div>
              </div>

              {/* 50/30/20 Budgeting Rules */}
              <div className="mt-auto pt-4 border-t border-line min-w-0">
                 <div className="flex items-center gap-1.5 mb-3">
                     <Target className="w-3.5 h-3.5 text-brand"/>
                     <h4 className="text-[10px] font-extrabold text-muted uppercase tracking-widest">50/30/20 Budget Rule (Monthly)</h4>
                 </div>
                 <div className="grid gap-2">
                     <div className="flex justify-between items-center bg-paper p-2 rounded-lg border border-line min-w-0">
                         <span className="text-xs font-bold text-ink">Needs (50%)</span>
                         <span className="text-xs font-black font-mono text-[#38bdf8]">{isMounted ? formatCurrency(results.budgetNeeds, currency.code, currency.locale) : "$0"}</span>
                     </div>
                     <div className="flex justify-between items-center bg-paper p-2 rounded-lg border border-line min-w-0">
                         <span className="text-xs font-bold text-ink">Wants (30%)</span>
                         <span className="text-xs font-black font-mono text-[#d946ef]">{isMounted ? formatCurrency(results.budgetWants, currency.code, currency.locale) : "$0"}</span>
                     </div>
                     <div className="flex justify-between items-center bg-paper p-2 rounded-lg border border-line min-w-0">
                         <span className="text-xs font-bold text-ink">Savings (20%)</span>
                         <span className="text-xs font-black font-mono text-[#34d399]">{isMounted ? formatCurrency(results.budgetSavings, currency.code, currency.locale) : "$0"}</span>
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