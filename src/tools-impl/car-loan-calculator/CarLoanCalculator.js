"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Car, DollarSign, Percent, Calendar, Shield, Settings, AlertTriangle, TrendingDown, Gauge, Fuel, Wrench, Wallet, Activity } from "lucide-react";

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

const CarLoanCalculator = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Core Inputs
  const [vehiclePrice, setVehiclePrice] = useState("35000");
  const [downPayment, setDownPayment] = useState("5000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("60"); // Months

  // Trade-in & Fees
  const [tradeInValue, setTradeInValue] = useState("0");
  const [owedOnTradeIn, setOwedOnTradeIn] = useState("0");
  const [salesTaxRate, setSalesTaxRate] = useState("7.0"); // %
  const [dealerFees, setDealerFees] = useState("800");

  // True Cost of Ownership (TCO)
  const [insurance, setInsurance] = useState("150");
  const [fuel, setFuel] = useState("200");
  const [maintenance, setMaintenance] = useState("75");

  const [results, setResults] = useState({
    loanAmount: 0,
    monthlyLoanPayment: 0,
    totalInterest: 0,
    totalPaid: 0,
    totalTax: 0,
    monthlyTCO: 0,
    underwaterMonths: 0,
    depreciationSchedule: []
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateLoan = useCallback(() => {
    const price = Number(vehiclePrice) || 0;
    const down = Number(downPayment) || 0;
    const rate = Number(interestRate) || 0;
    const term = Number(loanTerm) || 0;
    
    const tradeIn = Number(tradeInValue) || 0;
    const owedOnTrade = Number(owedOnTradeIn) || 0;
    const taxRate = Number(salesTaxRate) || 0;
    const fees = Number(dealerFees) || 0;

    const ins = Number(insurance) || 0;
    const gas = Number(fuel) || 0;
    const maint = Number(maintenance) || 0;

    // Dealership Math
    const netTradeIn = tradeIn - owedOnTrade;
    const taxableAmount = Math.max(0, price - tradeIn); 
    const totalTax = taxableAmount * (taxRate / 100);

    // Total Amount Financed
    const amountFinanced = price + totalTax + fees - down - netTradeIn;

    if (amountFinanced <= 0 || term <= 0) {
      setResults({
        loanAmount: 0, monthlyLoanPayment: 0, totalInterest: 0, totalPaid: 0, 
        totalTax, monthlyTCO: ins + gas + maint, underwaterMonths: 0, depreciationSchedule: []
      });
      return;
    }

    // Standard Amortization
    const monthlyRate = rate / 100 / 12;
    let monthlyPayment = 0;

    if (monthlyRate === 0) {
      monthlyPayment = amountFinanced / term;
    } else {
      monthlyPayment = (amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    }

    const totalInterest = (monthlyPayment * term) - amountFinanced;
    
    let balance = amountFinanced;
    let carValue = price;
    let schedule = [];
    let underwaterCount = 0;

    for (let month = 1; month <= term; month++) {
      let interestPayment = balance * monthlyRate;
      let principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      const year = Math.ceil(month / 12);
      let monthlyDepreciationRate = year === 1 ? (0.20 / 12) : (0.15 / 12);
      carValue -= (carValue * monthlyDepreciationRate);

      if (balance > carValue) {
        underwaterCount++;
      }

      if (month % 12 === 0 || month === term) {
        schedule.push({
          month,
          year: Math.ceil(month / 12),
          balance: Math.max(0, balance),
          value: Math.max(0, carValue),
          equity: carValue - balance
        });
      }
    }

    setResults({
      loanAmount: amountFinanced,
      monthlyLoanPayment: monthlyPayment,
      totalInterest: totalInterest,
      totalPaid: amountFinanced + totalInterest,
      totalTax: totalTax,
      monthlyTCO: monthlyPayment + ins + gas + maint,
      underwaterMonths: underwaterCount,
      depreciationSchedule: schedule
    });

  }, [vehiclePrice, downPayment, interestRate, loanTerm, tradeInValue, owedOnTradeIn, salesTaxRate, dealerFees, insurance, fuel, maintenance]);

  useEffect(() => {
    calculateLoan();
  }, [calculateLoan]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Car className="w-6 h-6 text-sky-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Pro Auto Finance Engine</h2>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={currency.code}
            onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
            className="text-sm font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
          </select>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:text-sky-600 transition-colors">
            <Settings className="w-4 h-4" /> {showAdvanced ? "Basic Mode" : "TCO & Trade-in"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-xl shadow-sm space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <DollarSign className="w-4 h-4 text-sky-500"/> Vehicle Price
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-sky-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={vehiclePrice} onChange={(e) => setVehiclePrice(e.target.value)} className="w-full text-3xl font-black pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Wallet className="w-4 h-4 text-emerald-500"/> Down Payment
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-emerald-500 transition-colors">{currency.symbol}</span>
                  <input type="number" min="0" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Calendar className="w-4 h-4 text-sky-500"/> Loan Term (Months)
                </label>
                <select value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} className="w-full text-xl font-bold px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100 cursor-pointer">
                  <option value="12">12 Months (1 Year)</option>
                  <option value="24">24 Months (2 Years)</option>
                  <option value="36">36 Months (3 Years)</option>
                  <option value="48">48 Months (4 Years)</option>
                  <option value="60">60 Months (5 Years)</option>
                  <option value="72">72 Months (6 Years)</option>
                  <option value="84">84 Months (7 Years)</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Percent className="w-4 h-4 text-rose-500"/> Interest Rate (APR)
                </label>
                <div className="relative group">
                  <input type="number" step="0.1" min="0" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="w-full text-xl font-bold pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100 transition-shadow" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-rose-500 transition-colors">%</span>
                </div>
              </div>
            </div>

            {showAdvanced && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-2">
                
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                     <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Settings className="w-4 h-4"/> Dealership Details</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Trade-In Value</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{currency.symbol}</span>
                      <input type="number" value={tradeInValue} onChange={(e) => setTradeInValue(e.target.value)} className="w-full font-bold pl-8 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Owed on Trade-In</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{currency.symbol}</span>
                      <input type="number" value={owedOnTradeIn} onChange={(e) => setOwedOnTradeIn(e.target.value)} className="w-full font-bold pl-8 p-2.5 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/50 rounded-md focus:ring-2 focus:ring-rose-500 text-rose-700 dark:text-rose-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Sales Tax Rate (%)</label>
                    <input type="number" step="0.1" value={salesTaxRate} onChange={(e) => setSalesTaxRate(e.target.value)} className="w-full font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Dealer Fees</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{currency.symbol}</span>
                      <input type="number" value={dealerFees} onChange={(e) => setDealerFees(e.target.value)} className="w-full font-bold pl-8 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-full flex items-center justify-between">
                     <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4"/> True Cost Estimator (Monthly)</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500"><Shield className="w-3 h-3"/> Insurance</label>
                    <input type="number" value={insurance} onChange={(e) => setInsurance(e.target.value)} className="w-full font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500"><Fuel className="w-3 h-3"/> Gas / Charge</label>
                    <input type="number" value={fuel} onChange={(e) => setFuel(e.target.value)} className="w-full font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500"><Wrench className="w-3 h-3"/> Maintenance</label>
                    <input type="number" value={maintenance} onChange={(e) => setMaintenance(e.target.value)} className="w-full font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100" />
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        <div className="flex flex-col gap-6 h-full sticky top-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm text-center relative overflow-hidden">
             
             <div className="z-10 relative">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Loan Payment (/mo)</h3>
               <div className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-2">
                 {isMounted ? formatCurrency(results.monthlyLoanPayment, currency.code, currency.locale) : `${currency.symbol}0`}
               </div>
               <div className="text-xs font-semibold text-sky-400 flex items-center justify-center gap-1 mt-2">
                 Total Financed: {isMounted ? formatCurrency(results.loanAmount, currency.code, currency.locale) : "$0"}
               </div>
             </div>

             <div className="mt-8 mb-4 max-w-2xl mx-auto space-y-3">
               <div className="flex justify-between items-center p-2 rounded bg-slate-800/50">
                 <span className="text-sm text-slate-300 font-medium">Total Interest</span>
                 <span className="font-bold text-rose-400 font-mono">+{isMounted ? formatCurrency(results.totalInterest, currency.code, currency.locale) : "$0"}</span>
               </div>
               <div className="flex justify-between items-center p-2 rounded bg-slate-800/50">
                 <span className="text-sm text-slate-300 font-medium">Taxes & Fees</span>
                 <span className="font-bold text-amber-400 font-mono">{isMounted ? formatCurrency(results.totalTax + Number(dealerFees), currency.code, currency.locale) : "$0"}</span>
               </div>
             </div>
          </div>

          {showAdvanced && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-800 p-6 rounded-xl shadow-sm animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2 border-b border-indigo-800/50 pb-3 mb-4">
                  <Gauge className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-semibold text-white">True Cost of Ownership</h3>
              </div>
              <div className="text-center mb-4">
                  <span className="block text-4xl font-black text-white tracking-tighter">
                    {isMounted ? formatCurrency(results.monthlyTCO, currency.code, currency.locale) : "$0"} <span className="text-lg text-indigo-300">/mo</span>
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1 block">Loan + Ins + Gas + Maint</span>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-rose-500" />
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Depreciation Danger</h3>
              </div>
              {results.underwaterMonths > 0 ? (
                <span className="flex items-center gap-1 text-[10px] bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-black px-2 py-1 rounded uppercase">
                  <AlertTriangle className="w-3 h-3"/> Underwater risk
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-black px-2 py-1 rounded uppercase">Safe</span>
              )}
            </div>
            
            <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
              Cars lose value. If your loan balance is higher than the car's value, you are "underwater" (Negative Equity).
            </p>

            {results.underwaterMonths > 0 && (
                <div className="mb-4 text-center p-3 rounded-lg bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/50">
                    <span className="block text-xl font-black text-rose-600 dark:text-rose-500">{results.underwaterMonths} Months</span>
                    <span className="text-[10px] uppercase font-bold text-rose-500/70">Time spent owing more than car is worth</span>
                </div>
            )}

            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                {results.depreciationSchedule.map((data) => (
                  <div key={data.year} className={`flex justify-between items-center p-3 rounded-lg border ${data.equity < 0 ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50'}`}>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-16">Year {data.year}</span>
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] font-bold text-slate-400">Loan: {formatCurrency(data.balance, currency.code, currency.locale)}</span>
                        <span className="text-[10px] font-bold text-sky-500">Value: {formatCurrency(data.value, currency.code, currency.locale)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarLoanCalculator;