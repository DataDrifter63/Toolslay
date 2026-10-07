"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Map, CalendarDays, Users, Plane, Home, 
  ShieldAlert, Coffee, Train, Umbrella, 
  Wallet, PieChart, Info, DollarSign, BaggageClaim
} from "lucide-react";

export default function TravelBudgetPlanner() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Trip Basics
  const [currency, setCurrency] = useState("$");
  const [days, setDays] = useState(7);
  const [travelers, setTravelers] = useState(2);
  
  // Fixed Upfront Costs (Total for the whole trip)
  const [upfront, setUpfront] = useState({
    flights: 850,
    accommodation: 1200,
    insurance: 150,
    visas: 0
  });

  // Daily Living Costs (Per Day, Total for all travelers)
  const [daily, setDaily] = useState({
    food: 120,
    transport: 40,
    activities: 80,
    shopping: 30
  });

  // Contingency
  const [contingencyPercent, setContingencyPercent] = useState(10);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handlers
  const handleUpfrontChange = (field, value) => {
    setUpfront(prev => ({ ...prev, [field]: Math.max(0, parseFloat(value) || 0) }));
  };

  const handleDailyChange = (field, value) => {
    setDaily(prev => ({ ...prev, [field]: Math.max(0, parseFloat(value) || 0) }));
  };

  // Advanced Financial Engine
  const calculations = useMemo(() => {
    const validDays = Math.max(1, parseInt(days) || 1);
    const validTravelers = Math.max(1, parseInt(travelers) || 1);

    // Sum Upfront
    const totalUpfront = Object.values(upfront).reduce((a, b) => a + b, 0);

    // Sum Daily & Multiply by Days
    const dailyTotalPerDay = Object.values(daily).reduce((a, b) => a + b, 0);
    const totalDailyExpected = dailyTotalPerDay * validDays;

    // Subtotal
    const subtotal = totalUpfront + totalDailyExpected;

    // Contingency
    const emergencyBuffer = subtotal * (contingencyPercent / 100);

    // Grand Total
    const grandTotal = subtotal + emergencyBuffer;
    const costPerPerson = grandTotal / validTravelers;
    const costPerDay = grandTotal / validDays;

    // Percentages for Progress Bar
    const pctUpfront = grandTotal > 0 ? (totalUpfront / grandTotal) * 100 : 0;
    const pctDaily = grandTotal > 0 ? (totalDailyExpected / grandTotal) * 100 : 0;
    const pctBuffer = grandTotal > 0 ? (emergencyBuffer / grandTotal) * 100 : 0;

    return {
      totalUpfront,
      dailyTotalPerDay,
      totalDailyExpected,
      subtotal,
      emergencyBuffer,
      grandTotal,
      costPerPerson,
      costPerDay,
      pctUpfront,
      pctDaily,
      pctBuffer
    };
  }, [days, travelers, upfront, daily, contingencyPercent]);

  // Format Helper
  const formatMoney = (amount) => {
    return amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 dark:bg-sky-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-sky-100 dark:bg-sky-900/40 p-3 rounded-xl shadow-inner">
            <Map className="w-7 h-7 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Travel Budget Planner
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Upfront Costs, Daily Expenses & Emergency Fund
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 sm:p-8 rounded-2xl shadow-sm space-y-8">
            
            {/* Trip Basics */}
            <div className="grid grid-cols-3 gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" /> Days
                </label>
                <input
                  type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Travelers
                </label>
                <input
                  type="number" min="1" value={travelers} onChange={(e) => setTravelers(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Currency
                </label>
                <input
                  type="text" value={currency} onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500 transition-colors text-center"
                />
              </div>
            </div>

            {/* Fixed Upfront Costs */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between pb-4">
                <span className="flex items-center gap-1.5"><Plane className="w-4 h-4 text-sky-500" /> Pre-Trip & Fixed Costs</span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">Paid Upfront</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "flights", label: "Flights / Transit", icon: Plane },
                  { id: "accommodation", label: "Accommodation", icon: Home },
                  { id: "insurance", label: "Travel Insurance", icon: ShieldAlert },
                  { id: "visas", label: "Visas & Fees", icon: BaggageClaim }
                ].map((item) => (
                  <div key={item.id} className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-sky-500 transition-colors overflow-hidden">
                    <div className="flex items-center justify-center w-12 bg-slate-100 dark:bg-slate-700/50 border-r border-slate-200 dark:border-slate-700 shrink-0">
                      <item.icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">{currency}</span>
                      <input
                        type="number" min="0" value={upfront[item.id] || ""} onChange={(e) => handleUpfrontChange(item.id, e.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent px-3 py-3 pl-8 text-sm font-black text-slate-800 dark:text-slate-200 outline-none"
                      />
                    </div>
                    <span className="absolute right-3 top-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-1">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Living Costs */}
            <div className="pt-2">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between pb-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <span className="flex items-center gap-1.5"><Coffee className="w-4 h-4 text-indigo-500" /> Daily Expenses</span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">Per Day Estimate</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "food", label: "Food & Drinks", icon: Coffee },
                  { id: "transport", label: "Local Transport", icon: Train },
                  { id: "activities", label: "Tours & Tickets", icon: Umbrella },
                  { id: "shopping", label: "Misc / Shopping", icon: Wallet }
                ].map((item) => (
                  <div key={item.id} className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-indigo-500 transition-colors overflow-hidden">
                    <div className="flex items-center justify-center w-12 bg-slate-100 dark:bg-slate-700/50 border-r border-slate-200 dark:border-slate-700 shrink-0">
                      <item.icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">{currency}</span>
                      <input
                        type="number" min="0" value={daily[item.id] || ""} onChange={(e) => handleDailyChange(item.id, e.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent px-3 py-3 pl-8 text-sm font-black text-slate-800 dark:text-slate-200 outline-none"
                      />
                    </div>
                    <span className="absolute right-3 top-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-1">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contingency Slider */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between pb-3">
                <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-rose-500" /> Emergency Contingency Buffer</span>
                <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                  {contingencyPercent}%
                </span>
              </h3>
              
              <div className="px-1">
                <input
                  type="range" min="0" max="30" step="5"
                  value={contingencyPercent}
                  onChange={(e) => setContingencyPercent(parseFloat(e.target.value))}
                  className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 border border-black/5 dark:border-white/5"
                />
                <div className="flex justify-between text-[9px] font-bold mt-2 uppercase tracking-widest text-slate-400">
                  <span>0% (Risky)</span>
                  <span className="text-rose-500">10-15% (Recommended)</span>
                  <span>30% (Safe)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden flex flex-col min-h-[600px]">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 to-indigo-500`}></div>
            
            <div className="flex items-center justify-between mb-8 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                <PieChart className="w-3.5 h-3.5 text-sky-500" /> Total Trip Estimate
              </span>
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 px-2 py-1 rounded">
                {days} Days • {travelers} Travelers
              </span>
            </div>
            
            {/* Grand Total */}
            <div className="text-center mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Grand Total</span>
              <div className="flex justify-center items-start gap-1">
                <span className="text-2xl font-bold text-slate-400 mt-2">{currency}</span>
                <span className="text-6xl lg:text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                  {formatMoney(calculations.grandTotal)}
                </span>
              </div>
            </div>

            {/* Split Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-sky-200 dark:border-sky-900/50 shadow-sm text-center">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Per Person Total</span>
                <span className="text-2xl font-black text-sky-600 dark:text-sky-400 tabular-nums">
                  {currency}{formatMoney(calculations.costPerPerson)}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 shadow-sm text-center">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Per Day</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {currency}{formatMoney(calculations.costPerDay)}
                </span>
              </div>
            </div>

            {/* Visual Budget Breakdown */}
            <div className="space-y-4 mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between">
                Fund Allocation
                <span className="font-medium lowercase">Total: {currency}{formatMoney(calculations.grandTotal)}</span>
              </h4>
              
              {/* Stacked Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 flex overflow-hidden">
                <div style={{ width: `${calculations.pctUpfront}%` }} className="h-full bg-sky-500 transition-all duration-500"></div>
                <div style={{ width: `${calculations.pctDaily}%` }} className="h-full bg-indigo-500 transition-all duration-500"></div>
                <div style={{ width: `${calculations.pctBuffer}%` }} className="h-full bg-rose-500 transition-all duration-500"></div>
              </div>

              {/* Legends */}
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sky-500"></div> Pre-Trip Fixed</span>
                  <span className="font-black text-slate-800 dark:text-slate-100">{currency}{formatMoney(calculations.totalUpfront)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Daily Living ({days} days)</span>
                  <span className="font-black text-slate-800 dark:text-slate-100">{currency}{formatMoney(calculations.totalDailyExpected)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Emergency Buffer</span>
                  <span className="font-black text-slate-800 dark:text-slate-100">{currency}{formatMoney(calculations.emergencyBuffer)}</span>
                </div>
              </div>
            </div>

            {/* Smart Tip */}
            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-1">
                    Smart Travel Tip
                  </h4>
                  <p className="text-[10px] font-medium text-slate-500 leading-relaxed pr-2">
                    Keep your <strong>{currency}{formatMoney(calculations.emergencyBuffer)}</strong> contingency fund in a separate account or travel card. If you don't use it, it becomes the deposit for your next trip!
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}