"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Car, Key, Landmark, DollarSign, 
  TrendingUp, Percent, CheckCircle2, ShieldCheck, 
  HelpCircle, PieChart, Calculator, AlertCircle, ArrowRightLeft, Briefcase
} from "lucide-react";

export default function LeaseVsBuyCarCalculator() {
  const [isMounted, setIsMounted] = useState(false);

  // Common Vehicle Inputs
  const [carPrice, setCarPrice] = useState("40000");
  const [termMonths, setTermMonths] = useState("36");
  const [salesTax, setSalesTax] = useState("7");

  // Buying Inputs
  const [buyDownPayment, setBuyDownPayment] = useState("5000");
  const [buyInterestRate, setBuyInterestRate] = useState("6.5");
  const [estimatedResaleValue, setEstimatedResaleValue] = useState("22000");

  // Leasing Inputs
  const [leaseDownPayment, setLeaseDownPayment] = useState("3000");
  const [leaseMonthlyPayment, setLeaseMonthlyPayment] = useState("450");
  const [leaseAcquisitionFee, setLeaseAcquisitionFee] = useState("895");
  const [leaseDispositionFee, setLeaseDispositionFee] = useState("395");

  // Advanced / Business Inputs
  const [isBusinessUse, setIsBusinessUse] = useState(false);
  const [taxRate, setTaxRate] = useState("25"); // Tax bracket for business write-offs
  const [investmentReturnRate, setInvestmentReturnRate] = useState("6"); // Opportunity cost rate

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNumInput = (setter, value, max = null) => {
    if (value === "") {
      setter("");
      return;
    }
    if (/^\d*\.?\d*$/.test(value)) {
      const num = parseFloat(value);
      if (max && num > max) return;
      setter(value);
    }
  };

  // --- CORE FINANCIAL DECISION ENGINE ---
  const calculations = useMemo(() => {
    const price = parseFloat(carPrice) || 0;
    const months = parseInt(termMonths) || 36;
    const years = months / 12;
    const tax = (parseFloat(salesTax) || 0) / 100;
    const invReturn = (parseFloat(investmentReturnRate) || 0) / 100;
    const bizTaxRate = isBusinessUse ? ((parseFloat(taxRate) || 0) / 100) : 0;

    // 1. BUYING CALCULATION
    const buyDown = parseFloat(buyDownPayment) || 0;
    const buyApr = (parseFloat(buyInterestRate) || 0) / 100;
    const resaleVal = parseFloat(estimatedResaleValue) || 0;

    // Loan amount (Car price + Sales Tax on whole car - Down Payment)
    const totalPriceWithTax = price * (1 + tax);
    const loanAmount = Math.max(0, totalPriceWithTax - buyDown);
    const monthlyInterestRate = buyApr / 12;
    
    let buyMonthlyPayment = 0;
    if (loanAmount > 0 && monthlyInterestRate > 0) {
      buyMonthlyPayment = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months)) / (Math.pow(1 + monthlyInterestRate, months) - 1);
    } else if (loanAmount > 0) {
      buyMonthlyPayment = loanAmount / months;
    }

    const totalBuyPayments = buyMonthlyPayment * months;
    const totalBuyOutOfPocket = buyDown + totalBuyPayments;

    // Buying Tax Write-off (Depreciation + Interest if Business)
    const totalLoanInterest = totalBuyPayments - loanAmount;
    const totalDepreciation = Math.max(0, price - resaleVal);
    const buyTaxDeduction = isBusinessUse ? (totalDepreciation + totalLoanInterest) * bizTaxRate : 0;

    // Net True Cost to Buy (Out of Pocket - Resale Equity - Tax Write-Offs)
    const netBuyCost = totalBuyOutOfPocket - resaleVal - buyTaxDeduction;

    // 2. LEASING CALCULATION
    const leaseDown = parseFloat(leaseDownPayment) || 0;
    const leaseMonthly = parseFloat(leaseMonthlyPayment) || 0;
    const acqFee = parseFloat(leaseAcquisitionFee) || 0;
    const dispFee = parseFloat(leaseDispositionFee) || 0;

    // Lease monthly payment typically already includes tax or gets taxed monthly
    const totalLeaseMonthlyPayments = (leaseMonthly * (1 + tax)) * months;
    const totalLeaseOutOfPocket = leaseDown + acqFee + totalLeaseMonthlyPayments + dispFee;

    // Opportunity Cost Difference (If Buying down payment was higher, user lost interest on the difference)
    const downPaymentDiff = buyDown - leaseDown;
    let opportunityCost = 0;
    if (downPaymentDiff > 0 && invReturn > 0) {
      opportunityCost = downPaymentDiff * (Math.pow(1 + invReturn, years) - 1);
    }

    // Lease Tax Write-off (100% of lease payments deductible for business)
    const leaseTaxDeduction = isBusinessUse ? totalLeaseOutOfPocket * bizTaxRate : 0;

    // Net True Cost to Lease (Total Paid + Opportunity Cost - Tax Write-Offs)
    const netLeaseCost = totalLeaseOutOfPocket + opportunityCost - leaseTaxDeduction;

    // Verdict
    const diff = Math.abs(netBuyCost - netLeaseCost);
    const winner = netBuyCost < netLeaseCost ? "buy" : "lease";

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return {
      buyMonthlyPayment,
      totalBuyOutOfPocket,
      resaleVal,
      buyTaxDeduction,
      netBuyCost,

      totalLeaseOutOfPocket,
      opportunityCost,
      leaseTaxDeduction,
      netLeaseCost,

      winner,
      diff,
      formatCurrency
    };
  }, [
    carPrice, termMonths, salesTax, buyDownPayment, buyInterestRate, 
    estimatedResaleValue, leaseDownPayment, leaseMonthlyPayment, 
    leaseAcquisitionFee, leaseDispositionFee, isBusinessUse, taxRate, 
    investmentReturnRate
  ]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-indigo-100 via-sky-50 to-transparent dark:from-indigo-900/30 dark:via-sky-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-sky-500 p-3.5 rounded-2xl shadow-md">
            <ArrowRightLeft className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Lease vs. Buy Financial Oracle
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              True Equity & Tax-Adjusted Vehicle Cost Comparison
            </p>
          </div>
        </div>
      </div>

      {/* VERDICT WINNER BANNER */}
      <div className={`p-6 rounded-3xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
        calculations.winner === "buy" 
          ? "bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800" 
          : "bg-sky-50/80 dark:bg-sky-900/20 border-sky-300 dark:border-sky-800"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${
            calculations.winner === "buy" ? "bg-emerald-500 text-white" : "bg-sky-500 text-white"
          }`}>
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                calculations.winner === "buy" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" : "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200"
              }`}>
                Financial Verdict
              </span>
              <span className="text-xs font-bold text-slate-500">Over {termMonths} Months</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
              {calculations.winner === "buy" ? "Buying is the Smarter Choice" : "Leasing is More Cost-Effective"}
            </h3>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
              {calculations.winner === "buy" 
                ? `You save approx. ${calculations.formatCurrency(calculations.diff)} in true net cost by building resale equity.`
                : `You save approx. ${calculations.formatCurrency(calculations.diff)} in total out-of-pocket cashflow and depreciation risks.`
              }
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Common Vehicle Info */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Car className="w-3.5 h-3.5 text-indigo-500" /> 1. Vehicle Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Vehicle Price</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-indigo-500 transition-all overflow-hidden">
                    <span className="pl-3 text-sm font-black text-slate-400">$</span>
                    <input
                      type="text" value={carPrice} onChange={(e) => handleNumInput(setCarPrice, e.target.value)}
                      className="w-full bg-transparent px-2 py-3 text-base font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Term Duration</label>
                  <select 
                    value={termMonths} onChange={(e) => setTermMonths(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-sm font-black text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="24">24 Months (2 Yrs)</option>
                    <option value="36">36 Months (3 Yrs)</option>
                    <option value="48">48 Months (4 Yrs)</option>
                    <option value="60">60 Months (5 Yrs)</option>
                    <option value="72">72 Months (6 Yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Sales Tax Rate</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-indigo-500 transition-all overflow-hidden">
                    <input
                      type="text" value={salesTax} onChange={(e) => handleNumInput(setSalesTax, e.target.value, 30)}
                      className="w-full bg-transparent px-3 py-3 text-base font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums text-right"
                    />
                    <span className="pr-3 pl-1 text-sm font-black text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Buying Parameters */}
            <div className="space-y-4 p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 border-b border-emerald-200/60 dark:border-emerald-800/60 pb-2">
                <Landmark className="w-3.5 h-3.5" /> 2. Buying & Financing Scenario
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Down Payment</label>
                  <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <span className="pl-2.5 text-xs font-bold text-slate-400">$</span>
                    <input type="text" value={buyDownPayment} onChange={(e) => handleNumInput(setBuyDownPayment, e.target.value)} className="w-full bg-transparent px-2 py-2 text-sm font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Loan Interest (APR)</label>
                  <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <input type="text" value={buyInterestRate} onChange={(e) => handleNumInput(setBuyInterestRate, e.target.value, 30)} className="w-full bg-transparent px-2 py-2 text-sm font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums text-right" />
                    <span className="pr-2 pl-1 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1 block">Est. Resale Equity</label>
                  <div className="relative flex items-center bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg overflow-hidden">
                    <span className="pl-2.5 text-xs font-bold text-slate-400">$</span>
                    <input type="text" value={estimatedResaleValue} onChange={(e) => handleNumInput(setEstimatedResaleValue, e.target.value)} className="w-full bg-transparent px-2 py-2 text-sm font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Leasing Parameters */}
            <div className="space-y-4 p-5 rounded-2xl bg-sky-50/40 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800/50">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-sky-700 dark:text-sky-400 flex items-center gap-1.5 border-b border-sky-200/60 dark:border-sky-800/60 pb-2">
                <Key className="w-3.5 h-3.5" /> 3. Leasing Scenario
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Lease Down Payment</label>
                  <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <span className="pl-2.5 text-xs font-bold text-slate-400">$</span>
                    <input type="text" value={leaseDownPayment} onChange={(e) => handleNumInput(setLeaseDownPayment, e.target.value)} className="w-full bg-transparent px-2 py-2 text-sm font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Monthly Lease Rate</label>
                  <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <span className="pl-2.5 text-xs font-bold text-slate-400">$</span>
                    <input type="text" value={leaseMonthlyPayment} onChange={(e) => handleNumInput(setLeaseMonthlyPayment, e.target.value)} className="w-full bg-transparent px-2 py-2 text-sm font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Acquisition Fee</label>
                  <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <span className="pl-2.5 text-xs font-bold text-slate-400">$</span>
                    <input type="text" value={leaseAcquisitionFee} onChange={(e) => handleNumInput(setLeaseAcquisitionFee, e.target.value)} className="w-full bg-transparent px-2 py-2 text-sm font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Disposition Fee</label>
                  <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <span className="pl-2.5 text-xs font-bold text-slate-400">$</span>
                    <input type="text" value={leaseDispositionFee} onChange={(e) => handleNumInput(setLeaseDispositionFee, e.target.value)} className="w-full bg-transparent px-2 py-2 text-sm font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums" />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Advanced Options (Business & Opportunity Cost) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-indigo-500" />
                  <div>
                    <span className="block text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Business Use Tax Write-Off</span>
                    <span className="text-[10px] text-slate-400 block">Deduct lease payments or buying depreciation</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBusinessUse(!isBusinessUse)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${isBusinessUse ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isBusinessUse ? "translate-x-6" : "translate-x-0"}`}></div>
                </button>
              </div>

              {isBusinessUse && (
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-4 animate-in fade-in">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Your Business Tax Rate Bracket:</span>
                  <div className="relative w-24">
                    <input type="text" value={taxRate} onChange={(e) => handleNumInput(setTaxRate, e.target.value, 100)} className="w-full bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-lg px-2 py-1.5 text-sm font-black text-center outline-none tabular-nums" />
                    <span className="absolute right-2 top-1.5 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE SIDE-BY-SIDE LEDGER ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[700px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <PieChart className="w-4 h-4 text-indigo-500" /> Financial Comparison
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                  {termMonths} Months
                </span>
              </div>

              {/* SIDE BY SIDE LEDGER TABLE */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 shadow-sm space-y-4">
                
                {/* Header Row */}
                <div className="grid grid-cols-3 text-[9px] font-black uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-left pl-2">Metric</div>
                  <div className="text-emerald-600 dark:text-emerald-400">Buying</div>
                  <div className="text-sky-600 dark:text-sky-400">Leasing</div>
                </div>

                <div className="space-y-3 text-xs font-medium">
                  
                  {/* Monthly Payment */}
                  <div className="grid grid-cols-3 items-center py-2 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-500 font-bold">Monthly Payment</span>
                    <span className="text-center font-black tabular-nums text-slate-800 dark:text-slate-100">{calculations.formatCurrency(calculations.buyMonthlyPayment)}</span>
                    <span className="text-center font-black tabular-nums text-slate-800 dark:text-slate-100">{calculations.formatCurrency(parseFloat(leaseMonthlyPayment) || 0)}</span>
                  </div>

                  {/* Out of Pocket Total */}
                  <div className="grid grid-cols-3 items-center py-2 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-500 font-bold">Out of Pocket Cash</span>
                    <span className="text-center font-bold tabular-nums text-slate-600 dark:text-slate-400">{calculations.formatCurrency(calculations.totalBuyOutOfPocket)}</span>
                    <span className="text-center font-bold tabular-nums text-slate-600 dark:text-slate-400">{calculations.formatCurrency(calculations.totalLeaseOutOfPocket)}</span>
                  </div>

                  {/* Resale Equity (Buy Only) */}
                  <div className="grid grid-cols-3 items-center py-2 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Resale Equity</span>
                    <span className="text-center font-black tabular-nums text-emerald-600 dark:text-emerald-400">− {calculations.formatCurrency(calculations.resaleVal)}</span>
                    <span className="text-center text-slate-300 dark:text-slate-700 font-bold">$0 (None)</span>
                  </div>

                  {/* Opportunity Cost (Lease factor) */}
                  {calculations.opportunityCost > 0 && (
                    <div className="grid grid-cols-3 items-center py-2 border-b border-slate-50 dark:border-slate-800/50">
                      <span className="text-slate-500 font-bold">Opportunity Cost</span>
                      <span className="text-center text-slate-300 dark:text-slate-700 font-bold">$0</span>
                      <span className="text-center font-bold tabular-nums text-rose-500">+{calculations.formatCurrency(calculations.opportunityCost)}</span>
                    </div>
                  )}

                  {/* Tax Deductions (Business Only) */}
                  {isBusinessUse && (
                    <div className="grid grid-cols-3 items-center py-2 border-b border-slate-50 dark:border-slate-800/50 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-lg">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold pl-1">Tax Write-Off</span>
                      <span className="text-center font-black tabular-nums text-indigo-600 dark:text-indigo-400">− {calculations.formatCurrency(calculations.buyTaxDeduction)}</span>
                      <span className="text-center font-black tabular-nums text-indigo-600 dark:text-indigo-400">− {calculations.formatCurrency(calculations.leaseTaxDeduction)}</span>
                    </div>
                  )}

                  {/* TRUE NET COST HERO ROW */}
                  <div className="grid grid-cols-3 items-center py-4 bg-slate-100 dark:bg-slate-800 rounded-xl mt-4">
                    <span className="text-slate-800 dark:text-slate-100 font-black uppercase text-[10px] tracking-widest pl-2">True Net Cost</span>
                    <span className={`text-center font-black text-base tabular-nums ${calculations.winner === "buy" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                      {calculations.formatCurrency(calculations.netBuyCost)}
                    </span>
                    <span className={`text-center font-black text-base tabular-nums ${calculations.winner === "lease" ? "text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-300"}`}>
                      {calculations.formatCurrency(calculations.netLeaseCost)}
                    </span>
                  </div>

                </div>

                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-medium text-center">
                  *True Net Cost = (Total Cash Paid) − (Resale Equity) + (Opportunity Cost) − (Business Tax Deductions)
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
