"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Home, Landmark, Calculator, Percent, 
  DollarSign, ShieldCheck, PieChart, 
  CalendarDays, TrendingUp, AlertCircle, 
  Receipt, Wallet
} from "lucide-react";

export default function PropertyTaxEstimator() {
  const [isMounted, setIsMounted] = useState(false);

  const [marketValue, setMarketValue] = useState("350000");
  const [assessmentRatio, setAssessmentRatio] = useState("100");
  const [taxRate, setTaxRate] = useState("1.25");
  const [exemptions, setExemptions] = useState("0");

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
    const marketVal = parseFloat(marketValue) || 0;
    const ratio = parseFloat(assessmentRatio) || 100;
    const rate = parseFloat(taxRate) || 0;
    const exempt = parseFloat(exemptions) || 0;

    const assessedValue = marketVal * (ratio / 100);
    const taxableValue = Math.max(0, assessedValue - exempt);

    const annualTax = taxableValue * (rate / 100);
    const monthlyEscrow = annualTax / 12;
    const biAnnualTax = annualTax / 2;

    const effectiveTaxRate = marketVal > 0 ? (annualTax / marketVal) * 100 : 0;
    const taxSavedByExemptions = (Math.min(exempt, assessedValue)) * (rate / 100);

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return {
      marketVal, assessedValue, taxableValue,
      annualTax, monthlyEscrow, biAnnualTax,
      effectiveTaxRate, taxSavedByExemptions,
      formatCurrency
    };
  }, [marketValue, assessmentRatio, taxRate, exemptions]);

  if (!isMounted) return null;

  const baseInputStyle = "w-full min-w-0 bg-surface border border-line rounded-xl px-3 py-2.5 text-base font-bold text-ink outline-none focus:border-brand tabular-nums";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              Property Tax Estimator
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              Assessed Value & Escrow Analytics
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start min-w-0">
        
        {/* CONFIGURATION */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* Market Value */}
            <div className="space-y-2.5 min-w-0">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                <Home className="w-3.5 h-3.5 text-brand shrink-0" /> 1. Home Market Value
              </label>
              
              <div className="relative flex items-center bg-paper border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden min-w-0">
                <span className="pl-4 sm:pl-5 text-xl sm:text-2xl font-black text-muted">$</span>
                <input
                  type="text" value={marketValue} onChange={(e) => handleNumInput(setMarketValue, e.target.value)}
                  placeholder="0.00"
                  className="w-full min-w-0 bg-transparent px-2.5 py-3.5 sm:py-4 text-2xl sm:text-3xl font-black text-ink outline-none tabular-nums"
                />
              </div>
            </div>

            <hr className="border-line" />

            {/* Assessment Details */}
            <div className="space-y-4 min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-brand shrink-0" /> 2. Assessment & Tax Rate
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                <div className="bg-paper p-3.5 rounded-xl border border-line min-w-0">
                  <label className="block text-[8px] font-bold text-muted uppercase tracking-widest mb-1 truncate">
                    Assessment Ratio (%)
                  </label>
                  <div className="relative flex items-center min-w-0">
                    <input 
                      type="text" value={assessmentRatio} onChange={(e) => handleNumInput(setAssessmentRatio, e.target.value, 100)} 
                      className={`${baseInputStyle} pr-7`} 
                    />
                    <span className="absolute right-3 text-xs font-bold text-muted pointer-events-none">%</span>
                  </div>
                </div>

                <div className="bg-paper p-3.5 rounded-xl border border-line min-w-0">
                  <label className="block text-[8px] font-bold text-muted uppercase tracking-widest mb-1 truncate">
                    Local Tax Rate (%)
                  </label>
                  <div className="relative flex items-center min-w-0">
                    <input 
                      type="text" value={taxRate} onChange={(e) => handleNumInput(setTaxRate, e.target.value, 100)} 
                      className={`${baseInputStyle} pr-7`} 
                    />
                    <span className="absolute right-3 text-xs font-bold text-muted pointer-events-none">%</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-line" />

            {/* Exemptions */}
            <div className="space-y-3 p-4 rounded-xl bg-paper border border-line min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-teal flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <Wallet className="w-3.5 h-3.5 shrink-0" /> 3. Deductions & Exemptions
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between min-w-0">
                <p className="text-[10px] font-medium text-muted leading-snug truncate">
                  Homestead/Senior/Veteran deduction ($)
                </p>
                <div className="relative flex items-center w-full sm:w-32 shrink-0">
                  <span className="pl-3 text-sm font-bold text-muted absolute left-0">$</span>
                  <input 
                    type="text" value={exemptions} onChange={(e) => handleNumInput(setExemptions, e.target.value)} 
                    placeholder="0" className={`${baseInputStyle} pl-7`} 
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD / RECEIPT */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[500px] min-w-0">
            
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <Receipt className="w-4 h-4 text-brand shrink-0" /> Tax Estimate Receipt
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0">
                Annual
              </span>
            </div>

            {calculations.taxSavedByExemptions > 0 && (
              <div className="bg-teal/10 border border-teal/30 p-2.5 rounded-xl flex items-start gap-2 mb-4 shrink-0 min-w-0">
                <ShieldCheck className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-teal truncate">Exemption Savings Applied</span>
                  <p className="text-[9px] font-medium text-muted mt-0.5 truncate">Saving {calculations.formatCurrency(calculations.taxSavedByExemptions)} annually.</p>
                </div>
              </div>
            )}

            {/* HERO METRIC: ANNUAL TAX */}
            <div className="text-center bg-paper border border-line py-5 px-4 rounded-xl shadow-sm mb-4 relative overflow-hidden shrink-0 min-w-0">
              <span className="block text-[9px] font-black uppercase tracking-widest text-muted mb-1 truncate">
                Estimated Annual Property Tax
              </span>
              <span className="text-3xl sm:text-4xl font-black text-brand tracking-tight tabular-nums leading-none block truncate">
                {calculations.formatCurrency(calculations.annualTax)}
              </span>
              
              <div className="mt-3 flex justify-center min-w-0">
                <div className="bg-surface border border-line px-2.5 py-1 rounded-lg flex items-center gap-1.5 truncate">
                  <PieChart className="w-3 h-3 text-muted shrink-0" />
                  <span className="text-[9px] font-bold text-muted uppercase tracking-wider truncate">Effective Rate:</span>
                  <span className="text-[10px] font-black text-ink tabular-nums">{calculations.effectiveTaxRate.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* PAYMENT SCHEDULE */}
            <div className="grid grid-cols-2 gap-2.5 mb-4 shrink-0 min-w-0">
              <div className="bg-paper border border-line p-3 rounded-xl flex flex-col items-center justify-center text-center min-w-0">
                <span className="text-[8px] font-black uppercase tracking-wider text-muted mb-0.5 truncate flex items-center gap-1"><CalendarDays className="w-3 h-3 shrink-0"/> Monthly Escrow</span>
                <span className="text-base sm:text-lg font-black tabular-nums text-brand truncate">{calculations.formatCurrency(calculations.monthlyEscrow)}</span>
              </div>
              <div className="bg-paper border border-line p-3 rounded-xl flex flex-col items-center justify-center text-center min-w-0">
                <span className="text-[8px] font-black uppercase tracking-wider text-muted mb-0.5 truncate flex items-center gap-1"><TrendingUp className="w-3 h-3 shrink-0"/> Bi-Annual Bill</span>
                <span className="text-base sm:text-lg font-black tabular-nums text-ink truncate">{calculations.formatCurrency(calculations.biAnnualTax)}</span>
              </div>
            </div>

            {/* DETAILED VALUATION LEDGER */}
            <div className="flex-1 flex flex-col min-h-0 bg-paper rounded-xl border border-line p-2 shadow-sm min-w-0 text-xs">
              
              <div className="flex text-[9px] font-black uppercase tracking-widest text-muted px-3 pb-2 pt-2 border-b border-line shrink-0 min-w-0">
                <div className="flex-1 truncate">Valuation Line</div>
                <div className="w-1/3 text-right truncate">Amount</div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pt-1 space-y-0.5 min-w-0">
                
                {/* Market Value */}
                <div className="flex items-center px-3 py-2 border-b border-line/50 min-w-0">
                  <div className="flex-1 min-w-0 truncate">
                    <span className="font-bold text-muted truncate block">Market Value</span>
                  </div>
                  <div className="w-1/3 text-right font-black tabular-nums text-ink shrink-0">{calculations.formatCurrency(calculations.marketVal)}</div>
                </div>

                {/* Assessed Value */}
                <div className="flex items-center px-3 py-2 bg-surface/50 border-b border-line/50 min-w-0">
                  <div className="flex-1 min-w-0 truncate">
                    <span className="font-black text-ink block truncate">Assessed Value</span>
                    <span className="text-[8px] font-bold text-muted truncate block">Ratio {assessmentRatio}%</span>
                  </div>
                  <div className="w-1/3 text-right font-black tabular-nums text-ink shrink-0">{calculations.formatCurrency(calculations.assessedValue)}</div>
                </div>

                {/* Exemptions */}
                <div className="flex items-center px-3 py-2 border-b border-line/50 min-w-0">
                  <div className="flex-1 min-w-0 truncate">
                    <span className="font-bold text-teal truncate block">Less Exemptions</span>
                  </div>
                  <div className="w-1/3 text-right font-black tabular-nums text-teal shrink-0">− {calculations.formatCurrency(parseFloat(exemptions) || 0)}</div>
                </div>

                {/* Taxable Value */}
                <div className="flex items-center px-3 py-2.5 bg-surface rounded-lg mt-1 min-w-0">
                  <div className="flex-1 min-w-0 truncate">
                    <span className="text-[9px] font-black uppercase tracking-wider text-brand block truncate">Net Taxable</span>
                  </div>
                  <div className="w-1/3 text-right font-black tabular-nums text-brand shrink-0 text-sm">{calculations.formatCurrency(calculations.taxableValue)}</div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}