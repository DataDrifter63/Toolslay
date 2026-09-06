"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings, Landmark, DollarSign, Percent, Calendar, TrendingDown, PiggyBank, FileText, Sparkles } from "lucide-react";

// Global Currencies configuration
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

const LoanCalculator = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]); // Default USD
  
  const [principal, setPrincipal] = useState("300000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");
  const [extraPayment, setExtraPayment] = useState("0");
  
  const [showSettings, setShowSettings] = useState(true);

  const [results, setResults] = useState({
    monthlyPayment: 0,
    totalInterest: 0,
    totalPayment: 0,
    savedInterest: 0,
    savedMonths: 0,
    payoffYears: 0,
    yearlySchedule: []
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateLoan = useCallback(() => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(rate) || 0;
    const y = parseFloat(years) || 0;
    const extra = parseFloat(extraPayment) || 0;

    if (p <= 0 || y <= 0) {
      setResults({ monthlyPayment: 0, totalInterest: 0, totalPayment: 0, savedInterest: 0, savedMonths: 0, payoffYears: 0, yearlySchedule: [] });
      return;
    }

    const monthlyRate = r / 100 / 12;
    const totalMonths = Math.floor(y * 12);
    let standardPayment = 0;

    if (monthlyRate === 0) {
      standardPayment = p / totalMonths;
    } else {
      standardPayment = (p * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const standardTotalPayment = standardPayment * totalMonths;
    const standardTotalInterest = standardTotalPayment - p;

    let balance = p;
    let actualInterest = 0;
    let actualMonths = 0;
    let yearlyData = [];
    let currentYearInterest = 0;
    let currentYearPrincipal = 0;

    for (let i = 1; i <= totalMonths; i++) {
      let interestPayment = balance * monthlyRate;
      let principalPayment = standardPayment - interestPayment + extra;

      if (balance < principalPayment) {
        principalPayment = balance;
        interestPayment = balance * monthlyRate;
      }

      balance -= principalPayment;
      actualInterest += interestPayment;
      currentYearInterest += interestPayment;
      currentYearPrincipal += principalPayment;
      actualMonths++;

      if (i % 12 === 0 || balance <= 0) {
        yearlyData.push({
          year: Math.ceil(i / 12),
          interest: currentYearInterest,
          principal: currentYearPrincipal,
          balance: Math.max(0, balance)
        });
        currentYearInterest = 0;
        currentYearPrincipal = 0;
      }

      if (balance <= 0) break;
    }

    const calcSavedInterest = Math.max(0, standardTotalInterest - actualInterest);
    const finalSavedInterest = calcSavedInterest < 1 ? 0 : calcSavedInterest;

    setResults({
      monthlyPayment: standardPayment,
      totalInterest: actualInterest,
      totalPayment: p + actualInterest,
      savedInterest: finalSavedInterest,
      savedMonths: totalMonths - actualMonths,
      payoffYears: (actualMonths / 12).toFixed(1),
      yearlySchedule: yearlyData
    });
  }, [principal, rate, years, extraPayment]);

  useEffect(() => {
    calculateLoan();
  }, [calculateLoan]);

  const pNum = parseFloat(principal) || 0;
  const principalPercent = results.totalPayment > 0 ? (pNum / results.totalPayment) * 100 : 100;
  const interestPercent = results.totalPayment > 0 ? (results.totalInterest / results.totalPayment) * 100 : 0;
  const hasExtraPayment = parseFloat(extraPayment) > 0 && results.savedMonths > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Landmark className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Advanced Loan Calculator</h2>
        </div>
        <div className="flex gap-2">
          {/* Multi-Currency Dropdown */}
          <select 
            value={currency.code}
            onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
            className="text-sm font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
          </select>

          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all">
            <Settings className="w-4 h-4" /> {showSettings ? "Hide Amortization" : "Amortization"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 items-start">
        <div className="flex flex-col gap-6 flex-grow">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <DollarSign className="w-4 h-4 text-indigo-500"/> Loan Amount
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-indigo-500 transition-colors">{currency.symbol}</span>
                <input type="number" min="0" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-shadow" placeholder="0" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <Percent className="w-4 h-4 text-indigo-500"/> Interest Rate
              </label>
              <div className="relative group">
                <input type="number" step="0.1" min="0" value={rate} onChange={(e) => setRate(e.target.value)} className="w-full text-xl font-bold pl-4 pr-8 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-shadow" placeholder="0" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-indigo-500 transition-colors">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <Calendar className="w-4 h-4 text-indigo-500"/> Loan Term
              </label>
              <div className="relative group">
                <input type="number" min="1" value={years} onChange={(e) => setYears(e.target.value)} className="w-full text-xl font-bold pl-4 pr-16 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-shadow" placeholder="0" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-indigo-500 transition-colors">Years</span>
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <TrendingDown className="w-4 h-4 text-emerald-500"/> Extra Monthly Payment
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-500">{currency.symbol}</span>
                <input type="number" min="0" value={extraPayment} onChange={(e) => setExtraPayment(e.target.value)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-700 dark:text-emerald-400 placeholder-emerald-300 transition-shadow" placeholder="0" />
              </div>
            </div>

          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-sm text-center relative overflow-hidden">
             <div className="z-10 relative">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Base Monthly Payment</h3>
               
               <div className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6">
                 {isMounted ? formatCurrency(results.monthlyPayment, currency.code, currency.locale) : `${currency.symbol}0`}
                 {hasExtraPayment && <span className="text-2xl text-emerald-400 block mt-2 animate-in fade-in slide-in-from-bottom-2">+ {formatCurrency(extraPayment, currency.code, currency.locale)} Extra</span>}
               </div>

               <div className="mt-8 mb-4 max-w-2xl mx-auto space-y-2">
                 <div className="flex justify-between text-xs font-bold uppercase">
                   <span className="text-indigo-400">Principal (Total Loan)</span>
                   <span className="text-pink-400">Total Interest</span>
                 </div>
                 <div className="h-4 w-full bg-slate-800 rounded-full flex overflow-hidden border border-slate-700">
                   <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${principalPercent}%` }}></div>
                   <div className="h-full bg-pink-500 transition-all duration-1000 ease-out" style={{ width: `${interestPercent}%` }}></div>
                 </div>
                 <div className="flex justify-between text-sm font-mono font-bold text-white">
                   <span>{isMounted ? formatCurrency(pNum, currency.code, currency.locale) : `${currency.symbol}0`}</span>
                   <span>{isMounted ? formatCurrency(results.totalInterest, currency.code, currency.locale) : `${currency.symbol}0`}</span>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {showSettings && (
          <div className="space-y-6 lg:w-[350px] lg:max-w-[350px] flex flex-col h-full animate-in fade-in slide-in-from-right-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <PiggyBank className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Extra Payment Impact</h3>
              </div>
              
              {hasExtraPayment ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wide mb-1">Interest Saved</span>
                    <span className="block text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
                      {formatCurrency(results.savedInterest, currency.code, currency.locale)}
                    </span>
                  </div>
                  <div className="p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
                    <span className="block text-xs font-bold text-sky-600 dark:text-sky-500 uppercase tracking-wide mb-1">Time Saved</span>
                    <span className="block text-xl font-black text-sky-700 dark:text-sky-400 tracking-tight">
                      {Math.floor(results.savedMonths / 12)} Yrs, {results.savedMonths % 12} Mos
                    </span>
                    <span className="text-xs font-bold text-sky-500 mt-2 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> New Payoff: {results.payoffYears} Years</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500 dark:text-slate-400 text-center flex flex-col items-center justify-center min-h-[180px]">
                  <TrendingDown className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
                  Enter an extra monthly payment to see how much time and interest you can save!
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm flex flex-col max-h-[500px]">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Yearly Amortization</h3>
              </div>
              
              <div className="overflow-y-auto pr-2 space-y-2 flex-grow custom-scrollbar">
                {results.yearlySchedule.length > 0 ? (
                    results.yearlySchedule.map((data) => (
                    <div key={data.year} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">Year {data.year}</span>
                        <span className="text-xs font-mono font-bold text-slate-500">Bal: {formatCurrency(data.balance, currency.code, currency.locale)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-indigo-500">Prin: {formatCurrency(data.principal, currency.code, currency.locale)}</span>
                        <span className="text-pink-500">Int: {formatCurrency(data.interest, currency.code, currency.locale)}</span>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-center text-xs font-bold text-slate-400 py-6">Enter valid loan details to generate schedule.</div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCalculator;