"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Car, TrendingDown, DollarSign, CalendarDays, 
  Key, ShieldCheck, Gem, BatteryCharging,
  Info, PieChart, Activity, AlertCircle, ArrowDownRight
} from "lucide-react";

export default function CarDepreciationCalculator() {
  const [isMounted, setIsMounted] = useState(false);

  const [price, setPrice] = useState("35000");
  const [condition, setCondition] = useState("new");
  const [brandTier, setBrandTier] = useState("standard");
  const [yearsToOwn, setYearsToOwn] = useState("5");

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
    const startPrice = parseFloat(price) || 0;
    const years = parseInt(yearsToOwn) || 0;
    
    const rates = {
      economy: { cliff: 0.15, mid: 0.10, late: 0.08, name: "Economy / Reliable" },
      standard: { cliff: 0.20, mid: 0.15, late: 0.10, name: "Standard" },
      luxury: { cliff: 0.25, mid: 0.18, late: 0.15, name: "Luxury / Premium" },
      ev: { cliff: 0.28, mid: 0.20, late: 0.12, name: "Electric Vehicle (EV)" }
    };

    const currentRates = rates[brandTier];
    let schedule = [];
    let currentVal = startPrice;
    let totalDepreciation = 0;

    for (let i = 1; i <= Math.min(years, 30); i++) {
      let depRate = 0;

      if (i === 1 && condition === "new") {
        depRate = currentRates.cliff;
      } else if (i <= 5) {
        depRate = currentRates.mid;
      } else {
        depRate = currentRates.late;
      }

      if (i === 1 && condition === "used") {
         depRate = currentRates.mid;
      }

      let dropAmt = currentVal * depRate;
      currentVal -= dropAmt;
      totalDepreciation += dropAmt;

      schedule.push({
        year: i,
        startVal: currentVal + dropAmt,
        dropAmt: dropAmt,
        endVal: currentVal,
        rateApplied: depRate * 100
      });
    }

    const finalValue = currentVal;
    const pctRetained = startPrice > 0 ? (finalValue / startPrice) * 100 : 0;
    const pctLost = startPrice > 0 ? (totalDepreciation / startPrice) * 100 : 0;

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return {
      startPrice, years, finalValue, totalDepreciation,
      schedule, pctRetained, pctLost, currentRates,
      formatCurrency
    };
  }, [price, condition, brandTier, yearsToOwn]);

  if (!isMounted) return null;

  const baseInputStyle = "w-full min-w-0 bg-paper border border-line rounded-xl px-3.5 py-3 text-base font-bold text-ink outline-none focus:border-brand tabular-nums";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              Auto Depreciation Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              Vehicle Value Retention Calculator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start min-w-0">
        
        {/* CONFIGURATION */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* Purchase Price Input */}
            <div className="space-y-2.5 min-w-0">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                <DollarSign className="w-3.5 h-3.5 text-brand shrink-0" /> 1. Purchase Price
              </label>
              
              <div className="relative flex items-center bg-paper border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden min-w-0">
                <span className="pl-4 sm:pl-5 text-xl sm:text-2xl font-black text-muted">$</span>
                <input
                  type="text" value={price} onChange={(e) => handleNumInput(setPrice, e.target.value)}
                  placeholder="0.00"
                  className="w-full min-w-0 bg-transparent px-2.5 py-3.5 sm:py-4 text-2xl sm:text-3xl font-black text-ink outline-none tabular-nums"
                />
              </div>
            </div>

            <hr className="border-line" />

            {/* Condition Toggle */}
            <div className="space-y-2.5 min-w-0">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                <Key className="w-3.5 h-3.5 text-brand shrink-0" /> 2. Vehicle Condition
              </label>
              <div className="flex bg-paper rounded-xl p-1 border border-line min-w-0 gap-1">
                <button 
                  type="button"
                  onClick={() => setCondition("new")}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-lg transition-all min-w-0 truncate ${condition === "new" ? "bg-surface text-brand shadow-sm border border-line" : "text-muted hover:text-ink"}`}
                >
                  <span className="text-[11px] font-black uppercase tracking-wider truncate">Brand New</span>
                  <span className="text-[8px] font-bold opacity-75 truncate">Year 1 Cliff</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setCondition("used")}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-lg transition-all min-w-0 truncate ${condition === "used" ? "bg-surface text-brand shadow-sm border border-line" : "text-muted hover:text-ink"}`}
                >
                  <span className="text-[11px] font-black uppercase tracking-wider truncate">Used / Pre-Owned</span>
                  <span className="text-[8px] font-bold opacity-75 truncate">Steadier Decline</span>
                </button>
              </div>
            </div>

            <hr className="border-line" />

            {/* Brand Tier Cards */}
            <div className="space-y-2.5 min-w-0">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-brand shrink-0" /> 3. Brand Depreciation Tier
              </label>
              <div className="grid grid-cols-2 gap-2.5 min-w-0">
                <button type="button" onClick={() => setBrandTier("economy")} className={`p-3 rounded-xl border transition-all flex flex-col items-start gap-1 min-w-0 truncate ${brandTier === "economy" ? "border-brand bg-brand/5 text-ink" : "border-line bg-paper text-muted hover:text-ink"}`}>
                  <ShieldCheck className={`w-3.5 h-3.5 ${brandTier === "economy" ? "text-brand" : "text-muted"}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider truncate w-full text-left">Economy</span>
                  <span className="text-[8px] font-bold text-muted truncate w-full text-left">Toyota, Honda</span>
                </button>
                <button type="button" onClick={() => setBrandTier("standard")} className={`p-3 rounded-xl border transition-all flex flex-col items-start gap-1 min-w-0 truncate ${brandTier === "standard" ? "border-brand bg-brand/5 text-ink" : "border-line bg-paper text-muted hover:text-ink"}`}>
                  <Car className={`w-3.5 h-3.5 ${brandTier === "standard" ? "text-brand" : "text-muted"}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider truncate w-full text-left">Standard</span>
                  <span className="text-[8px] font-bold text-muted truncate w-full text-left">Ford, Chevy</span>
                </button>
                <button type="button" onClick={() => setBrandTier("luxury")} className={`p-3 rounded-xl border transition-all flex flex-col items-start gap-1 min-w-0 truncate ${brandTier === "luxury" ? "border-brand bg-brand/5 text-ink" : "border-line bg-paper text-muted hover:text-ink"}`}>
                  <Gem className={`w-3.5 h-3.5 ${brandTier === "luxury" ? "text-brand" : "text-muted"}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider truncate w-full text-left">Luxury</span>
                  <span className="text-[8px] font-bold text-muted truncate w-full text-left">BMW, Audi</span>
                </button>
                <button type="button" onClick={() => setBrandTier("ev")} className={`p-3 rounded-xl border transition-all flex flex-col items-start gap-1 min-w-0 truncate ${brandTier === "ev" ? "border-brand bg-brand/5 text-ink" : "border-line bg-paper text-muted hover:text-ink"}`}>
                  <BatteryCharging className={`w-3.5 h-3.5 ${brandTier === "ev" ? "text-brand" : "text-muted"}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider truncate w-full text-left">Electric (EV)</span>
                  <span className="text-[8px] font-bold text-muted truncate w-full text-left">Tesla, Rivian</span>
                </button>
              </div>
            </div>

            <hr className="border-line" />

            {/* Ownership Period */}
            <div className="space-y-2.5 min-w-0">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                <CalendarDays className="w-3.5 h-3.5 text-brand shrink-0" /> 4. Ownership Duration
              </label>
              
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-paper border border-line min-w-0">
                <p className="text-[10px] font-medium text-muted truncate">
                  Years to keep vehicle
                </p>
                <div className="relative flex items-center w-24 shrink-0">
                  <input
                    type="text" value={yearsToOwn} onChange={(e) => handleNumInput(setYearsToOwn, e.target.value, 30)}
                    className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm font-black text-center text-ink outline-none tabular-nums"
                  />
                  <span className="pr-2.5 absolute right-0 text-[9px] font-bold text-muted uppercase pointer-events-none">Yrs</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD / LEDGER */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[500px] min-w-0">
            
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <Activity className="w-4 h-4 text-brand shrink-0" /> Valuation Summary
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0">
                Year {calculations.years}
              </span>
            </div>

            {condition === "new" && calculations.years > 0 && (
              <div className="bg-[#fb7185]/10 border border-[#fb7185]/30 p-2.5 rounded-xl flex items-start gap-2 mb-4 shrink-0 min-w-0">
                <AlertCircle className="w-3.5 h-3.5 text-[#e11d48] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-[#e11d48] truncate">Drive-Off Penalty</span>
                  <p className="text-[9px] font-medium text-muted mt-0.5 truncate">Year 1 drop is ~{calculations.currentRates.cliff * 100}%.</p>
                </div>
              </div>
            )}

            {/* HERO METRIC */}
            <div className="text-center bg-paper border border-line py-5 px-4 rounded-xl shadow-sm mb-4 relative overflow-hidden shrink-0 min-w-0">
              <span className="block text-[9px] font-black uppercase tracking-widest text-muted mb-1 truncate">
                Estimated Resale Value
              </span>
              <span className="text-3xl sm:text-4xl font-black text-brand tracking-tight tabular-nums leading-none block truncate">
                {calculations.formatCurrency(calculations.finalValue)}
              </span>
              
              {calculations.startPrice > 0 && (
                <div className="w-full px-2 mt-4 min-w-0">
                  <div className="flex h-2.5 rounded-full overflow-hidden bg-line">
                    {calculations.pctRetained > 0 && <div style={{ width: `${calculations.pctRetained}%` }} className="bg-brand"></div>}
                  </div>
                  <div className="flex justify-between mt-1 px-0.5 text-[8px] font-black uppercase tracking-widest text-muted min-w-0">
                    <span className="text-brand truncate">Retained ({calculations.pctRetained.toFixed(0)}%)</span>
                    <span className="text-[#e11d48] truncate">Lost ({calculations.pctLost.toFixed(0)}%)</span>
                  </div>
                </div>
              )}
            </div>

            {/* TOTAL LOSS SUMMARY */}
            <div className="flex items-center justify-between px-3.5 py-3 bg-[#fb7185]/10 border border-[#fb7185]/30 rounded-xl mb-4 shrink-0 text-xs min-w-0">
               <span className="font-black uppercase tracking-wider text-[#e11d48] flex items-center gap-1.5 truncate">
                 <TrendingDown className="w-3.5 h-3.5 shrink-0" /> Total Depreciation
               </span>
               <span className="font-black tabular-nums text-[#e11d48] shrink-0">
                 − {calculations.formatCurrency(calculations.totalDepreciation)}
               </span>
            </div>

            {/* DETAILED YEARLY LEDGER */}
            <div className="flex-1 flex flex-col min-h-0 bg-paper rounded-xl border border-line p-2 shadow-sm min-w-0">
              
              <div className="flex text-[9px] font-black uppercase tracking-widest text-muted px-2.5 pb-2 pt-2 border-b border-line shrink-0 min-w-0">
                <div className="w-14 truncate">Year</div>
                <div className="flex-1 truncate">Drop</div>
                <div className="w-1/3 text-right truncate text-ink">Left</div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pt-1 min-w-0 text-xs">
                {calculations.schedule.map((row, idx) => (
                  <div key={idx} className="flex items-center px-2.5 py-2.5 border-b border-line/50 hover:bg-surface/50 transition-colors min-w-0">
                    <div className="w-14 truncate">
                      <span className="text-[10px] font-black text-muted bg-surface px-1.5 py-0.5 rounded border border-line">Yr {row.year}</span>
                    </div>
                    <div className="flex-1 min-w-0 truncate pr-1">
                      <span className="font-bold tabular-nums text-[#e11d48] flex items-center gap-0.5 truncate text-[11px]">
                        <ArrowDownRight className="w-3 h-3 shrink-0" /> {calculations.formatCurrency(row.dropAmt)}
                      </span>
                    </div>
                    <div className="w-1/3 text-right shrink-0">
                      <span className="font-black tabular-nums text-ink text-[11px]">{calculations.formatCurrency(row.endVal)}</span>
                    </div>
                  </div>
                ))}
                
                {calculations.schedule.length === 0 && (
                   <div className="flex-1 flex items-center justify-center h-20 text-[10px] font-bold text-muted">
                     Enter duration.
                   </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}