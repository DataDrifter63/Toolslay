"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Car, DollarSign, Percent, Calendar, Shield, 
  Settings, AlertTriangle, TrendingDown, Gauge, 
  Fuel, Wrench, Wallet, Activity, Copy, Check 
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

const CarLoanCalculator = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);

  // Core Inputs
  const [vehiclePrice, setVehiclePrice] = useState("35000");
  const [downPayment, setDownPayment] = useState("5000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("60"); 

  // Trade-in & Fees
  const [tradeInValue, setTradeInValue] = useState("0");
  const [owedOnTradeIn, setOwedOnTradeIn] = useState("0");
  const [salesTaxRate, setSalesTaxRate] = useState("7.0"); 
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

    const netTradeIn = tradeIn - owedOnTrade;
    const taxableAmount = Math.max(0, price - tradeIn); 
    const totalTax = taxableAmount * (taxRate / 100);

    const amountFinanced = price + totalTax + fees - down - netTradeIn;

    if (amountFinanced <= 0 || term <= 0) {
      setResults({
        loanAmount: 0, monthlyLoanPayment: 0, totalInterest: 0, totalPaid: 0, 
        totalTax, monthlyTCO: ins + gas + maint, underwaterMonths: 0, depreciationSchedule: []
      });
      return;
    }

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

  const copyResult = async () => {
    if (results.monthlyLoanPayment <= 0) return;
    const text = 
      `Auto Finance & TCO Summary (${loanTerm} mos @ ${interestRate}% APR)\n` +
      `Monthly Loan Payment: ${formatCurrency(results.monthlyLoanPayment, currency.code, currency.locale)}\n` +
      `Total Financed: ${formatCurrency(results.loanAmount, currency.code, currency.locale)}\n` +
      `Total Interest: ${formatCurrency(results.totalInterest, currency.code, currency.locale)}\n\n` +
      `True Cost of Ownership (Monthly): ${formatCurrency(results.monthlyTCO, currency.code, currency.locale)}\n` +
      `Depreciation Risk: ${results.underwaterMonths > 0 ? `${results.underwaterMonths} months underwater` : 'Safe (Positive Equity)'}`;

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

  const baseInputStyle = "w-full min-w-0 h-11 md:h-12 px-3 sm:px-4 bg-surface border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold";
  const baseCurrencyInputStyle = "w-full min-w-0 h-11 md:h-12 pl-8 pr-3 bg-surface border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold";
  const baseSelectStyle = "w-full min-w-0 h-11 md:h-12 pl-3 sm:pl-4 pr-10 bg-surface border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold cursor-pointer";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      
      {/* MAIN WRAPPER SHELL */}
      <div className="rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 min-w-0">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Car className="w-6 h-6 md:w-7 md:h-7 text-brand shrink-0" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink truncate">
              Pro Auto Finance Engine
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 shrink-0">
            <select 
              value={currency.code}
              onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
              className="h-10 md:h-11 pl-3 md:pl-4 pr-8 bg-surface border border-line rounded-lg text-ink text-xs md:text-sm font-semibold focus:outline-none focus:border-brand cursor-pointer"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
              ))}
            </select>
            <button 
              type="button" 
              onClick={() => setShowAdvanced(!showAdvanced)} 
              className="flex items-center gap-2 text-xs md:text-sm font-semibold bg-paper border border-line text-ink px-3.5 py-2.5 rounded-lg hover:bg-brand/10 hover:border-brand/30 transition-colors whitespace-nowrap"
            >
              <Settings className="w-4 h-4 text-brand shrink-0" /> {showAdvanced ? "Basic Mode" : "TCO & Trade-in"}
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] items-start gap-6 md:gap-8 min-w-0">
          
          {/* INPUT FORM PANEL */}
          <div className="flex flex-col gap-6 md:gap-8 min-w-0">
            <div className="bg-surface border border-line p-5 md:p-7 rounded-xl space-y-6 md:space-y-8 min-w-0">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 min-w-0">
                <div className="space-y-2 sm:col-span-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted">
                    <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0"/> Vehicle Price
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none">{currency.symbol}</span>
                    <input 
                      type="number" 
                      min="0" 
                      value={vehiclePrice} 
                      onChange={(e) => setVehiclePrice(e.target.value)} 
                      className={`${baseCurrencyInputStyle} text-xl md:text-2xl font-black`} 
                    />
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted truncate">
                    <Wallet className="w-4 h-4 md:w-5 md:h-5 text-teal shrink-0"/> Down Payment
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none">{currency.symbol}</span>
                    <input 
                      type="number" 
                      min="0" 
                      value={downPayment} 
                      onChange={(e) => setDownPayment(e.target.value)} 
                      className={baseCurrencyInputStyle} 
                    />
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted truncate">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0"/> Loan Term (Months)
                  </label>
                  <select value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} className={baseSelectStyle}>
                    <option value="12">12 Months (1 Year)</option>
                    <option value="24">24 Months (2 Years)</option>
                    <option value="36">36 Months (3 Years)</option>
                    <option value="48">48 Months (4 Years)</option>
                    <option value="60">60 Months (5 Years)</option>
                    <option value="72">72 Months (6 Years)</option>
                    <option value="84">84 Months (7 Years)</option>
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2 min-w-0">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted">
                    <Percent className="w-4 h-4 md:w-5 md:h-5 text-[#fb7185] shrink-0"/> Interest Rate (Annual % APR)
                  </label>
                  <div className="relative group">
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      value={interestRate} 
                      onChange={(e) => setInterestRate(e.target.value)} 
                      className={`${baseInputStyle} pr-8`} 
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none">%</span>
                  </div>
                </div>
              </div>

              {showAdvanced && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 min-w-0">
                  
                  <div className="pt-6 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 min-w-0">
                    <div className="col-span-full min-w-0">
                       <h3 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                         <Settings className="w-4 h-4 text-brand shrink-0"/> Dealership Details
                       </h3>
                    </div>
                    
                    <div className="space-y-2 min-w-0">
                      <label className="text-xs font-bold text-muted truncate block">Trade-In Value</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none">{currency.symbol}</span>
                        <input type="number" value={tradeInValue} onChange={(e) => setTradeInValue(e.target.value)} className={baseCurrencyInputStyle} />
                      </div>
                    </div>
                    
                    <div className="space-y-2 min-w-0">
                      <label className="text-xs font-bold text-muted truncate block">Owed on Trade-In</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#e11d48] pointer-events-none">{currency.symbol}</span>
                        <input type="number" value={owedOnTradeIn} onChange={(e) => setOwedOnTradeIn(e.target.value)} className="w-full min-w-0 h-11 md:h-12 pl-8 pr-3 bg-[#fb7185]/5 border border-[#fb7185]/30 rounded-lg text-[#e11d48] text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#fb7185]/20" />
                      </div>
                    </div>

                    <div className="space-y-2 min-w-0">
                      <label className="text-xs font-bold text-muted truncate block">Sales Tax Rate (%)</label>
                      <div className="relative">
                        <input type="number" step="0.1" value={salesTaxRate} onChange={(e) => setSalesTaxRate(e.target.value)} className={`${baseInputStyle} pr-8`} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none">%</span>
                      </div>
                    </div>

                    <div className="space-y-2 min-w-0">
                      <label className="text-xs font-bold text-muted truncate block">Dealer Fees</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted pointer-events-none">{currency.symbol}</span>
                        <input type="number" value={dealerFees} onChange={(e) => setDealerFees(e.target.value)} className={baseCurrencyInputStyle} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-line grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
                    <div className="col-span-full flex items-center justify-between min-w-0">
                       <h3 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                         <Activity className="w-4 h-4 text-brand shrink-0"/> True Cost Estimator (Monthly)
                       </h3>
                    </div>
                    
                    <div className="space-y-2 min-w-0">
                      <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted truncate"><Shield className="w-3 h-3 text-brand"/> Insurance</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted pointer-events-none">{currency.symbol}</span>
                        <input type="number" value={insurance} onChange={(e) => setInsurance(e.target.value)} className="w-full min-w-0 h-10 px-3 pl-7 bg-surface border border-line rounded-lg text-ink text-xs font-semibold focus:outline-none focus:border-brand" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 min-w-0">
                      <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted truncate"><Fuel className="w-3 h-3 text-amber-500"/> Gas / Charge</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted pointer-events-none">{currency.symbol}</span>
                        <input type="number" value={fuel} onChange={(e) => setFuel(e.target.value)} className="w-full min-w-0 h-10 px-3 pl-7 bg-surface border border-line rounded-lg text-ink text-xs font-semibold focus:outline-none focus:border-brand" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 min-w-0">
                      <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted truncate"><Wrench className="w-3 h-3 text-teal"/> Maintenance</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted pointer-events-none">{currency.symbol}</span>
                        <input type="number" value={maintenance} onChange={(e) => setMaintenance(e.target.value)} className="w-full min-w-0 h-10 px-3 pl-7 bg-surface border border-line rounded-lg text-ink text-xs font-semibold focus:outline-none focus:border-brand" />
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* OUTPUT DASHBOARD PANEL */}
          <div className="flex flex-col gap-6 h-full min-w-0">
            
            <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card text-center relative overflow-hidden min-w-0">
               <div className="flex items-center justify-between border-b border-line pb-4 mb-5 min-w-0">
                 <h3 className="text-base md:text-lg font-bold text-ink truncate">Loan Summary</h3>
                 <button
                   type="button"
                   onClick={copyResult}
                   className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border border-line bg-surface hover:bg-line text-ink text-xs font-semibold transition-colors shrink-0"
                 >
                   {copied ? <><Check className="w-3.5 h-3.5 text-teal" /> Copied</> : <><Copy className="w-3.5 h-3.5 text-muted" /> Copy</>}
                 </button>
               </div>
               
               <div className="z-10 relative my-3 min-w-0">
                 <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5 truncate">Monthly Loan Payment</h4>
                 <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-ink mb-2 truncate">
                   {isMounted ? formatCurrency(results.monthlyLoanPayment, currency.code, currency.locale) : `${currency.symbol}0`}
                 </div>
                 <div className="text-xs font-semibold text-brand flex items-center justify-center gap-1.5 truncate">
                   Total Financed: {isMounted ? formatCurrency(results.loanAmount, currency.code, currency.locale) : "$0"}
                 </div>
               </div>

               <div className="mt-6 mb-2 max-w-2xl mx-auto space-y-2 min-w-0">
                 <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface border border-line min-w-0">
                   <span className="text-xs font-bold text-muted">Total Interest</span>
                   <span className="font-bold text-[#e11d48] font-mono text-xs sm:text-sm shrink-0 pl-2">+{isMounted ? formatCurrency(results.totalInterest, currency.code, currency.locale) : "$0"}</span>
                 </div>
                 <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface border border-line min-w-0">
                   <span className="text-xs font-bold text-muted">Taxes & Fees</span>
                   <span className="font-bold text-amber-600 font-mono text-xs sm:text-sm shrink-0 pl-2">{isMounted ? formatCurrency(results.totalTax + Number(dealerFees), currency.code, currency.locale) : "$0"}</span>
                 </div>
               </div>
            </div>

            {showAdvanced && (
              <div className="bg-brand/10 border border-brand/20 p-5 md:p-6 rounded-xl shadow-card animate-in fade-in zoom-in-95 min-w-0">
                <div className="flex items-center gap-2 border-b border-brand/20 pb-3 mb-4 min-w-0">
                    <Gauge className="w-5 h-5 text-brand shrink-0" />
                    <h3 className="text-base font-bold text-ink truncate">True Cost of Ownership</h3>
                </div>
                <div className="text-center min-w-0">
                    <span className="block text-3xl sm:text-4xl font-black text-ink tracking-tight truncate">
                      {isMounted ? formatCurrency(results.monthlyTCO, currency.code, currency.locale) : "$0"} <span className="text-sm sm:text-base font-sans font-medium text-muted">/mo</span>
                    </span>
                    <span className="text-[10px] font-bold text-brand uppercase tracking-widest mt-1 block truncate">Loan + Ins + Gas + Maint</span>
                </div>
              </div>
            )}

            <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card min-w-0">
              <div className="flex items-center justify-between border-b border-line pb-3.5 mb-4 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-[#fb7185] shrink-0" />
                    <h3 className="text-sm md:text-base font-bold text-ink truncate">Depreciation Danger</h3>
                </div>
                {results.underwaterMonths > 0 ? (
                  <span className="flex items-center gap-1 text-[10px] bg-[#fb7185]/15 text-[#e11d48] font-black px-2 py-1 rounded uppercase tracking-wider shrink-0">
                    <AlertTriangle className="w-3 h-3"/> Underwater risk
                  </span>
                ) : (
                  <span className="text-[10px] bg-teal/15 text-teal font-black px-2 py-1 rounded uppercase tracking-wider shrink-0">Safe Equity</span>
                )}
              </div>
              
              <p className="text-xs text-muted mb-4 font-medium leading-relaxed">
                Cars lose value. If your loan balance is higher than the car's value, you are "underwater" (Negative Equity).
              </p>

              {results.underwaterMonths > 0 && (
                <div className="mb-4 text-center p-3 rounded-lg bg-[#fb7185]/10 border border-[#fb7185]/20 min-w-0">
                    <span className="block text-lg sm:text-xl font-black text-[#e11d48] truncate">{results.underwaterMonths} Months</span>
                    <span className="text-[10px] uppercase font-bold text-muted tracking-wider block truncate">Time spent owing more than car is worth</span>
                </div>
              )}

              <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1 min-w-0">
                {results.depreciationSchedule.map((data) => (
                  <div key={data.year} className={`flex justify-between items-center p-2.5 rounded-lg border text-xs min-w-0 ${data.equity < 0 ? 'bg-[#fb7185]/5 border-[#fb7185]/20 text-[#e11d48]' : 'bg-surface border-line text-ink'}`}>
                    <span className="font-bold shrink-0 pr-2">Year {data.year}</span>
                    <div className="flex flex-col text-right truncate">
                        <span className="text-[10px] text-muted truncate">Loan: {formatCurrency(data.balance, currency.code, currency.locale)}</span>
                        <span className="text-[10px] font-bold text-brand truncate">Value: {formatCurrency(data.value, currency.code, currency.locale)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CarLoanCalculator;