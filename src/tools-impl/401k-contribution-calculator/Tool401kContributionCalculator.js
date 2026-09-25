"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  PiggyBank, Briefcase, TrendingUp, DollarSign, 
  Percent, AlertCircle, CheckCircle2, PieChart, 
  LineChart, AlertTriangle, ShieldCheck
} from "lucide-react";

export default function FourOhOneKCalculator() {
  const [isMounted, setIsMounted] = useState(false);

  const [currentAge, setCurrentAge] = useState("30");
  const [retireAge, setRetireAge] = useState("65");
  const [currentSalary, setCurrentSalary] = useState("85000");
  const [annualRaise, setAnnualRaise] = useState("3");
  const [currentBalance, setCurrentBalance] = useState("25000");

  const [contributionPercent, setContributionPercent] = useState("8");
  const [employerMatchLimit, setEmployerMatchLimit] = useState("5");
  const [employerMatchPercent, setEmployerMatchPercent] = useState("100");
  const [annualReturn, setAnnualReturn] = useState("7");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNumInput = (setter, value, max = null) => {
    if (value === "") {
      setter("");
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && (!max || num <= max)) {
      setter(value);
    }
  };

  const calculations = useMemo(() => {
    const age = parseInt(currentAge) || 0;
    const rAge = parseInt(retireAge) || 0;
    let salary = parseFloat(currentSalary) || 0;
    const raise = parseFloat(annualRaise) || 0;
    const startBalance = parseFloat(currentBalance) || 0;
    
    const contPct = parseFloat(contributionPercent) || 0;
    const empMatchLim = parseFloat(employerMatchLimit) || 0;
    const empMatchPct = parseFloat(employerMatchPercent) || 0;
    const retRate = parseFloat(annualReturn) || 0;

    let totalUserContributions = 0;
    let totalEmployerContributions = 0;
    let totalInterest = 0;
    let currentBal = startBalance;
    
    let hitIrsLimit = false;
    let missedMatch = false;

    const baseIrsLimit = 23000;
    const catchUpLimit = 7500;

    if (contPct < empMatchLim && empMatchLim > 0) {
      missedMatch = true;
    }

    const yearsToGrow = Math.max(0, rAge - age);

    for (let i = 0; i < yearsToGrow; i++) {
      let currentYearAge = age + i;
      let currentIrsLimit = currentYearAge >= 50 ? (baseIrsLimit + catchUpLimit) : baseIrsLimit;
      
      let plannedContribution = salary * (contPct / 100);
      let actualContribution = plannedContribution;
      
      if (plannedContribution > currentIrsLimit) {
        actualContribution = currentIrsLimit;
        hitIrsLimit = true;
      }
      
      let matchablePct = Math.min(contPct, empMatchLim);
      let actualMatch = salary * (matchablePct / 100) * (empMatchPct / 100);

      let interestEarned = (currentBal + (actualContribution + actualMatch) / 2) * (retRate / 100);

      currentBal += actualContribution + actualMatch + interestEarned;
      totalUserContributions += actualContribution;
      totalEmployerContributions += actualMatch;
      totalInterest += interestEarned;
      
      salary = salary * (1 + (raise / 100));
    }

    const finalBalance = startBalance + totalUserContributions + totalEmployerContributions + totalInterest;

    const pctStart = finalBalance > 0 ? (startBalance / finalBalance) * 100 : 0;
    const pctUser = finalBalance > 0 ? (totalUserContributions / finalBalance) * 100 : 0;
    const pctEmployer = finalBalance > 0 ? (totalEmployerContributions / finalBalance) * 100 : 0;
    const pctInterest = finalBalance > 0 ? (totalInterest / finalBalance) * 100 : 0;

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return {
      yearsToGrow, finalBalance,
      startBalance, totalUserContributions, totalEmployerContributions, totalInterest,
      pctStart, pctUser, pctEmployer, pctInterest,
      hitIrsLimit, missedMatch,
      formatCurrency
    };
  }, [currentAge, retireAge, currentSalary, annualRaise, currentBalance, contributionPercent, employerMatchLimit, employerMatchPercent, annualReturn]);

  if (!isMounted) return null;

  const baseInputStyle = "w-full min-w-0 bg-paper border border-line rounded-xl px-3 py-2.5 text-base font-bold text-ink outline-none focus:border-brand tabular-nums";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <LineChart className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              401(k) Growth Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              Retirement Wealth & Match Optimizer
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start min-w-0">
        
        {/* CONFIGURATION ENGINE */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* Personal & Income */}
            <div className="space-y-4 min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <Briefcase className="w-3.5 h-3.5 text-brand shrink-0" /> 1. Personal & Income
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                <div className="min-w-0">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 block truncate">Current Salary</label>
                  <div className="relative flex items-center min-w-0">
                    <span className="absolute left-3.5 text-base font-black text-muted pointer-events-none">$</span>
                    <input
                      type="text" value={currentSalary} onChange={(e) => handleNumInput(setCurrentSalary, e.target.value)}
                      className={`${baseInputStyle} pl-8`}
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 block truncate">Current 401(k) Balance</label>
                  <div className="relative flex items-center min-w-0">
                    <span className="absolute left-3.5 text-base font-black text-muted pointer-events-none">$</span>
                    <input
                      type="text" value={currentBalance} onChange={(e) => handleNumInput(setCurrentBalance, e.target.value)}
                      className={`${baseInputStyle} pl-8`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Current Age</label>
                  <input type="text" value={currentAge} onChange={(e) => handleNumInput(setCurrentAge, e.target.value, 100)} className={`${baseInputStyle} text-center`} />
                </div>
                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Retire Age</label>
                  <input type="text" value={retireAge} onChange={(e) => handleNumInput(setRetireAge, e.target.value, 100)} className={`${baseInputStyle} text-center`} />
                </div>
                <div className="min-w-0">
                  <label className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1 block truncate">Annual Raise</label>
                  <div className="relative flex items-center min-w-0">
                    <input type="text" value={annualRaise} onChange={(e) => handleNumInput(setAnnualRaise, e.target.value, 20)} className={`${baseInputStyle} pr-7 text-center`} />
                    <span className="absolute right-2.5 text-xs font-black text-muted pointer-events-none">%</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-line" />

            {/* Contributions & Match */}
            <div className="space-y-4 min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <PiggyBank className="w-3.5 h-3.5 text-teal shrink-0" /> 2. Contributions & Employer Match
              </h3>
              
              <div className="p-4 rounded-xl bg-paper border border-line min-w-0">
                <label className="text-[10px] font-black text-ink uppercase tracking-widest flex items-center justify-between mb-2.5 min-w-0">
                  <span className="truncate">Your Contribution</span>
                  <span className="text-[9px] font-bold text-muted shrink-0">% of Salary</span>
                </label>
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="range" min="0" max="30" step="1"
                    value={contributionPercent} onChange={(e) => setContributionPercent(e.target.value)}
                    className="flex-1 h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand"
                  />
                  <div className="relative w-20 shrink-0">
                    <input
                      type="text" value={contributionPercent} onChange={(e) => handleNumInput(setContributionPercent, e.target.value, 100)}
                      className={`${baseInputStyle} pr-6 text-center text-brand`}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted pointer-events-none">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                <div className="bg-paper p-3 rounded-xl border border-line min-w-0">
                  <label className="block text-[8px] font-bold text-muted uppercase tracking-widest mb-1 truncate">Employer Match Limit</label>
                  <div className="relative flex items-center min-w-0">
                    <input type="text" value={employerMatchLimit} onChange={(e) => handleNumInput(setEmployerMatchLimit, e.target.value, 100)} className={`${baseInputStyle} pr-12`} />
                    <span className="absolute right-2.5 text-[10px] font-bold text-muted pointer-events-none truncate">% sal</span>
                  </div>
                </div>
                <div className="bg-paper p-3 rounded-xl border border-line min-w-0">
                  <label className="block text-[8px] font-bold text-muted uppercase tracking-widest mb-1 truncate">Match Percentage</label>
                  <div className="relative flex items-center min-w-0">
                    <input type="text" value={employerMatchPercent} onChange={(e) => handleNumInput(setEmployerMatchPercent, e.target.value, 200)} className={`${baseInputStyle} pr-7`} />
                    <span className="absolute right-2.5 text-xs font-bold text-muted pointer-events-none">%</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-line" />

            {/* Market */}
            <div className="space-y-3 min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <TrendingUp className="w-3.5 h-3.5 text-teal shrink-0" /> 3. Market Growth
              </h3>
              <div className="w-full sm:w-1/2 min-w-0">
                <label className="block text-[8px] font-bold text-muted uppercase tracking-widest mb-1 truncate">Est. Annual Return</label>
                <div className="relative flex items-center min-w-0">
                  <input type="text" value={annualReturn} onChange={(e) => handleNumInput(setAnnualReturn, e.target.value, 30)} className={`${baseInputStyle} pr-7 text-right`} />
                  <span className="absolute right-2.5 text-xs font-black text-muted pointer-events-none">%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD / ORACLE */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[500px] min-w-0">
            
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <PieChart className="w-4 h-4 text-brand shrink-0" /> Future Wealth Projection
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0">
                {calculations.yearsToGrow} Yrs
              </span>
            </div>

            {/* SMART ALERTS */}
            <div className="space-y-2 mb-4 shrink-0 min-w-0">
              {calculations.missedMatch && (
                <div className="bg-[#fb7185]/10 border border-[#fb7185]/30 p-2.5 rounded-xl flex items-start gap-2 min-w-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#e11d48] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="block text-[9px] font-black uppercase tracking-wider text-[#e11d48] truncate">Leaving Match Money</span>
                    <p className="text-[9px] font-medium text-muted mt-0.5 truncate">Match limit is {employerMatchLimit}%, you contribute {contributionPercent}%. Increase to capture match.</p>
                  </div>
                </div>
              )}
              {calculations.hitIrsLimit && (
                <div className="bg-teal/10 border border-teal/30 p-2.5 rounded-xl flex items-start gap-2 min-w-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="block text-[9px] font-black uppercase tracking-wider text-teal truncate">IRS Limit Reached</span>
                    <p className="text-[9px] font-medium text-muted mt-0.5 truncate">Contributions capped at annual IRS legal max.</p>
                  </div>
                </div>
              )}
              {!calculations.missedMatch && !calculations.hitIrsLimit && parseFloat(contributionPercent) >= parseFloat(employerMatchLimit) && parseFloat(employerMatchLimit) > 0 && (
                <div className="bg-teal/10 border border-teal/30 p-2.5 rounded-xl flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-teal truncate">Maximizing Employer Match!</span>
                </div>
              )}
            </div>

            {/* HERO METRIC */}
            <div className="text-center bg-paper border border-line py-5 px-4 rounded-xl shadow-sm mb-4 relative overflow-hidden shrink-0 min-w-0">
              <span className="block text-[9px] font-black uppercase tracking-widest text-muted mb-1 truncate">
                Estimated Balance at Age {retireAge}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-brand tracking-tight tabular-nums leading-none block truncate">
                {calculations.formatCurrency(calculations.finalBalance)}
              </span>
              
              {calculations.finalBalance > 0 && (
                <div className="w-full px-2 mt-4 min-w-0">
                  <div className="flex h-2.5 rounded-full overflow-hidden bg-line">
                    {calculations.pctStart > 0 && <div style={{ width: `${calculations.pctStart}%` }} className="bg-muted/40"></div>}
                    {calculations.pctUser > 0 && <div style={{ width: `${calculations.pctUser}%` }} className="bg-brand"></div>}
                    {calculations.pctEmployer > 0 && <div style={{ width: `${calculations.pctEmployer}%` }} className="bg-brand/50"></div>}
                    {calculations.pctInterest > 0 && <div style={{ width: `${calculations.pctInterest}%` }} className="bg-teal"></div>}
                  </div>
                </div>
              )}
            </div>

            {/* DETAILED RECEIPT */}
            <div className="flex-1 flex flex-col min-h-0 bg-paper rounded-xl border border-line p-2 shadow-sm min-w-0">
              
              <div className="flex text-[9px] font-black uppercase tracking-widest text-muted px-3 pb-2 pt-2 border-b border-line shrink-0 min-w-0">
                <div className="flex-1 truncate">Wealth Source</div>
                <div className="w-1/3 text-right truncate">Amount</div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pt-1 min-w-0 text-xs">
                
                {/* Start Balance */}
                <div className="flex items-center px-3 py-2.5 border-b border-line/50 min-w-0">
                  <div className="flex-1 flex items-center gap-2 min-w-0 truncate">
                    <div className="w-2 h-2 rounded-sm bg-muted/40 shrink-0"></div>
                    <span className="font-bold text-ink truncate">Starting Balance</span>
                  </div>
                  <div className="w-1/3 text-right font-black tabular-nums text-ink shrink-0">{calculations.formatCurrency(calculations.startBalance)}</div>
                </div>

                {/* Your Contributions */}
                <div className="flex items-center px-3 py-2.5 border-b border-line/50 min-w-0">
                  <div className="flex-1 flex items-center gap-2 min-w-0 truncate">
                    <div className="w-2 h-2 rounded-sm bg-brand shrink-0"></div>
                    <span className="font-bold text-ink truncate">Your Contributions</span>
                  </div>
                  <div className="w-1/3 text-right font-black tabular-nums text-brand shrink-0">{calculations.formatCurrency(calculations.totalUserContributions)}</div>
                </div>

                {/* Employer Match */}
                <div className="flex items-center px-3 py-2.5 border-b border-line/50 min-w-0">
                  <div className="flex-1 flex items-center gap-2 min-w-0 truncate">
                    <div className="w-2 h-2 rounded-sm bg-brand/50 shrink-0"></div>
                    <span className="font-bold text-ink truncate">Employer Match</span>
                  </div>
                  <div className="w-1/3 text-right font-black tabular-nums text-brand/80 shrink-0">{calculations.formatCurrency(calculations.totalEmployerContributions)}</div>
                </div>

                {/* Interest */}
                <div className="flex items-center px-3 py-2.5 bg-teal/10 rounded-lg mt-1 min-w-0">
                  <div className="flex-1 flex items-center gap-2 min-w-0 truncate">
                    <div className="w-2 h-2 rounded-sm bg-teal shrink-0"></div>
                    <span className="font-black text-teal truncate">Compound Growth</span>
                  </div>
                  <div className="w-1/3 text-right font-black tabular-nums text-teal shrink-0">+{calculations.formatCurrency(calculations.totalInterest)}</div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}