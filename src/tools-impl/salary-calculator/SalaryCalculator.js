"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Wallet, DollarSign, Percent, Calculator, TrendingUp, CalendarDays, Clock, PieChart, Target } from "lucide-react";

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

  // Visual Bar Percentages
  const taxPct = results.grossAnnual > 0 ? (results.taxAnnual / results.grossAnnual) * 100 : 0;
  const deductPct = results.grossAnnual > 0 ? (results.deductionsAnnual / results.grossAnnual) * 100 : 0;
  const netPct = results.grossAnnual > 0 ? (results.netAnnual / results.grossAnnual) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Wallet className="w-6 h-6 text-emerald-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Pro Salary Analyzer</h2>
        </div>
        <select 
            value={currency.code}
            onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
            className="text-sm font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6 items-start">
        
        {/* Input Controls */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm space-y-6">
            
            {/* Salary Type Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full">
                {['hourly', 'monthly', 'yearly'].map((type) => (
                    <button 
                        key={type}
                        onClick={() => setSalaryType(type)} 
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${salaryType === type ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <DollarSign className="w-4 h-4 text-emerald-500"/> Base Pay ({salaryType})
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-emerald-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} className="w-full text-2xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 transition-shadow" placeholder="0" />
                </div>
              </div>

              {salaryType === 'hourly' && (
                  <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                      <Clock className="w-4 h-4 text-emerald-500"/> Hours per Week
                    </label>
                    <input type="number" min="1" max="168" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)} className="w-full text-xl font-bold px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 transition-shadow" placeholder="40" />
                  </div>
              )}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Percent className="w-4 h-4 text-emerald-500"/> Effective Tax Rate
                </label>
                <div className="relative group">
                  <input type="number" step="0.1" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-full text-xl font-bold pl-4 pr-8 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 transition-shadow" placeholder="15" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-emerald-500 transition-colors">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <TrendingUp className="w-4 h-4 text-emerald-500"/> Annual Bonus
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-emerald-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={annualBonus} onChange={(e) => setAnnualBonus(e.target.value)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 transition-shadow" placeholder="0" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Calculator className="w-4 h-4 text-emerald-500"/> Other Deductions (Monthly)
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-emerald-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={monthlyDeductions} onChange={(e) => setMonthlyDeductions(e.target.value)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 transition-shadow" placeholder="Health Ins, 401k, etc." />
                </div>
              </div>

            </div>
          </div>

          {/* Time Breakdown Matrix */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
               <CalendarDays className="w-4 h-4 text-emerald-500"/>
               <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Net Take-Home Breakdown</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 dark:bg-slate-700">
                {[
                    { label: "Annually", val: results.netAnnual },
                    { label: "Bi-Weekly", val: results.netBiWeekly },
                    { label: "Weekly", val: results.netWeekly },
                    { label: "Hourly", val: results.netHourly },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{stat.label}</span>
                        <span className="text-lg font-black text-slate-800 dark:text-slate-200">
                            {isMounted ? formatCurrency(stat.val, currency.code, currency.locale) : `${currency.symbol}0`}
                        </span>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Results Sidebar */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm flex flex-col h-full sticky top-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6">
            <PieChart className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Monthly Take-Home</h3>
          </div>
          
          <div className="text-center mb-6">
             <span className="block text-5xl md:text-6xl font-black text-white tracking-tighter">
               {isMounted ? formatCurrency(results.netMonthly, currency.code, currency.locale) : `${currency.symbol}0`}
             </span>
             <span className="text-xs font-bold text-slate-400 mt-2 block">Gross Monthly: {isMounted ? formatCurrency(results.grossMonthly, currency.code, currency.locale) : `${currency.symbol}0`}</span>
          </div>

          {/* Visual Deduction Bar */}
          <div className="h-4 w-full bg-slate-800 rounded-full flex overflow-hidden mb-6">
            <div className="h-full bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${netPct}%` }}></div>
            <div className="h-full bg-rose-500 transition-all duration-700 ease-out" style={{ width: `${taxPct}%` }}></div>
            <div className="h-full bg-amber-400 transition-all duration-700 ease-out" style={{ width: `${deductPct}%` }}></div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center p-2 rounded bg-slate-800/50">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-sm text-slate-300 font-medium">Net Salary</span></div>
              <span className="font-bold text-white font-mono">{isMounted ? formatCurrency(results.netAnnual, currency.code, currency.locale) : `${currency.symbol}0`} /yr</span>
            </div>
            
            <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/50">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span><span className="text-sm text-slate-300 font-medium">Est. Taxes</span></div>
              <span className="font-bold text-rose-400 font-mono">-{isMounted ? formatCurrency(results.taxAnnual, currency.code, currency.locale) : `${currency.symbol}0`} /yr</span>
            </div>
            
            <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/50">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400"></span><span className="text-sm text-slate-300 font-medium">Deductions</span></div>
              <span className="font-bold text-amber-400 font-mono">-{isMounted ? formatCurrency(results.deductionsAnnual, currency.code, currency.locale) : `${currency.symbol}0`} /yr</span>
            </div>
          </div>

          {/* 50/30/20 Budgeting Rules */}
          <div className="mt-auto pt-6 border-t border-slate-800">
             <div className="flex items-center gap-2 mb-4">
                 <Target className="w-4 h-4 text-sky-400"/>
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">50/30/20 Budget Rule</h4>
             </div>
             <div className="space-y-3">
                 <div className="flex justify-between items-center bg-slate-800/30 p-2.5 rounded-lg border border-slate-700/50">
                     <span className="text-xs font-bold text-slate-300">Needs (50%)</span>
                     <span className="text-sm font-black text-sky-400">{isMounted ? formatCurrency(results.budgetNeeds, currency.code, currency.locale) : "$0"}</span>
                 </div>
                 <div className="flex justify-between items-center bg-slate-800/30 p-2.5 rounded-lg border border-slate-700/50">
                     <span className="text-xs font-bold text-slate-300">Wants (30%)</span>
                     <span className="text-sm font-black text-fuchsia-400">{isMounted ? formatCurrency(results.budgetWants, currency.code, currency.locale) : "$0"}</span>
                 </div>
                 <div className="flex justify-between items-center bg-slate-800/30 p-2.5 rounded-lg border border-slate-700/50">
                     <span className="text-xs font-bold text-slate-300">Savings (20%)</span>
                     <span className="text-sm font-black text-emerald-400">{isMounted ? formatCurrency(results.budgetSavings, currency.code, currency.locale) : "$0"}</span>
                 </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}