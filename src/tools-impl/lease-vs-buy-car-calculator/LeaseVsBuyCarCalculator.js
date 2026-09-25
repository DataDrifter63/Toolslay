"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Car, Key, Landmark, DollarSign, 
  TrendingUp, Percent, CheckCircle2, ShieldCheck, 
  HelpCircle, PieChart, Calculator, AlertCircle, ArrowRightLeft, Briefcase
} from "lucide-react";

export default function LeaseVsBuyCarCalculator() {
  const [isMounted, setIsMounted] = useState(false);

  const [carPrice, setCarPrice] = useState("40000");
  const [termMonths, setTermMonths] = useState("36");
  const [salesTax, setSalesTax] = useState("7");

  const [buyDownPayment, setBuyDownPayment] = useState("5000");
  const [buyInterestRate, setBuyInterestRate] = useState("6.5");
  const [estimatedResaleValue, setEstimatedResaleValue] = useState("22000");

  const [leaseDownPayment, setLeaseDownPayment] = useState("3000");
  const [leaseMonthlyPayment, setLeaseMonthlyPayment] = useState("450");
  const [leaseAcquisitionFee, setLeaseAcquisitionFee] = useState("895");
  const [leaseDispositionFee, setLeaseDispositionFee] = useState("395");

  const [isBusinessUse, setIsBusinessUse] = useState(false);
  const [taxRate, setTaxRate] = useState("25");
  const [investmentReturnRate, setInvestmentReturnRate] = useState("6");

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

  const calculations = useMemo(() => {
    const price = parseFloat(carPrice) || 0;
    const months = parseInt(termMonths) || 36;
    const years = months / 12;
    const tax = (parseFloat(salesTax) || 0) / 100;
    const invReturn = (parseFloat(investmentReturnRate) || 0) / 100;
    const bizTaxRate = isBusinessUse ? ((parseFloat(taxRate) || 0) / 100) : 0;

    const buyDown = parseFloat(buyDownPayment) || 0;
    const buyApr = (parseFloat(buyInterestRate) || 0) / 100;
    const resaleVal = parseFloat(estimatedResaleValue) || 0;

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

    const totalLoanInterest = totalBuyPayments - loanAmount;
    const totalDepreciation = Math.max(0, price - resaleVal);
    const buyTaxDeduction = isBusinessUse ? (totalDepreciation + totalLoanInterest) * bizTaxRate : 0;
    const netBuyCost = totalBuyOutOfPocket - resaleVal - buyTaxDeduction;

    const leaseDown = parseFloat(leaseDownPayment) || 0;
    const leaseMonthly = parseFloat(leaseMonthlyPayment) || 0;
    const acqFee = parseFloat(leaseAcquisitionFee) || 0;
    const dispFee = parseFloat(leaseDispositionFee) || 0;

    const totalLeaseMonthlyPayments = (leaseMonthly * (1 + tax)) * months;
    const totalLeaseOutOfPocket = leaseDown + acqFee + totalLeaseMonthlyPayments + dispFee;

    const downPaymentDiff = buyDown - leaseDown;
    let opportunityCost = 0;
    if (downPaymentDiff > 0 && invReturn > 0) {
      opportunityCost = downPaymentDiff * (Math.pow(1 + invReturn, years) - 1);
    }

    const leaseTaxDeduction = isBusinessUse ? totalLeaseOutOfPocket * bizTaxRate : 0;
    const netLeaseCost = totalLeaseOutOfPocket + opportunityCost - leaseTaxDeduction;

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

  const baseInputStyle = "w-full min-w-0 bg-surface border border-line rounded-lg px-2.5 py-2 text-xs sm:text-sm font-bold text-ink outline-none focus:border-brand tabular-nums";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* UNIFIED COMPACT TOP BAR (Merged Title & Dynamic Verdict Pill) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface border border-line px-5 py-4 rounded-2xl shadow-card min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-brand/15 text-brand p-2.5 rounded-xl shrink-0">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Lease vs. Buy Financial Oracle
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted truncate">
              True Equity & Tax-Adjusted Comparison ({termMonths} Mos)
            </p>
          </div>
        </div>

        {/* Integrated Sleek Verdict Badge */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border shrink-0 ${
          calculations.winner === "buy" 
            ? "bg-teal/10 border-teal/30 text-teal" 
            : "bg-brand/10 border-brand/30 text-brand"
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="text-xs font-black uppercase tracking-wider">
            {calculations.winner === "buy" ? "Buy Recommended" : "Lease Recommended"}
          </span>
          <span className="text-[10px] font-bold opacity-80 pl-1 border-l border-current/20">
            Saves {calculations.formatCurrency(calculations.diff)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start min-w-0">
        
        {/* CONFIGURATION ENGINE */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* Common Vehicle Info */}
            <div className="space-y-3 min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <Car className="w-3.5 h-3.5 text-brand shrink-0" /> 1. Vehicle Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Vehicle Price</label>
                  <div className="relative flex items-center min-w-0">
                    <span className="absolute left-3 text-xs font-black text-muted pointer-events-none">$</span>
                    <input type="text" value={carPrice} onChange={(e) => handleNumInput(setCarPrice, e.target.value)} className={`${baseInputStyle} pl-7`} />
                  </div>
                </div>
                
                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Term Duration</label>
                  <select 
                    value={termMonths} onChange={(e) => setTermMonths(e.target.value)}
                    className={`${baseInputStyle} cursor-pointer truncate`}
                  >
                    <option value="24">24 Mos (2 Yr)</option>
                    <option value="36">36 Mos (3 Yr)</option>
                    <option value="48">48 Mos (4 Yr)</option>
                    <option value="60">60 Mos (5 Yr)</option>
                    <option value="72">72 Mos (6 Yr)</option>
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Sales Tax Rate</label>
                  <div className="relative flex items-center min-w-0">
                    <input type="text" value={salesTax} onChange={(e) => handleNumInput(setSalesTax, e.target.value, 30)} className={`${baseInputStyle} pr-7 text-right`} />
                    <span className="absolute right-2.5 text-xs font-black text-muted pointer-events-none">%</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-line" />

            {/* Buying Parameters */}
            <div className="space-y-3 p-4 rounded-xl bg-paper border border-line min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-teal flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <Landmark className="w-3.5 h-3.5 shrink-0" /> 2. Buying Scenario
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Down Payment</label>
                  <div className="relative flex items-center min-w-0">
                    <span className="absolute left-2.5 text-xs font-bold text-muted">$</span>
                    <input type="text" value={buyDownPayment} onChange={(e) => handleNumInput(setBuyDownPayment, e.target.value)} className={`${baseInputStyle} pl-6`} />
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Loan APR</label>
                  <div className="relative flex items-center min-w-0">
                    <input type="text" value={buyInterestRate} onChange={(e) => handleNumInput(setBuyInterestRate, e.target.value, 30)} className={`${baseInputStyle} pr-6 text-right`} />
                    <span className="absolute right-2 text-xs font-bold text-muted">%</span>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-teal uppercase tracking-widest mb-1 block truncate">Est. Resale Equity</label>
                  <div className="relative flex items-center min-w-0">
                    <span className="absolute left-2.5 text-xs font-bold text-muted">$</span>
                    <input type="text" value={estimatedResaleValue} onChange={(e) => handleNumInput(setEstimatedResaleValue, e.target.value)} className={`${baseInputStyle} pl-6 border-teal/40`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Leasing Parameters */}
            <div className="space-y-3 p-4 rounded-xl bg-paper border border-line min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-brand flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <Key className="w-3.5 h-3.5 shrink-0" /> 3. Leasing Scenario
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Lease Down Payment</label>
                  <div className="relative flex items-center min-w-0">
                    <span className="absolute left-2.5 text-xs font-bold text-muted">$</span>
                    <input type="text" value={leaseDownPayment} onChange={(e) => handleNumInput(setLeaseDownPayment, e.target.value)} className={`${baseInputStyle} pl-6`} />
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Monthly Lease Rate</label>
                  <div className="relative flex items-center min-w-0">
                    <span className="absolute left-2.5 text-xs font-bold text-muted">$</span>
                    <input type="text" value={leaseMonthlyPayment} onChange={(e) => handleNumInput(setLeaseMonthlyPayment, e.target.value)} className={`${baseInputStyle} pl-6`} />
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Acquisition Fee</label>
                  <div className="relative flex items-center min-w-0">
                    <span className="absolute left-2.5 text-xs font-bold text-muted">$</span>
                    <input type="text" value={leaseAcquisitionFee} onChange={(e) => handleNumInput(setLeaseAcquisitionFee, e.target.value)} className={`${baseInputStyle} pl-6`} />
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Disposition Fee</label>
                  <div className="relative flex items-center min-w-0">
                    <span className="absolute left-2.5 text-xs font-bold text-muted">$</span>
                    <input type="text" value={leaseDispositionFee} onChange={(e) => handleNumInput(setLeaseDispositionFee, e.target.value)} className={`${baseInputStyle} pl-6`} />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-line" />

            {/* Advanced Options */}
            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-paper border border-line min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Briefcase className="w-4 h-4 text-brand shrink-0" />
                  <div className="min-w-0 truncate">
                    <span className="block text-[10px] font-black text-ink uppercase tracking-wider truncate">Business Use Deduction</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsBusinessUse(!isBusinessUse)}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 shrink-0 ${isBusinessUse ? "bg-brand" : "bg-line"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-surface transition-transform ${isBusinessUse ? "translate-x-5" : "translate-x-0"}`}></div>
                </button>
              </div>

              {isBusinessUse && (
                <div className="p-3.5 rounded-xl bg-paper border border-line flex items-center justify-between gap-3 text-xs min-w-0">
                  <span className="font-bold text-muted truncate">Biz Tax Rate Bracket:</span>
                  <div className="relative w-20 shrink-0">
                    <input type="text" value={taxRate} onChange={(e) => handleNumInput(setTaxRate, e.target.value, 100)} className={`${baseInputStyle} pr-6 text-center`} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">%</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* SIDE-BY-SIDE LEDGER */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[500px] min-w-0">
            
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <PieChart className="w-4 h-4 text-brand shrink-0" /> Financial Comparison
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0">
                {termMonths} Mos
              </span>
            </div>

            {/* SIDE BY SIDE LEDGER TABLE */}
            <div className="flex-1 flex flex-col min-h-0 bg-paper rounded-xl border border-line p-3 shadow-sm space-y-3 min-w-0 text-xs">
              
              {/* Header Row */}
              <div className="grid grid-cols-3 text-[9px] font-black uppercase tracking-widest text-muted pb-2 border-b border-line text-center min-w-0">
                <div className="text-left truncate">Metric</div>
                <div className="text-teal truncate">Buying</div>
                <div className="text-brand truncate">Leasing</div>
              </div>

              <div className="space-y-2.5 min-w-0">
                
                {/* Monthly Payment */}
                <div className="grid grid-cols-3 items-center py-1.5 border-b border-line/50 min-w-0">
                  <span className="text-muted font-bold truncate">Monthly</span>
                  <span className="text-center font-black tabular-nums text-ink truncate">{calculations.formatCurrency(calculations.buyMonthlyPayment)}</span>
                  <span className="text-center font-black tabular-nums text-ink truncate">{calculations.formatCurrency(parseFloat(leaseMonthlyPayment) || 0)}</span>
                </div>

                {/* Out of Pocket Total */}
                <div className="grid grid-cols-3 items-center py-1.5 border-b border-line/50 min-w-0">
                  <span className="text-muted font-bold truncate">Cash Paid</span>
                  <span className="text-center font-bold tabular-nums text-muted truncate">{calculations.formatCurrency(calculations.totalBuyOutOfPocket)}</span>
                  <span className="text-center font-bold tabular-nums text-muted truncate">{calculations.formatCurrency(calculations.totalLeaseOutOfPocket)}</span>
                </div>

                {/* Resale Equity */}
                <div className="grid grid-cols-3 items-center py-1.5 border-b border-line/50 min-w-0">
                  <span className="text-teal font-bold truncate">Equity</span>
                  <span className="text-center font-black tabular-nums text-teal truncate">− {calculations.formatCurrency(calculations.resaleVal)}</span>
                  <span className="text-center text-muted font-bold truncate">$0</span>
                </div>

                {/* Opportunity Cost */}
                {calculations.opportunityCost > 0 && (
                  <div className="grid grid-cols-3 items-center py-1.5 border-b border-line/50 min-w-0">
                    <span className="text-muted font-bold truncate">Opp. Cost</span>
                    <span className="text-center text-muted font-bold truncate">$0</span>
                    <span className="text-center font-bold tabular-nums text-[#e11d48] truncate">+{calculations.formatCurrency(calculations.opportunityCost)}</span>
                  </div>
                )}

                {/* Tax Deductions */}
                {isBusinessUse && (
                  <div className="grid grid-cols-3 items-center py-1.5 border-b border-line/50 bg-surface rounded-lg min-w-0">
                    <span className="text-brand font-bold pl-1 truncate">Tax Deduct</span>
                    <span className="text-center font-black tabular-nums text-brand truncate">− {calculations.formatCurrency(calculations.buyTaxDeduction)}</span>
                    <span className="text-center font-black tabular-nums text-brand truncate">− {calculations.formatCurrency(calculations.leaseTaxDeduction)}</span>
                  </div>
                )}

                {/* TRUE NET COST HERO ROW */}
                <div className="grid grid-cols-3 items-center py-3 bg-surface border border-line rounded-xl mt-3 min-w-0">
                  <span className="text-ink font-black uppercase text-[9px] tracking-widest pl-2 truncate">Net Cost</span>
                  <span className={`text-center font-black text-sm sm:text-base tabular-nums truncate ${calculations.winner === "buy" ? "text-teal" : "text-ink"}`}>
                    {calculations.formatCurrency(calculations.netBuyCost)}
                  </span>
                  <span className={`text-center font-black text-sm sm:text-base tabular-nums truncate ${calculations.winner === "lease" ? "text-brand" : "text-ink"}`}>
                    {calculations.formatCurrency(calculations.netLeaseCost)}
                  </span>
                </div>

              </div>

              <div className="mt-auto pt-2 border-t border-line/60 text-[8px] text-muted font-medium text-center truncate">
                *Net Cost = Cash Paid − Equity + Opp. Cost − Tax Deductions
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}