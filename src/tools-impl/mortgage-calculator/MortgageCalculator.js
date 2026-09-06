"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Home, DollarSign, Percent, Calendar, Shield, Landmark, PieChart } from "lucide-react";

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

export default function MortgageCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]); // Default USD

  const [homePrice, setHomePrice] = useState("400000");
  const [downPayment, setDownPayment] = useState("80000");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [rate, setRate] = useState("7.0");
  const [years, setYears] = useState("30");

  const [propTaxRate, setPropTaxRate] = useState("1.2");
  const [homeInsurance, setHomeInsurance] = useState("1200");
  const [hoa, setHoa] = useState("0");

  const [results, setResults] = useState({
    monthlyPI: 0,
    monthlyTax: 0,
    monthlyIns: 0,
    monthlyPMI: 0,
    monthlyHOA: 0,
    totalMonthly: 0,
    totalLoan: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleHomePriceChange = (val) => {
    setHomePrice(val);
    const hp = parseFloat(val) || 0;
    const dpPercent = parseFloat(downPaymentPercent) || 0;
    setDownPayment((hp * (dpPercent / 100)).toFixed(0));
  };

  const handleDownPaymentChange = (val) => {
    setDownPayment(val);
    const dp = parseFloat(val) || 0;
    const hp = parseFloat(homePrice) || 0;
    if (hp > 0) {
      setDownPaymentPercent(((dp / hp) * 100).toFixed(1));
    }
  };

  const handleDownPaymentPercentChange = (val) => {
    setDownPaymentPercent(val);
    const percent = parseFloat(val) || 0;
    const hp = parseFloat(homePrice) || 0;
    setDownPayment((hp * (percent / 100)).toFixed(0));
  };

  const calculateMortgage = useCallback(() => {
    const hp = parseFloat(homePrice) || 0;
    const dp = parseFloat(downPayment) || 0;
    const r = parseFloat(rate) || 0;
    const y = parseFloat(years) || 0;
    const taxRate = parseFloat(propTaxRate) || 0;
    const ins = parseFloat(homeInsurance) || 0;
    const hoaFee = parseFloat(hoa) || 0;

    const loanAmount = Math.max(0, hp - dp);
    
    if (loanAmount <= 0 || y <= 0) {
      setResults({ monthlyPI: 0, monthlyTax: 0, monthlyIns: 0, monthlyPMI: 0, monthlyHOA: hoaFee, totalMonthly: hoaFee, totalLoan: 0 });
      return;
    }

    const monthlyRate = r / 100 / 12;
    const totalMonths = y * 12;
    let pi = 0;
    
    if (monthlyRate === 0) {
      pi = loanAmount / totalMonths;
    } else {
      pi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const monthlyTax = (hp * (taxRate / 100)) / 12;
    const monthlyIns = ins / 12;

    const dpPercent = hp > 0 ? (dp / hp) * 100 : 0;
    const pmi = dpPercent < 20 ? (loanAmount * 0.005) / 12 : 0;

    const total = pi + monthlyTax + monthlyIns + pmi + hoaFee;

    setResults({
      monthlyPI: pi,
      monthlyTax: monthlyTax,
      monthlyIns: monthlyIns,
      monthlyPMI: pmi,
      monthlyHOA: hoaFee,
      totalMonthly: total,
      totalLoan: loanAmount
    });
  }, [homePrice, downPayment, rate, years, propTaxRate, homeInsurance, hoa]);

  useEffect(() => {
    calculateMortgage();
  }, [calculateMortgage]);

  const getPercent = (value) => results.totalMonthly > 0 ? (value / results.totalMonthly) * 100 : 0;
  const piPct = getPercent(results.monthlyPI);
  const taxPct = getPercent(results.monthlyTax);
  const insPct = getPercent(results.monthlyIns);
  const pmiPct = getPercent(results.monthlyPMI);
  const hoaPct = getPercent(results.monthlyHOA);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Home className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Ultimate Mortgage Analyzer</h2>
        </div>
        <div className="flex gap-2">
          <select 
            value={currency.code}
            onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
            className="text-sm font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
          </select>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-colors">
            <Shield className="w-4 h-4" /> {showAdvanced ? "Hide Escrow Info" : "Include Taxes & Insurance"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-6 items-start">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <DollarSign className="w-4 h-4 text-indigo-500"/> Home Price
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-indigo-500 transition-colors">{currency.symbol}</span>
                <input type="number" min="0" value={homePrice} onChange={(e) => handleHomePriceChange(e.target.value)} className="w-full text-2xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-shadow" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <label className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                <div className="flex items-center gap-2"><Landmark className="w-4 h-4 text-indigo-500"/> Down Payment</div>
                {results.monthlyPMI > 0 && <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-1 rounded font-black uppercase tracking-wider">PMI Required (&lt; 20%)</span>}
              </label>
              <div className="flex gap-4">
                <div className="relative flex-grow">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-indigo-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={downPayment} onChange={(e) => handleDownPaymentChange(e.target.value)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                </div>
                <div className="relative w-32">
                  <input type="number" min="0" max="100" step="0.1" value={downPaymentPercent} onChange={(e) => handleDownPaymentPercentChange(e.target.value)} className="w-full text-xl font-bold pl-4 pr-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-indigo-500 transition-colors">%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <Percent className="w-4 h-4 text-indigo-500"/> Interest Rate
              </label>
              <div className="relative group">
                <input type="number" step="0.1" min="0" value={rate} onChange={(e) => setRate(e.target.value)} className="w-full text-xl font-bold pl-4 pr-8 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-indigo-500 transition-colors">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <Calendar className="w-4 h-4 text-indigo-500"/> Loan Term
              </label>
              <select value={years} onChange={(e) => setYears(e.target.value)} className="w-full text-xl font-bold px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 cursor-pointer">
                <option value="30">30 Years Fixed</option>
                <option value="20">20 Years Fixed</option>
                <option value="15">15 Years Fixed</option>
                <option value="10">10 Years Fixed</option>
              </select>
            </div>
          </div>

          {showAdvanced && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Shield className="w-4 h-4"/> Escrow Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Property Tax (Annual %)</label>
                  <input type="number" step="0.1" value={propTaxRate} onChange={(e) => setPropTaxRate(e.target.value)} className="w-full font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Home Insurance ({currency.symbol}/Yr)</label>
                  <input type="number" value={homeInsurance} onChange={(e) => setHomeInsurance(e.target.value)} className="w-full font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">HOA Fees ({currency.symbol}/Mo)</label>
                  <input type="number" value={hoa} onChange={(e) => setHoa(e.target.value)} className="w-full font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" />
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm flex flex-col h-full sticky top-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6">
            <PieChart className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white">Monthly Payment</h3>
          </div>
          
          <div className="text-center mb-8">
             <span className="block text-4xl md:text-5xl font-black text-white tracking-tighter">
               {isMounted ? formatCurrency(results.totalMonthly, currency.code, currency.locale) : `${currency.symbol}0`}
             </span>
             <span className="text-xs font-bold text-slate-400 mt-2 block">Total Loan: {isMounted ? formatCurrency(results.totalLoan, currency.code, currency.locale) : `${currency.symbol}0`}</span>
          </div>

          <div className="h-6 w-full bg-slate-800 rounded-full flex overflow-hidden mb-6">
            <div className="h-full bg-indigo-500 transition-all duration-700 ease-out" style={{ width: `${piPct}%` }}></div>
            <div className="h-full bg-sky-400 transition-all duration-700 ease-out" style={{ width: `${taxPct}%` }}></div>
            <div className="h-full bg-emerald-400 transition-all duration-700 ease-out" style={{ width: `${insPct}%` }}></div>
            <div className="h-full bg-rose-500 transition-all duration-700 ease-out" style={{ width: `${pmiPct}%` }}></div>
            <div className="h-full bg-amber-400 transition-all duration-700 ease-out" style={{ width: `${hoaPct}%` }}></div>
          </div>

          <div className="space-y-3 flex-grow">
            <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/50">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500"></span><span className="text-sm text-slate-300 font-medium">Principal & Interest</span></div>
              <span className="font-bold text-white font-mono">{isMounted ? formatCurrency(results.monthlyPI, currency.code, currency.locale) : `${currency.symbol}0`}</span>
            </div>
            
            {results.monthlyTax > 0 && (
              <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/50 animate-in fade-in">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sky-400"></span><span className="text-sm text-slate-300 font-medium">Property Taxes</span></div>
                <span className="font-bold text-white font-mono">{isMounted ? formatCurrency(results.monthlyTax, currency.code, currency.locale) : `${currency.symbol}0`}</span>
              </div>
            )}
            
            {results.monthlyIns > 0 && (
              <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/50 animate-in fade-in">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400"></span><span className="text-sm text-slate-300 font-medium">Home Insurance</span></div>
                <span className="font-bold text-white font-mono">{isMounted ? formatCurrency(results.monthlyIns, currency.code, currency.locale) : `${currency.symbol}0`}</span>
              </div>
            )}

            {results.monthlyPMI > 0 && (
              <div className="flex justify-between items-center p-2 rounded bg-rose-500/10 border border-rose-500/20 animate-in fade-in">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span><span className="text-sm text-rose-300 font-bold">PMI (Under 20% Down)</span></div>
                <span className="font-bold text-rose-400 font-mono">{isMounted ? formatCurrency(results.monthlyPMI, currency.code, currency.locale) : `${currency.symbol}0`}</span>
              </div>
            )}

            {results.monthlyHOA > 0 && (
              <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/50 animate-in fade-in">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400"></span><span className="text-sm text-slate-300 font-medium">HOA Fees</span></div>
                <span className="font-bold text-white font-mono">{isMounted ? formatCurrency(results.monthlyHOA, currency.code, currency.locale) : `${currency.symbol}0`}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}