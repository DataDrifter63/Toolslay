"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingDown, Snowflake, Flame, CalendarDays, 
  DollarSign, Plus, Trash2, CheckCircle2, 
  ArrowRight, ShieldAlert, Target, PieChart
} from "lucide-react";

const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const getFutureDate = (monthsToAdd) => {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsToAdd);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export default function DebtPayoffCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [strategy, setStrategy] = useState("snowball");
  const [extraPayment, setExtraPayment] = useState("200");

  const [debts, setDebts] = useState([
    { id: "1", name: "Credit Card", balance: "5000", rate: "22.5", minPayment: "150" },
    { id: "2", name: "Car Loan", balance: "14500", rate: "6.5", minPayment: "350" },
    { id: "3", name: "Medical Bill", balance: "2000", rate: "0", minPayment: "100" }
  ]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDebtChange = (id, field, value) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d));
    }
  };

  const addDebt = () => {
    setDebts([...debts, { id: Date.now().toString(), name: `Debt ${debts.length + 1}`, balance: "", rate: "", minPayment: "" }]);
  };

  const removeDebt = (id) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const simulatePayoff = (debtsInput, extraPayInput, strat) => {
    let currentDebts = debtsInput.map(d => ({
      id: d.id, name: d.name || "Unnamed Debt",
      bal: parseFloat(d.balance) || 0,
      rate: parseFloat(d.rate) || 0,
      min: parseFloat(d.minPayment) || 0
    })).filter(d => d.bal > 0);

    if (currentDebts.length === 0) return { months: 0, totalInterest: 0, timeline: [], infinite: false };

    if (strat === 'snowball') {
      currentDebts.sort((a, b) => a.bal - b.bal);
    } else {
      currentDebts.sort((a, b) => b.rate - a.rate);
    }

    let totalInterest = 0;
    let months = 0;
    let timeline = [];
    let infiniteLoopWarning = false;

    while (currentDebts.some(d => d.bal > 0) && months < 1200) {
      months++;
      let availableExtra = parseFloat(extraPayInput) || 0;

      for (let i = 0; i < currentDebts.length; i++) {
        let d = currentDebts[i];
        if (d.bal <= 0) {
          availableExtra += d.min;
          continue;
        }

        const monthlyInterest = d.bal * (d.rate / 100 / 12);
        totalInterest += monthlyInterest;
        d.bal += monthlyInterest;

        if (d.bal <= d.min) {
          availableExtra += (d.min - d.bal);
          d.bal = 0;
          timeline.push({ id: d.id, name: d.name, monthCleared: months, date: getFutureDate(months) });
        } else {
          d.bal -= d.min;
          if (monthlyInterest >= d.min && parseFloat(extraPayInput) === 0 && currentDebts.length === 1) {
             infiniteLoopWarning = true;
          }
        }
      }

      for (let i = 0; i < currentDebts.length; i++) {
        let d = currentDebts[i];
        if (d.bal > 0 && availableExtra > 0) {
          if (d.bal <= availableExtra) {
            availableExtra -= d.bal;
            d.bal = 0;
            timeline.push({ id: d.id, name: d.name, monthCleared: months, date: getFutureDate(months) });
          } else {
            d.bal -= availableExtra;
            availableExtra = 0;
          }
        }
      }
    }

    if (months >= 1200) infiniteLoopWarning = true;

    return { months, totalInterest, timeline, infinite: infiniteLoopWarning };
  };

  const results = useMemo(() => {
    const snowballRes = simulatePayoff(debts, extraPayment, 'snowball');
    const avalancheRes = simulatePayoff(debts, extraPayment, 'avalanche');
    
    const activeData = strategy === 'snowball' ? snowballRes : avalancheRes;
    const totalBalance = debts.reduce((acc, curr) => acc + (parseFloat(curr.balance) || 0), 0);
    const totalMinPayments = debts.reduce((acc, curr) => acc + (parseFloat(curr.minPayment) || 0), 0);

    return {
      active: activeData,
      snowball: snowballRes,
      avalanche: avalancheRes,
      totalBalance,
      totalMinPayments
    };
  }, [debts, extraPayment, strategy]);

  if (!isMounted) return null;

  const isSnowball = strategy === "snowball";
  const MainIcon = isSnowball ? Snowflake : Flame;

  const baseInputStyle = "w-full min-w-0 bg-paper border border-line rounded-lg px-2.5 py-2 text-xs sm:text-sm font-bold text-ink outline-none focus:border-brand tabular-nums";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              Debt Payoff Strategy Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              Snowball vs Avalanche Calculator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start min-w-0">
        
        {/* CONFIGURATION ENGINE */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* Strategy Toggle */}
            <div className="space-y-2.5 min-w-0">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                <Target className="w-3.5 h-3.5 shrink-0" /> Choose Your Strategy
              </label>
              <div className="flex bg-paper rounded-xl p-1 border border-line min-w-0 gap-1">
                <button 
                  type="button"
                  onClick={() => setStrategy("snowball")}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-lg transition-all min-w-0 truncate ${isSnowball ? "bg-surface text-brand shadow-sm border border-line" : "text-muted hover:text-ink"}`}
                >
                  <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider truncate"><Snowflake className="w-3.5 h-3.5 shrink-0"/> Snowball</span>
                  <span className="text-[8px] font-bold opacity-70 truncate">Lowest balance first</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setStrategy("avalanche")}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-lg transition-all min-w-0 truncate ${!isSnowball ? "bg-surface text-brand shadow-sm border border-line" : "text-muted hover:text-ink"}`}
                >
                  <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider truncate"><Flame className="w-3.5 h-3.5 shrink-0"/> Avalanche</span>
                  <span className="text-[8px] font-bold opacity-70 truncate">Highest rate first</span>
                </button>
              </div>
            </div>

            {/* Extra Payment Input */}
            <div className="p-4 sm:p-5 rounded-xl bg-paper border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
              <div className="min-w-0">
                <h4 className="text-xs font-black text-ink uppercase tracking-wider mb-0.5 flex items-center gap-1.5 truncate">
                  <DollarSign className="w-3.5 h-3.5 text-brand shrink-0" /> Extra Monthly Payment
                </h4>
                <p className="text-[10px] font-medium text-muted truncate">
                  Extra per month above minimums
                </p>
              </div>
              <div className="relative flex items-center w-full sm:w-32 shrink-0">
                <span className="absolute left-3 text-base font-black text-muted pointer-events-none">$</span>
                <input
                  type="text" value={extraPayment} 
                  onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value)) setExtraPayment(e.target.value); }}
                  placeholder="0"
                  className={`${baseInputStyle} pl-7 text-right font-black`}
                />
              </div>
            </div>

            {/* Debt List Inputs */}
            <div className="min-w-0">
              <div className="flex items-center justify-between mb-3 min-w-0">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                  <PieChart className="w-3.5 h-3.5 shrink-0" /> Your Debts ({debts.length})
                </label>
              </div>
              
              <div className="space-y-3 min-w-0">
                {debts.map((debt, idx) => (
                  <div key={debt.id} className="p-3.5 bg-paper border border-line rounded-xl relative group focus-within:border-brand transition-colors min-w-0">
                    
                    {debts.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeDebt(debt.id)}
                        className="absolute -top-2 -right-2 bg-surface text-[#e11d48] rounded-full p-1 shadow-sm border border-line hover:bg-[#fb7185]/10 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 min-w-0">
                      <div className="sm:col-span-5 min-w-0">
                        <label className="block text-[8px] font-bold text-muted uppercase tracking-wider mb-1 truncate">Name</label>
                        <input 
                          type="text" value={debt.name} onChange={(e) => handleDebtChange(debt.id, 'name', e.target.value)} 
                          placeholder="Visa Card" className={`${baseInputStyle} truncate`} 
                        />
                      </div>
                      <div className="sm:col-span-3 min-w-0">
                        <label className="block text-[8px] font-bold text-muted uppercase tracking-wider mb-1 truncate">Balance ($)</label>
                        <input 
                          type="text" value={debt.balance} onChange={(e) => handleDebtChange(debt.id, 'balance', e.target.value)} 
                          placeholder="0" className={baseInputStyle} 
                        />
                      </div>
                      <div className="sm:col-span-2 min-w-0">
                        <label className="block text-[8px] font-bold text-muted uppercase tracking-wider mb-1 truncate">Rate (%)</label>
                        <input 
                          type="text" value={debt.rate} onChange={(e) => handleDebtChange(debt.id, 'rate', e.target.value)} 
                          placeholder="0" className={baseInputStyle} 
                        />
                      </div>
                      <div className="sm:col-span-2 min-w-0">
                        <label className="block text-[8px] font-bold text-muted uppercase tracking-wider mb-1 truncate">Min ($)</label>
                        <input 
                          type="text" value={debt.minPayment} onChange={(e) => handleDebtChange(debt.id, 'minPayment', e.target.value)} 
                          placeholder="0" className={baseInputStyle} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addDebt}
                className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-line text-muted hover:border-brand hover:text-brand font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Debt
              </button>

            </div>

          </div>
        </div>

        {/* DASHBOARD / ORACLE */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[500px] min-w-0">
            
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <MainIcon className="w-4 h-4 text-brand shrink-0" /> Strategy Insights
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0">
                {strategy}
              </span>
            </div>

            {results.active.infinite ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-5 bg-[#fb7185]/10 rounded-xl border border-[#fb7185]/30 min-w-0">
                <ShieldAlert className="w-10 h-10 text-[#e11d48] mb-3 shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-[#e11d48] truncate">Negative Amortization</span>
                <p className="text-[10px] font-semibold text-muted mt-1.5">
                  Minimum payments cover less than interest. Increase extra payment.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-w-0">
                
                {results.snowball.totalInterest !== results.avalanche.totalInterest && (
                  <div className="mb-4 bg-paper border border-line p-3 rounded-xl flex items-start gap-2.5 shadow-sm min-w-0">
                    <Flame className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-brand truncate">Avalanche Efficiency</span>
                      <span className="text-[10px] font-medium text-muted truncate block">
                        Saves <strong>{formatMoney(Math.abs(results.snowball.totalInterest - results.avalanche.totalInterest))}</strong> in interest over snowball.
                      </span>
                    </div>
                  </div>
                )}

                {/* HERO METRICS */}
                <div className="text-center bg-paper border border-line py-5 px-4 rounded-xl shadow-sm mb-4 relative overflow-hidden shrink-0 min-w-0">
                  <span className="block text-[9px] font-black uppercase tracking-widest text-muted mb-1 truncate">Debt Free Date</span>
                  <span className="text-3xl sm:text-4xl font-black text-brand tracking-tight leading-none mb-3 block truncate">
                    {results.active.months > 0 ? getFutureDate(results.active.months) : "Today"}
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-line/60 text-xs min-w-0">
                    <div className="min-w-0 truncate">
                      <span className="block text-[8px] font-bold text-muted uppercase tracking-wider truncate">Time to Payoff</span>
                      <span className="text-sm font-black text-ink truncate block">{results.active.months} Mos</span>
                    </div>
                    <div className="min-w-0 truncate">
                      <span className="block text-[8px] font-bold text-muted uppercase tracking-wider truncate">Total Interest</span>
                      <span className="text-sm font-black text-ink tabular-nums truncate block">{formatMoney(results.active.totalInterest)}</span>
                    </div>
                  </div>
                </div>

                {/* MONTHLY COMMITMENT */}
                <div className="flex items-center justify-between bg-ink text-surface p-3.5 rounded-xl shadow-sm mb-4 min-w-0 text-xs">
                  <span className="font-black uppercase tracking-wider text-muted flex items-center gap-1.5 truncate">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" /> Total Monthly Outflow
                  </span>
                  <span className="font-black tabular-nums tracking-wider shrink-0 text-surface">
                    {formatMoney(results.totalMinPayments + (parseFloat(extraPayment) || 0))}
                  </span>
                </div>

                {/* PAYOFF TIMELINE */}
                <div className="flex-1 bg-paper rounded-xl border border-line p-3.5 shadow-sm flex flex-col min-h-[180px] min-w-0">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-muted mb-3 border-b border-line pb-1.5 truncate">
                    Payoff Timeline Order
                  </h4>
                  
                  {results.active.timeline.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[11px] font-bold text-muted">No debts active.</div>
                  ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-w-0">
                      {results.active.timeline.map((event, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 min-w-0 text-xs">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black bg-brand/10 text-brand">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0 truncate">
                            <span className="font-black text-ink truncate block">{event.name}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="block text-[10px] font-bold text-muted">{event.date}</span>
                            <span className="text-[8px] font-black uppercase tracking-wider text-teal flex items-center justify-end gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5 shrink-0" /> Cleared
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}