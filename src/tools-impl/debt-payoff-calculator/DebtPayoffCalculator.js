"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingDown, Snowflake, Flame, CalendarDays, 
  DollarSign, Plus, Trash2, CheckCircle2, 
  ArrowRight, ShieldAlert, Target, PieChart
} from "lucide-react";

// Helper to format currency
const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
// Helper to add months to current date
const getFutureDate = (monthsToAdd) => {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsToAdd);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export default function DebtPayoffCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Strategy: 'snowball' (lowest balance first) or 'avalanche' (highest interest first)
  const [strategy, setStrategy] = useState("snowball");
  const [extraPayment, setExtraPayment] = useState("200");

  // Pre-filled realistic data for immediate "wow" factor
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

  // --- CORE SIMULATION ENGINE ---
  // Runs the payoff simulation for a given strategy
  const simulatePayoff = (debtsInput, extraPayInput, strat) => {
    let currentDebts = debtsInput.map(d => ({
      id: d.id, name: d.name || "Unnamed Debt",
      bal: parseFloat(d.balance) || 0,
      rate: parseFloat(d.rate) || 0,
      min: parseFloat(d.minPayment) || 0
    })).filter(d => d.bal > 0);

    if (currentDebts.length === 0) return { months: 0, totalInterest: 0, timeline: [], infinite: false };

    // Sort based on strategy
    if (strat === 'snowball') {
      currentDebts.sort((a, b) => a.bal - b.bal); // Lowest balance first
    } else {
      currentDebts.sort((a, b) => b.rate - a.rate); // Highest rate first
    }

    let totalInterest = 0;
    let months = 0;
    let timeline = [];
    let infiniteLoopWarning = false;

    // Simulation Loop (Max 1200 months / 100 years to prevent infinite crashes if min payments are too low)
    while (currentDebts.some(d => d.bal > 0) && months < 1200) {
      months++;
      let availableExtra = parseFloat(extraPayInput) || 0;

      // 1. Apply minimums, calculate interest, and gather rolled-over money from paid-off debts
      for (let i = 0; i < currentDebts.length; i++) {
        let d = currentDebts[i];
        if (d.bal <= 0) {
          availableExtra += d.min; // The Snowball Effect!
          continue;
        }

        const monthlyInterest = d.bal * (d.rate / 100 / 12);
        totalInterest += monthlyInterest;
        d.bal += monthlyInterest;

        if (d.bal <= d.min) {
          availableExtra += (d.min - d.bal); // Add leftover min payment to extra
          d.bal = 0;
          timeline.push({ id: d.id, name: d.name, monthCleared: months, date: getFutureDate(months) });
        } else {
          d.bal -= d.min;
          // Safety check: if balance is growing despite min payment, and no extra money is available, it will never be paid off
          if (monthlyInterest >= d.min && parseFloat(extraPayInput) === 0 && currentDebts.length === 1) {
             infiniteLoopWarning = true;
          }
        }
      }

      // 2. Apply available extra money to the highest priority target debt
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

  // Dynamic Theming based on Strategy
  const theme = {
    gradient: strategy === "snowball" ? "from-blue-100 via-cyan-50 to-transparent dark:from-blue-900/30 dark:via-cyan-900/10" : "from-emerald-100 via-teal-50 to-transparent dark:from-emerald-900/30 dark:via-teal-900/10",
    iconBg: strategy === "snowball" ? "bg-gradient-to-br from-blue-500 to-cyan-500" : "bg-gradient-to-br from-emerald-500 to-teal-600",
    textPri: strategy === "snowball" ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400",
    bgLight: strategy === "snowball" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-emerald-50 dark:bg-emerald-900/20",
    borderLight: strategy === "snowball" ? "border-blue-200 dark:border-blue-800" : "border-emerald-200 dark:border-emerald-800",
    MainIcon: strategy === "snowball" ? Snowflake : Flame,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500`}>
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70 transition-colors duration-500`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.iconBg} p-3.5 rounded-2xl shadow-md transition-all duration-500`}>
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Debt Payoff Strategy Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Snowball vs Avalanche Calculator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Strategy Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Choose Your Strategy
                </label>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner">
                <button 
                  onClick={() => setStrategy("snowball")}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg transition-all ${strategy === "snowball" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest"><Snowflake className="w-4 h-4"/> Snowball</span>
                  <span className="text-[9px] font-bold opacity-70">Lowest balance first</span>
                </button>
                <button 
                  onClick={() => setStrategy("avalanche")}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg transition-all ${strategy === "avalanche" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest"><Flame className="w-4 h-4"/> Avalanche</span>
                  <span className="text-[9px] font-bold opacity-70">Highest interest first</span>
                </button>
              </div>
            </div>

            {/* Extra Payment Input */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-slate-500" /> Extra Monthly Payment
                </h4>
                <p className="text-[10px] font-medium text-slate-500 max-w-[250px]">
                  How much extra can you put towards your debts each month above the minimums?
                </p>
              </div>
              <div className="relative flex items-center w-full sm:w-36 shrink-0">
                <span className="absolute left-3 text-lg font-black text-slate-400">$</span>
                <input
                  type="text" value={extraPayment} onChange={(e) => handleDebtChange(null, null, null) /* Prevent crash, handle locally */}
                  onInput={(e) => { if (/^\d*\.?\d*$/.test(e.target.value)) setExtraPayment(e.target.value); }}
                  placeholder="0"
                  className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl pl-8 pr-3 py-3 text-lg font-black text-slate-800 dark:text-slate-100 outline-none focus:border-slate-400 transition-colors tabular-nums"
                />
              </div>
            </div>

            {/* Debt List Inputs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5" /> Your Debts ({debts.length})
                </label>
              </div>
              
              <div className="space-y-4">
                {debts.map((debt, idx) => (
                  <div key={debt.id} className="p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl relative group focus-within:border-slate-300 dark:focus-within:border-slate-500 transition-colors">
                    
                    {debts.length > 1 && (
                      <button 
                        onClick={() => removeDebt(debt.id)}
                        className="absolute -top-2 -right-2 bg-rose-100 hover:bg-rose-500 text-rose-500 hover:text-white dark:bg-rose-900 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white rounded-full p-1.5 shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-5">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Debt Name</label>
                        <input 
                          type="text" value={debt.name} onChange={(e) => handleDebtChange(debt.id, 'name', e.target.value)} 
                          placeholder="e.g. Visa Card" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-slate-400" 
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Balance ($)</label>
                        <input 
                          type="text" value={debt.balance} onChange={(e) => handleDebtChange(debt.id, 'balance', e.target.value)} 
                          placeholder="0" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-slate-400 tabular-nums" 
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Rate (%)</label>
                        <input 
                          type="text" value={debt.rate} onChange={(e) => handleDebtChange(debt.id, 'rate', e.target.value)} 
                          placeholder="0" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-slate-400 tabular-nums" 
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Min ($)</label>
                        <input 
                          type="text" value={debt.minPayment} onChange={(e) => handleDebtChange(debt.id, 'minPayment', e.target.value)} 
                          placeholder="0" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-slate-400 tabular-nums" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addDebt}
                className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Another Debt
              </button>

            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD / ORACLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[650px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-5 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <theme.MainIcon className={`w-4 h-4 ${theme.textPri}`} /> Strategy Insights
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.textPri} bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700`}>
                  {strategy} Mode
                </span>
              </div>

              {results.active.infinite ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-200 dark:border-rose-800">
                  <ShieldAlert className="w-12 h-12 text-rose-500 mb-4" />
                  <span className="text-sm font-black uppercase tracking-widest text-rose-600">Danger: Negative Amortization</span>
                  <p className="text-[11px] font-bold text-slate-500 mt-2">
                    Your minimum payments are lower than the interest accumulating. Without higher extra payments, you will never pay off this debt.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-300">
                  
                  {/* COMPARISON ALERT (The "AHA" Moment) */}
                  {results.snowball.totalInterest !== results.avalanche.totalInterest && (
                    <div className="mb-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl flex items-start gap-3 shadow-sm">
                      <Flame className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Avalanche Saves Money</span>
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          Avalanche strategy saves you <strong>{formatMoney(Math.abs(results.snowball.totalInterest - results.avalanche.totalInterest))}</strong> in interest compared to Snowball.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* HERO METRICS */}
                  <div className={`text-center ${theme.bgLight} border ${theme.borderLight} py-6 px-4 rounded-3xl shadow-inner mb-6 relative overflow-hidden shrink-0 transition-colors duration-500`}>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Debt Free Date</span>
                    <span className={`text-4xl sm:text-5xl font-black ${theme.textPri} tracking-tighter leading-none mb-4 block`}>
                      {results.active.months > 0 ? getFutureDate(results.active.months) : "Today"}
                    </span>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/40 dark:border-black/20">
                      <div>
                        <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Time to Payoff</span>
                        <span className="text-lg font-black text-slate-800 dark:text-slate-100">{results.active.months} Mos</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Interest Paid</span>
                        <span className="text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">{formatMoney(results.active.totalInterest)}</span>
                      </div>
                    </div>
                  </div>

                  {/* MONTHLY COMMITMENT */}
                  <div className="flex items-center justify-between bg-slate-800 dark:bg-slate-800 p-4 rounded-2xl shadow-md mb-6 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4" /> Monthly Payment
                    </span>
                    <span className="text-xl font-black tabular-nums">
                      {formatMoney(results.totalMinPayments + (parseFloat(extraPayment) || 0))}
                    </span>
                  </div>

                  {/* PAYOFF TIMELINE */}
                  <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex flex-col min-h-[200px]">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                      Payoff Timeline Order
                    </h4>
                    
                    {results.active.timeline.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-xs font-bold text-slate-400">No debts to pay off.</div>
                    ) : (
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {results.active.timeline.map((event, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${theme.bgLight} ${theme.textPri}`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-sm font-black text-slate-800 dark:text-slate-100 truncate">{event.name}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="block text-[11px] font-bold text-slate-500">{event.date}</span>
                              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Cleared
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
    </div>
  );
}