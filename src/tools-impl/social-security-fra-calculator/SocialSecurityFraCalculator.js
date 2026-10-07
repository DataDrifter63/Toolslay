"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Award, Calendar, TrendingUp, AlertTriangle, 
  DollarSign, Clock, ShieldCheck, Scale, 
  Activity, CheckCircle2, PieChart, ArrowRight
} from "lucide-react";

export default function SocialSecurityFRACalculator() {
  const [isMounted, setIsMounted] = useState(false);

  const [birthYear, setBirthYear] = useState("1965");
  const [birthMonth, setBirthMonth] = useState("1");
  const [estimatedFraBenefit, setEstimatedFraBenefit] = useState("2000");
  const [claimAge, setClaimAge] = useState(67);
  const [lifeExpectancy, setLifeExpectancy] = useState("85");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNumInput = (setter, value, max = null) => {
    if (value === "") {
      setter("");
      return;
    }
    if (/^\d*$/.test(value)) {
      const num = parseInt(value, 10);
      if (max && num > max) return;
      setter(value);
    }
  };

  const calculations = useMemo(() => {
    const year = parseInt(birthYear) || 1960;
    const month = parseInt(birthMonth) || 1;
    const baseBenefit = parseFloat(estimatedFraBenefit) || 0;
    const selectedAge = parseFloat(claimAge) || 67;
    const maxAge = parseInt(lifeExpectancy) || 85;

    let fraYears = 67;
    let fraMonths = 0;

    if (year <= 1937) {
      fraYears = 65; fraMonths = 0;
    } else if (year >= 1938 && year <= 1942) {
      fraYears = 65; fraMonths = (year - 1937) * 2;
    } else if (year >= 1943 && year <= 1954) {
      fraYears = 66; fraMonths = 0;
    } else if (year >= 1955 && year <= 1959) {
      fraYears = 66; fraMonths = (year - 1954) * 2;
    } else {
      fraYears = 67; fraMonths = 0;
    }

    const totalFraMonths = (fraYears * 12) + fraMonths;
    const fraDecimalAge = fraYears + (fraMonths / 12);

    const fraDate = new Date(year + fraYears, (month - 1) + fraMonths, 1);
    const fraDateString = fraDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    const getMultiplierForAge = (ageInYears) => {
      const claimTotalMonths = Math.round(ageInYears * 12);
      const diffMonths = claimTotalMonths - totalFraMonths;

      if (diffMonths === 0) return 1.0;

      if (diffMonths < 0) {
        const monthsEarly = Math.abs(diffMonths);
        let reduction = 0;

        if (monthsEarly <= 36) {
          reduction = monthsEarly * (5 / 900);
        } else {
          reduction = (36 * (5 / 900)) + ((monthsEarly - 36) * (5 / 1200));
        }
        return Math.max(0, 1 - reduction);
      } else {
        const monthsDelayed = Math.min(diffMonths, (70 * 12) - totalFraMonths);
        const bonus = monthsDelayed * (8 / 1200);
        return 1 + Math.max(0, bonus);
      }
    };

    const benefitAt62 = baseBenefit * getMultiplierForAge(62);
    const benefitAtFra = baseBenefit;
    const benefitAt70 = baseBenefit * getMultiplierForAge(70);
    const benefitAtSelected = baseBenefit * getMultiplierForAge(selectedAge);

    const selectedMultiplier = getMultiplierForAge(selectedAge);
    const percentDifference = ((selectedMultiplier - 1) * 100).toFixed(1);

    let cumulative62 = 0;
    let cumulative70 = 0;
    let breakEvenAge70vs62 = null;

    for (let age = 62; age <= maxAge; age++) {
      const monthsInYear = 12;
      cumulative62 += benefitAt62 * monthsInYear;
      
      if (age >= 70) {
        cumulative70 += benefitAt70 * monthsInYear;
      }

      if (breakEvenAge70vs62 === null && age >= 70 && cumulative70 > cumulative62) {
        breakEvenAge70vs62 = age;
      }
    }

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return {
      fraYears, fraMonths, fraDecimalAge, fraDateString,
      benefitAt62, benefitAtFra, benefitAt70, benefitAtSelected,
      selectedMultiplier, percentDifference,
      breakEvenAge70vs62,
      formatCurrency
    };
  }, [birthYear, birthMonth, estimatedFraBenefit, claimAge, lifeExpectancy]);

  const baseInputStyle = "w-full min-w-0 bg-surface border border-line rounded-xl px-3 py-2.5 text-base font-bold text-ink outline-none focus:border-brand tabular-nums";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              Social Security FRA Oracle
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              Full Retirement Age & Benefit Multiplier Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start min-w-0">
        
        {/* CONFIGURATION ENGINE */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* Birth Date Inputs */}
            <div className="space-y-3 min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <Calendar className="w-3.5 h-3.5 text-brand shrink-0" /> 1. Date of Birth
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Birth Year</label>
                  <input
                    type="text" value={birthYear} onChange={(e) => handleNumInput(setBirthYear, e.target.value, 2010)}
                    placeholder="1960"
                    className={`${baseInputStyle} text-center`}
                  />
                </div>
                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Birth Month</label>
                  <select
                    value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}
                    className={`${baseInputStyle} cursor-pointer truncate`}
                  >
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, idx) => (
                      <option key={idx} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* FRA RESULT BANNER */}
            <div className="p-4 sm:p-5 rounded-xl bg-paper border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
              <div className="min-w-0 truncate">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand block truncate">Official FRA</span>
                <h4 className="text-xl sm:text-2xl font-black text-ink mt-0.5 truncate">
                  {calculations.fraYears}y {calculations.fraMonths > 0 ? `${calculations.fraMonths}m` : ""}
                </h4>
                <p className="text-[9px] font-bold text-muted mt-0.5 truncate">
                  100% full benefits in <strong>{calculations.fraDateString}</strong>
                </p>
              </div>
              <div className="bg-surface px-3.5 py-2 rounded-lg border border-line text-center shrink-0">
                <span className="block text-[8px] font-bold text-muted uppercase tracking-wider">Base</span>
                <span className="text-base font-black text-brand">100%</span>
              </div>
            </div>

            <hr className="border-line" />

            {/* Estimated Primary Insurance Amount (PIA) */}
            <div className="space-y-2.5 min-w-0">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                <DollarSign className="w-3.5 h-3.5 text-teal shrink-0" /> 2. Estimated FRA Monthly Benefit
              </label>
              
              <div className="relative flex items-center bg-paper border border-line rounded-xl focus-within:border-brand transition-all overflow-hidden min-w-0">
                <span className="pl-4 text-xl font-black text-muted pointer-events-none">$</span>
                <input
                  type="text" value={estimatedFraBenefit} onChange={(e) => handleNumInput(setEstimatedFraBenefit, e.target.value)}
                  placeholder="2000"
                  className="w-full min-w-0 bg-transparent px-2.5 py-3 text-2xl font-black text-ink outline-none tabular-nums"
                />
                <span className="pr-4 text-[9px] font-bold text-muted uppercase tracking-wider pointer-events-none">/mo</span>
              </div>
            </div>

            <hr className="border-line" />

            {/* Claiming Strategy Slider */}
            <div className="space-y-3 p-4 rounded-xl bg-paper border border-line min-w-0">
              <div className="flex items-center justify-between min-w-0">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 truncate">
                  <Clock className="w-3.5 h-3.5 text-brand shrink-0" /> Planned Claim Age
                </label>
                <span className="text-sm font-black text-brand bg-surface px-2.5 py-1 rounded-lg border border-line shrink-0 tabular-nums">
                  Age {claimAge}
                </span>
              </div>

              <input
                type="range" min="62" max="70" step="1"
                value={claimAge} onChange={(e) => setClaimAge(parseInt(e.target.value))}
                className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand"
              />

              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted px-0.5 truncate">
                <span className="truncate">62 (Earliest)</span>
                <span className="truncate">FRA ({calculations.fraYears}y)</span>
                <span className="truncate">70 (Max)</span>
              </div>
            </div>

            {/* Life Expectancy */}
            <div className="space-y-2 min-w-0">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 truncate">
                <Activity className="w-3.5 h-3.5 text-muted shrink-0" /> Life Expectancy (Break-Even)
              </label>
              <div className="relative flex items-center w-full sm:w-1/2 min-w-0">
                <input
                  type="text" value={lifeExpectancy} onChange={(e) => handleNumInput(setLifeExpectancy, e.target.value, 110)}
                  className={`${baseInputStyle} pr-12 text-right`}
                />
                <span className="pr-3 text-[10px] font-bold text-muted uppercase pointer-events-none absolute right-0">Yrs</span>
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD / ORACLE */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[500px] min-w-0">
            
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <PieChart className="w-4 h-4 text-brand shrink-0" /> Benefit Projection
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0">
                Age {claimAge}
              </span>
            </div>

            {/* HERO METRIC: MONTHLY AT PLANNED AGE */}
            <div className="text-center bg-paper border border-line py-5 px-4 rounded-xl shadow-sm mb-4 relative overflow-hidden shrink-0 min-w-0">
              <span className="block text-[9px] font-black uppercase tracking-widest text-muted mb-1 truncate">
                Monthly Check at Age {claimAge}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-brand tracking-tight tabular-nums leading-none block truncate">
                {calculations.formatCurrency(calculations.benefitAtSelected)}
              </span>
              
              <div className="mt-3 flex justify-center min-w-0">
                <span className={`text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border truncate ${
                  parseFloat(calculations.percentDifference) < 0 
                    ? "bg-[#fb7185]/10 text-[#e11d48] border-[#fb7185]/30" 
                    : parseFloat(calculations.percentDifference) > 0 
                    ? "bg-teal/10 text-teal border-teal/30" 
                    : "bg-brand/10 text-brand border-brand/30"
                }`}>
                  {parseFloat(calculations.percentDifference) < 0 ? `${calculations.percentDifference}% Early Penalty` : parseFloat(calculations.percentDifference) > 0 ? `+${calculations.percentDifference}% Delayed Credit` : "100% Full Unreduced"}
                </span>
              </div>
            </div>

            {/* BREAK-EVEN ALERT */}
            {calculations.breakEvenAge70vs62 && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-start gap-2.5 mb-4 shrink-0 min-w-0">
                <Scale className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 truncate">Age 70 Break-Even Point</span>
                  <p className="text-[9px] font-medium text-muted mt-0.5 truncate">
                    Surpasses early claims at <strong>Age {calculations.breakEvenAge70vs62}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* DETAILED COMPARISON TABLE */}
            <div className="flex-1 flex flex-col min-h-0 bg-paper rounded-xl border border-line p-2.5 shadow-sm min-w-0 text-xs">
              
              <div className="flex text-[9px] font-black uppercase tracking-widest text-muted px-2.5 pb-2 pt-1.5 border-b border-line shrink-0 min-w-0">
                <div className="flex-1 truncate">Claim Age Target</div>
                <div className="w-1/3 text-right truncate">Monthly</div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pt-1 space-y-1 min-w-0">
                
                {/* Age 62 */}
                <div className={`flex items-center px-2.5 py-2 rounded-lg transition-colors min-w-0 ${claimAge === 62 ? "bg-surface border border-line" : "hover:bg-surface/50"}`}>
                  <div className="min-w-0 truncate pr-2 flex-1">
                    <span className="font-black text-ink block truncate text-[11px]">Age 62</span>
                    <span className="text-[8px] font-bold text-[#e11d48] truncate block">Early Reduction</span>
                  </div>
                  <div className="w-1/3 text-right font-black tabular-nums text-ink shrink-0 text-xs">{calculations.formatCurrency(calculations.benefitAt62)}</div>
                </div>

                {/* FRA */}
                <div className={`flex items-center px-2.5 py-2 rounded-lg transition-colors min-w-0 ${claimAge === Math.floor(calculations.fraDecimalAge) ? "bg-surface border border-line" : "hover:bg-surface/50"}`}>
                  <div className="min-w-0 truncate pr-2 flex-1">
                    <span className="font-black text-ink block truncate text-[11px]">FRA ({calculations.fraYears}y {calculations.fraMonths}m)</span>
                    <span className="text-[8px] font-bold text-brand truncate block">100% Unreduced</span>
                  </div>
                  <div className="w-1/3 text-right font-black tabular-nums text-brand shrink-0 text-xs">{calculations.formatCurrency(calculations.benefitAtFra)}</div>
                </div>

                {/* Age 70 */}
                <div className={`flex items-center px-2.5 py-2 rounded-lg transition-colors min-w-0 ${claimAge === 70 ? "bg-surface border border-line" : "hover:bg-surface/50"}`}>
                  <div className="min-w-0 truncate pr-2 flex-1">
                    <span className="font-black text-ink block truncate text-[11px]">Age 70</span>
                    <span className="text-[8px] font-bold text-teal truncate block">Max Delayed Credits</span>
                  </div>
                  <div className="w-1/3 text-right font-black tabular-nums text-teal shrink-0 text-xs">{calculations.formatCurrency(calculations.benefitAt70)}</div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}